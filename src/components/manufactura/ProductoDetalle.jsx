import { obtenerProductoMaterial } from '../../modules/manufactura/productos.js';
import { nombreReferencia } from '../../modules/manufactura/referencias.js';
import { obtenerRuta } from '../../modules/manufactura/rutas.js';
import { buscar } from '../../modules/manufactura/almacenamiento.js';
export default function ProductoDetalle({ producto, onCerrar }) {
  if (!producto) return null;
  const materiales = obtenerProductoMaterial(producto.producto_id);
  const ruta = obtenerRuta(producto.producto_id);
  return (
    <article className="card" aria-label={`Detalle de ${producto.nombre}`}>
      <header>
        <h2>{producto.nombre}</h2>
        <button onClick={onCerrar}>Cerrar detalle</button>
      </header>
      <p>
        Producto #{producto.producto_id} · {producto.tipo}
      </p>
      <h3>Composición de materiales</h3>
      {materiales.length ? (
        <ul>
          {materiales.map((r) => (
            <li key={r.prod_mat_id}>
              {nombreReferencia('materiales', r.material_id)} —{' '}
              {r.cantidad_por_unidad} por unidad
            </li>
          ))}
        </ul>
      ) : (
        <p>Sin materiales asociados.</p>
      )}
      <h3>Ruta de fabricación</h3>
      {ruta.length ? (
        <ol className="route-summary">
          {ruta.map((r) => (
            <li key={r.ruta_id}>
              {r.secuencia}. {buscar('etapas', r.etapa_id)?.nombre} ·{' '}
              {buscar('etapas', r.etapa_id)?.tiempo_estandar_min} min
            </li>
          ))}
        </ol>
      ) : (
        <p>Configura la ruta en Etapas y rutas.</p>
      )}
    </article>
  );
}
