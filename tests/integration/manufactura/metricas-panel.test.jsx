// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import App from '../../../src/App.jsx';
import { guardarCambios, deshacerUltimoCambio } from '../../../src/modules/manufactura/almacenamiento.js';
import { cambiarRol } from '../../../src/modules/manufactura/roles.js';

let root;
let container;
beforeEach(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  sessionStorage.clear();
  guardarCambios({
    productos: [{ producto_id: 1, nombre: 'Oso Bruno' }, { producto_id: 2, nombre: 'Dino' }],
    etapas: [{ etapa_id: 1, nombre: 'Costura', tiempo_estandar_min: 30 }],
    ordenes: [
      { orden_id: 1, producto_id: 1, cantidad_plan: 64, estado: 'Finalizada' },
      { orden_id: 2, producto_id: 2, cantidad_plan: 128, estado: 'Planificada' },
    ],
    ejecuciones: [{ ejecucion_id: 1, orden_id: 1, etapa_id: 1, fin_real: '2026-11-20T12:00', tiempo_uso_min: 45 }],
  });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<App />));
  await act(async () => container.querySelector('[aria-label="Panel de producción"]').click());
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  localStorage.clear();
  sessionStorage.clear();
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});

const valor = (titulo) => [...container.querySelectorAll('.production-kpi')]
  .find((tarjeta) => tarjeta.querySelector('h3').textContent === titulo).querySelector('strong').textContent;

it('muestra gráficos accesibles, filtra el producto y se actualiza al guardar y deshacer', async () => {
  expect(valor('Unidades planificadas')).toBe('192');
  expect(valor('Unidades finalizadas')).toBe('64');
  expect(container.querySelector('[aria-label="Órdenes por estado"] svg').getAttribute('role')).toBe('img');
  expect(container.querySelector('[aria-label="Volumen por peluche"]').textContent).toContain('128 planificadas · 0 finalizadas');
  expect(container.querySelector('[aria-label="Tiempos por etapa"]').textContent).toContain('+15 min sobre el estándar');
  const filtro = container.querySelector('.analytics-filter select');
  await act(async () => {
    filtro.value = '2';
    filtro.dispatchEvent(new Event('change', { bubbles: true }));
  });
  expect(valor('Unidades planificadas')).toBe('128');
  expect(valor('Unidades finalizadas')).toBe('0');
  expect(container.querySelector('[aria-label="Volumen por peluche"]').textContent).not.toContain('Oso Bruno');
  expect(container.querySelector('[aria-label="Tiempos por etapa"]').textContent).toContain('Registra el término de una ejecución');
  await act(async () => guardarCambios({
    ordenes: [
      { orden_id: 1, producto_id: 1, cantidad_plan: 64, estado: 'Finalizada' },
      { orden_id: 2, producto_id: 2, cantidad_plan: 128, estado: 'Finalizada' },
    ],
  }));
  expect(valor('Unidades finalizadas')).toBe('128');
  expect(valor('Cumplimiento del volumen')).toBe('100 %');
  await act(async () => deshacerUltimoCambio());
  expect(valor('Unidades finalizadas')).toBe('0');
  expect(valor('Cumplimiento del volumen')).toBe('0 %');
});

it('conserva las perspectivas de los roles y no expone métricas globales a ensamble', async () => {
  await act(async () => cambiarRol('ensamble'));
  expect(container.querySelector('[aria-label="Panel de producción"]')).toBeNull();
  expect(container.querySelector('.production-analytics')).toBeNull();
  expect(container.querySelector('h1').textContent).toBe('Órdenes de producción');
});
