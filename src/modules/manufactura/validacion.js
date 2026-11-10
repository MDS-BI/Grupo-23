import { buscar } from './almacenamiento.js';
import { obtenerReferencias } from './referencias.js';

export const vacio = (v) => v == null || String(v).trim() === '';
export const texto = (e, d, campo, nombre) => {
  if (vacio(d[campo])) e[campo] = `${nombre} es obligatorio.`;
};
export function numero(
  e,
  d,
  campo,
  nombre,
  { entero = false, cero = false } = {},
) {
  if (
    vacio(d[campo]) ||
    !Number.isFinite(Number(d[campo])) ||
    (cero ? Number(d[campo]) < 0 : Number(d[campo]) <= 0) ||
    (entero && !Number.isInteger(Number(d[campo])))
  ) {
    e[campo] =
      `${nombre} debe ser ${entero ? 'un entero' : 'un número'} ${cero ? 'mayor o igual que 0' : 'mayor que 0'}.`;
  }
}
export function referencia(e, d, campo, tabla, nombre, opcional = false) {
  if (opcional && vacio(d[campo])) return;
  const campos = {
    materiales: 'material_id',
    repuestos: 'repuesto_id',
    trabajadores: 'trabajador_id',
    proveedores: 'proveedor_id',
  };
  const existe = campos[tabla]
    ? obtenerReferencias(tabla).some(
        (r) => Number(r[campos[tabla]]) === Number(d[campo]),
      )
    : buscar(tabla, d[campo]);
  if (vacio(d[campo]) || !existe) e[campo] = `Selecciona ${nombre} existente.`;
}
export function fechaValida(valor, hora = false) {
  if (vacio(valor)) return false;
  const patron = hora
    ? /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/
    : /^\d{4}-\d{2}-\d{2}$/;
  if (!patron.test(valor)) return false;
  const [ano, mes, dia] = valor.slice(0, 10).split('-').map(Number);
  const calendario = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    calendario.getUTCFullYear() === ano &&
    calendario.getUTCMonth() === mes - 1 &&
    calendario.getUTCDate() === dia &&
    Number.isFinite(new Date(valor).getTime())
  );
}
export function fecha(e, d, campo, nombre, hora = false, opcional = false) {
  if (opcional && vacio(d[campo])) return;
  if (!fechaValida(d[campo], hora))
    e[campo] = `Indica ${nombre} válida${hora ? ' y su hora' : ''}.`;
}
export function rango(e, d, inicio, fin) {
  if (
    !e[inicio] &&
    !e[fin] &&
    !vacio(d[fin]) &&
    new Date(d[fin]) < new Date(d[inicio])
  )
    e[fin] = 'La fecha de término no puede ser anterior al inicio.';
}
