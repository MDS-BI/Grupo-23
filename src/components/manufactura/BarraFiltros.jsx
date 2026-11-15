export default function BarraFiltros({
  placeholderBusqueda = 'Buscar...',
  valorBusqueda = '',
  onChangeBusqueda,
  mostrarFiltrosOrden = false,
  filtros = {},
  onChangeFiltro,
  onLimpiar,
  hayFiltrosActivos = false,
  listaProductos = [],
  estadosDisponibles = [],
}) {
  return (
    <div className="barra-filtros">
      <div className="filtro-grupo filtro-busqueda">
        <input
          type="text"
          placeholder={placeholderBusqueda}
          value={valorBusqueda}
          onChange={(e) => onChangeBusqueda(e.target.value)}
        />
      </div>

      {mostrarFiltrosOrden && (
        <>
          <div className="filtro-grupo">
            <select value={filtros.estado || ''} onChange={(e) => onChangeFiltro('estado', e.target.value)}>
              <option value="">Todos los estados</option>
              {estadosDisponibles.map((est) => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <select value={filtros.productoId || ''} onChange={(e) => onChangeFiltro('productoId', e.target.value)}>
              <option value="">Todos los productos</option>
              {listaProductos.map((prod) => (
                <option key={prod.producto_id} value={prod.producto_id}>{prod.nombre}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo filtro-fechas">
            <label>
              Desde:
              <input type="date" value={filtros.fechaDesde || ''} onChange={(e) => onChangeFiltro('fechaDesde', e.target.value)} />
            </label>
            <label>
              Hasta:
              <input type="date" value={filtros.fechaHasta || ''} onChange={(e) => onChangeFiltro('fechaHasta', e.target.value)} />
            </label>
          </div>
        </>
      )}

      {hayFiltrosActivos && (
        <button type="button" className="btn-limpiar-filtros" onClick={onLimpiar}>
          Limpiar filtros
        </button>
      )}
    </div>
  );
}