import { listar, guardarRegistro, eliminarRegistro } from './almacenamiento.js';
import { referencia, numero, fecha } from './validacion.js';
export const obtenerRecepciones = (ordenId) =>
  listar('recepciones').filter(
    (r) => !ordenId || Number(r.orden_id) === Number(ordenId),
  );
export function validarRecepcion(d) {
  const e = {};
  referencia(e, d, 'orden_id', 'ordenes', 'una orden');
  referencia(e, d, 'material_id', 'materiales', 'un material');
  referencia(e, d, 'proveedor_id', 'proveedores', 'un proveedor');
  numero(e, d, 'cantidad_recibida', 'La cantidad recibida');
  fecha(e, d, 'fecha_recepcion', 'una fecha de recepción');
  return e;
}
export const guardarRecepcion = (d, id) =>
  guardarRegistro(
    'recepciones',
    {
      ...d,
      orden_id: Number(d.orden_id),
      material_id: Number(d.material_id),
      proveedor_id: Number(d.proveedor_id),
      cantidad_recibida: Number(d.cantidad_recibida),
    },
    validarRecepcion,
    id,
  );
export const eliminarRecepcion = (id) => eliminarRegistro('recepciones', id);
