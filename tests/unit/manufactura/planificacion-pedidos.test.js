// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cargarDemoPeluches } from '../../../src/modules/manufactura/demo-peluches.js';
import { asignarPedidosAOrden, guardarOrdenConPedidos, guardarPedido, inicializarPedidosDemo, obtenerPedidosDeOrden } from '../../../src/modules/manufactura/pedidos-locales.js';
import { guardarOrden } from '../../../src/modules/manufactura/ordenes.js';
import { buscar, cambioParaDeshacer, descartarAvisoCambio, deshacerCambio, deshacerUltimoCambio, estadoCambio, guardarCambios, historialCambios, listar, rehacerCambio } from '../../../src/modules/manufactura/almacenamiento.js';
import { cambiarRol } from '../../../src/modules/manufactura/roles.js';

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); cargarDemoPeluches(); inicializarPedidosDemo(); });
afterEach(() => vi.restoreAllMocks());
const datosOrden = (producto_id = 4, cantidad_plan = 64) => ({ producto_id, cantidad_plan, estado: 'Planificada', fecha_inicio: '2026-11-27', fecha_fin: '2026-11-28' });
const datosPedido = (codigo = 'PED-NUEVO', cantidad = 64) => ({ codigo, cantidad, local_id: 3, producto_id: 4 });

it('guarda fechas, orden, pedido de local y vínculo en una transacción reversible', () => {
  const antes = { ordenes: listar('ordenes'), pedidos: listar('pedidos') };
  const resultado = guardarOrdenConPedidos(datosOrden(), [], null, [datosPedido()]);
  expect(resultado.errores).toBeNull();
  expect(obtenerPedidosDeOrden(resultado.registro.orden_id)).toMatchObject([{ codigo: 'PED-NUEVO', local_id: 3, cantidad: 64, producto_id: 4 }]);
  expect(deshacerUltimoCambio().errores).toBeNull();
  expect(listar('ordenes')).toEqual(antes.ordenes);
  expect(listar('pedidos')).toEqual(antes.pedidos);
});

it.each([0, -1, 64.5])('rechaza un pedido inválido de %s en ambos recorridos', (cantidad) => {
  expect(guardarPedido(datosPedido('PED-INVALIDO', cantidad)).errores).toBeTruthy();
  expect(guardarOrdenConPedidos(datosOrden(), [], null, [datosPedido('PED-INVALIDO', cantidad)]).errores).toBeTruthy();
  expect(listar('ordenes')).toHaveLength(5);
  expect(listar('pedidos')).toHaveLength(25);
});

it('permite pedidos pequeños por tienda y pedidos grandes de un solo local', () => {
  expect(guardarPedido(datosPedido('PED-80', 80)).errores).toBeNull();
  const historico = listar('pedidos')[0];
  expect(guardarPedido(historico, historico.pedido_id).errores).toBeNull();
  expect(guardarPedido({ ...historico, cantidad: 20 }, historico.pedido_id).errores).toBeNull();
  expect(guardarPedido(datosPedido('PED-30', 30)).errores).toBeNull();
  expect(guardarPedido(datosPedido('PED-15', 15)).errores).toBeNull();
});

it('reúne 30, 15 y 19 de distintos locales en un lote de 64 con fechas comunes', () => {
  const pedidos = [30, 15, 19].map((cantidad, i) => ({ ...datosPedido(`PED-SUMA-${i}`, cantidad), local_id: i + 1 }));
  const resultado = guardarOrdenConPedidos(datosOrden(), [], null, pedidos);
  expect(resultado.errores).toBeNull();
  expect(resultado.registro).toMatchObject({ cantidad_plan: 64, fecha_inicio: '2026-11-27', fecha_fin: '2026-11-28' });
  expect(obtenerPedidosDeOrden(resultado.registro.orden_id).map((p) => p.cantidad)).toEqual([30, 15, 19]);
  expect(new Set(obtenerPedidosDeOrden(resultado.registro.orden_id).map((p) => p.orden_id)).size).toBe(1);
});

it('no crea un lote si la suma de los pedidos es menor de 64', () => {
  expect(guardarOrdenConPedidos(datosOrden(), [], null, [datosPedido('PED-SOLO-30', 30)]).errores.pedidos).toContain('al menos 64');
  expect(listar('ordenes')).toHaveLength(5);
  expect(listar('pedidos')).toHaveLength(25);
});

it('asigna un pedido a una orden manual existente, sin crear otra orden, y conserva el vínculo al recargar', async () => {
  const orden = guardarOrden(datosOrden()).registro;
  const pedido = guardarPedido(datosPedido()).registro;
  const cantidadOrdenes = listar('ordenes').length;
  expect(asignarPedidosAOrden(orden.orden_id, [pedido.pedido_id]).errores).toBeNull();
  expect(listar('ordenes')).toHaveLength(cantidadOrdenes);
  sessionStorage.clear();
  vi.resetModules();
  const recargado = await import('../../../src/modules/manufactura/pedidos-locales.js');
  expect(recargado.obtenerPedidosDeOrden(orden.orden_id)).toMatchObject([{ pedido_id: pedido.pedido_id }]);
});

it('rechaza exceso de capacidad, pedidos de otro producto, repetidos, inexistentes o asignados a otro lote', () => {
  const a = guardarOrden(datosOrden()).registro;
  const b = guardarOrden(datosOrden()).registro;
  const pedido = guardarPedido(datosPedido()).registro;
  const grande = guardarPedido(datosPedido('PED-80', 80)).registro;
  const otro = guardarPedido({ ...datosPedido('PED-OTRO'), producto_id: 1 }).registro;
  for (const ids of [[grande.pedido_id], [otro.pedido_id], [pedido.pedido_id, pedido.pedido_id], [9999]])
    expect(asignarPedidosAOrden(a.orden_id, ids).errores).toBeTruthy();
  expect(asignarPedidosAOrden(a.orden_id, [pedido.pedido_id]).errores).toBeNull();
  expect(asignarPedidosAOrden(b.orden_id, [pedido.pedido_id]).errores).toBeTruthy();
  expect(obtenerPedidosDeOrden(a.orden_id)).toHaveLength(1);
});

it('impide reducir la cantidad o cambiar el modelo por debajo de los pedidos asignados', () => {
  const orden = guardarOrden(datosOrden(4, 128)).registro;
  const pedido = guardarPedido(datosPedido('PED-96', 96)).registro;
  asignarPedidosAOrden(orden.orden_id, [pedido.pedido_id]);
  expect(guardarOrden({ ...orden, cantidad_plan: 64 }, orden.orden_id).errores.cantidad_plan).toBeTruthy();
  expect(guardarOrden({ ...orden, producto_id: 1 }, orden.orden_id).errores.producto_id).toBeTruthy();
  // Una edición conjunta sí puede liberar el pedido y reducir el lote.
  expect(guardarOrdenConPedidos({ ...orden, cantidad_plan: 64 }, [], orden.orden_id).errores).toBeNull();
  expect(obtenerPedidosDeOrden(orden.orden_id)).toHaveLength(0);
});

it('protege las órdenes cerradas y los permisos de planificación', () => {
  const pedido = guardarPedido({ ...datosPedido('PED-OSO'), producto_id: 1 }).registro;
  expect(asignarPedidosAOrden(1, [pedido.pedido_id]).errores.general).toContain('orden planificada');
  cambiarRol('ensamble');
  expect(guardarOrdenConPedidos(datosOrden(), [], null, [datosPedido('PED-ROL')]).errores).toBeTruthy();
  expect(asignarPedidosAOrden(4, []).errores).toBeTruthy();
});

it('no deja pedidos ni órdenes parcialmente creados si falla una escritura', () => {
  const anteriores = { ordenes: listar('ordenes'), pedidos: listar('pedidos') };
  const escribir = Storage.prototype.setItem;
  let falla = true;
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (clave, valor) {
    if (this === localStorage && clave === 'manufactura:pedidos' && falla) { falla = false; throw new Error('Sin espacio'); }
    return escribir.call(this, clave, valor);
  });
  expect(guardarOrdenConPedidos(datosOrden(), [], null, [datosPedido()]).errores).toBeTruthy();
  expect(listar('ordenes')).toEqual(anteriores.ordenes);
  expect(listar('pedidos')).toEqual(anteriores.pedidos);
});

it('bloquea deshacer una ampliación del lote si dejaría pedidos sin capacidad', () => {
  const orden = guardarOrden(datosOrden()).registro;
  guardarOrden({ ...orden, cantidad_plan: 128 }, orden.orden_id);
  const ampliacion = cambioParaDeshacer().id;
  const pedido = guardarPedido(datosPedido('PED-96', 96)).registro;
  asignarPedidosAOrden(orden.orden_id, [pedido.pedido_id]);
  expect(deshacerCambio(ampliacion).errores).toBeTruthy();
  expect(buscar('ordenes', orden.orden_id).cantidad_plan).toBe(128);
});

it('descarta avisos de deshacer y rehacer sin modificar los registros y persiste al recargar', async () => {
  const pedido = guardarPedido(datosPedido()).registro;
  const id = cambioParaDeshacer().id;
  const antes = listar('pedidos');
  expect(descartarAvisoCambio(id).errores).toBeNull();
  expect(historialCambios('pedidos')).toHaveLength(0);
  expect(listar('pedidos')).toEqual(antes);
  expect(estadoCambio(id).cambio).toBeNull();
  guardarPedido(datosPedido('PED-SEGUNDO'));
  const segundo = cambioParaDeshacer().id;
  deshacerCambio(segundo);
  expect(descartarAvisoCambio(segundo).errores).toBeNull();
  expect(rehacerCambio(segundo).errores).toBeTruthy();
  sessionStorage.clear();
  vi.resetModules();
  const recargado = await import('../../../src/modules/manufactura/almacenamiento.js');
  expect(recargado.historialCambios('pedidos')).toHaveLength(0);
  expect(listar('pedidos')).toContainEqual(pedido);
});

it('cierra cantidad y pedidos al entrar en producción, también ante deshacer cambios anteriores', () => {
  const orden = guardarOrden(datosOrden()).registro;
  guardarOrden({ ...orden, cantidad_plan: 128 }, orden.orden_id);
  const ampliacion = cambioParaDeshacer().id;
  const pedido = guardarPedido(datosPedido('PED-INICIADO', 64)).registro;
  const nuevo = guardarPedido(datosPedido('PED-FUERA', 64)).registro;
  asignarPedidosAOrden(orden.orden_id, [pedido.pedido_id]);
  expect(guardarOrden({ ...orden, cantidad_plan: 128, estado: 'En producción' }, orden.orden_id).errores.estado).toContain('todos los peluches');
  asignarPedidosAOrden(orden.orden_id, [pedido.pedido_id, nuevo.pedido_id]);
  guardarOrden({ ...orden, cantidad_plan: 128, estado: 'En producción' }, orden.orden_id);
  expect(asignarPedidosAOrden(orden.orden_id, [pedido.pedido_id]).errores.general).toContain('orden planificada');
  expect(guardarOrden({ ...orden, cantidad_plan: 192, estado: 'En producción' }, orden.orden_id).errores.cantidad_plan).toContain('planificación');
  expect(deshacerCambio(ampliacion).errores.general).toContain('salió de planificación');
  expect(buscar('ordenes', orden.orden_id)).toMatchObject({ cantidad_plan: 128, estado: 'En producción' });
  expect(obtenerPedidosDeOrden(orden.orden_id)).toHaveLength(2);
});
