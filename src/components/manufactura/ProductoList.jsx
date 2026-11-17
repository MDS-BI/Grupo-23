export default function ProductoList({
  productos = [],
  onEliminar,
  onEditar,
  onDetalle,
}) {
  if (productos.length === 0) {
    return (
      <div className="empty">
        <p>No hay productos registrados.</p>
        <small>Crea tu primer producto para comenzar.</small>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table aria-label="Catálogo de productos">
        <thead>
          <tr>
            <th scope="col">Código</th>
            <th scope="col">Nombre</th>
            <th scope="col">Tipo</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.producto_id}>
              <td className="catalogo-codigo">{producto.producto_id}</td>
              <td><strong>{producto.nombre}</strong></td>
              <td><span className="badge">{producto.tipo}</span></td>
              <td className="row-actions">
                {onDetalle && (
                  <button type="button" onClick={() => onDetalle(producto)}>
                    Ver detalle
                  </button>
                )}
                {onEditar && (
                  <button type="button" onClick={() => onEditar(producto)}>
                    Editar
                  </button>
                )}
                {onEliminar && (
                  <button
                    type="button"
                    onClick={() => onEliminar(producto)}
                    className="danger"
                  >
                    Eliminar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
