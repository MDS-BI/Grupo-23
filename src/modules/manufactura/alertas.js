import { fechaValida } from './validacion.js';
import { nombreReferencia } from './referencias.js';

export function calcularAlertasProduccion(
  {
    ordenes = [],
    maquinas = [],
    etapas = [],
    ejecuciones = [],
    recepciones = [],
    productoMaterial = [],
    materiales = [],
  },
  ahora = new Date(),
) {
  const hoy = [ahora.getFullYear(), ahora.getMonth() + 1, ahora.getDate()]
    .map((parte) => String(parte).padStart(2, '0'))
    .join('-');

  const ordenesAtrasadas = ordenes
    .filter(
      ({ estado, fecha_fin }) =>
        (estado === 'Planificada' || estado === 'En producción') &&
        fechaValida(fecha_fin) &&
        fecha_fin < hoy,
    )
    .sort((a, b) => a.fecha_fin.localeCompare(b.fecha_fin));

  const maquinasFueraDeServicio = maquinas.filter(
    ({ estado }) => estado === 'Fuera de servicio',
  );

  const etapasPorId = new Map(etapas.map((etapa) => [Number(etapa.etapa_id), etapa]));
  const ordenesPorId = new Set(ordenes.map((orden) => Number(orden.orden_id)));
  const ejecucionesExcedidas = [];
  for (const ejecucion of ejecuciones) {
    if (!ejecucion.fin_real || !ordenesPorId.has(Number(ejecucion.orden_id))) {
      continue;
    }
    const etapa = etapasPorId.get(Number(ejecucion.etapa_id));
    const estandar = Number(etapa?.tiempo_estandar_min);
    const real = Number(ejecucion.tiempo_uso_min);
    if (Number.isFinite(estandar) && estandar > 0 && Number.isFinite(real) && real > estandar) {
      ejecucionesExcedidas.push({ ejecucion, etapa, real, estandar, exceso: real - estandar });
    }
  }
  ejecucionesExcedidas.sort((a, b) => b.exceso - a.exceso);

  const ordenesAbiertas = new Set(
    ordenes
      .filter(
        ({ estado }) => estado === 'Planificada' || estado === 'En producción',
      )
      .map(({ orden_id }) => Number(orden_id)),
  );
  const requeridoPorOrden = new Map();
  for (const orden of ordenes) {
    if (!ordenesAbiertas.has(Number(orden.orden_id))) continue;
    const cantidad = Number(orden.cantidad_plan) || 0;
    for (const relacion of productoMaterial) {
      if (Number(relacion.producto_id) !== Number(orden.producto_id)) continue;
      const porUnidad = Number(relacion.cantidad_por_unidad) || 0;
      if (porUnidad <= 0 || cantidad <= 0) continue;
      const material_id = Number(relacion.material_id);
      const clave = `${Number(orden.orden_id)}:${material_id}`;
      const anterior = requeridoPorOrden.get(clave)?.requerido || 0;
      requeridoPorOrden.set(clave, { material_id, requerido: anterior + cantidad * porUnidad });
    }
  }
  const recibidoPorOrden = new Map();
  for (const recepcion of recepciones) {
    const clave = `${Number(recepcion.orden_id)}:${Number(recepcion.material_id)}`;
    const cantidad = Math.max(0, Number(recepcion.cantidad_recibida) || 0);
    recibidoPorOrden.set(clave, (recibidoPorOrden.get(clave) || 0) + cantidad);
  }
  const totalesPorMaterial = new Map();
  for (const [clave, { material_id, requerido }] of requeridoPorOrden) {
    const total = totalesPorMaterial.get(material_id) || { requerido: 0, recibido: 0 };
    total.requerido += requerido;
    // Las entregas están destinadas a una orden: ni un lote cerrado ni el
    // excedente de otro lote pueden ocultar materiales pendientes de este.
    total.recibido += Math.min(requerido, recibidoPorOrden.get(clave) || 0);
    totalesPorMaterial.set(material_id, total);
  }
  const nombresMateriales = new Map(
    materiales.map((material) => [Number(material.material_id), material.nombre]),
  );
  const redondear = (valor) => Math.round(valor * 1000) / 1000;
  const stockCritico = [...totalesPorMaterial]
    .map(([material_id, { requerido, recibido }]) => {
      return {
        material_id,
        nombre:
          nombresMateriales.get(material_id) ||
          nombreReferencia('materiales', material_id),
        requerido: redondear(requerido),
        recibido: redondear(recibido),
        faltante: redondear(requerido - recibido),
      };
    })
    .filter(({ faltante }) => faltante > 0)
    .sort((a, b) => b.faltante - a.faltante);

  return {
    ordenesAtrasadas,
    maquinasFueraDeServicio,
    ejecucionesExcedidas,
    stockCritico,
  };
}
