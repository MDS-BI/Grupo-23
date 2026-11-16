import {
  guardarCambios,
  listar,
  siguienteId,
  tablas,
} from './almacenamiento.js';
import { obtenerReferencias } from './referencias.js';
import { estaciones, insumos, lotes, proveedores } from './peluches-ejemplo.js';

export const demoPeluchesCargada = () => listar('demo_peluches').length > 0;
export const hayRegistrosManufactura = () =>
  [...Object.keys(tablas), 'materiales_locales'].some((tabla) => listar(tabla).length > 0);

function idsDeReferencia(registros, campo) {
  let id = registros.reduce((menor, registro) => {
    const actual = Number(registro[campo]);
    return Number.isSafeInteger(actual) ? Math.min(menor, actual) : menor;
  }, 0);
  return () => --id;
}

function fechaCalendario(base, dias) {
  const fecha = new Date(base.getFullYear(), base.getMonth(), base.getDate() + dias);
  return [fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate()]
    .map((parte) => String(parte).padStart(2, '0'))
    .join('-');
}

function horaLocal(fecha, minutos) {
  const hora = [Math.floor(minutos / 60), minutos % 60]
    .map((parte) => String(parte).padStart(2, '0'))
    .join(':');
  return `${fecha}T${hora}`;
}

export function cargarDemoPeluches({ reemplazar = false, hoy = new Date() } = {}) {
  if (demoPeluchesCargada()) return { errores: null, cargada: false };

  const cambios = Object.fromEntries(
    Object.keys(tablas).map((tabla) => [tabla, reemplazar ? [] : listar(tabla)]),
  );
  const ids = Object.fromEntries(
    Object.entries(cambios).map(([tabla, registros]) => [
      tabla,
      siguienteId(tabla, registros),
    ]),
  );
  function agregar(tabla, datos) {
    const id = ids[tabla]++;
    cambios[tabla].push({ [tablas[tabla]]: id, ...datos });
    return id;
  }
  const fecha = (dias) => fechaCalendario(hoy, dias);

  const proveedorId = idsDeReferencia(obtenerReferencias('proveedores'), 'proveedor_id');
  const proveedoresPorClave = Object.fromEntries(
    Object.entries(proveedores).map(([clave, razon_social]) => [
      clave,
      { proveedor_id: proveedorId(), razon_social },
    ]),
  );

  cambios.materiales_locales = reemplazar ? [] : listar('materiales_locales');
  const existentes = obtenerReferencias('materiales').filter(
    ({ material_id }) => !reemplazar || Number(material_id) > 0,
  );
  const materialId = idsDeReferencia(cambios.materiales_locales, 'material_id');
  const comparar = new Intl.Collator('es', { sensitivity: 'base' });
  const materialesPorClave = {};
  for (const [clave, [nombre, unidad]] of Object.entries(insumos)) {
    const nombresIguales = existentes.filter(
      (material) => comparar.compare(material.nombre, nombre) === 0,
    );
    const existente = nombresIguales.find(
      (material) => comparar.compare(material.unidad, unidad) === 0,
    );
    if (existente) {
      materialesPorClave[clave] = existente.material_id;
      continue;
    }
    const material_id = materialId();
    cambios.materiales_locales.push({
      material_id,
      nombre: nombresIguales.length ? `${nombre} (${unidad})` : nombre,
      unidad,
    });
    materialesPorClave[clave] = material_id;
  }

  const trabajadorId = idsDeReferencia(obtenerReferencias('trabajadores'), 'trabajador_id');
  const nombres = new Set(Object.values(estaciones).map(({ trabajador }) => trabajador));
  const tecnico = 'Diego Mella · Mantenimiento';
  nombres.add(tecnico);
  const trabajadores = [...nombres].map((nombre) => ({ trabajador_id: trabajadorId(), nombre }));
  const trabajadoresPorNombre = new Map(
    trabajadores.map(({ nombre, trabajador_id }) => [nombre, trabajador_id]),
  );
  const repuestoId = idsDeReferencia(obtenerReferencias('repuestos'), 'repuesto_id');
  const repuestos = [];
  const codigos = new Set(cambios.maquinas.map(({ codigo }) => String(codigo).trim().toUpperCase()));
  const proceso = [];
  for (const estacion of Object.values(estaciones)) {
    const etapa_id = agregar('etapas', {
      nombre: estacion.etapa,
      tipo: estacion.tipo,
      tiempo_estandar_min: estacion.minutos,
    });
    const trabajador_id = trabajadoresPorNombre.get(estacion.trabajador);
    let maquina_id = null;
    if (estacion.maquina) {
      const [codigoBase, nombre, capacidad_hora] = estacion.maquina;
      let codigo = codigoBase;
      for (let sufijo = 2; codigos.has(codigo); sufijo++) {
        codigo = `${codigoBase}-${sufijo}`;
      }
      codigos.add(codigo);
      maquina_id = agregar('maquinas', { codigo, nombre, capacidad_hora, estado: 'Disponible' });

      const [tipo, nombreRepuesto, costo_tecnico] = estacion.mantenimiento;
      const repuesto_id = repuestoId();
      repuestos.push({ repuesto_id, nombre: nombreRepuesto });
      const mantenimiento_id = agregar('mantenimientos', {
        maquina_id, tecnico_id: trabajadoresPorNombre.get(tecnico),
        tipo, costo_tecnico, fecha: fecha(-15),
      });
      agregar('mantenimiento_repuestos', { mantenimiento_id, repuesto_id, cantidad: 1 });

      const [nombreEquipo, tipoEquipo] = estacion.equipo;
      const equipamiento_id = agregar('equipamiento', { nombre: nombreEquipo, tipo: tipoEquipo });
      agregar('asignaciones', { equipamiento_id, trabajador_id, fecha_entrega: fecha(-16) });
    }
    proceso.push({ etapa_id, trabajador_id, maquina_id });
  }

  for (const lote of lotes) {
    const [inicio, fin] = lote.periodo;
    const producto_id = agregar('productos', { nombre: lote.nombre, tipo: lote.tipo });
    const orden_id = agregar('ordenes', {
      producto_id,
      cantidad_plan: lote.cantidad,
      estado: lote.estado,
      fecha_inicio: fecha(inicio),
      fecha_fin: fecha(fin),
    });
    for (const [clave, cantidad_por_unidad] of Object.entries(lote.materiales)) {
      const material_id = materialesPorClave[clave];
      agregar('producto_material', { producto_id, material_id, cantidad_por_unidad });
      if (lote.pendientes?.includes(clave)) continue;

      const proveedorClave = insumos[clave][2];
      agregar('recepciones', {
        orden_id,
        material_id,
        proveedor_id: proveedoresPorClave[proveedorClave].proveedor_id,
        cantidad_recibida: Math.round(cantidad_por_unidad * lote.cantidad * 1000) / 1000,
        fecha_recepcion: fecha(Math.min(inicio - 1, -1)),
      });
    }
    let hora = 8 * 60;
    proceso.forEach((paso, i) => {
      agregar('rutas', { producto_id, etapa_id: paso.etapa_id, secuencia: i + 1 });
      const tiempo_uso_min = lote.tiempos[i];
      if (!tiempo_uso_min) return;

      agregar('ejecuciones', {
        ...paso,
        orden_id,
        inicio_real: horaLocal(fecha(inicio), hora),
        fin_real: horaLocal(fecha(inicio), hora + tiempo_uso_min),
        tiempo_uso_min,
      });
      hora += tiempo_uso_min + 15;
    });
  }

  cambios.demo_peluches = [{ proveedores: Object.values(proveedoresPorClave), trabajadores, repuestos }];
  const resultado = guardarCambios(cambios);
  return { ...resultado, cargada: !resultado.errores };
}
