/*
  ============================================================
  AUDITOR DE TRADUCCIONES
  ============================================================

  Consulta varios numeros de seguimiento y avisa cuales estados
  de SUNYOU todavia no tienen traduccion.

  Usa el mismo motor que la pagina de la tienda
  (assets/seguimiento-motor.js), asi que lo que diga aca es
  exactamente lo que va a ver el cliente.

  Como se usa:

    1. Deja el proxy corriendo en otra terminal:
         TRACKING_API_KEY=tu_clave node local.mjs

    2. Corre la auditoria con tus numeros:
         node auditar.mjs SYCL014614007 SYCL014614008 SYAE123456789

    O con un archivo, un numero por linea:
         node auditar.mjs --archivo numeros.txt
  ============================================================
*/

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(AQUI, '..', 'assets');
const PROXY = process.env.PROXY_URL || 'http://127.0.0.1:8787';

/*
  Los archivos del tema se escriben para el navegador, asi que se
  cargan con un "window" de mentira. Es a proposito: se usa el
  mismo codigo que la tienda, sin copiarlo ni adaptarlo.
*/
function cargarMotor() {
  const ventana = {};

  for (const archivo of ['seguimiento-estados.js', 'seguimiento-motor.js']) {
    const codigo = readFileSync(join(ASSETS, archivo), 'utf8');
    new Function('window', codigo)(ventana);
  }

  if (!ventana.SEGUIMIENTO_CONFIG || !ventana.SEGUIMIENTO_MOTOR) {
    throw new Error('No se pudieron cargar los archivos del tema');
  }

  return {
    cfg: ventana.SEGUIMIENTO_CONFIG,
    motor: ventana.SEGUIMIENTO_MOTOR.crear(ventana.SEGUIMIENTO_CONFIG),
  };
}

function leerNumeros(argumentos) {
  const posArchivo = argumentos.indexOf('--archivo');

  if (posArchivo !== -1) {
    const ruta = argumentos[posArchivo + 1];
    if (!ruta) throw new Error('Falta la ruta despues de --archivo');

    return readFileSync(ruta, 'utf8')
      .split('\n')
      .map((linea) => linea.trim())
      .filter((linea) => linea && !linea.startsWith('#'));
  }

  return argumentos.filter((valor) => !valor.startsWith('--'));
}

async function consultar(numero) {
  const respuesta = await fetch(PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numero }),
  });

  return respuesta.json();
}

async function main() {
  const numeros = leerNumeros(process.argv.slice(2));

  if (numeros.length === 0) {
    console.error('\nFalta indicar al menos un numero de seguimiento.\n');
    console.error('  node auditar.mjs SYCL014614007 SYCL014614008');
    console.error('  node auditar.mjs --archivo numeros.txt\n');
    process.exit(1);
  }

  const { motor } = cargarMotor();

  // Estado en ingles -> cuantas veces aparecio y en que envios
  const sinTraducir = new Map();
  const fallidos = [];
  let revisados = 0;

  console.log(`\nConsultando ${numeros.length} numero(s) a ${PROXY}\n`);

  for (const numero of numeros) {
    let datos;
    try {
      datos = await consultar(numero);
    } catch (error) {
      console.log(`  ${numero}  no se pudo conectar al proxy`);
      fallidos.push({ numero, motivo: 'sin conexion al proxy' });
      continue;
    }

    if (!datos.ok) {
      console.log(`  ${numero}  ${datos.error}${datos.detalle ? ` (${datos.detalle})` : ''}`);
      fallidos.push({ numero, motivo: datos.error });
      continue;
    }

    const vista = motor.procesar(datos);
    revisados++;

    const aviso = vista.sinTraducir.length
      ? `  <-- ${vista.sinTraducir.length} sin traducir`
      : '';
    console.log(
      `  ${numero}  ${vista.estado}  ${vista.eventos.length} movimientos` +
        `  ${vista.dias || 'sin contador'}${aviso}`
    );

    for (const evento of vista.sinTraducir) {
      const clave = evento.original;
      if (!sinTraducir.has(clave)) sinTraducir.set(clave, { veces: 0, envios: new Set() });

      const registro = sinTraducir.get(clave);
      registro.veces++;
      registro.envios.add(numero);
    }
  }

  informar({ revisados, fallidos, sinTraducir });
}

function informar({ revisados, fallidos, sinTraducir }) {
  console.log('\n' + '='.repeat(64));
  console.log(`Envios revisados: ${revisados}`);
  if (fallidos.length) console.log(`Envios con problema: ${fallidos.length}`);
  console.log('='.repeat(64));

  if (sinTraducir.size === 0) {
    console.log('\nTodos los estados tienen traduccion. No hay nada que agregar.\n');
    return;
  }

  console.log(`\nHay ${sinTraducir.size} estado(s) SIN TRADUCIR.`);
  console.log('Al cliente le aparecen con el texto generico de respaldo.\n');

  const ordenados = [...sinTraducir.entries()].sort((a, b) => b[1].veces - a[1].veces);

  for (const [texto, info] of ordenados) {
    console.log(`  "${texto}"`);
    console.log(`     aparece ${info.veces} vez(ces), en: ${[...info.envios].join(', ')}`);
  }

  console.log('\n' + '-'.repeat(64));
  console.log('Para agregarlos, copia estas lineas en la lista "eventos" de');
  console.log('assets/seguimiento-estados.js y reemplaza el texto en espanol');
  console.log('y el nivel (1=recibido, 2=enviado, 3=transito, 4=en Chile, 5=entregado):');
  console.log('-'.repeat(64) + '\n');

  for (const [texto] of ordenados) {
    const busca = texto.toLowerCase().replace(/"/g, '');
    console.log(`    { busca: '${busca}', es: 'TRADUCEME', nivel: 3 },`);
  }

  console.log('');
}

main().catch((error) => {
  console.error('\nError:', error.message, '\n');
  process.exit(1);
});
