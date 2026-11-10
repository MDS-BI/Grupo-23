import { useEffect, useReducer } from 'react';
export default function useManufactura() {
  const [version, recargar] = useReducer((n) => n + 1, 0);
  useEffect(() => {
    window.addEventListener('manufactura:cambio', recargar);
    window.addEventListener('storage', recargar);
    return () => {
      window.removeEventListener('manufactura:cambio', recargar);
      window.removeEventListener('storage', recargar);
    };
  }, []);
  return version;
}
