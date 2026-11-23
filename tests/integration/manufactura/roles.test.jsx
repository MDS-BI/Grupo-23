// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import App from '../../../src/App.jsx';
import { guardarCambios, listar } from '../../../src/modules/manufactura/almacenamiento.js';
import { cargarDemoPeluches } from '../../../src/modules/manufactura/demo-peluches.js';
import { guardarEjecucion, guardarOrden } from '../../../src/modules/manufactura/ordenes.js';
import { eliminarRecepcion, guardarRecepcion } from '../../../src/modules/manufactura/recepciones.js';
import { cambiarRol, rolActual } from '../../../src/modules/manufactura/roles.js';

let container;
let root;
beforeEach(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  cargarDemoPeluches();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<App />));
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  localStorage.clear();
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});

async function seleccionarRol(rol) {
  await act(async () => {
    const selector = container.querySelector('#rol-manufactura');
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(selector, rol);
    selector.dispatchEvent(new Event('change', { bubbles: true }));
  });
}
async function pulsar(texto) {
  const boton = [...container.querySelectorAll('button')].find(
    (elemento) => (elemento.getAttribute('aria-label') || elemento.textContent.trim()) === texto,
  );
  expect(boton).toBeTruthy();
  await act(async () => boton.click());
}
const botones = () => [...container.querySelectorAll('button')].map((b) => b.textContent.trim());

it('Ensamble ve órdenes y sus etapas sin entregas ni acciones de planificación', async () => {
  await pulsar('Nuevo producto');
  await seleccionarRol('ensamble');
  expect(container.querySelector('form')).toBeNull();
  expect(container.querySelector('h1').textContent).toBe('Órdenes de producción');
  expect(botones()).not.toContain('Recepción de materiales');
  expect(botones()).not.toContain('Nueva orden');
  expect(botones()).not.toContain('Eliminar');
  expect(container.textContent).not.toContain('Término');
  await pulsar('Ver detalle');
  expect(container.textContent).not.toContain('Proveedor');
  expect(container.textContent).not.toContain('Textiles Nube Austral');
  expect(container.textContent).not.toContain('Recepciones de materiales');
  await pulsar('Registrar ejecución');
  const etapas = [...container.querySelector('[name="etapa_id"]').options]
    .map((o) => o.textContent).join(' ');
  expect(etapas).toContain('costura');
  expect(etapas).toContain('Relleno');
  expect(etapas).not.toContain('Tizado');
  expect(etapas).not.toContain('empaque');
});

it('Planificación gestiona órdenes y consulta ejecuciones sin registrar entregas', async () => {
  await seleccionarRol('planificacion');
  await pulsar('Órdenes de producción');
  expect(botones()).toContain('Nueva orden');
  await pulsar('Ver detalle');
  expect(botones()).not.toContain('Registrar ejecución');
  expect(botones()).not.toContain('Registrar recepción');
});

it('Bodega puede registrar una recepción y consulta el historial sin editar ni eliminar', async () => {
  await seleccionarRol('bodega');
  expect(container.querySelector('h1').textContent).toBe('Recepción de materiales');
  expect(botones()).toContain('Registrar recepción');
  expect(botones()).not.toContain('Editar');
  expect(botones()).not.toContain('Eliminar');
  expect(container.textContent).toContain('OP-0001 · Oso Bruno');
  const original = listar('recepciones')[0];
  await act(async () => {
    expect(guardarRecepcion({ ...original, cantidad_recibida: 999 }, original.recepcion_id).errores).toBeTruthy();
    expect(eliminarRecepcion(original.recepcion_id).errores).toBeTruthy();
    expect(guardarCambios({ recepciones: [] }).errores).toBeTruthy();
    const entregaAbierta = listar('recepciones').find((r) => r.orden_id === 4);
    expect(guardarRecepcion({ ...entregaAbierta, cantidad_recibida: 1 }).errores).toBeNull();
  });
  expect(listar('recepciones')[0]).toEqual(original);
  expect(listar('recepciones')).toHaveLength(29);
});

it('Mantenimiento administra sus recursos y conserva el perfil al reabrir', async () => {
  await seleccionarRol('mantenimiento');
  expect(botones()).toContain('Nueva máquina');
  expect(botones()).not.toContain('Órdenes de producción');
  await act(async () => root.unmount());
  root = createRoot(container);
  await act(async () => root.render(<App />));
  expect(rolActual()).toBe('mantenimiento');
  expect(container.querySelector('h1').textContent).toBe('Máquinas y equipamiento');
});

it('rechaza escrituras fuera del perfil y ejecuciones ajenas al ensamblaje', async () => {
  const productos = listar('productos');
  await seleccionarRol('ensamble');
  await act(async () => {
    expect(guardarCambios({ productos: [] }).errores).toBeTruthy();
    expect(guardarEjecucion({
      orden_id: 4, etapa_id: 1, inicio_real: '2026-11-14T10:00',
    }).errores).toBeTruthy();
    expect(guardarEjecucion({
      orden_id: 4, etapa_id: 3, inicio_real: '2026-11-14T10:00',
    }).errores).toBeNull();
    expect(guardarEjecucion({
      orden_id: 1, etapa_id: 3, inicio_real: '2026-11-14T10:00',
    }).errores).toBeTruthy();
  });
  expect(listar('productos')).toEqual(productos);
  expect(cambiarRol('desconocido').errores).toBeTruthy();
});

it('mantiene la corrección remota de cierre de órdenes y conserva sus entregas históricas', async () => {
  const orden = listar('ordenes').find((o) => o.orden_id === 4);
  const entrega = listar('recepciones').find((r) => r.orden_id === 4);
  await act(async () => {
    expect(guardarOrden({ ...orden, estado: 'Finalizada' }, orden.orden_id).errores.estado)
      .toContain('etapas por completar');
    for (const etapaId of [3, 4, 5, 6]) {
      expect(guardarEjecucion({
        orden_id: orden.orden_id,
        etapa_id: etapaId,
        inicio_real: '2026-11-14T10:00',
        fin_real: '2026-11-14T10:30',
      }).errores).toBeNull();
    }
    expect(guardarOrden({ ...orden, estado: 'Finalizada' }, orden.orden_id).errores).toBeNull();
    expect(guardarRecepcion({ ...entrega, cantidad_recibida: 1 }).errores.orden_id)
      .toContain('finalizada');
    const pendiente = listar('ordenes').find((o) => o.orden_id === 5);
    guardarOrden({ ...pendiente, estado: 'Cancelada' }, pendiente.orden_id);
    expect(guardarRecepcion({
      ...entrega, orden_id: pendiente.orden_id, cantidad_recibida: 1,
    }).errores.orden_id).toContain('cancelada');
  });
  expect(listar('recepciones')).toHaveLength(28);
  expect(listar('recepciones')).toContainEqual(entrega);
});
