export default function ProductoList({ productos = [], onEliminar }) {
  if (productos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm font-medium text-slate-700">No hay productos registrados.</p>
        <p className="mt-1 text-sm text-slate-500">
          Crea tu primer producto para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Código
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Nombre
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Tipo
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {productos.map((producto) => (
            <tr key={producto.producto_id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-slate-600">
                {producto.producto_id}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-slate-900">
                {producto.nombre}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{producto.tipo}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                {onEliminar && (
                  <button
                    type="button"
                    onClick={() => onEliminar(producto)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
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
