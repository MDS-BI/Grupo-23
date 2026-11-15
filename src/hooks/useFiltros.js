import { useState, useMemo } from 'react';

export function useFiltros(items, funcionFiltrado, estadoInicial = {}) {
  const [filtros, setFiltros] = useState(estadoInicial);

  const actualizarFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const limpiarFiltros = () => setFiltros(estadoInicial);

  const itemsFiltrados = useMemo(
    () => funcionFiltrado(items, filtros),
    [items, filtros, funcionFiltrado]
  );

  const hayFiltrosActivos = Object.values(filtros).some((v) => v !== '' && v !== null && v !== undefined);

  return { filtros, actualizarFiltro, limpiarFiltros, itemsFiltrados, hayFiltrosActivos };
}