const normalizarTexto = (valor) =>
  String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export function filtrarProductos(productos = [], busquedaNombre = '') {
  const termino = normalizarTexto(busquedaNombre);
  if (!termino) return productos;
  return productos.filter((prod) => normalizarTexto(prod.nombre).includes(termino));
}

export function filtrarMaquinas(maquinas = [], busquedaCodigo = '') {
  const codigo = normalizarTexto(busquedaCodigo);
  if (!codigo) return maquinas;
  return maquinas.filter((maq) => normalizarTexto(maq.codigo).includes(codigo));
}

export function filtrarOrdenes(ordenes = [], filtros = {}) {
  const { busquedaNumero = '', estado = '', productoId = '', fechaDesde = '', fechaHasta = '' } = filtros;
  const numeroNormalizado = normalizarTexto(busquedaNumero);

  return ordenes.filter((orden) => {
    if (numeroNormalizado) {
      const idStr = normalizarTexto(orden.orden_id);
      const codigoFormateado = normalizarTexto(`OP-${String(orden.orden_id).padStart(4, '0')}`);
      if (!idStr.includes(numeroNormalizado) && !codigoFormateado.includes(numeroNormalizado)) {
        return false;
      }
    }

    if (estado && orden.estado !== estado) return false;
    if (productoId && Number(orden.producto_id) !== Number(productoId)) return false;

    const inicio = orden.fecha_inicio ? String(orden.fecha_inicio).slice(0, 10) : '';
    const fin = orden.fecha_fin ? String(orden.fecha_fin).slice(0, 10) : inicio;

    if (fechaDesde && (!fin || fin < fechaDesde)) return false;
    if (fechaHasta && (!inicio || inicio > fechaHasta)) return false;
    return true;
  });
}