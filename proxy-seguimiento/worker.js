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

      const pedidoInfo = await completarPaquetesDelPedido(resuelto, datos, env);
      const { customerEmail, orderNumber, ...publico } = datos;
      return json(
        {
          ok: true,
          ...publico,
          pedido: nombrePedidoVisible(pedidoInfo?.pedido || resuelto.pedido || orderNumber),
          paquetes: armarPaquetes(pedidoInfo?.paquetes || resuelto.paquetes, resuelto.numero),
        },
        200,
        cors
      );
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

  const numeros = extraerNumerosRest(pedidoEncontrado);
  if (!numeros.length) {
    throw new ErrorCliente('pedido_sin_despachar', 200);
  }

  return {
    numero: numeros[0],
    email: emailBuscado,
    pedido: pedidoEncontrado.name || nombrePedido,
    paquetes: numeros,
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

  let datos = extraerItemTracking(payload?.data, numero);

  // Create a veces devuelve el stub sin historial. Siempre leemos
  // el tracking guardado si no hay movimientos.
  if (yaExistia || !datos || !tieneMovimientos(datos)) {
    const existente = await obtenerTrackingExistente(numero, courier, env);
    if (existente) datos = existente;
  }

  if (!datos) {
    throw new ErrorCliente('no_encontrado', 404, mensaje);
  }

  if (extras.email && !datos.customer_email) {
    await actualizarEmailTracking(datos.id, extras.email, env).catch(() => {});
  }

  const normalizado = normalizar(numero, datos);
  if (normalizado.eventos.length) return normalizado;

  const respaldo = await eventosDesdeParcelPanel(numero, env).catch(() => null);
  if (respaldo?.eventos?.length) {
    return {
      ...normalizado,
      estado: respaldo.estado || 'transit',
      eventos: respaldo.eventos,
    };
  }

  return normalizado;
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
  const urls = [
    'https://api.trackingmore.com/v4/trackings/get' +
      `?tracking_numbers=${encodeURIComponent(numero)}&courier_code=${encodeURIComponent(courier)}`,
    'https://api.trackingmore.com/v4/trackings/get' +
      `?tracking_numbers=${encodeURIComponent(numero)}`,
  ];

  for (const url of urls) {
    const respuesta = await fetch(url, {
      headers: {
        'Tracking-Api-Key': env.TRACKING_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    const payload = await respuesta.json().catch(() => null);
    const item = extraerItemTracking(payload?.data, numero);
    if (item && tieneMovimientos(item)) return item;
    if (item) return item;
  }
  return null;
}

function extraerItemTracking(data, numero) {
  if (!data) return null;
  const actual = String(numero || '').trim().toUpperCase();
  const candidatos = [];
  if (Array.isArray(data)) candidatos.push(...data);
  if (Array.isArray(data.trackings)) candidatos.push(...data.trackings);
  if (Array.isArray(data.success)) candidatos.push(...data.success);
  if (Array.isArray(data.items)) candidatos.push(...data.items);
  if (data.tracking_number || data.origin_info || data.destination_info) candidatos.push(data);

  const match = candidatos.find(
    (item) => String(item?.tracking_number || '').trim().toUpperCase() === actual
  );
  return match || candidatos[0] || null;
}

function tieneMovimientos(datos) {
  const origen = datos?.origin_info?.trackinfo;
  const destino = datos?.destination_info?.trackinfo;
  return (Array.isArray(origen) && origen.length > 0) || (Array.isArray(destino) && destino.length > 0);
}

const PP_A_INGLES = [
  { busca: 'información del envío registrada', en: 'Pre-Shipment Info Sent To Chile' },
  { busca: 'informacion del envio registrada', en: 'Pre-Shipment Info Sent To Chile' },
  { busca: 'el paquete está en tránsito', en: 'The shipment is in transit' },
  { busca: 'el paquete esta en transito', en: 'The shipment is in transit' },
  { busca: 'salió de las instalaciones', en: 'Departed Sunyou Facility' },
  { busca: 'salio de las instalaciones', en: 'Departed Sunyou Facility' },
  { busca: 'llegó al centro de origen', en: 'Arrived At The Port Of Origin' },
  { busca: 'llego al centro de origen', en: 'Arrived At The Port Of Origin' },
  { busca: 'salió del centro de origen', en: 'Departed From Port Of Origin' },
  { busca: 'salio del centro de origen', en: 'Departed From Port Of Origin' },
  { busca: 'aduana liberada', en: 'Customs Clearance Successed' },
  { busca: 'aduana', en: 'Customs Clearance In Process' },
  { busca: 'hand over to last mile', en: 'Hand Over To Last Mile' },
  { busca: 'entregado', en: 'Delivered' },
];

function textoParcelAIngles(texto) {
  const original = String(texto || '').trim();
  const lower = original.toLowerCase();
  for (const regla of PP_A_INGLES) {
    if (lower.includes(regla.busca)) {
      const extra = original.match(/\b[A-Z]{2}\d{9}CL\b/);
      if (extra && regla.en.startsWith('Departed Sunyou')) {
        return `${regla.en}, Carrier Tracking Number: ${extra[0]}`;
      }
      return regla.en;
    }
  }
  return original;
}

async function eventosDesdeParcelPanel(numero, env) {
  const shop = env.SHOPIFY_STORE;
  if (!shop) return null;

  const url =
    'https://pp-proxy.parcelwill.com/api/v2/tracking-info' +
    `?track_number=${encodeURIComponent(numero)}` +
    `&shop=${encodeURIComponent(shop)}`;

  const respuesta = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!respuesta.ok) return null;

  const payload = await respuesta.json().catch(() => null);
  const envios = payload?.data?.tracking;
  if (!Array.isArray(envios)) return null;

  const actual = String(numero).trim().toUpperCase();
  const envio =
    envios.find((item) => String(item?.track_number || '').trim().toUpperCase() === actual) ||
    envios[0];
  const pista = envio?.trackinfo;
  if (!Array.isArray(pista) || !pista.length) return null;

  const eventos = pista
    .map((item) => ({
      fecha: item.date_carbon || item.Date || '',
      texto: textoParcelAIngles(item.StatusDescription || item.checkpoint_status || ''),
      lugar: item.Details || '',
    }))
    .filter((evento) => evento.texto);

  const estadoPp = String(envio?.status || '').toLowerCase();
  let estado = 'transit';
  if (estadoPp.includes('entreg')) estado = 'delivered';
  else if (estadoPp.includes('reparto') || estadoPp.includes('entrega')) estado = 'pickup';
  else if (estadoPp.includes('tránsito') || estadoPp.includes('transito')) estado = 'transit';

  return { eventos, estado };
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
    orderNumber: datos?.order_number || datos?.orderNumber || null,
    customerEmail: datos?.customer_email || datos?.customerEmail || null,
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
  const from = env.EMAIL_FROM || 'La Cábala <avisos@lacabala.cl>';

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

async function completarPaquetesDelPedido(resuelto, datosTM, env) {
  if (resuelto?.paquetes?.length > 1 && resuelto.pedido) {
    const actual = String(resuelto.numero || '').trim().toUpperCase();
    const numeros = unicosMayusculas(resuelto.paquetes);
    if (!actual || numeros.includes(actual)) {
      return { pedido: resuelto.pedido, paquetes: numeros };
    }
  }

  const email = resuelto.email || datosTM?.customerEmail || null;
  if (email) {
    const porEmail = await buscarPedidoPorEmailYTracking(email, resuelto.numero, env).catch((error) => {
      console.error('shopify_email_tracking', error);
      return null;
    });
    if (porEmail?.numeros?.length) {
      return { pedido: porEmail.pedido, paquetes: porEmail.numeros };
    }
  }

  const nombre = nombrePedidoVisible(resuelto.pedido || datosTM?.orderNumber);
  if (nombre) {
    const porNombre = await buscarPedidoPorNombre(nombre, env, resuelto.numero).catch((error) => {
      console.error('shopify_pedido_nombre', error);
      return null;
    });
    if (porNombre?.numeros?.length) {
      return { pedido: porNombre.pedido, paquetes: porNombre.numeros };
    }
  }

  const porParcel = await buscarHermanosParcelPanel(resuelto.numero, env).catch((error) => {
    console.error('parcelpanel_hermanos', error);
    return null;
  });
  if (porParcel?.pedido) {
    const porNombrePP = await buscarPedidoPorNombre(porParcel.pedido, env, resuelto.numero).catch(
      () => null
    );
    if (porNombrePP?.numeros?.length) {
      return { pedido: porNombrePP.pedido, paquetes: porNombrePP.numeros };
    }
  }

  return {
    pedido: nombrePedidoVisible(resuelto.pedido),
    paquetes: [resuelto.numero],
  };
}

function nombrePedidoVisible(nombre) {
  const n = String(nombre || '').trim();
  if (!n) return null;
  if (/^[A-Z]{2}\d/i.test(n) || /^SYCL/i.test(n)) return null;
  return n;
}

async function buscarPedidoPorEmailYTracking(email, numero, env) {
  if (!env.SHOPIFY_STORE || !env.SHOPIFY_CLIENT_ID || !env.SHOPIFY_CLIENT_SECRET) {
    return null;
  }

  const emailBuscado = String(email || '').trim().toLowerCase();
  const actual = String(numero || '').trim().toUpperCase();
  if (!emailBuscado.includes('@') || !actual) return null;

  const url =
    `https://${env.SHOPIFY_STORE}/admin/api/${VERSION_API_SHOPIFY}/orders.json` +
    `?status=any&limit=50&email=${encodeURIComponent(emailBuscado)}`;

  let respuesta = await fetchShopifyConToken(url, env);
  if (respuesta.status === 401) {
    invalidarTokenShopify();
    respuesta = await fetchShopifyConToken(url, env);
  }
  if (!respuesta.ok) return null;

  const { orders = [] } = await respuesta.json();
  for (const orden of orders) {
    const numeros = extraerNumerosRest(orden);
    if (!numeros.includes(actual)) continue;
    return {
      email: emailBuscado,
      pedido: orden.name || null,
      numeros,
    };
  }
  return null;
}

async function buscarPedidoPorNombre(nombre, env, numeroBuscado) {
  if (!env.SHOPIFY_STORE || !env.SHOPIFY_CLIENT_ID || !env.SHOPIFY_CLIENT_SECRET) {
    return null;
  }

  const nombrePedido = String(nombre || '').trim().replace(/^#/, '');
  if (!nombrePedido) return null;

  const url =
    `https://${env.SHOPIFY_STORE}/admin/api/${VERSION_API_SHOPIFY}/orders.json` +
    `?status=any&limit=5&name=${encodeURIComponent(nombrePedido)}`;

  let respuesta = await fetchShopifyConToken(url, env);
  if (respuesta.status === 401) {
    invalidarTokenShopify();
    respuesta = await fetchShopifyConToken(url, env);
  }
  if (!respuesta.ok) return null;

  const { orders = [] } = await respuesta.json();
  const pedidoEncontrado = orders.find(
    (orden) => String(orden.name || '').replace(/^#/, '') === nombrePedido
  );
  if (!pedidoEncontrado) return null;

  const numeros = extraerNumerosRest(pedidoEncontrado);
  const actual = String(numeroBuscado || '').trim().toUpperCase();
  if (actual && !numeros.includes(actual)) return null;

  return {
    email: (pedidoEncontrado.email || '').trim().toLowerCase() || null,
    pedido: pedidoEncontrado.name || nombrePedido,
    numeros,
  };
}

async function buscarHermanosParcelPanel(numero, env) {
  const shop = env.SHOPIFY_STORE;
  if (!shop) return null;

  const url =
    'https://pp-proxy.parcelwill.com/api/v2/tracking-info' +
    `?track_number=${encodeURIComponent(numero)}` +
    `&shop=${encodeURIComponent(shop)}`;

  const respuesta = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!respuesta.ok) return null;

  const payload = await respuesta.json().catch(() => null);
  const envios = payload?.data?.tracking;
  if (!Array.isArray(envios) || envios.length === 0) return null;

  const numeros = unicosMayusculas(envios.map((envio) => envio?.track_number));
  if (!numeros.length) return null;

  return {
    pedido: nombrePedidoVisible(payload?.data?.order),
    numeros,
  };
}

async function buscarEmailPorTracking(numero, env) {
  const pedido = await buscarPedidoPorTracking(numero, env);
  return pedido?.email || null;
}

async function buscarPedidoPorTracking(numero, env) {
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
            legacyResourceId
          }
        }
      }
    }
  `;

  const url = `https://${env.SHOPIFY_STORE}/admin/api/${VERSION_API_SHOPIFY}/graphql.json`;
  const cuerpo = JSON.stringify({
    query,
    variables: { q: `tracking_number:${numero}` },
  });

  let respuesta = await fetchShopifyConToken(url, env, { method: 'POST', body: cuerpo });
  if (respuesta.status === 401) {
    invalidarTokenShopify();
    respuesta = await fetchShopifyConToken(url, env, { method: 'POST', body: cuerpo });
  }
  if (!respuesta.ok) {
    console.error('shopify_graphql_http', respuesta.status);
    return null;
  }

  const payload = await respuesta.json().catch(() => null);
  if (payload?.errors?.length) console.error('shopify_graphql', payload.errors);

  const edges = payload?.data?.orders?.edges || [];
  const actual = String(numero).trim().toUpperCase();
  let elegido = null;
  let numeros = [];

  for (const edge of edges) {
    const nodo = edge?.node;
    if (!nodo) continue;
    const idRest = String(nodo.legacyResourceId || '').trim();
    const pedidoRest = idRest ? await obtenerPedidoRest(idRest, env).catch(() => null) : null;
    const encontrados = extraerNumerosRest(pedidoRest || {});
    if (!encontrados.includes(actual)) continue;
    elegido = nodo;
    numeros = encontrados;
    break;
  }

  if (!elegido) return null;

  const email = (elegido.email || '').trim().toLowerCase() || null;
  return {
    email,
    pedido: elegido.name || null,
    numeros: unicosMayusculas(numeros),
  };
}

async function obtenerPedidoRest(id, env) {
  const url =
    `https://${env.SHOPIFY_STORE}/admin/api/${VERSION_API_SHOPIFY}/orders/${encodeURIComponent(id)}.json`;
  let respuesta = await fetchShopifyConToken(url, env);
  if (respuesta.status === 401) {
    invalidarTokenShopify();
    respuesta = await fetchShopifyConToken(url, env);
  }
  if (!respuesta.ok) return null;
  const payload = await respuesta.json().catch(() => null);
  return payload?.order || null;
}

function extraerNumerosRest(pedido) {
  const numeros = [];
  for (const envio of pedido?.fulfillments || []) {
    if (fulfillmentOmitido(envio?.status)) continue;
    const candidatos = [];
    if (Array.isArray(envio.tracking_numbers) && envio.tracking_numbers.length) {
      candidatos.push(...envio.tracking_numbers);
    } else if (envio.tracking_number) {
      candidatos.push(envio.tracking_number);
    }
    for (const n of candidatos) {
      for (const parte of String(n || '').split(/[\s,;]+/)) numeros.push(parte);
    }
  }
  return unicosMayusculas(numeros);
}

function fulfillmentOmitido(status) {
  const valor = String(status || '').toLowerCase();
  return valor === 'cancelled' || valor === 'canceled' || valor === 'error' || valor === 'failure';
}

function unicosMayusculas(valores) {
  const vistos = new Set();
  const out = [];
  for (const valor of valores || []) {
    const limpio = String(valor || '').trim().toUpperCase();
    if (!limpio || vistos.has(limpio)) continue;
    vistos.add(limpio);
    out.push(limpio);
  }
  return out;
}

function armarPaquetes(paquetes, numeroActual) {
  const actual = String(numeroActual || '').trim().toUpperCase();
  const numeros = unicosMayusculas(Array.isArray(paquetes) ? paquetes : []);
  // Solo se muestran hermanos si el codigo buscado esta en ese mismo pedido.
  // Si no, nunca se mezcla con el seguimiento de otro cliente.
  if (!actual || !numeros.includes(actual)) {
    return actual ? [{ numero: actual, indice: 1 }] : [];
  }
  return numeros.map((numero, i) => ({ numero, indice: i + 1 }));
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
