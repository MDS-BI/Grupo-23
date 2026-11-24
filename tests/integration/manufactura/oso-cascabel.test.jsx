// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import App from '../../../src/App.jsx';
import { cargarDemoPeluches } from '../../../src/modules/manufactura/demo-peluches.js';
import { inicializarPedidosDemo } from '../../../src/modules/manufactura/pedidos-locales.js';
import { NOMBRE_OSO_CASCABEL } from '../../../src/modules/manufactura/oso-cascabel.js';

let root;
let container;
beforeEach(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  sessionStorage.clear();
  cargarDemoPeluches();
  inicializarPedidosDemo();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<App />));
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  localStorage.clear();
  sessionStorage.clear();
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});
async function pulsar(nombre, dentro = container) {
  const boton = [...dentro.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || b.textContent.trim()) === nombre);
  expect(boton).toBeTruthy();
  expect(boton.disabled).toBe(false);
  await act(async () => boton.click());
}

it('muestra el oso con su composición, ruta, pedidos asignados y recepciones relacionadas', async () => {
  await pulsar('Agregar ejemplo de oso con cascabel');
  expect([...container.querySelectorAll('button')].some((b) => b.textContent === 'Agregar ejemplo de oso con cascabel')).toBe(false);
  const fila = [...container.querySelectorAll('tbody tr')].find((r) => r.textContent.includes(NOMBRE_OSO_CASCABEL));
  await pulsar('Ver detalle', fila);
  const detalle = container.querySelector(`[aria-label="Detalle de ${NOMBRE_OSO_CASCABEL}"]`);
  expect(detalle.textContent).toContain('Cascabel para peluche — 1 por unidad');
  expect(detalle.textContent).toContain('Bolsillo textil protector para cascabel — 1 por unidad');
  expect(detalle.querySelectorAll('ul li')).toHaveLength(9);
  expect(detalle.querySelectorAll('ol li')).toHaveLength(8);
  expect(detalle.textContent).toContain('Prueba de sonido y fijación del cascabel');
  await pulsar('Órdenes de producción');
  await pulsar(NOMBRE_OSO_CASCABEL, container.querySelector('.pedidos-productos'));
  const pedidos = container.querySelector('#pedidos-del-peluche');
  expect(pedidos.querySelectorAll('tbody tr')).toHaveLength(5);
  expect(pedidos.textContent).toContain('PED-0026');
  expect(pedidos.textContent).toContain('LOC-001');
  expect(pedidos.textContent).toContain('OP-0006');
  await pulsar('Recepción de materiales');
  const filtro = container.querySelector('[name="filtro_orden"]');
  await act(async () => {
    filtro.value = '6';
    filtro.dispatchEvent(new Event('change', { bubbles: true }));
  });
  expect(container.querySelectorAll('tbody tr')).toHaveLength(9);
  expect(container.querySelector('tbody').textContent).toContain('Cascabel para peluche');
  expect(container.querySelector('tbody').textContent).toContain('Accesorios Ojito');
});
