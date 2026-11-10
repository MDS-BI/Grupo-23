import {
  listar,
  guardarRegistro,
  eliminarRegistro,
  fallo,
} from './almacenamiento.js';
import { texto, numero } from './validacion.js';
export const obtenerEtapas = () => listar('etapas');
export function validarEtapa(d) {
  const e = {};
  texto(e, d, 'nombre', 'El nombre');
  texto(e, d, 'tipo', 'El tipo');
  numero(e, d, 'tiempo_estandar_min', 'El tiempo estándar', { entero: true });
  return e;
}
export function guardarEtapa(d, id) {
  return guardarRegistro(
    'etapas',
    {
      ...d,
      nombre: String(d.nombre || '').trim(),
      tipo: String(d.tipo || '').trim(),
      tiempo_estandar_min: Number(d.tiempo_estandar_min),
    },
    validarEtapa,
    id,
  );
}
export function eliminarEtapa(id) {
  if (
    listar('rutas').some((r) => Number(r.etapa_id) === Number(id)) ||
    listar('ejecuciones').some((r) => Number(r.etapa_id) === Number(id))
  )
    return fallo(
      'La etapa está en uso en una ruta o ejecución y no se puede eliminar.',
    );
  return eliminarRegistro('etapas', id);
}
