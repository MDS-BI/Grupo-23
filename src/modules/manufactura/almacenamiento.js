import { esEtapaEnsamble, puedeModificarTabla, rolActual } from './roles.js';

export const tablas = {
  productos: 'producto_id',
  producto_material: 'prod_mat_id',
  etapas: 'etapa_id',
  rutas: 'ruta_id',
  ordenes: 'orden_id',
  ejecuciones: 'ejecucion_id',
  recepciones: 'recepcion_id',
  maquinas: 'maquina_id',
  mantenimientos: 'mantenimiento_id',
  mantenimiento_repuestos: 'mant_repuesto_id',
  equipamiento: 'equipamiento_id',
  asignaciones: 'asignacion_id',
  locales: 'local_id',
  pedidos: 'pedido_id',
};

export function listar(tabla) {
  try {
    const datos = JSON.parse(
      window.localStorage.getItem(`manufactura:${tabla}`) || '[]',
    );
    return Array.isArray(datos)
      ? datos.filter((dato) => dato && typeof dato === 'object')
      : [];
  } catch {
    return [];
  }
}

export const buscar = (tabla, id) =>
  listar(tabla).find((r) => Number(r[tablas[tabla]]) === Number(id));
export const siguienteId = (tabla, lista = listar(tabla)) =>
  lista.reduce((max, r) => Math.max(max, Number(r[tablas[tabla]]) || 0), 0) + 1;
export const fallo = (mensaje) => ({ errores: { general: mensaje } });

let historialEnMemoria = { pasos: [], firma: '' };
let usarHistorialEnMemoria = false;
const CLAVE_DESHACER = 'manufactura:deshacer';

function firmaActual() {
  return JSON.stringify(
    [...Object.keys(tablas), 'materiales_locales', 'demo_peluches', 'pedidos_demo']
      .map((tabla) => [tabla, listar(tabla)]),
  );
}

function leerHistorial() {
  if (usarHistorialEnMemoria) return historialEnMemoria;
  try {
    const contenido = window.sessionStorage.getItem(CLAVE_DESHACER);
    if (!contenido) return { pasos: [], firma: '' };
    const historial = JSON.parse(contenido);
    if (Array.isArray(historial?.pasos) && typeof historial.firma === 'string' &&
      historial.pasos.every((paso) => paso && typeof paso.rol === 'string' &&
        paso.anteriores && paso.posteriores &&
        Object.values(paso.anteriores).every(Array.isArray) &&
        Object.values(paso.posteriores).every(Array.isArray))) {
      return historial;
    }
    return { pasos: [], firma: '' };
  } catch {
    // El historial puede seguir disponible durante la sesión.
  }
  return historialEnMemoria;
}

function guardarHistorial(historial) {
  historialEnMemoria = historial;
  try {
    window.sessionStorage.setItem(CLAVE_DESHACER, JSON.stringify(historial));
    usarHistorialEnMemoria = false;
  } catch {
    usarHistorialEnMemoria = true;
    // El guardado de los registros conserva prioridad sobre el historial.
  }
}

export function cambioParaDeshacer(tabla, id) {
  const historial = leerHistorial();
  const paso = historial.pasos.at(-1);
  if (!paso || paso.rol !== rolActual() || historial.firma !== firmaActual()) return null;
  if (!Object.keys(paso.anteriores).every(puedeModificarTabla)) return null;
  if (tabla && !Object.hasOwn(paso.anteriores, tabla)) return null;
  if (tabla && id != null) {
    const campo = tablas[tabla];
    const anterior = paso.anteriores[tabla].find((r) => Number(r[campo]) === Number(id));
    const posterior = paso.posteriores[tabla].find((r) => Number(r[campo]) === Number(id));
    if (JSON.stringify(anterior) === JSON.stringify(posterior)) return null;
  }
  return paso;
}

export function deshacerUltimoCambio(tabla, id) {
  const paso = cambioParaDeshacer(tabla, id);
  if (!paso) return fallo('El cambio ya no está disponible para deshacer. Actualiza el listado.');
  const historial = leerHistorial();
  const resultado = guardarCambios(paso.anteriores, { registrarHistorial: false });
  if (resultado.errores) return resultado;
  guardarHistorial({ pasos: historial.pasos.slice(0, -1), firma: firmaActual() });
  window.dispatchEvent(new Event('manufactura:cambio'));
  return { errores: null };
}

// Guarda juntas las relaciones; si el navegador rechaza una escritura se recuperan los valores previos.
export function guardarCambios(cambios, { registrarHistorial = true } = {}) {
  const cargaPedidos = cambios.pedidos_demo && listar('demo_peluches').length > 0 &&
    !listar('pedidos').length && !listar('locales').length &&
    Object.keys(cambios).every((tabla) => ['locales', 'pedidos', 'pedidos_demo'].includes(tabla));
  const cargaInicial = cargaPedidos || (cambios.demo_peluches &&
    !Object.keys(tablas).some((tabla) => listar(tabla).length > 0));
  const anteriores = new Map();
  const firmaAnterior = firmaActual();
  try {
    for (const tabla of Object.keys(cambios)) {
      const clave = `manufactura:${tabla}`;
      const anterior = window.localStorage.getItem(clave);
      if (anterior !== null) {
        let parsed;
        try {
          parsed = JSON.parse(anterior);
        } catch {
          return fallo(
            `Los datos de ${tabla} están dañados. No se sobrescribieron.`,
          );
        }
        if (!Array.isArray(parsed))
          return fallo(
            `Los datos de ${tabla} no son una lista válida. No se sobrescribieron.`,
          );
      }
      anteriores.set(clave, anterior);
      const registros = anterior === null ? [] : JSON.parse(anterior);
      if (JSON.stringify(registros) === JSON.stringify(cambios[tabla])) continue;
      if (!cargaInicial && !puedeModificarTabla(tabla)) {
        return fallo('Tu rol no permite modificar estos registros.');
      }
      if (tabla === 'recepciones' && !cambios.demo_peluches) {
        const nuevas = new Set(cambios[tabla].map((registro) => JSON.stringify(registro)));
        const originalesConservados = registros.every((registro) =>
          nuevas.has(JSON.stringify(registro)),
        );
        if (!originalesConservados) {
          return fallo('Las recepciones registradas se conservan como historial y no se pueden editar ni eliminar.');
        }
      }
      if (!cargaInicial && tabla === 'ejecuciones' && rolActual() === 'ensamble') {
        const previos = new Set(registros.map((registro) => JSON.stringify(registro)));
        const nuevos = new Set(cambios[tabla].map((registro) => JSON.stringify(registro)));
        const modificados = [...registros, ...cambios[tabla]].filter((registro) =>
          !previos.has(JSON.stringify(registro)) || !nuevos.has(JSON.stringify(registro)),
        );
        if (modificados.some((registro) =>
          !esEtapaEnsamble(buscar('etapas', registro.etapa_id)) ||
          !['Planificada', 'En producción'].includes(buscar('ordenes', registro.orden_id)?.estado),
        )) {
          return fallo('Ensamble solo puede registrar ejecuciones de sus etapas en órdenes abiertas.');
        }
      }
    }
    for (const [tabla, datos] of Object.entries(cambios))
      window.localStorage.setItem(
        `manufactura:${tabla}`,
        JSON.stringify(datos),
      );
    if (registrarHistorial) {
      const tablasCambiadas = Object.keys(cambios).filter((tabla) =>
        JSON.stringify(JSON.parse(anteriores.get(`manufactura:${tabla}`) || '[]')) !==
        JSON.stringify(cambios[tabla]),
      );
      if (tablasCambiadas.length) {
        const historial = leerHistorial();
        const pasos = historial.firma === firmaAnterior ? historial.pasos : [];
        const esHistorialProtegido = tablasCambiadas.some(
          (tabla) => ['recepciones', 'demo_peluches', 'pedidos_demo'].includes(tabla),
        );
        const paso = {
          rol: rolActual(),
          anteriores: Object.fromEntries(tablasCambiadas.map((tabla) => [
            tabla, JSON.parse(anteriores.get(`manufactura:${tabla}`) || '[]'),
          ])),
          posteriores: Object.fromEntries(tablasCambiadas.map((tabla) => [tabla, cambios[tabla]])),
        };
        guardarHistorial({
          pasos: esHistorialProtegido ? [] : [...pasos, paso].slice(-20),
          firma: firmaActual(),
        });
      }
    }
    window.dispatchEvent(new Event('manufactura:cambio'));
    return { errores: null };
  } catch {
    for (const [clave, valor] of anteriores) {
      try {
        if (valor === null) window.localStorage.removeItem(clave);
        else window.localStorage.setItem(clave, valor);
      } catch {
        /* El navegador puede impedir también la recuperación. */
      }
    }
    return fallo(
      'No se pudo guardar. Revisa el espacio o los permisos de almacenamiento del navegador.',
    );
  }
}

export function guardarRegistro(tabla, datos, validador, id) {
  const previo = id == null ? null : buscar(tabla, id);
  if (id != null && !previo)
    return fallo('El registro ya no existe. Actualiza el listado.');
  const registro = {
    ...previo,
    ...datos,
    [tablas[tabla]]: previo?.[tablas[tabla]] ?? siguienteId(tabla),
  };
  const errores = validador(registro);
  if (Object.keys(errores).length) return { registro: null, errores };
  const lista = listar(tabla);
  const resultado = guardarCambios({
    [tabla]: previo
      ? lista.map((r) =>
          Number(r[tablas[tabla]]) === Number(id) ? registro : r,
        )
      : [...lista, registro],
  });
  return { ...resultado, registro: resultado.errores ? null : registro };
}

export function eliminarRegistro(tabla, id) {
  return guardarCambios({
    [tabla]: listar(tabla).filter(
      (r) => Number(r[tablas[tabla]]) !== Number(id),
    ),
  });
}
