export default function AvisoOperacion({ children, onCerrar, className = 'notice', ...props }) {
  return <p role="status" {...props} className={`${className} aviso-operacion`}>
    <span>{children}</span>
    <button type="button" className="cerrar-aviso" aria-label="Cerrar notificación" title="Cerrar notificación" onClick={onCerrar}><span aria-hidden="true">×</span></button>
  </p>;
}
