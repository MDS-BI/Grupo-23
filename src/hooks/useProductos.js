import { useCallback, useEffect, useState } from 'react';
import {
  obtenerProductos,
  crearProducto,
  eliminarProducto,
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
      eliminarProducto(producto_id);
      recargar();
    },
    [recargar],
  );

  return { productos, recargar, crear, eliminar };
}
