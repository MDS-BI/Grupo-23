// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cargarDemoPeluches } from '../../../src/modules/manufactura/demo-peluches.js';
import { reconstruirEjemploCoherente, CLAVE_RESPALDO_EJEMPLO } from '../../../src/modules/manufactura/ejemplo-coherente.js';
import { listar, tablas } from '../../../src/modules/manufactura/almacenamiento.js';
import { inicializarPedidosDemo, obtenerPedidosDeOrden } from '../../../src/modules/manufactura/pedidos-locales.js';
import { agregarEjemploOsoCascabel } from '../../../src/modules/manufactura/oso-cascabel.js';
import { avanceOrden } from '../../../src/modules/manufactura/ordenes.js';
import { obtenerReferencias } from '../../../src/modules/manufactura/referencias.js';
import { calcularAlertasProduccion } from '../../../src/modules/manufactura/alertas.js';

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
afterEach(() => vi.restoreAllMocks());
const estado = () => Object.fromEntries([...Object.keys(tablas), 'materiales_locales', 'demo_peluches'].map((t) => [t, listar(t)]));

it('respalda antes de reconstruir seis lotes, con pedidos completos y materiales suficientes para los iniciados', () => {
  cargarDemoPeluches();
  inicializarPedidosDemo();
  agregarEjemploOsoCascabel();
  localStorage.setItem('manufactura:nota_anterior', 'ejemplo previo');
  const anterior = localStorage.getItem('manufactura:ordenes');
  expect(reconstruirEjemploCoherente()).toMatchObject({ errores: null, reconstruido: true });
  const respaldo = JSON.parse(localStorage.getItem(CLAVE_RESPALDO_EJEMPLO));
  expect(respaldo.datos['manufactura:ordenes']).toBe(anterior);
  expect(respaldo.datos['manufactura:nota_anterior']).toBe('ejemplo previo');
  expect(listar('productos')).toHaveLength(6);
  expect(listar('ordenes')).toHaveLength(6);
  expect(listar('pedidos')).toHaveLength(30);
  expect(listar('recepciones')).toHaveLength(38);
  const alertas = calcularAlertasProduccion({ ordenes: listar('ordenes'), productoMaterial: listar('producto_material'), recepciones: listar('recepciones') });
  expect(alertas.stockCritico).toHaveLength(3);
  for (const orden of listar('ordenes')) {
    expect(orden.cantidad_plan).toBe(64);
    const pedidos = obtenerPedidosDeOrden(orden.orden_id);
    if (orden.estado === 'Planificada') {
      expect(pedidos).toHaveLength(0);
      expect(avanceOrden(orden).porcentaje).toBe(0);
      continue;
    }
    expect(pedidos.reduce((n, p) => n + p.cantidad, 0)).toBe(64);
    for (const material of listar('producto_material').filter((m) => m.producto_id === orden.producto_id)) {
      const recepciones = listar('recepciones').filter((r) => r.orden_id === orden.orden_id && r.material_id === material.material_id);
      expect(recepciones.reduce((n, r) => n + r.cantidad_recibida, 0)).toBeCloseTo(material.cantidad_por_unidad * 64, 3);
      expect(recepciones.every((r) => r.fecha_recepcion <= orden.fecha_inicio)).toBe(true);
      expect(recepciones.every((r) => obtenerReferencias('proveedores').some((p) => p.proveedor_id === r.proveedor_id))).toBe(true);
    }
    for (const ejecucion of listar('ejecuciones').filter((e) => e.orden_id === orden.orden_id)) {
      expect(ejecucion.inicio_real.slice(0, 10) >= orden.fecha_inicio).toBe(true);
      expect(ejecucion.fin_real.slice(0, 10) <= orden.fecha_fin).toBe(true);
    }
    if (orden.estado === 'Finalizada') expect(avanceOrden(orden).porcentaje).toBe(100);
  }
  const primero = estado();
  expect(reconstruirEjemploCoherente().reconstruido).toBe(false);
  expect(estado()).toEqual(primero);
});

it('no reemplaza nada si no puede respaldar los datos', () => {
  cargarDemoPeluches();
  const anterior = estado();
  const escribir = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (clave, valor) {
    if (clave === CLAVE_RESPALDO_EJEMPLO) throw new Error('Sin espacio');
    return escribir.call(this, clave, valor);
  });
  expect(reconstruirEjemploCoherente().errores.general).toContain('respaldo');
  expect(estado()).toEqual(anterior);
});

it('recupera el estado previo completo cuando falla una parte de la reconstrucción', () => {
  cargarDemoPeluches();
  const anterior = estado();
  const escribir = Storage.prototype.setItem;
  let falla = true;
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (clave, valor) {
    if (this === localStorage && clave === 'manufactura:locales' && JSON.parse(valor).length === 5 && falla) { falla = false; throw new Error('Escritura fallida'); }
    return escribir.call(this, clave, valor);
  });
  expect(reconstruirEjemploCoherente().errores).toBeTruthy();
  expect(estado()).toEqual(anterior);
  expect(localStorage.getItem(CLAVE_RESPALDO_EJEMPLO)).not.toBeNull();
  vi.restoreAllMocks();
  expect(reconstruirEjemploCoherente().reconstruido).toBe(true);
});

it('genera los mismos datos iniciales desde navegadores vacíos o con ejemplos anteriores', () => {
  reconstruirEjemploCoherente();
  const primero = estado();
  localStorage.clear(); sessionStorage.clear(); cargarDemoPeluches();
  inicializarPedidosDemo();
  agregarEjemploOsoCascabel();
  reconstruirEjemploCoherente();
  expect(estado()).toEqual(primero);
});
