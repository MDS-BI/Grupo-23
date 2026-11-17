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
  const cantidadPlanPorProducto = new Map();
  for (const orden of ordenes) {
    if (!ordenesAbiertas.has(Number(orden.orden_id))) continue;
    const producto_id = Number(orden.producto_id);
    const cantidad = Number(orden.cantidad_plan) || 0;
    cantidadPlanPorProducto.set(
      producto_id,
      (cantidadPlanPorProducto.get(producto_id) || 0) + cantidad,
    );
  }
  const requeridoPorMaterial = new Map();
  for (const relacion of productoMaterial) {
    const porUnidad = Number(relacion.cantidad_por_unidad) || 0;
    const plan = cantidadPlanPorProducto.get(Number(relacion.producto_id)) || 0;
    if (porUnidad <= 0 || plan <= 0) continue;
    const material_id = Number(relacion.material_id);
    requeridoPorMaterial.set(
      material_id,
      (requeridoPorMaterial.get(material_id) || 0) + plan * porUnidad,
    );
  }
  const recibidoPorMaterial = new Map();
  for (const recepcion of recepciones) {
    const cantidad = Number(recepcion.cantidad_recibida) || 0;
    const material_id = Number(recepcion.material_id);
    recibidoPorMaterial.set(
      material_id,
      (recibidoPorMaterial.get(material_id) || 0) + cantidad,
    );
  }
  const nombresMateriales = new Map(
    materiales.map((material) => [Number(material.material_id), material.nombre]),
  );
  const redondear = (valor) => Math.round(valor * 1000) / 1000;
  const stockCritico = [...requeridoPorMaterial]
    .map(([material_id, requerido]) => {
      const recibido = recibidoPorMaterial.get(material_id) || 0;
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
