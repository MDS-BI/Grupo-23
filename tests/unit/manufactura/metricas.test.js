import { expect, it } from 'vitest';
import { calcularMetricasProduccion } from '../../../src/modules/manufactura/metricas.js';

const datos = {
  productos: [{ producto_id: 1, nombre: 'Oso' }, { producto_id: 2, nombre: 'Dinosaurio' }],
  ordenes: [
    { orden_id: 1, producto_id: 1, cantidad_plan: 64, estado: 'Finalizada' },
    { orden_id: 2, producto_id: 1, cantidad_plan: 128, estado: 'En producción' },
    { orden_id: 3, producto_id: 2, cantidad_plan: 64, estado: 'Planificada' },
    { orden_id: 4, producto_id: 1, cantidad_plan: 200, estado: 'Cancelada' },
  ],
  etapas: [{ etapa_id: 1, nombre: 'Costura', tiempo_estandar_min: 30 }],
  ejecuciones: [
    { orden_id: 1, etapa_id: 1, fin_real: '2026-11-20T12:00', tiempo_uso_min: 20 },
    { orden_id: 1, etapa_id: 1, fin_real: '2026-11-20T13:00', tiempo_uso_min: 40 },
    { orden_id: 2, etapa_id: 1, fin_real: null, tiempo_uso_min: 60 },
    { orden_id: 4, etapa_id: 1, fin_real: '2026-11-20T12:00', tiempo_uso_min: 90 },
    { orden_id: 999, etapa_id: 1, fin_real: '2026-11-20T12:00', tiempo_uso_min: 90 },
  ],
};

it('separa unidades y tiempos sin contar cada etapa como nuevos peluches ni incluir canceladas', () => {
  const metricas = calcularMetricasProduccion(datos);
  expect(metricas.totalOrdenes).toBe(4);
  expect(metricas.unidadesPlanificadas).toBe(256);
  expect(metricas.unidadesFinalizadas).toBe(64);
  expect(metricas.cumplimiento).toBe(25);
  expect(metricas.minutosRegistrados).toBe(60);
  expect(metricas.estados.map((estado) => estado.cantidad)).toEqual([1, 1, 1, 1]);
  expect(metricas.porProducto).toEqual([
    { producto_id: 1, nombre: 'Oso', planificadas: 192, finalizadas: 64 },
    { producto_id: 2, nombre: 'Dinosaurio', planificadas: 64, finalizadas: 0 },
  ]);
  expect(metricas.porEtapa[0]).toMatchObject({ nombre: 'Costura', promedio: 30, estandar: 30, muestras: 2 });
});

it('filtra todos los indicadores y sus ejecuciones por el producto seleccionado', () => {
  const metricas = calcularMetricasProduccion({ ...datos, productoId: '2' });
  expect(metricas.totalOrdenes).toBe(1);
  expect(metricas.unidadesPlanificadas).toBe(64);
  expect(metricas.unidadesFinalizadas).toBe(0);
  expect(metricas.cumplimiento).toBe(0);
  expect(metricas.minutosRegistrados).toBe(0);
  expect(metricas.porEtapa).toEqual([]);
  expect(metricas.porProducto.map((producto) => producto.nombre)).toEqual(['Dinosaurio']);
});

it('maneja el panel vacío y datos incompletos sin NaN ni porcentajes ficticios', () => {
  expect(calcularMetricasProduccion()).toMatchObject({
    totalOrdenes: 0, unidadesPlanificadas: 0, unidadesFinalizadas: 0,
    cumplimiento: 0, minutosRegistrados: 0, porProducto: [], porEtapa: [],
  });
  const metricas = calcularMetricasProduccion({
    ordenes: [{ orden_id: 1, producto_id: 8, cantidad_plan: 'incorrecto' }],
    ejecuciones: [null, '', -5, Infinity].map((minutos) => ({
      orden_id: 1, etapa_id: 8, tiempo_uso_min: minutos, fin_real: '2026-11-20T12:00',
    })),
  });
  expect(metricas.unidadesPlanificadas).toBe(0);
  expect(metricas.minutosRegistrados).toBe(0);
  expect(metricas.porEtapa).toEqual([]);
  expect(metricas.estados.at(-1)).toEqual({ nombre: 'Sin estado válido', cantidad: 1 });
  expect(metricas.porProducto[0].nombre).toBe('Producto #8');
});

it('no inventa un estándar faltante ni modifica los datos al calcular', () => {
  const copia = structuredClone(datos);
  copia.etapas[0].tiempo_estandar_min = null;
  const antes = structuredClone(copia);
  expect(calcularMetricasProduccion(copia).porEtapa[0].estandar).toBeNull();
  expect(copia).toEqual(antes);
});
