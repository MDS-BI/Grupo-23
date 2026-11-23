import {
  listar,
  buscar,
  guardarRegistro,
  fallo,
} from './almacenamiento.js';
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

  const orden = buscar('ordenes', d.orden_id);
  const existente = buscar('recepciones', d.recepcion_id);
  if (!existente && orden && ['Finalizada', 'Cancelada'].includes(orden.estado)) {
    e.orden_id = `No se pueden registrar recepciones en una orden ${orden.estado.toLowerCase()}.`;
  }
  return e;
}
export function guardarRecepcion(d, id) {
  if (id != null) return fallo('Una recepción registrada no se puede editar.');
  return guardarRegistro(
    'recepciones',
    {
      ...d,
      orden_id: Number(d.orden_id),
      material_id: Number(d.material_id),
      proveedor_id: Number(d.proveedor_id),
      cantidad_recibida: Number(d.cantidad_recibida),
    },
    validarRecepcion,
  );
}
export const eliminarRecepcion = () => fallo('Una recepción registrada no se puede eliminar.');
