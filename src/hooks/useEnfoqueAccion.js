import { useEffect, useRef } from 'react';

export default function useEnfoqueAccion(dependencia, enfocarControl = true) {
  const destino = useRef(null);
  useEffect(() => {
    const elemento = destino.current;
    if (!elemento) return;
    const movimientoReducido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    elemento.scrollIntoView?.({
      block: 'start',
      behavior: movimientoReducido ? 'auto' : 'smooth',
    });
    const control = enfocarControl
      ? elemento.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])')
      : null;
    (control || elemento).focus({ preventScroll: true });
  }, [dependencia, enfocarControl]);
  return destino;
}
