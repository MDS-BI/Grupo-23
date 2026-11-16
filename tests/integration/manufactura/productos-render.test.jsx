// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../../../src/App.jsx';
import {
  obtenerProductos,
  obtenerProductoMaterial,
} from '../../../src/modules/manufactura/productos.js';

let container;
let root;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  localStorage.clear();
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});

async function click(text) {
  const button = [...container.querySelectorAll('button')].find(
    (item) => item.textContent.trim() === text,
  );
  expect(button, `Botón: ${text}`).toBeTruthy();
  await act(async () => button.click());
}

async function input(id, value) {
  const field = document.getElementById(id);
  await act(async () => {
    const proto =
      field.tagName === 'SELECT'
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(field, value);
    field.dispatchEvent(
      new Event(field.tagName === 'SELECT' ? 'change' : 'input', {
        bubbles: true,
      }),
    );
  });
}

describe('Arranque de Manufactura', () => {
  it('renderiza Productos y permite abrir y cerrar el formulario', async () => {
    await act(async () => root.render(<App />));
    expect(container.querySelector('h1').textContent).toBe('Productos');
    expect(container.textContent).toContain('No hay productos registrados.');
    await click('Nuevo producto');
    expect(container.querySelector('form')).toBeTruthy();
    await click('Cancelar');
    expect(container.querySelector('form')).toBeNull();
  });

  it('valida, guarda producto y material y conserva el producto al volver a montar', async () => {
    await act(async () => root.render(<App />));
    await click('Nuevo producto');
    await click('Guardar producto');
    expect(container.textContent).toContain('El nombre es obligatorio.');
    expect(container.textContent).toContain('El tipo es obligatorio.');
    expect(obtenerProductos()).toEqual([]);

    await input('nombre', 'Mesa de prueba');
    await input('tipo', 'Mueble');
    await input('material_id', '1');
    await input('cantidad_por_unidad', '2.5');
    await click('Agregar');
    expect(
      container.querySelector('[aria-label="Cantidad del material 1"]').value,
    ).toBe('2.5');
    await click('Guardar producto');
    expect(container.querySelector('tbody').textContent).toContain(
      'Mesa de prueba',
    );
    expect(
      obtenerProductoMaterial(obtenerProductos()[0].producto_id)[0]
        .cantidad_por_unidad,
    ).toBe(2.5);

    await act(async () => root.unmount());
    root = createRoot(container);
    await act(async () => root.render(<App />));
    expect(container.querySelector('tbody').textContent).toContain(
      'Mesa de prueba',
    );
  });

  it('registra un material nuevo, lo selecciona y lo conserva junto a los ejemplos', async () => {
    await act(async () => root.render(<App />));
    await click('Nuevo producto');
    await input('nombre', 'Computador');
    await input('tipo', 'Electrónica');
    await click('Añadir nuevo material');
    expect(container.querySelector('fieldset').textContent).toContain(
      '12 clavos',
    );
    await click('Guardar material');
    expect(container.textContent).toContain('Escribe el nombre del material.');

    const nombre = container.querySelector('[name="nombre_material_nuevo"]');
    await input(nombre.id, 'Memoria RAM de 8 GB');
    await click('Guardar material');
    const selector = container.querySelector('#material_id');
    expect(selector.selectedOptions[0].textContent).toBe(
      'Memoria RAM de 8 GB (unidad)',
    );
    expect(container.querySelector('#nombre').value).toBe('Computador');
    await input('cantidad_por_unidad', '2');
    await click('Agregar');
    await click('Guardar producto');
    await click('Ver detalle');
    expect(container.textContent).toContain(
      'Memoria RAM de 8 GB — 2 por unidad',
    );

    await act(async () => root.unmount());
    root = createRoot(container);
    await act(async () => root.render(<App />));
    await click('Nuevo producto');
    const materiales = [
      ...container.querySelectorAll('#material_id option'),
    ].map((o) => o.textContent);
    expect(materiales).toContain('Memoria RAM de 8 GB (unidad)');
    expect(materiales).toContain('Pintura (litro)');
  });
});
