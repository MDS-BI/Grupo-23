// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cargarDemoPeluches } from '../../../src/modules/manufactura/demo-peluches.js';
import { buscar, cambioParaDeshacer, deshacerUltimoCambio, listar } from '../../../src/modules/manufactura/almacenamiento.js';
import { eliminarAsignacion, eliminarEquipamiento, guardarEquipamiento } from '../../../src/modules/manufactura/recursos.js';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(() => vi.restoreAllMocks());

it('recupera equipamiento eliminado aunque se pierda la sesión y se recargue la aplicación', async () => {
  const equipo = guardarEquipamiento({ nombre: 'Pinza para cascabel', tipo: 'Herramienta textil' }).registro;
  expect(eliminarEquipamiento(equipo.equipamiento_id).errores).toBeNull();
  sessionStorage.clear();
  vi.resetModules();
  const almacenamientoRecargado = await import('../../../src/modules/manufactura/almacenamiento.js');
  expect(almacenamientoRecargado.cambioParaDeshacer('equipamiento')).toBeTruthy();
  expect(almacenamientoRecargado.deshacerUltimoCambio().errores).toBeNull();
  expect(buscar('equipamiento', equipo.equipamiento_id)).toEqual(equipo);
});

it('restaura en orden el equipamiento y su asignación conservando sus identificadores', () => {
  cargarDemoPeluches();
  const equipos = listar('equipamiento');
  const asignaciones = listar('asignaciones');
  const asignacion = asignaciones[0];
  expect(eliminarEquipamiento(asignacion.equipamiento_id).errores).toBeTruthy();
  expect(cambioParaDeshacer()).toBeNull();
  eliminarAsignacion(asignacion.asignacion_id);
  eliminarEquipamiento(asignacion.equipamiento_id);
  expect(buscar('equipamiento', asignacion.equipamiento_id)).toBeUndefined();
  expect(deshacerUltimoCambio().errores).toBeNull();
  expect(listar('equipamiento')).toEqual(equipos);
  expect(deshacerUltimoCambio().errores).toBeNull();
  expect(listar('asignaciones')).toEqual(asignaciones);
});

it('usa la copia más reciente si el navegador rechaza actualizar una de ellas', async () => {
  const equipo = guardarEquipamiento({ nombre: 'Bastidor de prueba', tipo: 'Herramienta textil' }).registro;
  const escritura = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (clave, valor) {
    if (this === localStorage && clave === 'manufactura:deshacer') throw new Error('Sin espacio para el respaldo');
    return escritura.call(this, clave, valor);
  });
  eliminarEquipamiento(equipo.equipamiento_id);
  vi.restoreAllMocks();
  vi.resetModules();
  const recargado = await import('../../../src/modules/manufactura/almacenamiento.js');
  expect(recargado.cambioParaDeshacer('equipamiento').anteriores.equipamiento).toContainEqual(equipo);
  expect(recargado.deshacerUltimoCambio().errores).toBeNull();
  expect(buscar('equipamiento', equipo.equipamiento_id)).toEqual(equipo);
});

it('acepta el historial anterior de sesión y conserva sus pasos en el respaldo persistente', async () => {
  const equipo = guardarEquipamiento({ nombre: 'Tijera de prueba', tipo: 'Herramienta de costura' }).registro;
  const legado = JSON.parse(sessionStorage.getItem('manufactura:deshacer'));
  delete legado.revision;
  sessionStorage.setItem('manufactura:deshacer', JSON.stringify(legado));
  localStorage.removeItem('manufactura:deshacer');
  vi.resetModules();
  const recargado = await import('../../../src/modules/manufactura/almacenamiento.js');
  expect(recargado.cambioParaDeshacer('equipamiento')).toBeTruthy();
  expect(recargado.deshacerUltimoCambio().errores).toBeNull();
  expect(buscar('equipamiento', equipo.equipamiento_id)).toBeUndefined();
  expect(localStorage.getItem('manufactura:deshacer')).not.toBeNull();
});

it('elimina equipamiento y asignaciones con autorización explícita y restaura ambos en una operación', () => {
  cargarDemoPeluches();
  const equipos = listar('equipamiento');
  const asignaciones = listar('asignaciones');
  const equipo = equipos.at(-1);
  expect(eliminarEquipamiento(equipo.equipamiento_id, { retirarAsignaciones: true }).errores).toBeNull();
  expect(listar('equipamiento')).toHaveLength(4);
  expect(listar('asignaciones')).toHaveLength(4);
  sessionStorage.clear();
  expect(deshacerUltimoCambio().errores).toBeNull();
  expect(listar('equipamiento')).toEqual(equipos);
  expect(listar('asignaciones')).toEqual(asignaciones);
});

it('revierte la eliminación completa si falla retirar las asignaciones', () => {
  cargarDemoPeluches();
  const equipos = listar('equipamiento');
  const asignaciones = listar('asignaciones');
  const escritura = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (clave, valor) {
    if (this === localStorage && clave === 'manufactura:asignaciones' && JSON.parse(valor).length < asignaciones.length) throw new Error('Sin espacio');
    return escritura.call(this, clave, valor);
  });
  expect(eliminarEquipamiento(equipos[0].equipamiento_id, { retirarAsignaciones: true }).errores).toBeTruthy();
  expect(listar('equipamiento')).toEqual(equipos);
  expect(listar('asignaciones')).toEqual(asignaciones);
  expect(cambioParaDeshacer()).toBeNull();
});
