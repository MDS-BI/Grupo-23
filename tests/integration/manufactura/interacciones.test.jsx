// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from '../../../src/App.jsx';
import { cargarDemoPeluches } from '../../../src/modules/manufactura/demo-peluches.js';
import { listar } from '../../../src/modules/manufactura/almacenamiento.js';
import { inicializarPedidosDemo, obtenerPedidosPendientes } from '../../../src/modules/manufactura/pedidos-locales.js';
import { guardarEtapa } from '../../../src/modules/manufactura/etapas.js';

let container;
let root;
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
  vi.restoreAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});

async function pulsar(texto, dentro = container) {
  const boton = [...dentro.querySelectorAll('button')].find(
    (b) => (b.getAttribute('aria-label') || b.textContent.trim()) === texto,
  );
  expect(boton).toBeTruthy();
  expect(boton.disabled).toBe(false);
  await act(async () => boton.click());
}
async function escribir(nombre, valor) {
  const campo = container.querySelector(`[name="${nombre}"]`);
  expect(campo).toBeTruthy();
  await act(async () => {
    const prototipo = campo.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototipo, 'value').set.call(campo, valor);
    campo.dispatchEvent(new Event(campo.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
}

it('enfoca el formulario de etapa y permite deshacer edición y eliminación', async () => {
  await pulsar('Etapas y rutas');
  await pulsar('Nueva etapa');
  expect(document.activeElement).toBe(container.querySelector('[name="nombre"]'));
  await escribir('nombre', 'Revisión de felpa');
  await escribir('tipo', 'Calidad');
  await escribir('tiempo_estandar_min', '5');
  await pulsar('Guardar');
  let fila = container.querySelector('tbody tr:last-child');
  await pulsar('Editar', fila);
  await escribir('nombre', 'Revisión temporal');
  await pulsar('Deshacer cambios', container.querySelector('form'));
  expect(container.querySelector('[name="nombre"]').value).toBe('Revisión de felpa');
  await escribir('nombre', 'Revisión modificada');
  await pulsar('Guardar');
  fila = container.querySelector('tbody tr:last-child');
  await pulsar('Deshacer', fila);
  expect(listar('etapas').at(-1).nombre).toBe('Revisión de felpa');
  await pulsar('Eliminar', container.querySelector('tbody tr:last-child'));
  await pulsar('Confirmar eliminación', container.querySelector('[role="alertdialog"]'));
  expect(listar('etapas')).toHaveLength(6);
  await pulsar('Deshacer', container.querySelector('.deshacer-global'));
  expect(listar('etapas')).toHaveLength(7);
  expect(container.textContent).toContain('Revisión de felpa');
  await pulsar('Deshacer', container.querySelector('.deshacer-global'));
  expect(listar('etapas')).toHaveLength(6);
  expect(container.querySelector('.management > [role="status"]').textContent).not.toContain('Puedes recuperarlo');
});

it('ofrece deshacer una etapa eliminada en el aviso y en la tabla, incluso al volver a la página', async () => {
  let etapa;
  await act(async () => {
    etapa = guardarEtapa({ nombre: 'Inspección de prueba', tipo: 'Calidad', tiempo_estandar_min: 5 }).registro;
    sessionStorage.clear();
  });
  await pulsar('Etapas y rutas');
  let fila = [...container.querySelectorAll('tbody tr')].find((r) => r.textContent.includes(etapa.nombre));
  await pulsar('Eliminar', fila);
  expect(document.activeElement.textContent).toBe('Cancelar eliminación');
  await pulsar('Cancelar eliminación');
  expect(listar('etapas')).toContainEqual(etapa);
  await pulsar('Eliminar', fila);
  await pulsar('Confirmar eliminación');
  expect(listar('etapas')).not.toContainEqual(etapa);
  const aviso = container.querySelector('.management > [role="status"]');
  expect(aviso.textContent).toContain(etapa.nombre);
  expect(document.activeElement.textContent).toBe('Deshacer eliminación');
  expect(document.activeElement.closest('[role="status"]')).toBe(aviso);
  await pulsar('Deshacer eliminación', aviso);
  expect(listar('etapas')).toContainEqual(etapa);
  expect(container.querySelector('.deleted-record')).toBeNull();
  expect(container.querySelector('.management > [role="status"]').textContent).toContain('Eliminación deshecha.');
  fila = [...container.querySelectorAll('tbody tr')].find((r) => r.textContent.includes(etapa.nombre));
  await pulsar('Eliminar', fila);
  await pulsar('Confirmar eliminación');
  await pulsar('Productos y materiales');
  await pulsar('Etapas y rutas');
  const eliminada = container.querySelector('.deleted-record');
  expect(eliminada.textContent).toContain(etapa.nombre);
  expect(eliminada.textContent).toContain('Eliminado');
  await pulsar('Deshacer eliminación', eliminada);
  expect(listar('etapas')).toContainEqual(etapa);
  expect(container.querySelector('.deleted-record')).toBeNull();
});

it('no anuncia una eliminación cuando una etapa está protegida por una ruta', async () => {
  await pulsar('Etapas y rutas');
  const anteriores = listar('etapas');
  await pulsar('Eliminar', container.querySelector('tbody tr'));
  await pulsar('Confirmar eliminación');
  expect(listar('etapas')).toEqual(anteriores);
  expect(container.querySelector('.management > [role="status"]').textContent).toContain('La etapa está en uso');
  expect(container.querySelector('.deleted-record')).toBeNull();
  expect(container.textContent).not.toContain('Deshacer eliminación');
});

it('muestra códigos, locales y cantidades y planifica sus pedidos en una orden de 64', async () => {
  await pulsar('Órdenes de producción');
  await pulsar('Oso Bruno de 30 cm', container.querySelector('.pedidos-productos'));
  const menu = container.querySelector('#pedidos-del-peluche');
  expect(menu.textContent).toContain('PED-0001');
  expect(menu.textContent).toContain('LOC-001');
  expect(menu.textContent).toContain('Juguetería Nube');
  expect(menu.querySelectorAll('tbody tr')).toHaveLength(5);
  expect(menu.textContent).toContain('64 unidades pendientes');
  await pulsar('Planificar estos pedidos', menu);
  expect(document.activeElement).toBe(container.querySelector('[name="producto_id"]'));
  expect(container.querySelector('[name="cantidad_plan"]').value).toBe('64');
  await escribir('fecha_inicio', '2026-11-23');
  await escribir('fecha_fin', '2026-11-25');
  await pulsar('Guardar');
  expect(listar('ordenes')).toHaveLength(6);
  expect(obtenerPedidosPendientes(1)).toHaveLength(0);
  await pulsar('Deshacer', container.querySelector('.deshacer-global'));
  expect(listar('ordenes')).toHaveLength(5);
  expect(obtenerPedidosPendientes(1)).toHaveLength(5);
});
