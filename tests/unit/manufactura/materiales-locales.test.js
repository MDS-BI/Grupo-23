// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from 'vitest';
import {
  configurarReferencias,
  obtenerReferencias,
  registrarMaterialLocal,
} from '../../../src/modules/manufactura/referencias.js';
import { validarMaterialProducto } from '../../../src/modules/manufactura/productos.js';

beforeEach(() => localStorage.clear());
afterEach(() => configurarReferencias(null));

it('valida datos obligatorios y evita duplicar nombres de muestra o locales', () => {
  expect(registrarMaterialLocal({ nombre: ' ', unidad: '' }).errores).toEqual({
    nombre: 'Escribe el nombre del material.',
    unidad: 'Escribe una unidad de medida.',
  });
  expect(
    registrarMaterialLocal({ nombre: '  TELA DE FELPA  ', unidad: 'metro' }).errores
      .nombre,
  ).toContain('Ya existe');
  expect(
    registrarMaterialLocal({ nombre: '  Clavos  ', unidad: ' unidad ' })
      .registro,
  ).toMatchObject({ nombre: 'Clavos', unidad: 'unidad' });
  expect(
    registrarMaterialLocal({ nombre: 'CLAVOS', unidad: 'unidad' }).errores
      .nombre,
  ).toContain('Ya existe');
  expect(obtenerReferencias('materiales')).toHaveLength(4);
});

it('mantiene válidos los materiales locales al conectar un catálogo externo', () => {
  const { registro } = registrarMaterialLocal({
    nombre: 'Chip',
    unidad: 'unidad',
  });
  configurarReferencias((tipo) =>
    tipo === 'materiales'
      ? [{ material_id: 1, nombre: 'Acero', unidad: 'kg' }]
      : [],
  );
  expect(obtenerReferencias('materiales')).toEqual([
    { material_id: 1, nombre: 'Acero', unidad: 'kg' },
    registro,
  ]);
  expect(
    validarMaterialProducto({
      material_id: registro.material_id,
      cantidad_por_unidad: 2,
    }),
  ).toEqual({});
  expect(
    validarMaterialProducto({ material_id: -999, cantidad_por_unidad: 2 })
      .material_id,
  ).toBeTruthy();
});
