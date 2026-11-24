import { ESTADOS_ORDEN } from './ordenes.js';

const cantidadValida = (valor) => {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0 ? numero : 0;
};

// Las unidades terminadas proceden del cierre de órdenes; las ejecuciones
// registran tiempos por etapa y no cantidades de peluches independientes.
export function calcularMetricasProduccion({
  ordenes = [], productos = [], etapas = [], ejecuciones = [], productoId = '',
} = {}) {
  const seleccionadas = productoId === '' ? ordenes : ordenes.filter((orden) =>
    Number(orden.producto_id) === Number(productoId),
  );
  const vigentes = seleccionadas.filter((orden) => orden.estado !== 'Cancelada');
  const idsOrdenes = new Set(vigentes.map((orden) => Number(orden.orden_id)));
  const terminadas = ejecuciones.filter((ejecucion) =>
    idsOrdenes.has(Number(ejecucion.orden_id)) &&
    ejecucion.fin_real && Number.isFinite(new Date(ejecucion.fin_real).getTime()) &&
    ejecucion.tiempo_uso_min != null && ejecucion.tiempo_uso_min !== '' &&
    Number.isFinite(Number(ejecucion.tiempo_uso_min)) && Number(ejecucion.tiempo_uso_min) >= 0,
  );
  const unidadesPlanificadas = vigentes.reduce((suma, orden) => suma + cantidadValida(orden.cantidad_plan), 0);
  const unidadesFinalizadas = vigentes.filter((orden) => orden.estado === 'Finalizada')
    .reduce((suma, orden) => suma + cantidadValida(orden.cantidad_plan), 0);
  const minutosRegistrados = terminadas.reduce((suma, ejecucion) => suma + Number(ejecucion.tiempo_uso_min), 0);

  const estados = [...ESTADOS_ORDEN, 'Sin estado válido'].map((estado) => ({
    nombre: estado,
    cantidad: seleccionadas.filter((orden) => estado === 'Sin estado válido'
      ? !ESTADOS_ORDEN.includes(orden.estado) : orden.estado === estado).length,
  })).filter((estado) => estado.nombre !== 'Sin estado válido' || estado.cantidad);

  const productosAgrupados = new Map();
  for (const orden of vigentes) {
    const id = Number(orden.producto_id);
    if (!productosAgrupados.has(id)) {
      productosAgrupados.set(id, {
        producto_id: id,
        nombre: productos.find((producto) => Number(producto.producto_id) === id)?.nombre || `Producto #${id}`,
        planificadas: 0,
        finalizadas: 0,
      });
    }
    const producto = productosAgrupados.get(id);
    producto.planificadas += cantidadValida(orden.cantidad_plan);
    if (orden.estado === 'Finalizada') producto.finalizadas += cantidadValida(orden.cantidad_plan);
  }

  const etapasAgrupadas = new Map();
  for (const ejecucion of terminadas) {
    const id = Number(ejecucion.etapa_id);
    if (!etapasAgrupadas.has(id)) {
      const etapa = etapas.find((registro) => Number(registro.etapa_id) === id);
      etapasAgrupadas.set(id, {
        etapa_id: id,
        nombre: etapa?.nombre || `Etapa #${id}`,
        estandar: cantidadValida(etapa?.tiempo_estandar_min) || null,
        minutos: 0,
        muestras: 0,
      });
    }
    const etapa = etapasAgrupadas.get(id);
    etapa.minutos += Number(ejecucion.tiempo_uso_min);
    etapa.muestras++;
  }

  return {
    totalOrdenes: seleccionadas.length,
    unidadesPlanificadas,
    unidadesFinalizadas,
    cumplimiento: unidadesPlanificadas ? (unidadesFinalizadas * 100) / unidadesPlanificadas : 0,
    minutosRegistrados,
    estados,
    porProducto: [...productosAgrupados.values()].sort((a, b) => b.planificadas - a.planificadas || a.producto_id - b.producto_id),
    porEtapa: [...etapasAgrupadas.values()].sort((a, b) => a.etapa_id - b.etapa_id)
      .map((etapa) => ({ ...etapa, promedio: etapa.minutos / etapa.muestras })),
  };
}
