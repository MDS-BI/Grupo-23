// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../../../src/App.jsx';
import { guardarCambios } from '../../../src/modules/manufactura/almacenamiento.js';

let container;
let root;

beforeEach(async () => {
  vi.setSystemTime(new Date(2026, 10, 15, 12));
  localStorage.clear();
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
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
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  vi.useRealTimers();
});

it('muestra las tres categorías y actualiza el panel cuando cambian los registros', async () => {
  const panel = container.querySelector('[aria-labelledby="titulo-alertas"]');
  expect(panel.textContent).toContain('No hay órdenes abiertas con fecha de término vencida.');
  expect(panel.querySelectorAll('li')).toHaveLength(0);

  await act(async () => guardarCambios({
    ordenes: [{ orden_id: 4, producto_id: 1, fecha_fin: '2026-11-13', estado: 'En producción' }],
    maquinas: [{ maquina_id: 1, codigo: 'M-01', nombre: 'Sierra', estado: 'Fuera de servicio' }],
    etapas: [{ etapa_id: 1, nombre: 'Corte', tiempo_estandar_min: 30 }],
    ejecuciones: [{ ejecucion_id: 1, orden_id: 4, etapa_id: 1, fin_real: '2026-11-13T12:00', tiempo_uso_min: 45 }],
  }));

  expect(panel.querySelector('[aria-label="Órdenes atrasadas"]').textContent).toContain('OP-0004');
  expect(panel.querySelector('[aria-label="Máquinas fuera de servicio"]').textContent).toContain('Sierra');
  expect(panel.querySelector('[aria-label="Etapas que excedieron el tiempo estándar"]').textContent)
    .toContain('45 min reales · 30 min estándar · +15 min');

  await act(async () => guardarCambios({
    maquinas: [{ maquina_id: 1, codigo: 'M-01', nombre: 'Sierra', estado: 'Disponible' }],
  }));
  expect(panel.querySelector('[aria-label="Máquinas fuera de servicio"]')).toBeNull();
  expect(panel.textContent).toContain('No hay máquinas marcadas como fuera de servicio.');

  const irAOrdenes = [...panel.querySelectorAll('button')].find((b) => b.textContent.startsWith('Ir a órdenes'));
  await act(async () => irAOrdenes.click());
  expect(container.querySelector('h1').textContent).toBe('Órdenes de producción');
});
