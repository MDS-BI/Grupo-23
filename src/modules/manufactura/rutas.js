import {
  listar,
  guardarCambios,
  siguienteId,
  fallo,
} from './almacenamiento.js';
import { referencia, numero } from './validacion.js';
export const obtenerRuta = (productoId) =>
  listar('rutas')
    .filter((r) => Number(r.producto_id) === Number(productoId))
    .sort((a, b) => a.secuencia - b.secuencia);
export function guardarRuta(productoId, filas) {
  const errores = {};
  referencia(
    errores,
    { producto_id: productoId },
    'producto_id',
    'productos',
    'un producto',
  );
  const secuencias = new Set();
  const etapas = new Set();
  for (const [indice, fila] of filas.entries()) {
    const e = {};
    referencia(e, fila, 'etapa_id', 'etapas', 'una etapa');
    numero(e, fila, 'secuencia', 'La secuencia', { entero: true });
    if (secuencias.has(Number(fila.secuencia)))
      e.secuencia = 'Las secuencias deben ser únicas por producto.';
    if (etapas.has(Number(fila.etapa_id)))
      e.etapa_id = 'La etapa ya está incluida en esta ruta.';
    secuencias.add(Number(fila.secuencia));
    etapas.add(Number(fila.etapa_id));
    if (Object.keys(e).length)
      errores[`fila_${indice}`] = Object.values(e).join(' ');
  }
  if (Object.keys(errores).length) return { errores };
  const ordenes = listar('ordenes').filter(
    (o) => Number(o.producto_id) === Number(productoId),
  );
  if (
    listar('ejecuciones').some(
      (ej) =>
        ordenes.some((o) => Number(o.orden_id) === Number(ej.orden_id)) &&
        !etapas.has(Number(ej.etapa_id)),
    )
  )
    return fallo(
      'No se puede quitar una etapa que tiene ejecuciones registradas.',
    );
  const actuales = obtenerRuta(productoId);
  let siguiente = siguienteId('rutas');
  const nuevas = filas.map((f) => ({
    ruta_id:
      actuales.find((r) => Number(r.etapa_id) === Number(f.etapa_id))
        ?.ruta_id ?? siguiente++,
    producto_id: Number(productoId),
    etapa_id: Number(f.etapa_id),
    secuencia: Number(f.secuencia),
  }));
  return guardarCambios({
    rutas: [
      ...listar('rutas').filter(
        (r) => Number(r.producto_id) !== Number(productoId),
      ),
      ...nuevas,
    ],
  });
}
