/*
  ============================================================
  TRADUCCIONES DEL SEGUIMIENTO SUNYOU
  ============================================================

  Este es el unico archivo que necesitas editar para cambiar
  como se leen los estados del envio.

  Todo lo que ve el cliente sale de aca. Si un estado te suena
  mal, cambia el texto de la derecha ("es") y listo.
  ============================================================
*/

window.SEGUIMIENTO_CONFIG = {
  /*
    URL de tu proxy (el Cloudflare Worker).
    Reemplazala por la tuya cuando lo tengas publicado.
    Ejemplo: 'https://seguimiento-lacabala.lacabalachile.workers.dev'
  */
  proxyUrl: 'https://seguimiento-lacabala.lacabalachile.workers.dev',

  /*
    Poner en true para ver la pagina con datos de ejemplo,
    sin necesidad de tener el proxy funcionando todavia.
  */
  modoDemo: false,

  /*
    ------------------------------------------------------------
    ETAPAS DE LA BARRA DE PROGRESO
    ------------------------------------------------------------
    Son los 5 hitos grandes que ve el cliente arriba.
    Puedes cambiar los nombres o agregar/quitar etapas.
  */
  etapas: [
    { nivel: 1, nombre: 'Pedido recibido' },
    { nivel: 2, nombre: 'Enviado' },
    { nivel: 3, nombre: 'En transito' },
    { nivel: 4, nombre: 'En reparto' },
    { nivel: 5, nombre: 'Entregado' },
  ],

  /*
    ------------------------------------------------------------
    UBICACIONES QUE NUNCA SE MUESTRAN
    ------------------------------------------------------------
    Si el lugar de un movimiento coincide con alguna de estas
    palabras, el lugar se oculta completo y el cliente solo ve
    la fecha.

    Sirve para que no aparezca de donde salio el pedido.
    La comparacion es por palabra completa, asi que "cn" no
    afecta a nombres como "Concepcion".
  */
  ubicacionesOcultas: [
    'shenzhen',
    'shen zhen',
    'guangzhou',
    'guangdong',
    'shanghai',
    'yiwu',
    'hong kong',
    'hongkong',
    'china',
    'cn',
    'hk',
  ],

  /*
    ------------------------------------------------------------
    LUGARES DE CHILE
    ------------------------------------------------------------
    Cuando un movimiento nombra un lugar de Chile, significa que
    el pedido ya lo tiene Correos de Chile.

    Esto se usa para dos cosas:

      1. Elegir la traduccion correcta cuando el mismo texto en
         ingles significa cosas distintas segun donde este.
         Ejemplo: "The shipment is in transit" dicho desde China
         es "viajando hacia Chile", pero dicho desde Santiago es
         "en camino con Correos de Chile".

      2. Marcar la etapa "En Chile" en la barra de progreso, aunque
         el texto del courier no lo diga explicitamente.

    Si te falta una ciudad, agregala nomas.

    OJO: no agregues la palabra "chile" sola. Los movimientos de
    origen dicen "Acceptance, Sent To Chile" y "Pre-Shipment Info
    Sent To Chile", asi que la palabra aparece cuando el pedido
    todavia no ha salido. Solo ciudades y lugares.
  */
  lugaresDeChile: [
    'aeropuerto',
    'santiago',
    'vina del mar',
    'viña del mar',
    'valparaiso',
    'valparaíso',
    'quilpue',
    'concon',
    'coquimbo',
    'la serena',
    'antofagasta',
    'calama',
    'iquique',
    'arica',
    'copiapo',
    'rancagua',
    'talca',
    'chillan',
    'concepcion',
    'concepción',
    'temuco',
    'valdivia',
    'osorno',
    'puerto montt',
    'punta arenas',
    'coyhaique',
    'curico',
    'los angeles',
    'rm',
  ],

  /*
    ------------------------------------------------------------
    CONTADOR DE DIAS EN TRANSITO
    ------------------------------------------------------------
    "desde" es el movimiento donde arranca el conteo. Por defecto
    empieza cuando SUNYOU avisa "Acceptance, Sent To Chile".

    Escribe {dias} donde quieras que salga el numero.
  */
  diasEnTransito: {
    desde: 'acceptance, sent to',

    hoy: 'Tu pedido salio hoy',
    unDia: 'Tu pedido lleva 1 dia en transito',
    varios: 'Tu pedido lleva {dias} dias en transito',

    entregadoUnDia: 'Tu pedido llego en 1 dia',
    entregadoVarios: 'Tu pedido llego en {dias} dias',
  },

  /*
    ------------------------------------------------------------
    ENTREGA ESTIMADA
    ------------------------------------------------------------
    Por defecto se calcula desde "Acceptance, Sent To Chile"
    sumando minDias / maxDias (9 a 16 dias corridos).

    Cuando SUNYOU marca que aduana ya libero el paquete
    ("Customs Clearance Successed" → "Aduana liberada"), el
    estimado se recalcula desde ESE movimiento con la ventana
    de despuesDeAduana (3 a 4 dias), porque desde ahi Correos
    de Chile suele entregar rapido.

    {desde} = dia de la semana + fecha del minimo
    {hasta} = fecha del maximo

    No se muestra si el pedido todavia no ha salido, ni si ya llego.
    Si se paso la fecha maxima, se usa "atrasado".
  */
  entregaEstimada: {
    minDias: 9,
    maxDias: 16,
    titulo: 'Entrega estimada',
    formato: 'entre {desde} y {hasta}',
    atrasado:
      'El estimado de 9 a 16 dias ya se cumplio. Si todavia no te llega, escribenos y lo revisamos.',

    despuesDeAduana: {
      desde: 'customs clearance success',
      minDias: 3,
      maxDias: 4,
      atrasado:
        'El estimado de 3 a 4 dias desde que aduana libero ya se cumplio. Si todavia no te llega, escribenos y lo revisamos.',
    },
  },

  /*
    ------------------------------------------------------------
    NUMERO DE CORREOS DE CHILE
    ------------------------------------------------------------
    SUNYOU manda el numero de Correos de Chile dentro del texto
    del movimiento, asi:

      "Departed Sunyou Facility, Carrier Tracking Number: SX016414685CL"

    Solo se muestra DESPUES de Hand Over To Last Mile
    ("mostrarDesde"). Antes de eso el cliente aun no lo puede
    usar en Correos de Chile, asi que no tiene sentido mostrarlo.
  */
  correosChile: {
    patron: '\\b[A-Z]{2}\\d{9}CL\\b',
    mostrarDesde: ['hand over to last mile', 'handed over to last mile'],
    titulo: 'Numero para Correos de Chile',
    explicacion:
      'Con este numero puedes seguir tu pedido en el sitio de Correos de Chile.',
    enlace: 'https://www.correos.cl/',
    textoEnlace: 'Seguir en Correos de Chile',
  },

  /*
    ------------------------------------------------------------
    ESTADO GENERAL DEL ENVIO (el cartel grande de arriba)
    ------------------------------------------------------------
    "titulo"  = texto grande
    "bajada"  = texto chico explicativo
    "color"   = verde | azul | amarillo | rojo | gris
  */
  estados: {
    pending: {
      titulo: 'Pedido confirmado',
      bajada: 'Tu pedido ya fue armado. Pronto tendrás novedades.',
      color: 'gris',
    },
    inforeceived: {
      titulo: 'Pedido registrado',
      bajada: 'Tu pedido ya está en fila para despacho.',
      color: 'azul',
    },
    transit: {
      titulo: 'Tu pedido va en camino',
      bajada: 'Tu paquete fue despachado desde nuestro centro logístico y va en camino.',
      color: 'azul',
    },
    /*
      SUNYOU reporta "transit" tanto cuando el paquete viene volando
      como cuando ya esta en Chile. Este se usa en el segundo caso,
      para no decirle al cliente que viene viajando cuando ya llego.
    */
    transitEnChile: {
      titulo: 'Tu pedido ya esta en Chile',
      bajada: 'Esta en manos de Correos de Chile para la entrega final.',
      color: 'azul',
    },
    pickup: {
      titulo: 'Salio a reparto',
      bajada: 'El courier lo lleva hoy a tu direccion.',
      color: 'verde',
    },
    delivered: {
      titulo: 'Entregado',
      bajada: 'Tu pedido llego a destino. Gracias por comprar con nosotros.',
      color: 'verde',
    },
    undelivered: {
      titulo: 'No se pudo entregar',
      bajada: 'El courier intento entregar pero no habia nadie. Va a reintentar.',
      color: 'amarillo',
    },
    exception: {
      titulo: 'Envio con novedad',
      bajada: 'Hubo un imprevisto con tu paquete. Escribenos y lo revisamos.',
      color: 'rojo',
    },
    expired: {
      titulo: 'Sin novedades hace tiempo',
      bajada: 'Este envio lleva mucho sin actualizarse. Contactanos y lo averiguamos.',
      color: 'amarillo',
    },
    notfound: {
      titulo: 'Todavia sin informacion',
      bajada:
        'El numero es valido pero el courier aun no carga movimientos. Suele tardar 2 a 5 dias en aparecer.',
      color: 'gris',
    },
  },

  /*
    ------------------------------------------------------------
    TRADUCCION DE CADA MOVIMIENTO
    ------------------------------------------------------------
    Como funciona:

      "busca" -> texto en ingles que manda SUNYOU (en minusculas).
                 No necesita ser exacto: basta con que el texto
                 del courier CONTENGA esto.

      "es"    -> lo que va a leer tu cliente.

      "nivel" -> a que etapa de la barra corresponde (1 a 5).

      "nota"  -> opcional. Un texto mas largo que aparece debajo,
                 en letra chica, para explicarle algo al cliente
                 cuando el movimiento se presta a confusion.

      "soloEnChile"      -> opcional. La regla solo aplica si el
                            movimiento nombra un lugar de Chile.
      "soloFueraDeChile" -> opcional. Solo aplica si todavia no
                            esta en Chile.

    Las dos ultimas sirven para los textos que SUNYOU usa con
    doble significado, como "The shipment is in transit".

    IMPORTANTE: se revisa de arriba hacia abajo y gana la primera
    coincidencia. Por eso lo mas especifico va primero.
    Si agregas una regla nueva, ponla arriba de las genericas.
  */
  eventos: [
    /*
      Estados propios de SUNYOU.

      Van primero a proposito: son los mas especificos. Si quedaran
      mas abajo, una regla generica como "sent to" los atraparia
      antes y los traduciria mal.
    */
    { busca: 'pre-shipment info sent to', es: 'Tu pedido fue preparado', nivel: 1 },
    { busca: 'acceptance, sent to', es: 'Tu pedido fue enviado', nivel: 2 },
    { busca: 'departed sunyou facility', es: 'El paquete está en tránsito', nivel: 3 },

    // Salio del aeropuerto de Santiago: desde aca lo mueve Correos de Chile
    {
      busca: 'hand over to last mile',
      es: 'Salio del aeropuerto de Santiago y va en camino',
      nivel: 4,
    },
    {
      busca: 'handed over to last mile',
      es: 'Salio del aeropuerto de Santiago y va en camino',
      nivel: 4,
    },
    { busca: 'last mile', es: 'En manos de Correos de Chile', nivel: 4 },

    // ---- Entrega final ----
    { busca: 'delivered', es: 'Entregado', nivel: 5 },
    { busca: 'signed for', es: 'Entregado y firmado', nivel: 5 },
    { busca: 'successfully delivered', es: 'Entregado', nivel: 5 },

    // ---- Reparto local ----
    { busca: 'delivery in progress', es: 'En camino a tu domicilio', nivel: 4 },
    { busca: 'out for delivery', es: 'En camino a tu domicilio', nivel: 4 },
    { busca: 'failed attempt', es: 'Intento de entrega fallido', nivel: 4 },
    { busca: 'notice left', es: 'El courier dejo aviso de visita', nivel: 4 },
    { busca: 'available for pickup', es: 'Disponible para retiro en sucursal', nivel: 4 },
    { busca: 'handed over to the carrier', es: 'Entregado al courier local', nivel: 4 },
    { busca: 'handed over', es: 'Entregado al courier local', nivel: 4 },

    // ---- Ya en Chile ----
    {
      busca: 'arrived at regional facility',
      es: 'En centro de distribucion de Correos de Chile',
      nivel: 4,
    },
    { busca: 'arrival at regional sorting center', es: 'En centro de clasificacion regional', nivel: 4 },
    { busca: 'departure from regional sorting center', es: 'Salio del centro regional', nivel: 4 },
    {
      busca: 'arrived at facility',
      soloEnChile: true,
      es: 'En centro de distribucion de Correos de Chile',
      nivel: 4,
    },
    { busca: 'arrived at facility', es: 'En centro de distribucion', nivel: 4 },
    { busca: 'arrival at processing center', es: 'En centro de procesamiento', nivel: 4 },
    { busca: 'arrived at destination country airport', es: 'Llego al aeropuerto en Chile', nivel: 4 },
    { busca: 'arrival at destination', es: 'Llego a Chile', nivel: 4 },
    { busca: 'arrived at destination', es: 'Llego a Chile', nivel: 4 },

    // ---- Aduana ----
    // "Successed" y "In Process" son las palabras exactas que usa
    // SUNYOU. No son las mismas que "completed" ni "in progress".
    { busca: 'customs clearance success', es: 'Aduana liberada', nivel: 4 },
    { busca: 'customs clearance in process', es: 'En proceso de aduana', nivel: 4 },
    {
      busca: 'customs clearance inspection',
      es: 'En revision de aduana',
      nota:
        'Aduanas está revisando el pago de impuestos. Los impuestos ya están pagados por nosotros, ' +
        'así que deberían liberarlo pronto. Si pasan varios días sin cambios, escríbenos y lo vemos.',
      nivel: 4,
    },
    { busca: 'customs clearance was completed', es: 'Aduana liberada', nivel: 4 },
    { busca: 'customs clearance completed', es: 'Aduana liberada', nivel: 4 },
    { busca: 'released from customs', es: 'Liberado por aduana', nivel: 4 },
    { busca: 'item returned from customs', es: 'Devuelto por aduana', nivel: 4 },
    { busca: 'held at customs', es: 'Retenido en aduana', nivel: 4 },
    { busca: 'item presented to customs', es: 'Presentado ante aduana', nivel: 4 },
    { busca: 'customs clearance in progress', es: 'En proceso de aduana', nivel: 4 },
    { busca: 'customs cleared in the country of origin', es: 'Aduana de origen liberada', nivel: 2 },
    { busca: 'export customs cleared', es: 'Aduana de origen liberada', nivel: 2 },
    { busca: 'customs', es: 'Tramite de aduana', nivel: 4 },

    // ---- Transito internacional ----
    { busca: 'departed from port of origin', es: 'Salio del pais de origen', nivel: 3 },
    { busca: 'arrived at the port of origin', es: 'Llego al puerto de origen', nivel: 2 },
    { busca: 'dispatched from office of exchange', es: 'Despachado al extranjero', nivel: 3 },
    { busca: 'departure from airport', es: 'Despego el vuelo', nivel: 3 },
    { busca: 'flight departed', es: 'Despego el vuelo', nivel: 3 },
    // "in transit" cambia de significado segun donde este el paquete
    { busca: 'in transit', soloEnChile: true, es: 'En camino con Correos de Chile', nivel: 4 },
    { busca: 'in transit', es: 'Viajando hacia Chile', nivel: 3 },
    { busca: 'sent to', es: 'Despachado a destino', nivel: 3 },

    // ---- Origen: bodega y clasificacion ----
    { busca: 'departure from local sorting center', es: 'Salio del centro de clasificacion', nivel: 2 },
    { busca: 'arrival at local sorting center', es: 'Llego al centro de clasificacion', nivel: 2 },
    { busca: 'sorting center', es: 'En centro de clasificacion', nivel: 2 },
    { busca: 'picked up', es: 'Retirado por el courier', nivel: 2 },
    { busca: 'acceptance', es: 'Aceptado por el courier', nivel: 2 },
    { busca: 'package received', es: 'Pedido recibido en bodega', nivel: 1 },
    { busca: 'shipment information received', es: 'Pedido registrado', nivel: 1 },
    { busca: 'electronic information', es: 'Pedido registrado', nivel: 1 },
    { busca: 'information received', es: 'Pedido registrado', nivel: 1 },
    { busca: 'order processed', es: 'Pedido procesado', nivel: 1 },

    // ---- Problemas ----
    { busca: 'returned to sender', es: 'Devuelto al remitente', nivel: 4 },
    { busca: 'refused', es: 'Entrega rechazada', nivel: 4 },
    { busca: 'damaged', es: 'Paquete danado', nivel: 4 },
    { busca: 'lost', es: 'Paquete extraviado', nivel: 4 },
    { busca: 'delay', es: 'Envio con retraso', nivel: 3 },
    { busca: 'exception', es: 'Envio con novedad', nivel: 3 },
  ],

  /*
    ------------------------------------------------------------
    TEXTO PARA MOVIMIENTOS SIN TRADUCCION
    ------------------------------------------------------------
    Si el courier manda algo que no esta en la lista de arriba,
    el cliente ve este texto en vez del ingles.
  */
  eventoDesconocido: 'Tu pedido avanzo un paso mas',
};
