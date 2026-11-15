import { describe, expect, it } from 'vitest';
import { calcularAlertasProduccion } from '../../../src/modules/manufactura/alertas.js';

const hoy = new Date(2026, 10, 15, 23, 30);
const datos = { ordenes: [], maquinas: [], etapas: [], ejecuciones: [] };

describe('Alertas del panel de producción', () => {
  it('avisa al día siguiente del vencimiento y omite órdenes cerradas o fechas inválidas', () => {
    const ordenes = [
      { orden_id: 1, estado: 'En producción', fecha_fin: '2026-11-14' },
      { orden_id: 2, estado: 'Planificada', fecha_fin: '2026-11-01' },
      { orden_id: 3, estado: 'En producción', fecha_fin: '2026-11-15' },
      { orden_id: 4, estado: 'Planificada', fecha_fin: '2026-11-16' },
      { orden_id: 5, estado: 'Finalizada', fecha_fin: '2026-11-10' },
      { orden_id: 6, estado: 'Cancelada', fecha_fin: '2026-11-10' },
      { orden_id: 7, estado: 'Planificada', fecha_fin: '2026-02-30' },
    ];
    const alertas = calcularAlertasProduccion({ ...datos, ordenes }, hoy);
    expect(alertas.ordenesAtrasadas.map(({ orden_id }) => orden_id)).toEqual([2, 1]);
  });

  it('identifica máquinas fuera de servicio por su estado registrado', () => {
    const maquinas = [
      { maquina_id: 1, estado: 'Fuera de servicio' },
      { maquina_id: 2, estado: 'Disponible' },
      { maquina_id: 3, estado: 'En mantenimiento' },
      { maquina_id: 4, estado: 'En uso' },
    ];
    expect(calcularAlertasProduccion({ ...datos, maquinas }, hoy).maquinasFueraDeServicio)
      .toEqual([maquinas[0]]);
  });

  it('compara el tiempo de cada ejecución terminada con su etapa y muestra primero el mayor exceso', () => {
    const etapas = [{ etapa_id: 1, tiempo_estandar_min: 30 }, { etapa_id: 2 }];
    const base = { orden_id: 1, etapa_id: 1, fin_real: '2026-11-14T12:00' };
    const ejecuciones = [
      { ...base, ejecucion_id: 1, tiempo_uso_min: 31 },
      { ...base, ejecucion_id: 2, tiempo_uso_min: 50 },
      { ...base, ejecucion_id: 3, tiempo_uso_min: 30 },
      { ...base, ejecucion_id: 4, tiempo_uso_min: 29 },
      { ...base, ejecucion_id: 5, tiempo_uso_min: 60, fin_real: null },
      { ...base, ejecucion_id: 6, tiempo_uso_min: 60, etapa_id: 2 },
      { ...base, ejecucion_id: 7, tiempo_uso_min: 60, orden_id: 2 },
    ];
    const { ejecucionesExcedidas } = calcularAlertasProduccion(
      { ...datos, ordenes: [{ orden_id: 1 }], etapas, ejecuciones },
      hoy,
    );
    expect(ejecucionesExcedidas.map(({ ejecucion, exceso }) => [ejecucion.ejecucion_id, exceso]))
      .toEqual([[2, 20], [1, 1]]);
  });
});
