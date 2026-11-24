// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from 'vitest';
import { cargarDemoPeluches } from '../../../src/modules/manufactura/demo-peluches.js';
import { configurarReferencias, obtenerReferencias } from '../../../src/modules/manufactura/referencias.js';
import { guardarCambios, listar, tablas } from '../../../src/modules/manufactura/almacenamiento.js';

beforeEach(() => localStorage.clear());
afterEach(() => configurarReferencias(null));
const catalogos = () => Object.fromEntries(
  ['materiales', 'repuestos', 'trabajadores', 'proveedores'].map((tipo) => [tipo, obtenerReferencias(tipo)]),
);

it('ofrece solo referencias de la fábrica de peluches sin mezclar respaldos ni tocar registros', () => {
  cargarDemoPeluches();
  const antes = Object.fromEntries(Object.keys(tablas).map((tabla) => [tabla, listar(tabla)]));
  const referencias = catalogos();
  expect(referencias.materiales).toHaveLength(12);
  expect(referencias.repuestos).toHaveLength(5);
  expect(referencias.trabajadores).toHaveLength(6);
  expect(referencias.proveedores).toHaveLength(5);
  expect(JSON.stringify(referencias)).not.toMatch(/Tablero de madera|Tornillos|Pintura|Rodamiento|Correa de transmisión|Disco de corte|de muestra/i);
  for (const [tabla, registros] of Object.entries(antes)) expect(listar(tabla)).toEqual(registros);
  const campos = { materiales: 'material_id', repuestos: 'repuesto_id', trabajadores: 'trabajador_id', proveedores: 'proveedor_id' };
  for (const [tipo, lista] of Object.entries(referencias)) {
    const ids = lista.map((r) => r[campos[tipo]]);
    expect(new Set(ids).size).toBe(lista.length);
  }
});

it('conserva identificadores de respaldo que ya tienen relaciones al añadir la fábrica', () => {
  guardarCambios({
    productos: [{ producto_id: 1, nombre: 'Oso anterior', tipo: 'Peluche' }],
    producto_material: [{ prod_mat_id: 1, producto_id: 1, material_id: 1, cantidad_por_unidad: 0.3 }],
    mantenimiento_repuestos: [{ mant_repuesto_id: 1, mantenimiento_id: 1, repuesto_id: 1, cantidad: 1 }],
    asignaciones: [{ asignacion_id: 1, equipamiento_id: 1, trabajador_id: 1 }],
    recepciones: [{ recepcion_id: 1, orden_id: 1, material_id: 1, proveedor_id: 1, cantidad_recibida: 10 }],
  });
  const historica = listar('recepciones')[0];
  expect(cargarDemoPeluches().errores).toBeNull();
  const referencias = catalogos();
  expect(referencias.materiales.some((r) => r.material_id === 1)).toBe(true);
  expect(referencias.repuestos.some((r) => r.repuesto_id === 1)).toBe(true);
  expect(referencias.trabajadores.some((r) => r.trabajador_id === 1)).toBe(true);
  expect(referencias.proveedores.some((r) => r.proveedor_id === 1)).toBe(true);
  expect(referencias.repuestos.some((r) => r.repuesto_id === 2)).toBe(false);
  expect(listar('recepciones')[0]).toEqual(historica);
});

it('mantiene catálogos de respaldo textiles y respeta un adaptador externo', () => {
  expect(obtenerReferencias('materiales').map((r) => r.nombre)).toEqual(['Tela de felpa', 'Relleno de poliéster', 'Ojos de seguridad']);
  cargarDemoPeluches();
  configurarReferencias((tipo) => tipo === 'materiales' ? [{ material_id: 77, nombre: 'Tela bordada', unidad: 'metro' }] : []);
  expect(obtenerReferencias('materiales')).toContainEqual({ material_id: 77, nombre: 'Tela bordada', unidad: 'metro' });
  expect(obtenerReferencias('materiales').some((r) => r.material_id === 1)).toBe(false);
});
