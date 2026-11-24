// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest';
import { deshacerCambio, estadoCambio, guardarCambios, historialCambios, listar, rehacerCambio } from '../../../src/modules/manufactura/almacenamiento.js';
import { guardarEquipamiento, eliminarEquipamiento, guardarAsignacion } from '../../../src/modules/manufactura/recursos.js';
import { registrarMaterialLocal } from '../../../src/modules/manufactura/referencias.js';
import { crearProducto, eliminarProducto } from '../../../src/modules/manufactura/productos.js';
import { cargarDemoPeluches } from '../../../src/modules/manufactura/demo-peluches.js';
import { guardarRecepcion } from '../../../src/modules/manufactura/recepciones.js';
import { cambiarRol } from '../../../src/modules/manufactura/roles.js';

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
const equipo = (nombre) => guardarEquipamiento({ nombre, tipo: 'Herramienta textil' }).registro;
const ultimo = (tabla = 'equipamiento') => historialCambios(tabla)[0].id;

it('deshace un cambio anterior y conserva rehacer después de nuevas operaciones y recarga', async () => {
  const a = equipo('Pinza A');
  const cambioA = ultimo();
  equipo('Pinza B');
  expect(deshacerCambio(cambioA).errores).toBeNull();
  equipo('Pinza C');
  expect(historialCambios('equipamiento')).toHaveLength(3);
  sessionStorage.clear();
  vi.resetModules();
  const recargado = await import('../../../src/modules/manufactura/almacenamiento.js');
  expect(recargado.rehacerCambio(cambioA).errores).toBeNull();
  expect(listar('equipamiento')).toContainEqual(a);
  expect(listar('equipamiento').map((r) => r.nombre)).toEqual(['Pinza A', 'Pinza B', 'Pinza C']);
});

it('conserva ediciones posteriores de otros campos y bloquea conflictos sobre el mismo campo', () => {
  const a = equipo('Pinza A');
  guardarEquipamiento({ ...a, nombre: 'Pinza B' }, a.equipamiento_id);
  const cambioNombre = ultimo();
  guardarEquipamiento({ nombre: 'Pinza B', tipo: 'Herramienta de bordado' }, a.equipamiento_id);
  expect(deshacerCambio(cambioNombre).errores).toBeNull();
  expect(listar('equipamiento')[0]).toMatchObject({ nombre: 'Pinza A', tipo: 'Herramienta de bordado' });
  expect(rehacerCambio(cambioNombre).errores).toBeNull();
  guardarEquipamiento({ nombre: 'Pinza C', tipo: 'Herramienta de bordado' }, a.equipamiento_id);
  expect(deshacerCambio(cambioNombre).errores.general).toContain('posteriores');
  expect(listar('equipamiento')[0].nombre).toBe('Pinza C');
});

it('reserva identificadores de equipos, productos y materiales eliminados o deshechos', () => {
  const a = equipo('Pinza A');
  eliminarEquipamiento(a.equipamiento_id);
  const eliminacion = ultimo();
  expect(equipo('Pinza B').equipamiento_id).toBeGreaterThan(a.equipamiento_id);
  expect(deshacerCambio(eliminacion).errores).toBeNull();
  const material = registrarMaterialLocal({ nombre: 'Cinta rosa', unidad: 'metro' }).registro;
  const cambioMaterial = ultimo('materiales_locales');
  deshacerCambio(cambioMaterial);
  expect(registrarMaterialLocal({ nombre: 'Cinta azul', unidad: 'metro' }).registro.material_id).toBeLessThan(material.material_id);
  expect(rehacerCambio(cambioMaterial).errores).toBeNull();
  const producto = crearProducto({ nombre: 'Oso A', tipo: 'Peluche' }).producto;
  eliminarProducto(producto.producto_id);
  const eliminacionProducto = ultimo('productos');
  expect(crearProducto({ nombre: 'Oso B', tipo: 'Peluche' }).producto.producto_id).toBeGreaterThan(producto.producto_id);
  expect(deshacerCambio(eliminacionProducto).errores).toBeNull();
});

it('impide dejar una asignación huérfana y permite revertirla primero', () => {
  const a = equipo('Pinza A');
  const creacion = ultimo();
  guardarAsignacion({ equipamiento_id: a.equipamiento_id, trabajador_id: 1, fecha_entrega: '2026-11-23' });
  const asignacion = ultimo('asignaciones');
  expect(deshacerCambio(creacion).errores.general).toContain('relacionados');
  expect(listar('equipamiento')).toHaveLength(1);
  expect(deshacerCambio(asignacion).errores).toBeNull();
  expect(deshacerCambio(creacion).errores).toBeNull();
  expect(rehacerCambio(asignacion).errores).toBeTruthy();
  expect(rehacerCambio(creacion).errores).toBeNull();
  expect(rehacerCambio(asignacion).errores).toBeNull();
});

it('deshace y rehace una eliminación con sus asignaciones sin afectar equipos posteriores', () => {
  cargarDemoPeluches();
  const originales = listar('equipamiento');
  const asignaciones = listar('asignaciones');
  eliminarEquipamiento(originales[0].equipamiento_id, { retirarAsignaciones: true });
  const eliminacion = ultimo();
  const nuevo = equipo('Pinza nueva');
  expect(deshacerCambio(eliminacion).errores).toBeNull();
  expect(listar('equipamiento')).toEqual([...originales, nuevo]);
  expect(listar('asignaciones')).toEqual(asignaciones);
  expect(rehacerCambio(eliminacion).errores).toBeNull();
  expect(listar('equipamiento')).toContainEqual(nuevo);
  expect(listar('asignaciones')).toHaveLength(4);
});

it('mantiene recepciones inmutables y conserva los cambios independientes anteriores', () => {
  cargarDemoPeluches();
  equipo('Pinza independiente');
  const cambio = ultimo();
  guardarRecepcion({ ...listar('recepciones').find((r) => r.orden_id === 4), cantidad_recibida: 1 });
  const recepciones = listar('recepciones');
  const recepcion = ultimo('recepciones');
  expect(estadoCambio(recepcion).motivo).toContain('historial');
  expect(deshacerCambio(cambio).errores).toBeNull();
  expect(listar('recepciones')).toEqual(recepciones);
  cambiarRol('bodega');
  expect(historialCambios('equipamiento')).toHaveLength(0);
  expect(rehacerCambio(cambio).errores).toBeTruthy();
});

it('rechaza una reversión tras una modificación externa sin sobrescribir datos', () => {
  equipo('Pinza');
  const id = ultimo();
  localStorage.setItem('manufactura:equipamiento', '[]');
  expect(deshacerCambio(id).errores).toBeTruthy();
  expect(listar('equipamiento')).toHaveLength(0);
});

it('no permite deshacer una ruta necesaria para una ejecución posterior', () => {
  guardarCambios({ productos: [{ producto_id: 1, nombre: 'Oso' }], etapas: [{ etapa_id: 1, nombre: 'Costura' }], ordenes: [{ orden_id: 1, producto_id: 1, estado: 'En producción' }] });
  guardarCambios({ rutas: [{ ruta_id: 1, producto_id: 1, etapa_id: 1, secuencia: 1 }] });
  const ruta = ultimo('rutas');
  guardarCambios({ ejecuciones: [{ ejecucion_id: 1, orden_id: 1, etapa_id: 1, fin_real: null }] });
  expect(deshacerCambio(ruta).errores).toBeTruthy();
  expect(listar('rutas')).toHaveLength(1);
});
