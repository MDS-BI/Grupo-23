// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from '../../../src/App.jsx';
import { listar } from '../../../src/modules/manufactura/almacenamiento.js';

let container;
let root;
beforeEach(async () => {
  localStorage.clear();
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
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
async function click(text, scope = container) {
  const button = [...scope.querySelectorAll('button')].find(
    (b) => (b.getAttribute('aria-label') || b.textContent.trim()) === text,
  );
  expect(button, `Botón ${text}`).toBeTruthy();
  await act(async () => button.click());
}
async function campo(name, value) {
  const input = container.querySelector(`[name="${name}"]`);
  expect(input, `Campo ${name}`).toBeTruthy();
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      input.tagName === 'SELECT'
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype,
      'value',
    ).set.call(input, value);
    input.dispatchEvent(
      new Event(input.tagName === 'SELECT' ? 'change' : 'input', {
        bubbles: true,
      }),
    );
  });
}
async function rellenar(datos) {
  for (const [name, value] of Object.entries(datos)) await campo(name, value);
}
const texto = () => container.textContent;

describe('Historias del PDF en la interfaz', () => {
  it('completa HU1 → HU2 → HU3 → HU4 y los recursos de HU5; conserva todas las relaciones al reabrir', async () => {
    await click('Nuevo producto');
    await rellenar({
      nombre: 'Mesa PDF',
      tipo: 'Mueble',
      material_id: '1',
      cantidad_por_unidad: '2.5',
    });
    await click('Agregar');
    await click('Guardar producto');
    await click('Ver detalle');
    expect(texto()).toContain('Tablero de madera — 2.5 por unidad');
    await click('Cerrar detalle');
    await click('Editar');
    await campo('nombre', 'Mesa PDF revisada');
    await click('Guardar cambios');
    expect(listar('productos')[0].nombre).toBe('Mesa PDF revisada');

    await click('Etapas y rutas');
    for (const [nombre, minutos] of [
      ['Corte', '15'],
      ['Pintura', '30'],
    ]) {
      await click('Nueva etapa');
      await rellenar({
        nombre,
        tipo: 'Fabricación',
        tiempo_estandar_min: minutos,
      });
      await click('Guardar');
    }
    await campo('producto_ruta', '1');
    await click('Agregar etapa a la ruta');
    await rellenar({ etapa_0: '2', secuencia_0: '2' });
    await click('Agregar etapa a la ruta');
    await rellenar({ etapa_1: '1', secuencia_1: '1' });
    await click('Guardar ruta');
    expect(container.querySelector('[name="etapa_0"]').value).toBe('1');
    expect(texto()).toContain('Ruta guardada en orden de secuencia.');

    await click('Máquinas y equipamiento');
    await click('Nueva máquina');
    await rellenar({
      codigo: 'SI-01',
      nombre: 'Sierra de planta',
      estado: 'Disponible',
      capacidad_hora: '20',
    });
    await click('Guardar');
    await click('Órdenes de producción');
    await click('Nueva orden');
    await rellenar({
      producto_id: '1',
      cantidad_plan: '10',
      estado: 'Planificada',
      fecha_inicio: '2026-11-10',
      fecha_fin: '2026-11-12',
    });
    await click('Guardar');
    await click('Ver detalle');
    await click('Registrar ejecución');
    await rellenar({
      etapa_id: '1',
      maquina_id: '1',
      trabajador_id: '1',
      inicio_real: '2026-11-10T09:00',
    });
    await click('Guardar');
    expect(listar('ejecuciones')[0].fin_real).toBeNull();
    await click('Finalizar / editar');
    await campo('fin_real', '2026-11-10T09:45');
    await click('Guardar');
    expect(texto()).toContain('45 min');
    expect(container.querySelector('progress').value).toBe(50);
    await click('Registrar recepción');
    await rellenar({
      material_id: '1',
      proveedor_id: '1',
      cantidad_recibida: '25',
      fecha_recepcion: '2026-11-10',
    });
    await click('Guardar');
    expect(texto()).toContain('Proveedor de materiales de muestra');
    await click('Recepción de materiales');
    expect(container.querySelector('tbody').textContent).toContain(
      'Tablero de madera',
    );
    await campo('filtro_orden', '1');
    expect(listar('recepciones')).toHaveLength(1);

    await click('Máquinas y equipamiento');
    await click('Mantenimiento');
    await click('Registrar mantenimiento');
    await rellenar({
      maquina_id: '1',
      tecnico_id: '2',
      tipo: 'Preventivo',
      costo_tecnico: '5000',
      fecha: '2026-11-10',
      repuesto: '1',
      cantidad_repuesto: '2',
    });
    await click('Agregar repuesto');
    await click('Guardar');
    await click('Ver detalle');
    expect(texto()).toContain('Rodamiento · 2 unidades');
    await click('Equipamiento y asignaciones');
    await click('Nuevo equipamiento');
    await rellenar({ nombre: 'Taladro de planta', tipo: 'Herramienta' });
    await click('Guardar');
    await click('Asignar equipamiento');
    await rellenar({
      trabajador_id: '1',
      equipamiento_id: '1',
      fecha_entrega: '2026-11-10',
    });
    await click('Guardar');
    expect(listar('asignaciones')[0]).toMatchObject({
      trabajador_id: 1,
      equipamiento_id: 1,
    });
    await campo('filtro_trabajador', '1');
    await campo('filtro_equipo', '1');
    expect(texto()).toContain('Taladro de planta');
    await click('Catálogos de referencia');
    expect(texto()).toContain('Solo lectura');
    expect(texto()).toContain('módulos aún no están conectados');
    expect(container.querySelector('form')).toBeNull();

    await act(async () => root.unmount());
    root = createRoot(container);
    await act(async () => root.render(<App />));
    expect(texto()).toContain('Mesa PDF revisada');
    await click('Órdenes de producción');
    await click('Ver detalle');
    expect(texto()).toContain('45 min');
    expect(texto()).toContain('Proveedor de materiales de muestra');
    await click('Panel de producción');
    expect(texto()).toContain('OP-0001');
    expect(texto()).toContain('50%');
  });

  it('muestra mensajes por campo en las cinco historias sin guardar registros incompletos', async () => {
    await click('Nuevo producto');
    await click('Guardar producto');
    expect(texto()).toContain('El nombre es obligatorio.');
    await click('Etapas y rutas');
    await click('Nueva etapa');
    await click('Guardar');
    expect(texto()).toContain(
      'El tiempo estándar debe ser un entero mayor que 0.',
    );
    await click('Órdenes de producción');
    await click('Nueva orden');
    await click('Guardar');
    expect(texto()).toContain('Selecciona un producto existente.');
    expect(texto()).toContain('una fecha de término válida');
    await click('Recepción de materiales');
    await click('Registrar recepción');
    await click('Guardar');
    expect(texto()).toContain('Selecciona un proveedor existente.');
    expect(texto()).toContain(
      'La cantidad recibida debe ser un número mayor que 0.',
    );
    await click('Máquinas y equipamiento');
    await click('Mantenimiento');
    await click('Registrar mantenimiento');
    await click('Guardar');
    expect(texto()).toContain('Selecciona un técnico existente.');
    expect(texto()).toContain(
      'El costo del técnico debe ser un número mayor o igual que 0.',
    );
    expect(listar('productos')).toEqual([]);
    expect(listar('etapas')).toEqual([]);
    expect(listar('ordenes')).toEqual([]);
    expect(listar('recepciones')).toEqual([]);
    expect(listar('mantenimientos')).toEqual([]);
  });
});
