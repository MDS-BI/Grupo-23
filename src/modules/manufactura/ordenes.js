import {
  listar,
  buscar,
  guardarRegistro,
  guardarCambios,
  fallo,
  eliminarRegistro,
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
import { analizarEliminacion } from './eliminacion.js';
export const MINIMO_PRODUCCION = 64;

export const ESTADOS_ORDEN = [
  'Planificada',
  'En producción',
  'Finalizada',
  'Cancelada',
];

export const obtenerOrdenes = () => listar('ordenes');

export const obtenerEjecuciones = (id) =>
  listar('ejecuciones').filter((r) => Number(r.orden_id) === Number(id));

export function validarOrden(d, { cantidadPedidos } = {}) {
  const e = {};
  referencia(e, d, 'producto_id', 'productos', 'un producto');
  numero(e, d, 'cantidad_plan', 'La cantidad planificada');
  texto(e, d, 'estado', 'El estado');
  fecha(e, d, 'fecha_inicio', 'una fecha de inicio');
  fecha(e, d, 'fecha_fin', 'una fecha de término');
  rango(e, d, 'fecha_inicio', 'fecha_fin');

  const anterior = buscar('ordenes', d.orden_id);
  if (anterior && anterior.estado !== 'Planificada' && Number(anterior.cantidad_plan) !== Number(d.cantidad_plan))
    e.cantidad_plan = 'Solo se puede cambiar la cantidad de un lote en planificación. La producción iniciada conserva su cantidad.';
  if (anterior && anterior.estado !== 'Planificada' && Number(anterior.producto_id) !== Number(d.producto_id))
    e.producto_id = 'Solo se puede cambiar el peluche de una orden en planificación.';
  const vinculados = listar('pedidos').filter((p) => Number(p.orden_id) === Number(d.orden_id));
  const asignados = cantidadPedidos ?? vinculados.reduce((suma, p) => suma + Number(p.cantidad), 0);
  if (d.estado === 'En producción' && anterior?.estado !== 'En producción' && asignados !== Number(d.cantidad_plan))
    e.estado = 'Antes de iniciar producción, asigna a locales todos los peluches del lote.';
  if (anterior && Number(anterior.producto_id) !== Number(d.producto_id) && vinculados.length)
    e.producto_id = 'La orden tiene pedidos vinculados. Conserva el modelo de peluche de esos pedidos.';
  if (asignados > Number(d.cantidad_plan))
    e.cantidad_plan = 'La cantidad del lote no puede ser menor que los pedidos ya asignados.';
  const cambiaLote = !anterior ||
    Number(anterior.cantidad_plan) !== Number(d.cantidad_plan) ||
    Number(anterior.producto_id) !== Number(d.producto_id);
  if (cambiaLote && (!Number.isInteger(Number(d.cantidad_plan)) ||
    Number(d.cantidad_plan) < MINIMO_PRODUCCION)) {
    e.cantidad_plan = `El lote mínimo es de ${MINIMO_PRODUCCION} peluches enteros por producto.`;
  }
  if (
    anterior &&
    Number(anterior.producto_id) !== Number(d.producto_id) &&
    (obtenerEjecuciones(d.orden_id).length ||
      listar('recepciones').some(
        (r) => Number(r.orden_id) === Number(d.orden_id),
      ))
  ) {
    e.producto_id =
      'No se puede cambiar el producto de una orden con movimientos registrados.';
  }

  if (!e.producto_id && !e.estado && d.estado === 'Finalizada') {
    const ruta = obtenerRuta(d.producto_id);
    const ejecuciones = anterior ? obtenerEjecuciones(d.orden_id) : [];
    const hayEnCurso = ejecuciones.some((ej) => !ej.fin_real);
    const terminadas = new Set(
      ejecuciones.filter((ej) => ej.fin_real).map((ej) => Number(ej.etapa_id)),
    );
    const faltantes = ruta.filter(
      (r) => !terminadas.has(Number(r.etapa_id)),
    ).length;

    if (!ruta.length) {
      e.estado =
        'No se puede finalizar una orden cuyo producto no tiene ruta de fabricación.';
    } else if (hayEnCurso) {
      e.estado =
        'No se puede finalizar la orden mientras tenga ejecuciones en curso sin fecha de término.';
    } else if (faltantes > 0) {
      e.estado = `No se puede finalizar la orden: faltan ${faltantes} de ${ruta.length} etapas por completar.`;
    }
  }

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
  ) {
    e.etapa_id =
      'La etapa debe formar parte de la ruta del producto de esta orden.';
  }

  if (!e.maquina_id && !vacio(d.maquina_id)) {
    const maquina = buscar('maquinas', d.maquina_id);
    const anterior = d.ejecucion_id ? buscar('ejecuciones', d.ejecucion_id) : null;
    const cambioMaquina =
      !anterior || Number(anterior.maquina_id) !== Number(d.maquina_id);

    if (
      maquina &&
      cambioMaquina &&
      ['Fuera de servicio', 'En mantenimiento'].includes(maquina.estado)
    ) {
      e.maquina_id = `La máquina "${maquina.nombre}" está ${maquina.estado.toLowerCase()} y no puede asignarse.`;
    }
  }

  return e;
}

export function guardarEjecucion(d, id) {
  const datos = {
    ...d,
    ejecucion_id: id,
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
  const estado = analizarEliminacion('ordenes', id);
  if (!estado.permitida) return fallo(estado.motivo);
  return guardarCambios({
    ordenes: listar('ordenes').filter((o) => Number(o.orden_id) !== Number(id)),
    ejecuciones: listar('ejecuciones').filter(
      (e) => Number(e.orden_id) !== Number(id),
    ),
    recepciones: listar('recepciones').filter(
      (r) => Number(r.orden_id) !== Number(id),
    ),
    pedidos: listar('pedidos').map((pedido) =>
      Number(pedido.orden_id) === Number(id) ? { ...pedido, orden_id: null } : pedido,
    ),
  });
}

export function eliminarEjecucion(id) {
  const estado = analizarEliminacion('ejecuciones', id);
  return estado.permitida ? eliminarRegistro('ejecuciones', id) : fallo(estado.motivo);
}
