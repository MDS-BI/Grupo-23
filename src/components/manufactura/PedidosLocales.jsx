import { buscar, listar, siguienteId } from '../../modules/manufactura/almacenamiento.js';
import { MINIMO_PRODUCCION } from '../../modules/manufactura/ordenes.js';
import {
  eliminarPedido, guardarPedido, obtenerPedidos, obtenerPedidosPendientes,
} from '../../modules/manufactura/pedidos-locales.js';
import useEnfoqueAccion from '../../hooks/useEnfoqueAccion.js';
import { GestionRegistros, opciones } from './Controles.jsx';

export default function PedidosLocales({
  productos, productoId, seleccionarProducto, planificar,
}) {
  const destino = useEnfoqueAccion(productoId);
  const producto = productos.find((p) => Number(p.producto_id) === Number(productoId));
  const pendientes = obtenerPedidosPendientes(productoId);
  const total = pendientes.reduce((cantidad, pedido) => cantidad + pedido.cantidad, 0);

  return (
    <article className="card pedidos-locales">
      <h2>Pedidos por peluche</h2>
      <p className="muted">
        Selecciona un modelo para ver qué locales lo pidieron. Cada orden nueva
        requiere al menos {MINIMO_PRODUCCION} peluches del mismo producto.
      </p>
      <div className="pedidos-productos">
        {productos.map((p) => (
          <button
            type="button"
            key={p.producto_id}
            aria-expanded={Number(p.producto_id) === Number(productoId)}
            aria-controls={Number(p.producto_id) === Number(productoId) ? 'pedidos-del-peluche' : undefined}
            onClick={() => seleccionarProducto(p.producto_id)}
          >
            {p.nombre}
          </button>
        ))}
      </div>
      {producto && (
        <div ref={destino} id="pedidos-del-peluche" className="pedidos-detalle">
          <header>
            <h3>{producto.nombre}</h3>
            <button type="button" onClick={() => seleccionarProducto(null)}>Cerrar pedidos</button>
          </header>
          <p>
            <strong>{total}</strong> unidades pendientes de planificar.
            {total < MINIMO_PRODUCCION && ' Se requieren 64 para planificar este grupo de pedidos.'}
          </p>
          <button
            type="button"
            className="primary"
            disabled={total < MINIMO_PRODUCCION}
            onClick={() => planificar({
              producto_id: producto.producto_id,
              cantidad_plan: total,
              estado: 'Planificada',
              pedido_ids: pendientes.map((pedido) => pedido.pedido_id),
            })}
          >
            Planificar estos pedidos
          </button>
          <GestionRegistros
            key={producto.producto_id}
            titulo="Pedidos de locales"
            singular="Pedido"
            nuevoTexto="Registrar pedido de local"
            idCampo="pedido_id"
            registros={obtenerPedidos(producto.producto_id)}
            inicialNuevo={{ codigo: `PED-${String(siguienteId('pedidos')).padStart(4, '0')}` }}
            guardar={(datos, id) => guardarPedido({ ...datos, producto_id: producto.producto_id }, id)}
            eliminar={eliminarPedido}
            campos={[
              { name: 'codigo', label: 'Código del pedido' },
              { name: 'local_id', label: 'Local solicitante', type: 'select',
                options: opciones(listar('locales'), 'local_id') },
              { name: 'cantidad', label: 'Peluches pedidos', type: 'number', min: 1, step: '1' },
            ]}
            columnas={[
              { key: 'codigo', label: 'Código de pedido' },
              { key: 'local_id', label: 'Código de local', render: (r) => buscar('locales', r.local_id)?.codigo },
              { key: 'local', label: 'Local', render: (r) => buscar('locales', r.local_id)?.nombre },
              { key: 'cantidad', label: 'Cantidad' },
              { key: 'orden_id', label: 'Producción',
                render: (r) => r.orden_id
                  ? `OP-${String(r.orden_id).padStart(4, '0')}` : 'Pendiente' },
            ]}
          />
        </div>
      )}
    </article>
  );
}
