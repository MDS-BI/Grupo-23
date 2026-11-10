import { useCallback, useEffect, useState } from 'react';
import {
  obtenerProductos,
  crearProducto,
  eliminarProducto,
  actualizarProducto,
} from '../modules/manufactura/productos.js';

export function useProductos() {
  const [productos, setProductos] = useState([]);

  const recargar = useCallback(() => {
    setProductos(obtenerProductos());
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const crear = useCallback(
    (datos) => {
      const resultado = crearProducto(datos);
      if (!resultado.errores) {
        recargar();
      }
      return resultado;
    },
    [recargar],
  );

  const eliminar = useCallback(
    (producto_id) => {
      const resultado = eliminarProducto(producto_id);
      if (!resultado.errores) recargar();
      return resultado;
    },
    [recargar],
  );

  const actualizar = useCallback(
    (id, datos) => {
      const resultado = actualizarProducto(id, datos);
      if (!resultado.errores) recargar();
      return resultado;
    },
    [recargar],
  );

  return { productos, recargar, crear, actualizar, eliminar };
}
