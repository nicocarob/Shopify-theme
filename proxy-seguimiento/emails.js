/*
  ============================================================
  PLANTILLAS DE EMAIL — actualizaciones de envio
  ============================================================

  Cada regla mira el texto en ingles del courier (el mismo que
  traduce seguimiento-estados.js). Si calza, se manda ese mail.

  El orden importa: la primera regla que calza gana.
  "customs clearance inspection" va ANTES que el "customs" generico.
  ============================================================
*/

const LINK_SEGUIMIENTO = 'https://www.lacabala.cl/pages/seguimiento-de-pedido';
const WHATSAPP = 'https://wa.me/message/Z5XXALWPDL4GI1';

export const REGLAS_EMAIL = [
  {
    id: 'aduana_inspection',
    busca: 'customs clearance inspection',
    asunto: 'Tu pedido esta en revision de aduana — La Cábala',
    prioridad: true,
    titulo: 'Tu pedido esta en revision de aduana',
    cuerpo: [
      'Esto es normal y no tienes que hacer nada.',
      'Aduana esta revisando el pago de impuestos. Los impuestos ya estan pagados por nosotros, asi que deberian liberarlo pronto.',
      'En cuanto aduana lo libere, te avisamos de nuevo por este mismo correo.',
    ],
  },
  {
    id: 'aduana_proceso',
    busca: 'customs clearance in process',
    asunto: 'Tu pedido entro a aduana — La Cábala',
    titulo: 'Tu pedido esta en proceso de aduana',
    cuerpo: [
      'Ya llego a Chile y esta en tramite aduanero.',
      'No tienes que pagar nada extra: los impuestos van de nuestra parte.',
    ],
  },
  {
    id: 'aduana_liberada',
    busca: 'customs clearance success',
    asunto: 'Aduana libero tu pedido — La Cábala',
    titulo: 'Aduana libero tu pedido',
    cuerpo: [
      'Ya salio de aduana. En los proximos dias Correos de Chile lo lleva a tu domicilio.',
    ],
  },
  {
    id: 'llego_chile',
    busca: 'arrived at destination country airport',
    asunto: 'Tu pedido ya esta en Chile — La Cábala',
    titulo: 'Tu pedido llego a Chile',
    cuerpo: [
      'Ya aterrizo en el pais. El siguiente paso suele ser el tramite de aduana.',
    ],
  },
  {
    id: 'reparto',
    busca: 'delivery in progress',
    asunto: 'Tu pedido va en camino a tu domicilio — La Cábala',
    titulo: 'Tu pedido va en camino a tu domicilio',
    cuerpo: [
      'Correos de Chile ya lo tiene en reparto. Mantente atento hoy.',
    ],
  },
  {
    id: 'last_mile',
    busca: 'hand over to last mile',
    asunto: 'Tu pedido salio a Correos de Chile — La Cábala',
    titulo: 'Tu pedido ya va con Correos de Chile',
    cuerpo: [
      'Salio del aeropuerto y esta en manos de Correos de Chile para la entrega final.',
    ],
  },
  {
    id: 'entregado',
    busca: 'delivered',
    asunto: 'Tu pedido fue entregado — La Cábala',
    titulo: 'Tu pedido fue entregado',
    cuerpo: [
      'Gracias por comprar en La Cábala. Si algo no cuadra, escribenos y lo vemos.',
    ],
  },
  {
    id: 'enviado',
    busca: 'acceptance, sent to',
    asunto: 'Tu pedido ya salio — La Cábala',
    titulo: 'Tu pedido ya salio hacia Chile',
    cuerpo: [
      'El courier ya registro tu envio. Los primeros movimientos suelen tardar unos dias en aparecer.',
    ],
  },
  {
    id: 'salio_origen',
    busca: 'departed from port of origin',
    asunto: 'Tu pedido salio del pais de origen — La Cábala',
    titulo: 'Tu pedido salio del pais de origen',
    cuerpo: [
      'Ya va en camino internacional hacia Chile.',
    ],
  },
];

export function elegirPlantilla(textoEvento) {
  const texto = String(textoEvento || '').toLowerCase();
  if (!texto) return null;
  return REGLAS_EMAIL.find((regla) => texto.includes(regla.busca)) || null;
}

export function armarHtml(plantilla, { numero, linkSeguimiento, whatsappUrl }) {
  const link = linkSeguimiento || LINK_SEGUIMIENTO;
  const wa = whatsappUrl || WHATSAPP;
  const parrafos = plantilla.cuerpo
    .map((p) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.5;color:#222;">${escapar(p)}</p>`)
    .join('');

  const avisoAduana = plantilla.prioridad
    ? `<div style="margin:0 0 18px;padding:14px 16px;background:#fff8e6;border:1px solid #f0d78c;border-radius:10px;font-size:15px;line-height:1.45;color:#5c4a00;">
        <strong>Tranquilo:</strong> la revision de aduana es un paso habitual. No implica un cobro extra para ti.
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:24px auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e8e8e8;">
    <div style="padding:22px 24px;background:#000;color:#fff;">
      <div style="font-size:13px;letter-spacing:.04em;opacity:.75;margin-bottom:6px;">LA CÁBALA</div>
      <div style="font-size:22px;font-weight:700;line-height:1.25;">${escapar(plantilla.titulo)}</div>
    </div>
    <div style="padding:24px;">
      ${avisoAduana}
      ${parrafos}
      <p style="margin:0 0 8px;font-size:14px;color:#666;">Numero de seguimiento</p>
      <p style="margin:0 0 20px;font-size:18px;font-weight:700;letter-spacing:.03em;color:#111;">${escapar(numero)}</p>
      <a href="${escapar(link)}?nums=${encodeURIComponent(numero)}"
         style="display:inline-block;padding:12px 18px;background:#00e676;color:#000;text-decoration:none;font-weight:700;border-radius:10px;font-size:15px;">
        Ver seguimiento
      </a>
      <p style="margin:22px 0 0;font-size:13px;line-height:1.45;color:#777;">
        Si tienes dudas, <a href="${escapar(wa)}" style="color:#111;">escribenos por WhatsApp</a>.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function armarTexto(plantilla, { numero, linkSeguimiento }) {
  const link = linkSeguimiento || LINK_SEGUIMIENTO;
  return [
    plantilla.titulo,
    '',
    ...plantilla.cuerpo,
    '',
    `Numero de seguimiento: ${numero}`,
    `Ver seguimiento: ${link}?nums=${encodeURIComponent(numero)}`,
  ].join('\n');
}

function escapar(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
