import { fechaValida } from './validacion.js';

export function calcularAlertasProduccion(
  { ordenes, maquinas, etapas, ejecuciones },
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

  return { ordenesAtrasadas, maquinasFueraDeServicio, ejecucionesExcedidas };
}
