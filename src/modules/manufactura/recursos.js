import {
  listar,
  buscar,
  guardarRegistro,
  guardarCambios,
  siguienteId,
  eliminarRegistro,
  fallo,
} from './almacenamiento.js';
import { referencia, numero, texto, fecha, vacio } from './validacion.js';
export const ESTADOS_MAQUINA = [
  'Disponible',
  'En uso',
  'En mantenimiento',
  'Fuera de servicio',
];
export const obtenerMaquinas = () => listar('maquinas');
export const obtenerMantenimientos = (id) =>
  listar('mantenimientos').filter(
    (r) => !id || Number(r.maquina_id) === Number(id),
  );
export const obtenerRepuestosMantenimiento = (id) =>
  listar('mantenimiento_repuestos').filter(
    (r) => Number(r.mantenimiento_id) === Number(id),
  );
export const obtenerEquipamiento = () => listar('equipamiento');
export const obtenerAsignaciones = () => listar('asignaciones');
export function validarMaquina(d) {
  const e = {};
  texto(e, d, 'codigo', 'El código');
  texto(e, d, 'nombre', 'El nombre');
  texto(e, d, 'estado', 'El estado');
  numero(e, d, 'capacidad_hora', 'La capacidad por hora');
  if (
    listar('maquinas').some(
      (m) =>
        Number(m.maquina_id) !== Number(d.maquina_id) &&
        String(m.codigo).toLocaleLowerCase() ===
          String(d.codigo).trim().toLocaleLowerCase(),
    )
  )
    e.codigo = 'Ya existe una máquina con ese código.';
  return e;
}
export const guardarMaquina = (d, id) =>
  guardarRegistro(
    'maquinas',
    {
      ...d,
      codigo: String(d.codigo || '').trim(),
      nombre: String(d.nombre || '').trim(),
      capacidad_hora: Number(d.capacidad_hora),
    },
    validarMaquina,
    id,
  );
export function validarMantenimiento(d) {
  const e = {};
  referencia(e, d, 'maquina_id', 'maquinas', 'una máquina');
  referencia(e, d, 'tecnico_id', 'trabajadores', 'un técnico');
  texto(e, d, 'tipo', 'El tipo');
  numero(e, d, 'costo_tecnico', 'El costo del técnico', { cero: true });
  fecha(e, d, 'fecha', 'una fecha de mantenimiento');
  return e;
}
export function guardarMantenimiento(d, id) {
  const datos = {
    ...d,
    maquina_id: Number(d.maquina_id),
    tecnico_id: Number(d.tecnico_id),
    costo_tecnico: vacio(d.costo_tecnico) ? '' : Number(d.costo_tecnico),
  };
  const errores = validarMantenimiento(datos);
  const repuestos = d.repuestos || [];
  const incluidos = new Set();
  repuestos.forEach((r, i) => {
    const e = {};
    referencia(e, r, 'repuesto_id', 'repuestos', 'un repuesto');
    numero(e, r, 'cantidad', 'La cantidad', { entero: true });
    if (incluidos.has(Number(r.repuesto_id)))
      e.repuesto_id = 'El repuesto ya está incluido.';
    incluidos.add(Number(r.repuesto_id));
    if (Object.keys(e).length)
      errores[`repuesto_${i}`] = Object.values(e).join(' ');
  });
  if (Object.keys(errores).length) return { errores };
  const previo = id == null ? null : buscar('mantenimientos', id);
  if (id != null && !previo) return fallo('El mantenimiento ya no existe.');
  delete datos.repuestos;
  const registro = {
    ...previo,
    ...datos,
    mantenimiento_id: previo?.mantenimiento_id ?? siguienteId('mantenimientos'),
  };
  let next = siguienteId('mantenimiento_repuestos');
  const relaciones = repuestos.map((r) => ({
    mant_repuesto_id: next++,
    mantenimiento_id: registro.mantenimiento_id,
    repuesto_id: Number(r.repuesto_id),
    cantidad: Number(r.cantidad),
  }));
  const existentes = listar('mantenimientos');
  const resultado = guardarCambios({
    mantenimientos: previo
      ? existentes.map((m) =>
          Number(m.mantenimiento_id) === Number(id) ? registro : m,
        )
      : [...existentes, registro],
    mantenimiento_repuestos: [
      ...listar('mantenimiento_repuestos').filter(
        (r) => Number(r.mantenimiento_id) !== Number(registro.mantenimiento_id),
      ),
      ...relaciones,
    ],
  });
  return { ...resultado, registro };
}
export function eliminarMantenimiento(id) {
  return guardarCambios({
    mantenimientos: listar('mantenimientos').filter(
      (m) => Number(m.mantenimiento_id) !== Number(id),
    ),
    mantenimiento_repuestos: listar('mantenimiento_repuestos').filter(
      (r) => Number(r.mantenimiento_id) !== Number(id),
    ),
  });
}
export function eliminarMaquina(id) {
  if (listar('ejecuciones').some((e) => Number(e.maquina_id) === Number(id)))
    return fallo(
      'La máquina tiene ejecuciones registradas. Conserva su historial cambiando su estado.',
    );
  const ids = new Set(
    obtenerMantenimientos(id).map((r) => Number(r.mantenimiento_id)),
  );
  return guardarCambios({
    maquinas: listar('maquinas').filter(
      (m) => Number(m.maquina_id) !== Number(id),
    ),
    mantenimientos: listar('mantenimientos').filter(
      (m) => Number(m.maquina_id) !== Number(id),
    ),
    mantenimiento_repuestos: listar('mantenimiento_repuestos').filter(
      (r) => !ids.has(Number(r.mantenimiento_id)),
    ),
  });
}
export function validarEquipamiento(d) {
  const e = {};
  texto(e, d, 'nombre', 'El nombre');
  texto(e, d, 'tipo', 'El tipo');
  return e;
}
export const guardarEquipamiento = (d, id) =>
  guardarRegistro(
    'equipamiento',
    {
      ...d,
      nombre: String(d.nombre || '').trim(),
      tipo: String(d.tipo || '').trim(),
    },
    validarEquipamiento,
    id,
  );
export function eliminarEquipamiento(id) {
  if (
    listar('asignaciones').some((a) => Number(a.equipamiento_id) === Number(id))
  )
    return fallo(
      'El equipamiento está asignado a un trabajador. Quita su asignación antes de eliminarlo.',
    );
  return eliminarRegistro('equipamiento', id);
}
export function validarAsignacion(d) {
  const e = {};
  referencia(e, d, 'trabajador_id', 'trabajadores', 'un trabajador');
  referencia(e, d, 'equipamiento_id', 'equipamiento', 'un equipamiento');
  fecha(e, d, 'fecha_entrega', 'una fecha de entrega');
  return e;
}
export const guardarAsignacion = (d, id) =>
  guardarRegistro(
    'asignaciones',
    {
      ...d,
      trabajador_id: Number(d.trabajador_id),
      equipamiento_id: Number(d.equipamiento_id),
    },
    validarAsignacion,
    id,
  );
export const eliminarAsignacion = (id) => eliminarRegistro('asignaciones', id);
