// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  buscar, cambioParaDeshacer, deshacerUltimoCambio, guardarCambios, listar,
} from '../../../src/modules/manufactura/almacenamiento.js';
import { crearProducto, eliminarProducto } from '../../../src/modules/manufactura/productos.js';
import { guardarEtapa } from '../../../src/modules/manufactura/etapas.js';
import { guardarRuta } from '../../../src/modules/manufactura/rutas.js';
import { guardarOrden } from '../../../src/modules/manufactura/ordenes.js';
import { guardarRecepcion } from '../../../src/modules/manufactura/recepciones.js';
import { cargarDemoPeluches } from '../../../src/modules/manufactura/demo-peluches.js';
import {
  crearOrdenDesdePedidos, inicializarPedidosDemo, obtenerPedidosPendientes,
} from '../../../src/modules/manufactura/pedidos-locales.js';
import { cambiarRol } from '../../../src/modules/manufactura/roles.js';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
afterEach(() => vi.restoreAllMocks());

it('deshace una eliminación junto a sus materiales y ruta, conservando sus identificadores', () => {
  const producto = crearProducto({
    nombre: 'Oso de prueba', tipo: 'Peluche',
    materiales: [{ material_id: 1, cantidad_por_unidad: 0.3 }],
  }).producto;
  const etapa = guardarEtapa({ nombre: 'Coser', tipo: 'Ensamblaje', tiempo_estandar_min: 10 }).registro;
  guardarRuta(producto.producto_id, [{ etapa_id: etapa.etapa_id, secuencia: 1 }]);
  const anteriores = {
    productos: listar('productos'), producto_material: listar('producto_material'), rutas: listar('rutas'),
  };
  expect(eliminarProducto(producto.producto_id).errores).toBeNull();
  expect(listar('productos')).toHaveLength(0);
  expect(deshacerUltimoCambio().errores).toBeNull();
  for (const [tabla, registros] of Object.entries(anteriores)) expect(listar(tabla)).toEqual(registros);
});

it('limita deshacer al rol y al estado que generó el cambio', () => {
  const etapa = guardarEtapa({ nombre: 'Coser', tipo: 'Ensamblaje', tiempo_estandar_min: 10 }).registro;
  guardarEtapa({ ...etapa, nombre: 'Costura doble' }, etapa.etapa_id);
  expect(cambioParaDeshacer('etapas', etapa.etapa_id)).toBeTruthy();
  cambiarRol('bodega');
  expect(deshacerUltimoCambio().errores).toBeTruthy();
  cambiarRol('supervisor');
  expect(deshacerUltimoCambio('etapas', etapa.etapa_id).errores).toBeNull();
  expect(buscar('etapas', etapa.etapa_id).nombre).toBe('Coser');
  localStorage.setItem('manufactura:equipamiento', '[{"equipamiento_id":1,"nombre":"Cambio en otra pestaña"}]');
  expect(deshacerUltimoCambio().errores).toBeTruthy();
  expect(listar('etapas')).toHaveLength(1);
});

it('conserva las recepciones y empieza un historial posterior a la entrega', () => {
  cargarDemoPeluches();
  const original = listar('recepciones').find((r) => r.orden_id === 4);
  guardarEtapa({ nombre: 'Control adicional', tipo: 'Calidad', tiempo_estandar_min: 5 });
  expect(cambioParaDeshacer()).toBeTruthy();
  expect(guardarRecepcion({ ...original, cantidad_recibida: 2 }).errores).toBeNull();
  expect(deshacerUltimoCambio().errores).toBeTruthy();
  expect(listar('recepciones')).toHaveLength(29);
});

it('recupera los datos y el historial anterior si una escritura de varias tablas falla', () => {
  cargarDemoPeluches();
  const producto = crearProducto({ nombre: 'Panda', tipo: 'Peluche' }).producto;
  const historialAnterior = sessionStorage.getItem('manufactura:deshacer');
  const escritura = Storage.prototype.setItem;
  let fallar = true;
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (clave, valor) {
    if (this === localStorage && clave === 'manufactura:rutas' && fallar) {
      fallar = false;
      throw new Error('Espacio insuficiente');
    }
    return escritura.call(this, clave, valor);
  });
  expect(guardarCambios({ productos: [], rutas: [] }).errores).toBeTruthy();
  expect(buscar('productos', producto.producto_id)).toEqual(producto);
  expect(sessionStorage.getItem('manufactura:deshacer')).toBe(historialAnterior);
});

it('exige 64 peluches enteros para los lotes nuevos y conserva las cantidades históricas', () => {
  cargarDemoPeluches();
  const datos = {
    producto_id: 1, estado: 'Planificada',
    fecha_inicio: '2026-11-23', fecha_fin: '2026-11-25',
  };
  expect(guardarOrden({ ...datos, cantidad_plan: 63 }).errores.cantidad_plan).toBeTruthy();
  expect(guardarOrden({ ...datos, cantidad_plan: 64.5 }).errores.cantidad_plan).toBeTruthy();
  expect(guardarOrden({ ...datos, cantidad_plan: 64 }).errores).toBeNull();
  localStorage.setItem('manufactura:ordenes', JSON.stringify([
    { ...datos, orden_id: 100, cantidad_plan: 10 },
  ]));
  expect(guardarOrden({ ...datos, cantidad_plan: 10 }, 100).errores).toBeNull();
  expect(guardarOrden({ ...datos, cantidad_plan: 11 }, 100).errores.cantidad_plan).toBeTruthy();
});

it('relaciona pedidos por código y local y deshace la orden y sus vínculos juntos', () => {
  cargarDemoPeluches();
  inicializarPedidosDemo();
  inicializarPedidosDemo();
  expect(listar('locales')).toHaveLength(5);
  expect(listar('pedidos')).toHaveLength(25);
  expect(new Set(listar('pedidos').map((p) => p.codigo)).size).toBe(25);
  const pedidos = obtenerPedidosPendientes(1);
  expect(pedidos.reduce((total, p) => total + p.cantidad, 0)).toBe(64);
  const datos = {
    producto_id: 1, cantidad_plan: 64, estado: 'Planificada',
    fecha_inicio: '2026-11-23', fecha_fin: '2026-11-25',
  };
  const ids = pedidos.map((p) => p.pedido_id);
  expect(crearOrdenDesdePedidos(datos, ids).errores).toBeNull();
  expect(obtenerPedidosPendientes(1)).toHaveLength(0);
  expect(crearOrdenDesdePedidos(datos, ids).errores).toBeTruthy();
  expect(listar('ordenes')).toHaveLength(6);
  expect(deshacerUltimoCambio().errores).toBeNull();
  expect(obtenerPedidosPendientes(1)).toHaveLength(5);
  expect(listar('ordenes')).toHaveLength(5);
  cambiarRol('ensamble');
  expect(crearOrdenDesdePedidos(datos, ids).errores).toBeTruthy();
});

it('mantiene disponibles los últimos veinte cambios de la sesión', () => {
  for (let i = 0; i < 21; i++) {
    guardarEtapa({ nombre: `Etapa ${i}`, tipo: 'Control', tiempo_estandar_min: 1 });
  }
  for (let i = 0; i < 20; i++) expect(deshacerUltimoCambio().errores).toBeNull();
  expect(listar('etapas')).toHaveLength(1);
  expect(cambioParaDeshacer()).toBeNull();
});

it('permite deshacer durante la sesión aunque el navegador rechace guardar el historial', () => {
  const escritura = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (clave, valor) {
    if (clave === 'manufactura:deshacer') throw new Error('Historial sin espacio');
    return escritura.call(this, clave, valor);
  });
  const etapa = guardarEtapa({ nombre: 'Control', tipo: 'Calidad', tiempo_estandar_min: 5 }).registro;
  expect(cambioParaDeshacer('etapas', etapa.etapa_id)).toBeTruthy();
  expect(deshacerUltimoCambio().errores).toBeNull();
  expect(listar('etapas')).toHaveLength(0);
});
