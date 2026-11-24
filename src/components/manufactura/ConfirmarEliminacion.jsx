import { useId } from 'react';
import { analizarEliminacion } from '../../modules/manufactura/eliminacion.js';
import useManufactura from '../../hooks/useManufactura.js';
import useEnfoqueAccion from '../../hooks/useEnfoqueAccion.js';

export default function ConfirmarEliminacion({ tabla, registroId, nombre, singular, descripcion, retirarAsignaciones = false, cancelar, confirmar }) {
  useManufactura();
  const id = useId();
  const destino = useEnfoqueAccion(`${tabla}-${registroId}`);
  const estado = analizarEliminacion(tabla, registroId, { retirarAsignaciones });
  return (
    <div ref={destino} role="alertdialog" aria-labelledby={id} aria-describedby={`${id}-detalle`}
      className={`notice delete-confirmation${estado.permitida ? '' : ' delete-blocked'}`} tabIndex={-1}>
      <h3 id={id}>{estado.permitida ? `¿Eliminar ${singular} «${nombre}»?` : `No se puede eliminar ${singular} «${nombre}»`}</h3>
      <p id={`${id}-detalle`}>{estado.permitida ? descripcion || estado.descripcion : estado.motivo}</p>
      {!!estado.detalles.length && <ul className="delete-dependencies">{estado.detalles.map((detalle, i) => <li key={i}>{detalle}</li>)}</ul>}
      <div className="row-actions">
        <button type="button" onClick={cancelar}>{estado.permitida ? 'Cancelar eliminación' : 'Cerrar aviso'}</button>
        {estado.permitida && <button type="button" className="danger" onClick={confirmar}>Confirmar eliminación</button>}
      </div>
    </div>
  );
}
