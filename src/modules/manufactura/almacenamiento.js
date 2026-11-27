import { esEtapaEnsamble, puedeModificarTabla, rolActual } from './roles.js';
import { prepararCambio } from './historial-cambios.js';

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
export function siguienteId(tabla, lista) {
  const campo = tabla === 'materiales_locales' ? 'material_id' : tablas[tabla];
  const registros = lista ?? [
    ...listar(tabla),
    ...leerHistorial().pasos.flatMap((p) => [...(p.anteriores[tabla] || []), ...(p.posteriores[tabla] || [])]),
  ];
  const ids = registros.map((r) => Number(r[campo]) || 0);
  return tabla === 'materiales_locales' ? Math.min(0, ...ids) - 1 : Math.max(0, ...ids) + 1;
}
export const fallo = (mensaje) => ({ errores: { general: mensaje } });

let historialEnMemoria = { pasos: [], firma: '', revision: 0 };
let usarHistorialEnMemoria = false;
const CLAVE_DESHACER = 'manufactura:deshacer';

function firmaActual() {
  return JSON.stringify(
    [...Object.keys(tablas), 'materiales_locales', 'demo_peluches', 'pedidos_demo']
      .map((tabla) => [tabla, listar(tabla)]),
  );
}

function interpretarHistorial(contenido) {
  try {
    const historial = JSON.parse(contenido);
    if (Array.isArray(historial?.pasos) && historial.pasos.length <= 20 && typeof historial.firma === 'string' &&
      historial.pasos.every((paso) => paso && typeof paso.rol === 'string' &&
        paso.anteriores && paso.posteriores &&
        Object.keys(paso.anteriores).length > 0 &&
        Object.keys(paso.anteriores).length === Object.keys(paso.posteriores).length &&
        Object.keys(paso.anteriores).every((tabla) => Object.hasOwn(paso.posteriores, tabla)) &&
        Object.values(paso.anteriores).every(Array.isArray) &&
        Object.values(paso.posteriores).every(Array.isArray))) {
      return { ...historial, pasos: historial.pasos.map((paso, i) => ({ ...paso, id: paso.id || `anterior-${i}` })), revision: Number.isSafeInteger(historial.revision) ? historial.revision : 0 };
    }
  } catch { /* Se intenta la otra copia antes de descartar el historial. */ }
  return null;
}

function leerHistorial() {
  const candidatos = [];
  let errorLectura = false;
  // Los datos y su recuperación comparten persistencia. La copia de sesión
  // permite migrar historiales anteriores y sirve de respaldo si hay cuota.
  for (const nombre of ['localStorage', 'sessionStorage']) {
    try {
      const contenido = window[nombre].getItem(CLAVE_DESHACER);
      if (contenido == null) continue;
      const historial = interpretarHistorial(contenido);
      if (historial) candidatos.push(historial);
      else errorLectura = true;
    } catch { errorLectura = true; }
  }
  if (usarHistorialEnMemoria || errorLectura) candidatos.push(historialEnMemoria);
  historialEnMemoria = candidatos.reduce((ultimo, candidato) =>
    !ultimo || candidato.revision > ultimo.revision ? candidato : ultimo,
  null) || { pasos: [], firma: '', revision: 0 };
  return historialEnMemoria;
}

function guardarHistorial(historial) {
  historialEnMemoria = { ...historial, revision: historialEnMemoria.revision + 1 };
  let guardado = false;
  for (const nombre of ['localStorage', 'sessionStorage']) {
    try {
      window[nombre].setItem(CLAVE_DESHACER, JSON.stringify(historialEnMemoria));
      guardado = true;
    } catch { /* La otra copia o la memoria conservan la recuperación. */ }
  }
  usarHistorialEnMemoria = !guardado;
}

export function estadoDeshacer(tabla, id) {
  const historial = leerHistorial();
  const paso = historial.pasos.findLast((p) => !p.deshecho && !p.oculto);
  const noDisponible = (motivo) => ({ cambio: null, motivo });
  if (!paso) return noDisponible('No hay cambios guardados disponibles para deshacer.');
  if (paso.rol !== rolActual()) return noDisponible('Selecciona el rol que realizó el último cambio para deshacerlo.');
  if (historial.firma !== firmaActual()) return noDisponible('Los datos cambiaron fuera del historial. Ese cambio ya no se puede deshacer.');
  if (!Object.keys(paso.anteriores).every(puedeModificarTabla)) return noDisponible('Tu rol no permite deshacer este cambio.');
  if (tabla && !Object.hasOwn(paso.anteriores, tabla)) return noDisponible('El último cambio corresponde a otra sección.');
  if (tabla && id != null) {
    const campo = tablas[tabla];
    const anterior = paso.anteriores[tabla].find((r) => Number(r[campo]) === Number(id));
    const posterior = paso.posteriores[tabla].find((r) => Number(r[campo]) === Number(id));
    if (JSON.stringify(anterior) === JSON.stringify(posterior)) return noDisponible('Este registro no tiene un cambio reciente para deshacer.');
  }
  return estadoCambio(paso.id);
}

export const cambioParaDeshacer = (tabla, id) => estadoDeshacer(tabla, id).cambio;

export function deshacerUltimoCambio(tabla, id) {
  const paso = cambioParaDeshacer(tabla, id);
  if (!paso) return fallo('El cambio ya no está disponible para deshacer. Actualiza el listado.');
  return deshacerCambio(paso.id);
}

export function historialCambios(tabla) {
  return leerHistorial().pasos.filter((p) => !p.oculto && p.rol === rolActual() &&
    Object.keys(p.anteriores).every(puedeModificarTabla) &&
    (!tabla || Object.hasOwn(p.anteriores, tabla))).toReversed();
}

export function estadoCambio(cambioId) {
  const historial = leerHistorial();
  const paso = historial.pasos.find((p) => p.id === cambioId);
  const noDisponible = (motivo) => ({ cambio: null, motivo });
  if (!paso) return noDisponible('El cambio ya no está en los últimos 20 registros del historial.');
  if (paso.oculto) return noDisponible('El aviso de este cambio fue descartado.');
  if (paso.rol !== rolActual() || !Object.keys(paso.anteriores).every(puedeModificarTabla))
    return noDisponible('Tu rol no permite revertir este cambio.');
  if (paso.protegido) return noDisponible('Las recepciones guardadas se conservan como historial.');
  if (historial.firma !== firmaActual()) return noDisponible('Los datos cambiaron fuera del historial. Actualiza el listado antes de continuar.');
  const actuales = Object.fromEntries([...Object.keys(tablas), 'materiales_locales'].map((tabla) => [tabla, listar(tabla)]));
  const preparado = prepararCambio(paso, actuales, { ...tablas, materiales_locales: 'material_id' }, !!paso.deshecho);
  return preparado.motivo ? noDisponible(preparado.motivo) : { cambio: paso, cambios: preparado.cambios, motivo: '' };
}

function revertirCambio(cambioId, rehacer) {
  const estado = estadoCambio(cambioId);
  if (!estado.cambio) return fallo(estado.motivo);
  if (!!estado.cambio.deshecho !== rehacer) return fallo('El estado de este cambio ya se actualizó.');
  const historial = leerHistorial();
  const resultado = guardarCambios(estado.cambios, { registrarHistorial: false });
  if (resultado.errores) return resultado;
  guardarHistorial({ pasos: historial.pasos.map((p) => p.id === cambioId ? { ...p, deshecho: !rehacer } : p), firma: firmaActual() });
  window.dispatchEvent(new CustomEvent('manufactura:cambio', {
    detail: { accion: rehacer ? 'rehacer' : 'deshacer', tablas: Object.keys(estado.cambios) },
  }));
  return { errores: null };
}

export const deshacerCambio = (id) => revertirCambio(id, false);
export const rehacerCambio = (id) => revertirCambio(id, true);

export function descartarAvisoCambio(id) {
  const historial = leerHistorial();
  const paso = historial.pasos.find((p) => p.id === id);
  if (!paso || paso.rol !== rolActual() || !Object.keys(paso.anteriores).every(puedeModificarTabla))
    return fallo('Tu rol no permite descartar este aviso.');
  guardarHistorial({ ...historial, pasos: historial.pasos.map((p) => p.id === id ? { ...p, oculto: true } : p) });
  window.dispatchEvent(new CustomEvent('manufactura:cambio', { detail: { accion: 'descartar', tablas: [] } }));
  return { errores: null };
}

// Guarda juntas las relaciones; si el navegador rechaza una escritura se recuperan los valores previos.
export function guardarCambios(cambios, { registrarHistorial = true, ajusteLotes = false } = {}) {
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
          return fallo('El operario de producción solo puede registrar ejecuciones de sus etapas en órdenes abiertas.');
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
        const reiniciar = tablasCambiadas.some((tabla) => ['demo_peluches', 'pedidos_demo'].includes(tabla));
        const paso = {
          id: `cambio-${historial.revision + 1}`,
          fecha: new Date().toISOString(),
          deshecho: false,
          ajusteLotes,
          protegido: tablasCambiadas.includes('recepciones'),
          rol: rolActual(),
          anteriores: Object.fromEntries(tablasCambiadas.map((tabla) => [
            tabla, JSON.parse(anteriores.get(`manufactura:${tabla}`) || '[]'),
          ])),
          posteriores: Object.fromEntries(tablasCambiadas.map((tabla) => [tabla, cambios[tabla]])),
        };
        guardarHistorial({
          pasos: reiniciar ? [] : [...pasos, paso].slice(-20),
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
  if (!buscar(tabla, id)) return fallo('El registro ya no existe. Actualiza el listado.');
  return guardarCambios({
    [tabla]: listar(tabla).filter(
      (r) => Number(r[tablas[tabla]]) !== Number(id),
    ),
  });
}
