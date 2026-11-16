// @vitest-environment jsdom
import { beforeEach, expect, it } from 'vitest';
import { buscar, listar, tablas } from '../../../src/modules/manufactura/almacenamiento.js';
import { cargarDemoPeluches, demoPeluchesCargada } from '../../../src/modules/manufactura/demo-peluches.js';
import { validarEtapa } from '../../../src/modules/manufactura/etapas.js';
import { avanceOrden, validarEjecucion, validarOrden } from '../../../src/modules/manufactura/ordenes.js';
import { obtenerProductoMaterial, validarMaterialProducto } from '../../../src/modules/manufactura/productos.js';
import { validarRecepcion } from '../../../src/modules/manufactura/recepciones.js';
import { guardarMaquina, validarAsignacion, validarMantenimiento } from '../../../src/modules/manufactura/recursos.js';
import { obtenerReferencias, registrarMaterialLocal } from '../../../src/modules/manufactura/referencias.js';
import { obtenerRuta } from '../../../src/modules/manufactura/rutas.js';

const hoy = new Date(2026, 10, 16, 12);

beforeEach(() => localStorage.clear());

it('conecta cinco productos con lotes, rutas, insumos, proveedores y recursos', () => {
  expect(cargarDemoPeluches({ hoy })).toEqual({ errores: null, cargada: true });
  expect(listar('productos')).toHaveLength(5);
  expect(listar('ordenes')).toHaveLength(5);
  expect(listar('maquinas')).toHaveLength(5);
  expect(listar('mantenimientos')).toHaveLength(5);
  expect(listar('equipamiento')).toHaveLength(5);
  expect(listar('asignaciones')).toHaveLength(5);

  for (const [tabla, campo] of Object.entries(tablas)) {
    const ids = listar(tabla).map((registro) => registro[campo]);
    expect(new Set(ids).size).toBe(ids.length);
  }
  for (const etapa of listar('etapas')) expect(validarEtapa(etapa)).toEqual({});
  for (const orden of listar('ordenes')) {
    expect(validarOrden(orden)).toEqual({});
    const ruta = obtenerRuta(orden.producto_id);
    expect(ruta.map(({ secuencia }) => secuencia)).toEqual([1, 2, 3, 4, 5, 6]);
    const materiales = obtenerProductoMaterial(orden.producto_id);
    expect(materiales.length).toBeGreaterThanOrEqual(5);
    for (const material of materiales) {
      expect(validarMaterialProducto(material)).toEqual({});
    }
    const recepciones = listar('recepciones').filter((r) => r.orden_id === orden.orden_id);
    expect(recepciones.length).toBeGreaterThan(0);
    for (const recepcion of recepciones) {
      expect(validarRecepcion(recepcion)).toEqual({});
      const material = materiales.find((m) => m.material_id === recepcion.material_id);
      expect(recepcion.cantidad_recibida).toBeCloseTo(material.cantidad_por_unidad * orden.cantidad_plan);
      expect(recepcion.fecha_recepcion < orden.fecha_inicio).toBe(true);
    }
    const avance = avanceOrden(orden).porcentaje;
    if (orden.estado === 'Finalizada') {
      expect(avance).toBe(100);
      expect(recepciones).toHaveLength(materiales.length);
    } else if (orden.estado === 'Planificada') {
      expect(avance).toBe(0);
    } else {
      expect(avance).toBeGreaterThan(0);
      expect(avance).toBeLessThan(100);
    }
  }

  expect(new Set(listar('recepciones').map((r) => r.proveedor_id)).size).toBe(5);
  expect(new Set(listar('ejecuciones').flatMap((e) => e.maquina_id ?? [])).size).toBe(5);
  for (const ejecucion of listar('ejecuciones')) {
    expect(validarEjecucion(ejecucion)).toEqual({});
    expect((new Date(ejecucion.fin_real) - new Date(ejecucion.inicio_real)) / 60000)
      .toBe(ejecucion.tiempo_uso_min);
  }
  for (const mantenimiento of listar('mantenimientos')) {
    expect(validarMantenimiento(mantenimiento)).toEqual({});
    const repuesto = listar('mantenimiento_repuestos').find((r) => r.mantenimiento_id === mantenimiento.mantenimiento_id);
    expect(obtenerReferencias('repuestos').some((r) => r.repuesto_id === repuesto.repuesto_id)).toBe(true);
  }
  for (const asignacion of listar('asignaciones')) expect(validarAsignacion(asignacion)).toEqual({});
});

it('conserva datos previos al añadir y evita volver a cargar el mismo ejemplo', () => {
  const maquinaPrevia = guardarMaquina({
    codigo: 'pel-m01', nombre: 'Máquina previa', capacidad_hora: 10, estado: 'Disponible',
  }).registro;
  const materialPrevio = registrarMaterialLocal({ nombre: 'Felpa marrón de pelo corto', unidad: 'metro' }).registro;
  expect(cargarDemoPeluches({ hoy }).cargada).toBe(true);
  expect(cargarDemoPeluches({ hoy }).cargada).toBe(false);
  expect(buscar('maquinas', maquinaPrevia.maquina_id)).toEqual(maquinaPrevia);
  expect(listar('maquinas').some((m) => m.codigo === 'PEL-M01-2')).toBe(true);
  expect(listar('materiales_locales')).toHaveLength(12);
  expect(obtenerProductoMaterial(1)).toContainEqual(expect.objectContaining({
    material_id: materialPrevio.material_id,
  }));
  const { registro } = registrarMaterialLocal({ nombre: 'Broche de tela', unidad: 'unidad' });
  expect(listar('materiales_locales').filter((m) => m.material_id === registro.material_id)).toHaveLength(1);
});

it('no altera los ejemplos previos si falla la escritura del reemplazo', () => {
  const anteriores = '[{"producto_id":1,"nombre":"Mi producto anterior"}]';
  localStorage.setItem('manufactura:productos', anteriores);
  localStorage.setItem('manufactura:recepciones', '{incompleto');
  expect(cargarDemoPeluches({ hoy, reemplazar: true }).errores).toBeTruthy();
  expect(demoPeluchesCargada()).toBe(false);
  expect(localStorage.getItem('manufactura:productos')).toBe(anteriores);
  expect(localStorage.getItem('manufactura:recepciones')).toBe('{incompleto');
});
