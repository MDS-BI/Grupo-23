import {
  listar,
  buscar,
  guardarRegistro,
  guardarCambios,
  fallo,
} from './almacenamiento.js';
import {
  referencia,
  numero,
  texto,
  fecha,
  rango,
  vacio,
} from './validacion.js';
import { obtenerRuta } from './rutas.js';
export const ESTADOS_ORDEN = [
  'Planificada',
  'En producción',
  'Finalizada',
  'Cancelada',
];
export const obtenerOrdenes = () => listar('ordenes');
export const obtenerEjecuciones = (id) =>
  listar('ejecuciones').filter((r) => Number(r.orden_id) === Number(id));
export function validarOrden(d) {
  const e = {};
  referencia(e, d, 'producto_id', 'productos', 'un producto');
  numero(e, d, 'cantidad_plan', 'La cantidad planificada');
  texto(e, d, 'estado', 'El estado');
  fecha(e, d, 'fecha_inicio', 'una fecha de inicio');
  fecha(e, d, 'fecha_fin', 'una fecha de término');
  rango(e, d, 'fecha_inicio', 'fecha_fin');
  const anterior = buscar('ordenes', d.orden_id);
  if (
    anterior &&
    Number(anterior.producto_id) !== Number(d.producto_id) &&
    (obtenerEjecuciones(d.orden_id).length ||
      listar('recepciones').some(
        (r) => Number(r.orden_id) === Number(d.orden_id),
      ))
  )
    e.producto_id =
      'No se puede cambiar el producto de una orden con movimientos registrados.';
  return e;
}
export const guardarOrden = (d, id) =>
  guardarRegistro(
    'ordenes',
    {
      ...d,
      producto_id: Number(d.producto_id),
      cantidad_plan: Number(d.cantidad_plan),
    },
    validarOrden,
    id,
  );
export function validarEjecucion(d) {
  const e = {};
  referencia(e, d, 'orden_id', 'ordenes', 'una orden');
  referencia(e, d, 'etapa_id', 'etapas', 'una etapa');
  referencia(e, d, 'maquina_id', 'maquinas', 'una máquina', true);
  referencia(e, d, 'trabajador_id', 'trabajadores', 'un trabajador', true);
  fecha(e, d, 'inicio_real', 'una fecha de inicio real', true);
  fecha(e, d, 'fin_real', 'una fecha de término real', true, true);
  rango(e, d, 'inicio_real', 'fin_real');
  const orden = buscar('ordenes', d.orden_id);
  if (
    orden &&
    !obtenerRuta(orden.producto_id).some(
      (r) => Number(r.etapa_id) === Number(d.etapa_id),
    )
  )
    e.etapa_id =
      'La etapa debe formar parte de la ruta del producto de esta orden.';
  return e;
}
export function guardarEjecucion(d, id) {
  const datos = {
    ...d,
    orden_id: Number(d.orden_id),
    etapa_id: Number(d.etapa_id),
    maquina_id: vacio(d.maquina_id) ? null : Number(d.maquina_id),
    trabajador_id: vacio(d.trabajador_id) ? null : Number(d.trabajador_id),
    fin_real: d.fin_real || null,
  };
  const e = validarEjecucion(datos);
  if (Object.keys(e).length) return { errores: e };
  datos.tiempo_uso_min = datos.fin_real
    ? Math.round(
        (new Date(datos.fin_real) - new Date(datos.inicio_real)) / 60000,
      )
    : null;
  return guardarRegistro('ejecuciones', datos, validarEjecucion, id);
}
export function avanceOrden(orden) {
  const ruta = obtenerRuta(orden.producto_id);
  const ejecuciones = obtenerEjecuciones(orden.orden_id);
  const terminadas = new Set(
    ejecuciones.filter((e) => e.fin_real).map((e) => Number(e.etapa_id)),
  );
  const completadas = ruta.filter((r) =>
    terminadas.has(Number(r.etapa_id)),
  ).length;
  return {
    total: ruta.length,
    completadas,
    porcentaje: ruta.length ? Math.round((completadas * 100) / ruta.length) : 0,
    minutos: ejecuciones.reduce(
      (n, e) => n + (Number(e.tiempo_uso_min) || 0),
      0,
    ),
  };
}
export function eliminarOrden(id) {
  if (!buscar('ordenes', id)) return fallo('La orden ya no existe.');
  return guardarCambios({
    ordenes: listar('ordenes').filter((o) => Number(o.orden_id) !== Number(id)),
    ejecuciones: listar('ejecuciones').filter(
      (e) => Number(e.orden_id) !== Number(id),
    ),
    recepciones: listar('recepciones').filter(
      (r) => Number(r.orden_id) !== Number(id),
    ),
  });
}
