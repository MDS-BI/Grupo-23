import { useMemo } from 'react';
import useManufactura from './useManufactura.js';
import {
  obtenerProductos,
  crearProducto,
  eliminarProducto,
  actualizarProducto,
} from '../modules/manufactura/productos.js';

export function useProductos() {
  const version = useManufactura();
  const productos = useMemo(obtenerProductos, [version]);
  return {
    productos,
    crear: crearProducto,
    actualizar: actualizarProducto,
    eliminar: eliminarProducto,
  };
}
