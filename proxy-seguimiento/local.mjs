/*
  ============================================================
  PROXY LOCAL PARA PROBAR CON NUMEROS REALES
  ============================================================

  Corre el MISMO codigo de worker.js pero en tu computador, sin
  necesidad de cuenta de Cloudflare ni de publicar nada.

  Sirve para comprobar que los datos reales de SUNYOU llegan bien
  y que las traducciones calzan, antes de dejarlo en produccion.

  Como se usa:

    cd proxy-seguimiento
    TRACKING_API_KEY=tu_clave node local.mjs

  Y para probar tambien la busqueda por numero de pedido:

    TRACKING_API_KEY=tu_clave \
    SHOPIFY_CLIENT_ID=tu_client_id \
    SHOPIFY_CLIENT_SECRET=tu_client_secret \
    node local.mjs

  Las claves se pasan por variable de entorno a proposito: asi no
  quedan escritas en ningun archivo del proyecto.
  ============================================================
*/

import { createServer } from 'node:http';
import worker from './worker.js';

const PUERTO = Number(process.env.PORT || 8787);

const env = {
  TRACKING_API_KEY: process.env.TRACKING_API_KEY,
  SHOPIFY_CLIENT_ID: process.env.SHOPIFY_CLIENT_ID,
  SHOPIFY_CLIENT_SECRET: process.env.SHOPIFY_CLIENT_SECRET,
  SHOPIFY_STORE: process.env.SHOPIFY_STORE || '0aap7q-qc.myshopify.com',
  COURIER_CODE: process.env.COURIER_CODE || 'sunyou',

  // Vacio = acepta cualquier origen. Solo para pruebas locales.
  ALLOWED_ORIGINS: '',
};

if (!env.TRACKING_API_KEY) {
  console.error('\nFalta la clave de TrackingMore.\n');
  console.error('Corre el comando asi:\n');
  console.error('  TRACKING_API_KEY=tu_clave node local.mjs\n');
  process.exit(1);
}

const busquedaPorPedido =
  env.SHOPIFY_CLIENT_ID && env.SHOPIFY_CLIENT_SECRET ? 'activada' : 'desactivada';

const servidor = createServer(async (peticion, respuesta) => {
  const url = `http://${peticion.headers.host || '127.0.0.1'}${peticion.url}`;

  const cuerpo =
    peticion.method === 'GET' || peticion.method === 'HEAD'
      ? undefined
      : await leerCuerpo(peticion);

  const solicitud = new Request(url, {
    method: peticion.method,
    headers: peticion.headers,
    body: cuerpo,
  });

  try {
    const resultado = await worker.fetch(solicitud, env);
    const texto = await resultado.text();

    registrar(peticion, cuerpo, resultado.status, texto);

    respuesta.writeHead(resultado.status, Object.fromEntries(resultado.headers));
    respuesta.end(texto);
  } catch (error) {
    console.error('Error inesperado:', error);
    respuesta.writeHead(500, { 'Content-Type': 'application/json' });
    respuesta.end(JSON.stringify({ ok: false, error: 'error_servidor' }));
  }
});

function leerCuerpo(peticion) {
  return new Promise((resolver) => {
    const trozos = [];
    peticion.on('data', (trozo) => trozos.push(trozo));
    peticion.on('end', () => resolver(Buffer.concat(trozos).toString('utf8')));
  });
}

// Deja a la vista lo que entra y lo que sale, para poder revisar
// si los estados que manda SUNYOU calzan con las traducciones.
function registrar(peticion, cuerpo, estado, texto) {
  if (peticion.method === 'OPTIONS') return;

  console.log(`\n${peticion.method} ${peticion.url} -> ${estado}`);
  if (cuerpo) console.log('  consulta:', cuerpo);

  try {
    const datos = JSON.parse(texto);

    if (!datos.ok) {
      console.log('  error:', datos.error);
      if (datos.detalle) console.log('  detalle del proveedor:', datos.detalle);
      return;
    }

    console.log(`  numero: ${datos.numero}   estado: ${datos.estado}`);
    console.log(`  movimientos (${datos.eventos.length}), del mas nuevo al mas viejo:`);

    for (const evento of datos.eventos) {
      const lugar = evento.lugar ? `  [${evento.lugar}]` : '';
      console.log(`    ${evento.fecha}${lugar}  ${evento.texto}`);
    }
  } catch {
    console.log('  respuesta:', texto.slice(0, 400));
  }
}

servidor.listen(PUERTO, '127.0.0.1', () => {
  console.log(`\nProxy local escuchando en http://127.0.0.1:${PUERTO}`);
  console.log(`Transportista: ${env.COURIER_CODE}`);
  console.log(
    `Busqueda por pedido: ${busquedaPorPedido}` +
      (busquedaPorPedido === 'desactivada'
        ? ' (falta SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET)'
        : '')
  );
  console.log('\nPruebalo con:');
  console.log(
    `  curl -X POST http://127.0.0.1:${PUERTO} -H 'Content-Type: application/json' -d '{"numero":"TU_NUMERO"}'\n`
  );
});
