/*
  ============================================================
  PROXY DE SEGUIMIENTO — La Cábala
  ============================================================

  Este archivo NO es parte del tema de Shopify. Se publica en
  Cloudflare Workers (plan gratis) y su unico trabajo es guardar
  las claves secretas para que no queden expuestas en la tienda.

  Endpoints:
    POST /            -> consulta de seguimiento (tienda)
    POST /webhook     -> TrackingMore avisa un cambio de estado
                        y nosotros mandamos el mail al cliente

  Instrucciones: ver README.md en esta carpeta.
  ============================================================
*/

import { elegirPlantilla, armarHtml, armarTexto } from './emails.js';

const VERSION_API_SHOPIFY = '2025-10';
const LINK_SEGUIMIENTO_DEFAULT = 'https://www.lacabala.cl/pages/seguimiento-de-pedido';

let tokenShopifyCache = null;
let tokenShopifyExpiraEn = 0;
let tokenShopifyRenovando = null;

export default {
  async fetch(request, env) {
    const origen = request.headers.get('Origin') || '';
    const cors = cabecerasCors(origen, env);
    const url = new URL(request.url);
    const ruta = url.pathname.replace(/\/+$/, '') || '/';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method === 'GET' || request.method === 'HEAD') {
      return json(
        {
          ok: true,
          servicio: 'seguimiento-lacabala',
          rutas: {
            consulta: 'POST /',
            webhook: 'POST /webhook?token=TU_TOKEN',
          },
        },
        200,
        cors
      );
    }

    if (request.method !== 'POST') {
      return json({ ok: false, error: 'metodo_no_permitido' }, 405, cors);
    }

    let cuerpo;
    try {
      cuerpo = await request.json();
    } catch {
      return json({ ok: false, error: 'peticion_invalida' }, 400, cors);
    }

    try {
      if (ruta === '/webhook') {
        return await manejarWebhook(cuerpo, url, env, cors);
      }

      const resuelto = await resolverSeguimiento(cuerpo, env);
      if (!resuelto?.numero) {
        return json({ ok: false, error: 'no_encontrado' }, 404, cors);
      }

      const datos = await consultarTrackingMore(resuelto.numero, env, {
        email: resuelto.email,
        pedido: resuelto.pedido,
      });
      return json({ ok: true, ...datos }, 200, cors);
    } catch (error) {
      if (error instanceof ErrorCliente) {
        const respuesta = { ok: false, error: error.codigo };
        if (error.detalle) respuesta.detalle = error.detalle;
        return json(respuesta, error.estado, cors);
      }
      console.error('error_servidor', error);
      return json({ ok: false, error: 'error_servidor' }, 500, cors);
    }
  },
};

/* ------------------------------------------------------------
   Consulta desde la tienda
   ------------------------------------------------------------ */

async function resolverSeguimiento(cuerpo, env) {
  if (cuerpo.numero) {
    const limpio = String(cuerpo.numero).trim().toUpperCase();
    if (!/^[A-Z0-9-]{8,40}$/.test(limpio)) {
      throw new ErrorCliente('numero_invalido', 400);
    }
    return { numero: limpio };
  }

  if (cuerpo.pedido && cuerpo.email) {
    return await buscarPedidoEnShopify(cuerpo.pedido, cuerpo.email, env);
  }

  throw new ErrorCliente('faltan_datos', 400);
}

async function buscarPedidoEnShopify(pedido, email, env) {
  if (!env.SHOPIFY_STORE || !env.SHOPIFY_CLIENT_ID || !env.SHOPIFY_CLIENT_SECRET) {
    throw new ErrorCliente('busqueda_por_pedido_no_configurada', 503);
  }

  const nombrePedido = String(pedido).trim().replace(/^#/, '');
  const emailBuscado = String(email).trim().toLowerCase();

  if (!nombrePedido || !emailBuscado.includes('@')) {
    throw new ErrorCliente('faltan_datos', 400);
  }

  const url =
    `https://${env.SHOPIFY_STORE}/admin/api/${VERSION_API_SHOPIFY}/orders.json` +
    `?status=any&limit=5&name=${encodeURIComponent(nombrePedido)}`;

  let respuesta = await fetchShopifyConToken(url, env);
  if (respuesta.status === 401) {
    invalidarTokenShopify();
    respuesta = await fetchShopifyConToken(url, env);
  }

  if (!respuesta.ok) {
    throw new ErrorCliente('error_shopify', 502);
  }

  const { orders = [] } = await respuesta.json();
  const pedidoEncontrado = orders.find(
    (orden) => (orden.email || '').toLowerCase() === emailBuscado
  );

  if (!pedidoEncontrado) return null;

  const numero = (pedidoEncontrado.fulfillments || [])
    .map((envio) => envio.tracking_number)
    .filter(Boolean)
    .pop();

  if (!numero) {
    throw new ErrorCliente('pedido_sin_despachar', 200);
  }

  return {
    numero: String(numero).trim().toUpperCase(),
    email: emailBuscado,
    pedido: pedidoEncontrado.name || nombrePedido,
  };
}

async function fetchShopifyConToken(url, env, init = {}) {
  const token = await obtenerTokenShopify(env);
  return fetch(url, {
    ...init,
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

async function obtenerTokenShopify(env) {
  if (tokenShopifyCache && Date.now() < tokenShopifyExpiraEn) {
    return tokenShopifyCache;
  }

  if (tokenShopifyRenovando) return tokenShopifyRenovando;

  tokenShopifyRenovando = renovarTokenShopify(env).finally(() => {
    tokenShopifyRenovando = null;
  });

  return tokenShopifyRenovando;
}

async function renovarTokenShopify(env) {
  const url = `https://${env.SHOPIFY_STORE}/admin/oauth/access_token`;

  const respuesta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
    }).toString(),
  });

  const payload = await respuesta.json().catch(() => null);

  if (!respuesta.ok || !payload?.access_token) {
    throw new ErrorCliente(
      'error_shopify_auth',
      502,
      payload?.error_description || payload?.error || `HTTP ${respuesta.status}`
    );
  }

  tokenShopifyCache = payload.access_token;
  const segundos = Number(payload.expires_in) || 86400;
  const margen = Math.min(300, Math.max(30, Math.floor(segundos / 10)));
  tokenShopifyExpiraEn = Date.now() + (segundos - margen) * 1000;

  return tokenShopifyCache;
}

function invalidarTokenShopify() {
  tokenShopifyCache = null;
  tokenShopifyExpiraEn = 0;
}

/* ------------------------------------------------------------
   TrackingMore
   ------------------------------------------------------------ */

async function consultarTrackingMore(numero, env, extras = {}) {
  if (!env.TRACKING_API_KEY) {
    throw new ErrorCliente('api_no_configurada', 503);
  }

  const courier = env.COURIER_CODE || 'sunyou';
  const cuerpoCreate = {
    tracking_number: numero,
    courier_code: courier,
    language: 'en',
  };

  // Si conocemos el email del cliente, TrackingMore lo guarda y
  // lo reenvia en el webhook. Asi no dependemos solo de Shopify.
  if (extras.email) cuerpoCreate.customer_email = extras.email;
  if (extras.pedido) cuerpoCreate.order_number = String(extras.pedido);

  const creacion = await fetch('https://api.trackingmore.com/v4/trackings/create', {
    method: 'POST',
    headers: {
      'Tracking-Api-Key': env.TRACKING_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cuerpoCreate),
  });

  let payload = await creacion.json().catch(() => null);
  const codigo = payload?.meta?.code;
  const mensaje = String(payload?.meta?.message || '');
  const mensajeLower = mensaje.toLowerCase();

  const yaExistia =
    codigo === 4016 ||
    codigo === 4017 ||
    mensajeLower.includes('already exists') ||
    mensajeLower.includes('duplicate');

  if (!yaExistia) {
    if (creacion.status === 401 || creacion.status === 403 || codigo === 401) {
      throw new ErrorCliente('clave_invalida', 502, mensaje);
    }
    if (creacion.status === 429 || codigo === 429) {
      throw new ErrorCliente('limite_alcanzado', 502, mensaje);
    }
    if (codigo === 4101 || codigo === 4102 || codigo === 4103) {
      throw new ErrorCliente('clave_invalida', 502, mensaje);
    }
    if (codigo === 4111 || codigo === 4112) {
      throw new ErrorCliente('courier_incorrecto', 502, mensaje);
    }
  }

  let datos = payload?.data;

  if (yaExistia || !datos) {
    datos = await obtenerTrackingExistente(numero, courier, env);
  }

  if (!datos) {
    throw new ErrorCliente('no_encontrado', 404, mensaje);
  }

  // Si el tracking ya existia sin email, intentamos actualizarlo.
  if (extras.email && !datos.customer_email) {
    await actualizarEmailTracking(datos.id, extras.email, env).catch(() => {});
  }

  return normalizar(numero, datos);
}

async function actualizarEmailTracking(id, email, env) {
  if (!id || !email) return;
  await fetch(`https://api.trackingmore.com/v4/trackings/update/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Tracking-Api-Key': env.TRACKING_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customer_email: email }),
  });
}

async function obtenerTrackingExistente(numero, courier, env) {
  const url =
    'https://api.trackingmore.com/v4/trackings/get' +
    `?tracking_numbers=${encodeURIComponent(numero)}&courier_code=${encodeURIComponent(courier)}`;

  const respuesta = await fetch(url, {
    headers: {
      'Tracking-Api-Key': env.TRACKING_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  const payload = await respuesta.json().catch(() => null);
  const lista = payload?.data;

  if (Array.isArray(lista)) return lista[0] || null;
  if (lista?.trackings && Array.isArray(lista.trackings)) return lista.trackings[0] || null;
  return lista || null;
}

function normalizar(numero, datos) {
  const movimientos = [
    ...(datos?.origin_info?.trackinfo || []),
    ...(datos?.destination_info?.trackinfo || []),
  ];

  const vistos = new Set();
  const eventos = movimientos
    .map((item) => ({
      fecha: item.checkpoint_date || item.Date || '',
      texto: (item.tracking_detail || item.StatusDescription || item.details || '').trim(),
      lugar: [item.location, item.state, item.Details].filter(Boolean).join(', '),
      estado: item.checkpoint_delivery_status || '',
    }))
    .filter((evento) => {
      if (!evento.texto) return false;
      const clave = `${evento.fecha}|${evento.texto}`;
      if (vistos.has(clave)) return false;
      vistos.add(clave);
      return true;
    })
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return {
    numero,
    estado: datos?.delivery_status || datos?.status || 'notfound',
    diasEnTransito: datos?.transit_time || 0,
    eventos,
  };
}

/* ------------------------------------------------------------
   Webhook TrackingMore -> email al cliente
   ------------------------------------------------------------ */

async function manejarWebhook(cuerpo, url, env, cors) {
  const tokenEsperado = env.WEBHOOK_TOKEN || '';
  if (tokenEsperado) {
    const token = url.searchParams.get('token') || '';
    if (token !== tokenEsperado) {
      return json({ ok: false, error: 'no_autorizado' }, 401, cors);
    }
  }

  if (!env.RESEND_API_KEY) {
    return json({ ok: false, error: 'email_no_configurado' }, 503, cors);
  }

  const data = cuerpo?.data || cuerpo;
  const numero = String(data?.tracking_number || '').trim().toUpperCase();
  if (!numero) {
    return json({ ok: false, error: 'sin_numero' }, 400, cors);
  }

  const ultimoEvento = extraerUltimoEvento(data);
  const plantilla = elegirPlantilla(ultimoEvento.texto);
  if (!plantilla) {
    return json(
      {
        ok: true,
        omitido: true,
        motivo: 'evento_sin_mail',
        evento: ultimoEvento.texto || null,
      },
      200,
      cors
    );
  }

  const claveDedupe = `mail:${numero}:${plantilla.id}`;
  if (env.MAIL_DEDUPE) {
    const ya = await env.MAIL_DEDUPE.get(claveDedupe);
    if (ya) {
      return json({ ok: true, omitido: true, motivo: 'ya_enviado', plantilla: plantilla.id }, 200, cors);
    }
  }

  let email =
    String(data?.customer_email || '').trim().toLowerCase() ||
    (await buscarEmailPorTracking(numero, env));

  if (!email || !email.includes('@')) {
    return json(
      { ok: true, omitido: true, motivo: 'sin_email', plantilla: plantilla.id, numero },
      200,
      cors
    );
  }

  const linkSeguimiento = env.LINK_SEGUIMIENTO || LINK_SEGUIMIENTO_DEFAULT;
  const from = env.EMAIL_FROM || 'La Cábala <onboarding@resend.dev>';

  const enviado = await enviarResend({
    apiKey: env.RESEND_API_KEY,
    from,
    to: email,
    subject: plantilla.asunto,
    html: armarHtml(plantilla, {
      numero,
      linkSeguimiento,
      whatsappUrl: env.WHATSAPP_URL,
    }),
    text: armarTexto(plantilla, { numero, linkSeguimiento }),
  });

  if (!enviado.ok) {
    return json(
      { ok: false, error: 'error_email', detalle: enviado.detalle },
      502,
      cors
    );
  }

  if (env.MAIL_DEDUPE) {
    // 60 dias: evita reenviar el mismo hito si TrackingMore re-notifica
    await env.MAIL_DEDUPE.put(claveDedupe, new Date().toISOString(), {
      expirationTtl: 60 * 24 * 60 * 60,
    });
  }

  return json(
    {
      ok: true,
      enviado: true,
      plantilla: plantilla.id,
      numero,
      email: email.replace(/(^.).*(@.*$)/, '$1***$2'),
    },
    200,
    cors
  );
}

function extraerUltimoEvento(data) {
  const movimientos = [
    ...(data?.origin_info?.trackinfo || []),
    ...(data?.destination_info?.trackinfo || []),
  ];

  const normalizados = movimientos
    .map((item) => ({
      fecha: item.checkpoint_date || item.Date || '',
      texto: (item.tracking_detail || item.StatusDescription || item.details || '').trim(),
    }))
    .filter((e) => e.texto)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  if (normalizados[0]) return normalizados[0];

  // Fallback: algunos webhooks solo mandan latest_event
  const latest = data?.latest_event || data?.last_event || '';
  return { fecha: data?.latest_checkpoint_time || '', texto: String(latest).split(',')[0].trim() };
}

async function buscarEmailPorTracking(numero, env) {
  if (!env.SHOPIFY_STORE || !env.SHOPIFY_CLIENT_ID || !env.SHOPIFY_CLIENT_SECRET) {
    return null;
  }

  const query = `
    query ($q: String!) {
      orders(first: 5, query: $q) {
        edges {
          node {
            email
            name
            customer { email }
          }
        }
      }
    }
  `;

  const url = `https://${env.SHOPIFY_STORE}/admin/api/${VERSION_API_SHOPIFY}/graphql.json`;
  let respuesta = await fetchShopifyConToken(url, env, {
    method: 'POST',
    body: JSON.stringify({
      query,
      variables: { q: `tracking_number:${numero}` },
    }),
  });

  if (respuesta.status === 401) {
    invalidarTokenShopify();
    respuesta = await fetchShopifyConToken(url, env, {
      method: 'POST',
      body: JSON.stringify({
        query,
        variables: { q: `tracking_number:${numero}` },
      }),
    });
  }

  if (!respuesta.ok) return null;

  const payload = await respuesta.json().catch(() => null);
  const nodo = payload?.data?.orders?.edges?.[0]?.node;
  return (nodo?.email || nodo?.customer?.email || '').trim().toLowerCase() || null;
}

async function enviarResend({ apiKey, from, to, subject, html, text }) {
  const respuesta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });

  const payload = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    return {
      ok: false,
      detalle: payload?.message || payload?.name || `HTTP ${respuesta.status}`,
    };
  }
  return { ok: true, id: payload?.id };
}

/* ------------------------------------------------------------
   Utilidades
   ------------------------------------------------------------ */

class ErrorCliente extends Error {
  constructor(codigo, estado, detalle) {
    super(codigo);
    this.codigo = codigo;
    this.estado = estado;
    this.detalle = detalle;
  }
}

function cabecerasCors(origen, env) {
  const permitidos = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((valor) => valor.trim())
    .filter(Boolean);

  const autorizado = permitidos.length === 0 || permitidos.includes(origen);

  return {
    'Access-Control-Allow-Origin': autorizado ? origen || '*' : permitidos[0] || '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(cuerpo, estado, cors) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors },
  });
}
