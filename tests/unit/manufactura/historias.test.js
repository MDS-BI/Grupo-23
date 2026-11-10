// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerProductos,
  obtenerProductoMaterial,
} from '../../../src/modules/manufactura/productos.js';
import {
  guardarEtapa,
  obtenerEtapas,
  eliminarEtapa,
} from '../../../src/modules/manufactura/etapas.js';
import {
  guardarRuta,
  obtenerRuta,
} from '../../../src/modules/manufactura/rutas.js';
import {
  guardarOrden,
  guardarEjecucion,
  obtenerEjecuciones,
  avanceOrden,
  eliminarOrden,
} from '../../../src/modules/manufactura/ordenes.js';
import {
  guardarRecepcion,
  obtenerRecepciones,
} from '../../../src/modules/manufactura/recepciones.js';
import {
  guardarMaquina,
  guardarMantenimiento,
  guardarEquipamiento,
  guardarAsignacion,
  obtenerRepuestosMantenimiento,
  eliminarMaquina,
  eliminarMantenimiento,
  eliminarEquipamiento,
} from '../../../src/modules/manufactura/recursos.js';
import {
  listar,
  guardarCambios,
} from '../../../src/modules/manufactura/almacenamiento.js';
import {
  configurarReferencias,
  obtenerReferencias,
} from '../../../src/modules/manufactura/referencias.js';

const producto = () =>
  crearProducto({
    nombre: 'Mesa',
    tipo: 'Mueble',
    materiales: [{ material_id: 1, cantidad_por_unidad: 2.5 }],
  }).producto;
const etapa = () =>
  guardarEtapa({ nombre: 'Corte', tipo: 'Mecánica', tiempo_estandar_min: 15 })
    .registro;
const maquina = () =>
  guardarMaquina({
    codigo: 'M-01',
    nombre: 'Sierra',
    estado: 'Disponible',
    capacidad_hora: 20,
  }).registro;
function ordenConRuta() {
  const p = producto();
  const e = etapa();
  guardarRuta(p.producto_id, [{ etapa_id: e.etapa_id, secuencia: 1 }]);
  const o = guardarOrden({
    producto_id: p.producto_id,
    cantidad_plan: 10,
    estado: 'Planificada',
    fecha_inicio: '2026-11-10',
    fecha_fin: '2026-11-12',
  }).registro;
  return { p, e, o };
}
beforeEach(() => {
  localStorage.clear();
  configurarReferencias(null);
  vi.restoreAllMocks();
});

describe('HU1 productos y materiales', () => {
  it('crea, consulta y edita datos y composición sin cambiar la identidad', () => {
    const p = producto();
    const rel = obtenerProductoMaterial(p.producto_id)[0];
    const r = actualizarProducto(p.producto_id, {
      nombre: 'Mesa grande',
      tipo: 'Mueble',
      materiales: [
        { material_id: 1, cantidad_por_unidad: 4 },
        { material_id: 2, cantidad_por_unidad: 12 },
      ],
    });
    expect(r.errores).toBeNull();
    expect(obtenerProductos()[0].nombre).toBe('Mesa grande');
    expect(obtenerProductoMaterial(p.producto_id)).toHaveLength(2);
    expect(obtenerProductoMaterial(p.producto_id)[0]).toMatchObject({
      prod_mat_id: rel.prod_mat_id,
      cantidad_por_unidad: 4,
    });
    actualizarProducto(p.producto_id, {
      nombre: 'Mesa grande',
      tipo: 'Mueble',
      materiales: [],
    });
    expect(obtenerProductoMaterial(p.producto_id)).toEqual([]);
  });
  it.each([0, -1, Infinity, NaN])(
    'rechaza cantidad de material inválida %s',
    (cantidad) => {
      expect(
        crearProducto({
          nombre: 'Mesa',
          tipo: 'Mueble',
          materiales: [{ material_id: 1, cantidad_por_unidad: cantidad }],
        }).errores,
      ).toBeTruthy();
      expect(obtenerProductos()).toEqual([]);
    },
  );
  it('rechaza campos faltantes, referencias externas inexistentes y materiales duplicados', () => {
    expect(crearProducto({}).errores).toMatchObject({
      nombre: expect.any(String),
      tipo: expect.any(String),
    });
    expect(
      crearProducto({
        nombre: 'Mesa',
        tipo: 'Mueble',
        materiales: [{ material_id: 999, cantidad_por_unidad: 2 }],
      }).errores,
    ).toBeTruthy();
    expect(
      crearProducto({
        nombre: 'Mesa',
        tipo: 'Mueble',
        materiales: [
          { material_id: 1, cantidad_por_unidad: 2 },
          { material_id: 1, cantidad_por_unidad: 3 },
        ],
      }).errores,
    ).toBeTruthy();
  });
  it('borra composición y ruta; protege los productos con órdenes', () => {
    const p = producto();
    const e = etapa();
    guardarRuta(p.producto_id, [{ etapa_id: e.etapa_id, secuencia: 1 }]);
    expect(eliminarProducto(p.producto_id).errores).toBeNull();
    expect(listar('rutas')).toEqual([]);
    expect(listar('producto_material')).toEqual([]);
    const { o, p: otro } = ordenConRuta();
    expect(eliminarProducto(otro.producto_id).errores.general).toContain(
      'órdenes',
    );
    expect(listar('ordenes')[0].orden_id).toBe(o.orden_id);
  });
});

describe('HU2 etapas y rutas', () => {
  it('crea y edita etapas y conserva la ruta ordenada por secuencia', () => {
    const p = producto();
    const a = etapa();
    const b = guardarEtapa({
      nombre: 'Pintura',
      tipo: 'Acabado',
      tiempo_estandar_min: 20,
    }).registro;
    expect(
      guardarRuta(p.producto_id, [
        { etapa_id: a.etapa_id, secuencia: 2 },
        { etapa_id: b.etapa_id, secuencia: 1 },
      ]).errores,
    ).toBeNull();
    expect(obtenerRuta(p.producto_id).map((r) => r.etapa_id)).toEqual([
      b.etapa_id,
      a.etapa_id,
    ]);
    guardarEtapa({ ...a, tiempo_estandar_min: 30 }, a.etapa_id);
    expect(obtenerEtapas()[0].tiempo_estandar_min).toBe(30);
    expect(eliminarEtapa(a.etapa_id).errores.general).toContain('en uso');
  });
  it('rechaza tiempo no entero, secuencias repetidas, etapas inexistentes y producto inexistente', () => {
    expect(
      guardarEtapa({ nombre: 'x', tipo: 'x', tiempo_estandar_min: 1.5 }).errores
        .tiempo_estandar_min,
    ).toBeTruthy();
    const p = producto();
    const a = etapa();
    expect(
      guardarRuta(p.producto_id, [
        { etapa_id: a.etapa_id, secuencia: 1 },
        { etapa_id: 999, secuencia: 1 },
      ]).errores.fila_1,
    ).toBeTruthy();
    expect(guardarRuta(999, []).errores.producto_id).toBeTruthy();
    expect(listar('rutas')).toEqual([]);
  });
});

describe('HU3 órdenes y ejecución real', () => {
  it('inicia y finaliza una ejecución y calcula el tiempo y el progreso sin contar dos veces una etapa', () => {
    const { o, e } = ordenConRuta();
    const m = maquina();
    const datos = {
      orden_id: o.orden_id,
      etapa_id: e.etapa_id,
      maquina_id: m.maquina_id,
      trabajador_id: 1,
      inicio_real: '2026-11-10T09:00',
    };
    const inicio = guardarEjecucion(datos);
    expect(inicio.errores).toBeNull();
    expect(inicio.registro.fin_real).toBeNull();
    expect(avanceOrden(o).porcentaje).toBe(0);
    const fin = guardarEjecucion(
      { ...inicio.registro, fin_real: '2026-11-10T09:45' },
      inicio.registro.ejecucion_id,
    );
    expect(fin.registro.tiempo_uso_min).toBe(45);
    expect(avanceOrden(o)).toMatchObject({
      porcentaje: 100,
      completadas: 1,
      minutos: 45,
    });
    guardarEjecucion({ ...datos, fin_real: '2026-11-10T09:10' });
    expect(avanceOrden(o).completadas).toBe(1);
    expect(guardarRuta(o.producto_id, []).errores.general).toContain(
      'ejecuciones',
    );
  });
  it('permite ejecución sin máquina ni trabajador cuando no corresponde asignarlos', () => {
    const { o, e } = ordenConRuta();
    expect(
      guardarEjecucion({
        orden_id: o.orden_id,
        etapa_id: e.etapa_id,
        inicio_real: '2026-11-10T09:00',
      }).errores,
    ).toBeNull();
  });
  it('rechaza fechas invertidas o imposibles y etapas fuera de la ruta', () => {
    const { p, o, e } = ordenConRuta();
    expect(
      guardarOrden({
        producto_id: p.producto_id,
        cantidad_plan: 1,
        estado: 'Planificada',
        fecha_inicio: '2026-11-12',
        fecha_fin: '2026-11-10',
      }).errores.fecha_fin,
    ).toBeTruthy();
    expect(
      guardarOrden({
        producto_id: p.producto_id,
        cantidad_plan: 1,
        estado: 'Planificada',
        fecha_inicio: '2026-02-30',
        fecha_fin: '2026-12-01',
      }).errores.fecha_inicio,
    ).toBeTruthy();
    expect(
      guardarEjecucion({
        orden_id: o.orden_id,
        etapa_id: e.etapa_id,
        inicio_real: '2026-11-10T10:00',
        fin_real: '2026-11-10T09:00',
      }).errores.fin_real,
    ).toBeTruthy();
    const externa = guardarEtapa({
      nombre: 'Otra',
      tipo: 'Otra',
      tiempo_estandar_min: 10,
    }).registro;
    expect(
      guardarEjecucion({
        orden_id: o.orden_id,
        etapa_id: externa.etapa_id,
        inicio_real: '2026-11-10T10:00',
      }).errores.etapa_id,
    ).toBeTruthy();
  });
  it('impide cambiar el producto de una orden con movimientos y elimina sus dependientes al borrar la orden', () => {
    const { o, e } = ordenConRuta();
    guardarEjecucion({
      orden_id: o.orden_id,
      etapa_id: e.etapa_id,
      inicio_real: '2026-11-10T09:00',
    });
    guardarRecepcion({
      orden_id: o.orden_id,
      material_id: 1,
      proveedor_id: 1,
      cantidad_recibida: 20,
      fecha_recepcion: '2026-11-10',
    });
    const otro = producto();
    expect(
      guardarOrden({ ...o, producto_id: otro.producto_id }, o.orden_id).errores
        .producto_id,
    ).toBeTruthy();
    eliminarOrden(o.orden_id);
    expect(obtenerEjecuciones(o.orden_id)).toEqual([]);
    expect(obtenerRecepciones(o.orden_id)).toEqual([]);
  });
});

describe('HU4 recepciones', () => {
  it('registra varias fechas y proveedores, filtra por orden y edita una recepción', () => {
    const { o } = ordenConRuta();
    const r = guardarRecepcion({
      orden_id: o.orden_id,
      material_id: 1,
      proveedor_id: 1,
      cantidad_recibida: 10,
      fecha_recepcion: '2026-11-10',
    });
    guardarRecepcion({
      orden_id: o.orden_id,
      material_id: 2,
      proveedor_id: 2,
      cantidad_recibida: 15,
      fecha_recepcion: '2026-11-11',
    });
    guardarRecepcion(
      { ...r.registro, cantidad_recibida: 12 },
      r.registro.recepcion_id,
    );
    expect(obtenerRecepciones(o.orden_id)).toHaveLength(2);
    expect(obtenerRecepciones(o.orden_id)[0].cantidad_recibida).toBe(12);
    expect(obtenerRecepciones(999)).toEqual([]);
  });
  it('rechaza campos vacíos y referencias inexistentes sin persistir', () => {
    expect(Object.keys(guardarRecepcion({}).errores)).toHaveLength(5);
    expect(
      guardarRecepcion({
        orden_id: 999,
        material_id: 999,
        proveedor_id: 999,
        cantidad_recibida: -1,
        fecha_recepcion: 'no-fecha',
      }).errores.orden_id,
    ).toBeTruthy();
    expect(listar('recepciones')).toEqual([]);
  });
});

describe('HU5 máquinas, mantenimiento y equipamiento', () => {
  it('registra y actualiza máquina, mantenimiento con repuestos y asignación al trabajador', () => {
    const m = maquina();
    guardarMaquina({ ...m, estado: 'En mantenimiento' }, m.maquina_id);
    const mant = guardarMantenimiento({
      maquina_id: m.maquina_id,
      tecnico_id: 2,
      tipo: 'Preventivo',
      costo_tecnico: 0,
      fecha: '2026-11-10',
      repuestos: [{ repuesto_id: 1, cantidad: 2 }],
    });
    expect(mant.errores).toBeNull();
    expect(
      obtenerRepuestosMantenimiento(mant.registro.mantenimiento_id)[0].cantidad,
    ).toBe(2);
    expect(listar('maquinas')[0].estado).toBe('En mantenimiento');
    const equipo = guardarEquipamiento({
      nombre: 'Taladro',
      tipo: 'Herramienta',
    }).registro;
    expect(
      guardarAsignacion({
        equipamiento_id: equipo.equipamiento_id,
        trabajador_id: 1,
        fecha_entrega: '2026-11-10',
      }).errores,
    ).toBeNull();
    expect(eliminarEquipamiento(equipo.equipamiento_id).errores).toBeTruthy();
  });
  it('rechaza códigos duplicados, costos negativos o vacíos, repuestos inválidos y asignaciones incompletas', () => {
    const m = maquina();
    expect(
      guardarMaquina({ ...m, maquina_id: undefined }).errores.codigo,
    ).toBeTruthy();
    const datos = {
      maquina_id: m.maquina_id,
      tecnico_id: 2,
      tipo: 'Preventivo',
      fecha: '2026-11-10',
    };
    for (const costo of [-1, '', Infinity])
      expect(
        guardarMantenimiento({ ...datos, costo_tecnico: costo }).errores
          .costo_tecnico,
      ).toBeTruthy();
    expect(
      guardarMantenimiento({
        ...datos,
        costo_tecnico: 10,
        repuestos: [{ repuesto_id: 999, cantidad: 1.5 }],
      }).errores.repuesto_0,
    ).toBeTruthy();
    expect(guardarAsignacion({}).errores).toMatchObject({
      trabajador_id: expect.any(String),
      equipamiento_id: expect.any(String),
      fecha_entrega: expect.any(String),
    });
  });
  it('elimina repuestos en cascada y protege el historial de máquinas en ejecuciones', () => {
    const m = maquina();
    const datos = {
      maquina_id: m.maquina_id,
      tecnico_id: 2,
      tipo: 'Preventivo',
      costo_tecnico: 5,
      fecha: '2026-11-10',
      repuestos: [{ repuesto_id: 1, cantidad: 2 }],
    };
    const mant = guardarMantenimiento(datos).registro;
    eliminarMantenimiento(mant.mantenimiento_id);
    expect(listar('mantenimiento_repuestos')).toEqual([]);
    guardarMantenimiento(datos);
    eliminarMaquina(m.maquina_id);
    expect(listar('mantenimientos')).toEqual([]);
    expect(listar('mantenimiento_repuestos')).toEqual([]);
    const otra = maquina();
    const { o, e } = ordenConRuta();
    guardarEjecucion({
      orden_id: o.orden_id,
      etapa_id: e.etapa_id,
      maquina_id: otra.maquina_id,
      inicio_real: '2026-11-10T09:00',
    });
    expect(eliminarMaquina(otra.maquina_id).errores.general).toContain(
      'ejecuciones',
    );
  });
});

describe('persistencia y referencias externas', () => {
  it('los catálogos son sustituibles, de solo lectura y no se guardan como bases de Manufactura', () => {
    const copia = obtenerReferencias('materiales');
    copia[0].nombre = 'Modificado';
    expect(obtenerReferencias('materiales')[0].nombre).not.toBe('Modificado');
    configurarReferencias((tipo) =>
      tipo === 'materiales'
        ? [{ material_id: 50, nombre: 'Desde Logística' }]
        : [],
    );
    expect(
      crearProducto({
        nombre: 'x',
        tipo: 'x',
        materiales: [{ material_id: 50, cantidad_por_unidad: 1 }],
      }).errores,
    ).toBeNull();
    expect(localStorage.getItem('manufactura:materiales')).toBeNull();
  });
  it('lee datos corruptos sin romper la pantalla y evita sobrescribirlos', () => {
    localStorage.setItem('manufactura:etapas', '{dañado');
    expect(listar('etapas')).toEqual([]);
    expect(
      guardarEtapa({ nombre: 'x', tipo: 'x', tiempo_estandar_min: 2 }).errores
        .general,
    ).toContain('dañados');
    expect(localStorage.getItem('manufactura:etapas')).toBe('{dañado');
  });
  it('recupera las listas anteriores si falla una escritura de relaciones', () => {
    producto();
    const original = localStorage.getItem('manufactura:productos');
    const setter = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      function (key, value) {
        if (key === 'manufactura:producto_material' && value === '[1]')
          throw new Error('cuota');
        return setter.call(this, key, value);
      },
    );
    expect(
      guardarCambios({ productos: [], producto_material: [1] }).errores.general,
    ).toBeTruthy();
    expect(localStorage.getItem('manufactura:productos')).toBe(original);
  });
});
