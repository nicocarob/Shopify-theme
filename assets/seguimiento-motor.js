/*
  ============================================================
  MOTOR DE TRADUCCION DEL SEGUIMIENTO
  ============================================================

  Aca vive la logica que decide como se traduce cada movimiento.

  NO necesitas editar este archivo. Los textos y las reglas
  estan en seguimiento-estados.js.

  Esta separado a proposito: la pagina de la tienda y la
  herramienta de auditoria (proxy-seguimiento/auditar.mjs) usan
  este mismo codigo. Asi es imposible que una diga una cosa y la
  otra diga otra.
  ============================================================
*/

(function (raiz) {
  function crear(CFG) {
    var REGEX_CHILE = armarRegex(CFG.lugaresDeChile);
    var REGEX_OCULTAS = armarRegex(CFG.ubicacionesOcultas);

    function armarRegex(palabras) {
      var lista = palabras || [];
      if (lista.length === 0) return null;

      var escapadas = lista.map(function (palabra) {
        return String(palabra).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      });
      return new RegExp('\\b(' + escapadas.join('|') + ')\\b', 'i');
    }

    /*
      SUNYOU a veces manda la ciudad en el campo de ubicacion y otras
      veces pegada al texto del movimiento, asi que se revisan los dos.
    */
    function esDeChile(lugar, texto) {
      if (!REGEX_CHILE) return false;
      return REGEX_CHILE.test(String(lugar || '') + ' ' + String(texto || ''));
    }

    function limpiarUbicacion(lugar) {
      if (!lugar) return '';
      return REGEX_OCULTAS && REGEX_OCULTAS.test(lugar) ? '' : lugar;
    }

    /*
      Busca la primera regla que calce. El orden de la lista importa:
      lo mas especifico va primero.
    */
    function traducir(textoIngles, lugar) {
      var texto = String(textoIngles || '').toLowerCase();
      var reglas = CFG.eventos || [];
      var enChile = esDeChile(lugar, textoIngles);

      for (var i = 0; i < reglas.length; i++) {
        var regla = reglas[i];

        if (texto.indexOf(regla.busca) === -1) continue;
        if (regla.soloEnChile && !enChile) continue;
        if (regla.soloFueraDeChile && enChile) continue;

        return {
          es: regla.es,
          nota: regla.nota || '',
          nivel: regla.nivel || 0,
          traducido: true,
        };
      }

      return { es: CFG.eventoDesconocido, nota: '', nivel: 0, traducido: false };
    }

    function aFecha(valor) {
      if (!valor) return null;
      var fecha = new Date(String(valor).replace(' ', 'T'));
      return isNaN(fecha.getTime()) ? null : fecha;
    }

    /*
      Fecha en que el pedido salio hacia Chile. Es el punto de partida
      tanto del contador de dias como de la entrega estimada, asi los
      dos numeros siempre cuadran entre si.

      Devuelve null si el pedido todavia no ha salido.
    */
    function fechaDeSalida(eventos) {
      var desde = CFG.diasEnTransito && CFG.diasEnTransito.desde;
      if (!desde) return null;

      // Los eventos vienen del mas nuevo al mas viejo, asi que el
      // punto de partida es la coincidencia mas antigua.
      for (var i = eventos.length - 1; i >= 0; i--) {
        if (String(eventos[i].original || '').toLowerCase().indexOf(desde) !== -1) {
          return aFecha(eventos[i].fecha);
        }
      }
      return null;
    }

    function calcularDias(eventos, entregado, inicio) {
      var cfg = CFG.diasEnTransito;
      if (!cfg || !inicio) return '';

      var fin = entregado ? aFecha(eventos[0] && eventos[0].fecha) || new Date() : new Date();
      var dias = Math.floor((fin - inicio) / 86400000);

      if (dias <= 0) return entregado ? '' : cfg.hoy || '';

      if (entregado) {
        return dias === 1
          ? cfg.entregadoUnDia || ''
          : String(cfg.entregadoVarios || '').replace('{dias}', dias);
      }
      return dias === 1 ? cfg.unDia || '' : String(cfg.varios || '').replace('{dias}', dias);
    }

    function sumarDias(fecha, dias) {
      var copia = new Date(fecha.getTime());
      copia.setDate(copia.getDate() + dias);
      return copia;
    }

    /*
      Ventana de entrega estimada.

      Si aduana ya libero el paquete, se cuenta desde ese movimiento
      con la ventana corta (3-4 dias). Si no, se usa la de viaje
      internacional (9-16 dias desde Acceptance).
    */
    function calcularEstimado(eventos, entregado) {
      var cfg = CFG.entregaEstimada;
      if (!cfg || entregado) return null;

      var pivote = fechaPivoteEstimado(eventos);
      if (!pivote || !pivote.fecha) return null;

      var min = Number(pivote.minDias);
      var max = Number(pivote.maxDias);
      if (!isFinite(min) || !isFinite(max)) return null;

      var desde = sumarDias(pivote.fecha, min);
      var hasta = sumarDias(pivote.fecha, max);

      // Si ya se paso el ultimo dia del rango y el pedido no llego,
      // mostrar fechas viejas seria confuso.
      var limite = new Date(hasta.getTime());
      limite.setHours(23, 59, 59, 999);
      if (Date.now() > limite.getTime()) {
        return pivote.atrasado ? { texto: pivote.atrasado, atrasado: true } : null;
      }

      var texto = String(cfg.formato || '')
        .replace('{desde}', conDiaSemana(desde))
        .replace('{hasta}', sinDiaSemana(hasta));

      return { texto: texto, atrasado: false };
    }

    /*
      Elige desde donde contar el estimado:
        1. Si existe "Customs Clearance Success..." → desde ahi, 3-4 dias
        2. Si no, desde Acceptance → 9-16 dias
    */
    function fechaPivoteEstimado(eventos) {
      var cfg = CFG.entregaEstimada || {};
      var post = cfg.despuesDeAduana;

      if (post && post.desde) {
        // Del mas viejo al mas nuevo: la liberacion real de aduana.
        for (var i = eventos.length - 1; i >= 0; i--) {
          if (String(eventos[i].original || '').toLowerCase().indexOf(post.desde) !== -1) {
            var fechaAduana = aFecha(eventos[i].fecha);
            if (fechaAduana) {
              return {
                fecha: fechaAduana,
                minDias: post.minDias,
                maxDias: post.maxDias,
                atrasado: post.atrasado || cfg.atrasado || '',
              };
            }
          }
        }
      }

      var salida = fechaDeSalida(eventos);
      if (!salida) return null;

      return {
        fecha: salida,
        minDias: cfg.minDias,
        maxDias: cfg.maxDias,
        atrasado: cfg.atrasado || '',
      };
    }

    /*
      El locale es-CL mete una coma ("viernes, 4 de diciembre") que en
      una frase corrida se lee mal, asi que se saca.
    */
    function conDiaSemana(fecha) {
      return formatear(fecha, { weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '');
    }

    function sinDiaSemana(fecha) {
      return formatear(fecha, { day: 'numeric', month: 'long' });
    }

    function formatear(fecha, opciones) {
      try {
        return fecha.toLocaleDateString('es-CL', opciones);
      } catch (error) {
        return fecha.toLocaleDateString();
      }
    }

    function buscarNumeroCorreos(eventos) {
      var cfg = CFG.correosChile;
      if (!cfg || !cfg.patron) return '';

      // Solo cuando aduana ya libero. Antes el codigo de Correos
      // aparece en el texto de SUNYOU, pero el cliente aun no lo usa.
      if (cfg.mostrarDesde) {
        var liberada = false;
        for (var j = 0; j < eventos.length; j++) {
          if (
            String(eventos[j].original || '')
              .toLowerCase()
              .indexOf(cfg.mostrarDesde) !== -1
          ) {
            liberada = true;
            break;
          }
        }
        if (!liberada) return '';
      }

      var regex;
      try {
        regex = new RegExp(cfg.patron);
      } catch (error) {
        return '';
      }

      for (var i = 0; i < eventos.length; i++) {
        var encontrado = String(eventos[i].original || '').match(regex);
        if (encontrado) return encontrado[0];
      }
      return '';
    }

    /*
      Toma la respuesta cruda del proxy y devuelve todo lo que la
      pagina necesita mostrar, ya traducido y ordenado.
    */
    function procesar(datos) {
      var estados = CFG.estados || {};
      var estado = datos.estado || 'notfound';
      var entregado = estado === 'delivered';

      var eventos = (datos.eventos || []).map(function (evento) {
        var regla = traducir(evento.texto, evento.lugar);
        var nivel = regla.nivel;

        // Si el movimiento nombra un lugar de Chile, el pedido ya
        // esta en el pais aunque el texto del courier no lo diga.
        if (nivel < 4 && esDeChile(evento.lugar, evento.texto)) nivel = 4;

        return {
          es: regla.es,
          nota: regla.nota,
          nivel: nivel,
          traducido: regla.traducido,
          fecha: evento.fecha,
          lugar: limpiarUbicacion(evento.lugar),
          original: evento.texto,
        };
      });

      var alcanzado = eventos.reduce(function (maximo, evento) {
        return Math.max(maximo, evento.nivel);
      }, 0);

      if (entregado) alcanzado = 5;

      var info =
        estados[estado] ||
        estados.notfound || { titulo: 'Envio en curso', bajada: '', color: 'gris' };

      // El courier manda "transit" igual cuando el paquete viene
      // viajando y cuando ya esta en Chile. Si los movimientos
      // muestran que llego, se usa el texto que corresponde.
      if (estado === 'transit' && alcanzado >= 4 && estados.transitEnChile) {
        info = estados.transitEnChile;
      }

      var salida = fechaDeSalida(eventos);

      return {
        numero: datos.numero || '',
        estado: estado,
        entregado: entregado,
        info: info,
        eventos: eventos,
        alcanzado: alcanzado,
        dias: calcularDias(eventos, entregado, salida),
        estimado: calcularEstimado(eventos, entregado),
        numeroCorreos: buscarNumeroCorreos(eventos),
        sinTraducir: eventos.filter(function (evento) {
          return !evento.traducido;
        }),
      };
    }

    return { procesar: procesar, traducir: traducir, esDeChile: esDeChile, aFecha: aFecha };
  }

  raiz.SEGUIMIENTO_MOTOR = { crear: crear };
})(typeof window !== 'undefined' ? window : globalThis);
