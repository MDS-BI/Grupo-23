// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cargarDemoPeluches } from '../../../src/modules/manufactura/demo-peluches.js';
import { buscar, guardarCambios, listar, tablas } from '../../../src/modules/manufactura/almacenamiento.js';
import { inicializarPedidosDemo, obtenerPedidosPendientes } from '../../../src/modules/manufactura/pedidos-locales.js';
import { obtenerReferencias } from '../../../src/modules/manufactura/referencias.js';
import { agregarEjemploOsoCascabel, ejemploOsoCascabelCargado, NOMBRE_OSO_CASCABEL } from '../../../src/modules/manufactura/oso-cascabel.js';
import { obtenerProductoMaterial, validarMaterialProducto } from '../../../src/modules/manufactura/productos.js';
import { obtenerRuta } from '../../../src/modules/manufactura/rutas.js';
import { avanceOrden, validarEjecucion, validarOrden } from '../../../src/modules/manufactura/ordenes.js';
import { validarRecepcion } from '../../../src/modules/manufactura/recepciones.js';
import { cambiarRol } from '../../../src/modules/manufactura/roles.js';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  cargarDemoPeluches();
  inicializarPedidosDemo();
});
afterEach(() => vi.restoreAllMocks());
const estado = () => Object.fromEntries(
  [...Object.keys(tablas), 'materiales_locales', 'demo_peluches'].map((tabla) => [tabla, listar(tabla)]),
);

it('añade un ejemplo completo de 64 osos sin modificar registros anteriores', () => {
  const antes = estado();
  const resultado = agregarEjemploOsoCascabel();
  expect(resultado.errores).toBeNull();
  expect(resultado.cargada).toBe(true);
  expect(resultado.producto.nombre).toBe(NOMBRE_OSO_CASCABEL);
  for (const [tabla, registros] of Object.entries(antes)) {
    if (tabla === 'demo_peluches') continue;
    expect(listar(tabla).slice(0, registros.length)).toEqual(registros);
  }
  for (const tabla of ['maquinas', 'mantenimientos', 'mantenimiento_repuestos', 'equipamiento', 'asignaciones', 'locales']) {
    expect(listar(tabla)).toEqual(antes[tabla]);
  }
  expect(listar('productos')).toHaveLength(6);
  expect(obtenerReferencias('materiales')).toHaveLength(14);
  const productoId = resultado.producto.producto_id;
  const materiales = obtenerProductoMaterial(productoId);
  expect(materiales).toHaveLength(9);
  for (const material of materiales) expect(validarMaterialProducto(material)).toEqual({});
  const cascabel = obtenerReferencias('materiales').find((material) => material.nombre === 'Cascabel para peluche');
  const bolsillo = obtenerReferencias('materiales').find((material) => material.nombre === 'Bolsillo textil protector para cascabel');
  expect(materiales.find((material) => material.material_id === cascabel.material_id).cantidad_por_unidad).toBe(1);
  expect(materiales.find((material) => material.material_id === bolsillo.material_id).cantidad_por_unidad).toBe(1);

  const ruta = obtenerRuta(productoId);
  expect(ruta.map((paso) => paso.secuencia)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  expect(buscar('etapas', ruta[3].etapa_id).nombre).toBe('Montaje y fijación del cascabel interior');
  expect(buscar('etapas', ruta[6].etapa_id).nombre).toBe('Prueba de sonido y fijación del cascabel');
  const orden = listar('ordenes').find((registro) => registro.producto_id === productoId);
  expect(orden.cantidad_plan).toBe(64);
  expect(validarOrden(orden)).toEqual({});
  expect(avanceOrden(orden)).toMatchObject({ total: 8, completadas: 4, porcentaje: 50 });
  for (const ejecucion of listar('ejecuciones').filter((registro) => registro.orden_id === orden.orden_id)) {
    expect(validarEjecucion(ejecucion)).toEqual({});
    expect(buscar('maquinas', ejecucion.maquina_id)).toBeTruthy();
  }
  const recepciones = listar('recepciones').filter((registro) => registro.orden_id === orden.orden_id);
  expect(recepciones).toHaveLength(9);
  expect(new Set(recepciones.map((registro) => registro.proveedor_id)).size).toBe(5);
  for (const recepcion of recepciones) {
    expect(validarRecepcion(recepcion)).toEqual({});
    const material = materiales.find((registro) => registro.material_id === recepcion.material_id);
    expect(recepcion.cantidad_recibida).toBeCloseTo(material.cantidad_por_unidad * 64);
    expect(recepcion.fecha_recepcion < orden.fecha_inicio).toBe(true);
  }
  const pedidos = listar('pedidos').filter((pedido) => pedido.producto_id === productoId);
  expect(pedidos).toHaveLength(5);
  expect(pedidos.reduce((total, pedido) => total + pedido.cantidad, 0)).toBe(64);
  expect(pedidos.every((pedido) => pedido.orden_id === orden.orden_id)).toBe(true);
  expect(obtenerPedidosPendientes(productoId)).toHaveLength(0);
  expect(new Set(listar('pedidos').map((pedido) => pedido.codigo)).size).toBe(30);
});

it('no duplica el ejemplo al recargar y conserva modificaciones posteriores', () => {
  agregarEjemploOsoCascabel();
  guardarCambios({ productos: listar('productos').map((producto) => producto.nombre === NOMBRE_OSO_CASCABEL
    ? { ...producto, nombre: 'Oso con cascabel personalizado' } : producto) });
  const antes = estado();
  expect(agregarEjemploOsoCascabel()).toEqual({ errores: null, cargada: false });
  expect(estado()).toEqual(antes);
  expect(ejemploOsoCascabelCargado()).toBe(true);
});

it('genera el mismo ejemplo completo con independencia del reloj del computador', () => {
  agregarEjemploOsoCascabel();
  const antes = estado();
  vi.useFakeTimers();
  try {
    vi.setSystemTime(new Date('2027-05-01T12:00:00'));
    localStorage.clear();
    cargarDemoPeluches();
    inicializarPedidosDemo();
    agregarEjemploOsoCascabel();
    expect(estado()).toEqual(antes);
  } finally {
    vi.useRealTimers();
  }
});

it('revierte todas las escrituras del ejemplo cuando falla el almacenamiento', () => {
  const antes = estado();
  const escritura = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (clave, valor) {
    if (clave === 'manufactura:recepciones' && JSON.parse(valor).length > 28) throw new Error('Sin espacio');
    return escritura.call(this, clave, valor);
  });
  expect(agregarEjemploOsoCascabel().errores).toBeTruthy();
  expect(estado()).toEqual(antes);
  expect(ejemploOsoCascabelCargado()).toBe(false);
});

it('rechaza cargar el ejemplo fuera de Supervisor o si faltan sus recursos', () => {
  cambiarRol('planificacion');
  let antes = estado();
  expect(agregarEjemploOsoCascabel().errores.general).toContain('Supervisor');
  expect(estado()).toEqual(antes);
  cambiarRol('supervisor');
  localStorage.setItem('manufactura:maquinas', '[]');
  antes = estado();
  expect(agregarEjemploOsoCascabel().errores.general).toContain('Faltan recursos');
  expect(estado()).toEqual(antes);
});

it('reutiliza materiales existentes y rechaza una unidad contradictoria sin escribir', () => {
  const materiales = listar('materiales_locales');
  materiales.push({ material_id: -50, nombre: 'Cascabel para peluche', unidad: 'kilogramo' });
  localStorage.setItem('manufactura:materiales_locales', JSON.stringify(materiales));
  const antes = estado();
  expect(agregarEjemploOsoCascabel().errores.general).toContain('otra unidad');
  expect(estado()).toEqual(antes);
  materiales.at(-1).unidad = 'unidad';
  localStorage.setItem('manufactura:materiales_locales', JSON.stringify(materiales));
  expect(agregarEjemploOsoCascabel().errores).toBeNull();
  expect(obtenerReferencias('materiales').filter((material) => material.nombre === 'Cascabel para peluche')).toHaveLength(1);
});
