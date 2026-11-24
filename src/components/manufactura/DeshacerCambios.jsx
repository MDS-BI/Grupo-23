import { useState } from 'react';
import useManufactura from '../../hooks/useManufactura.js';
import {
  estadoDeshacer,
  deshacerUltimoCambio,
} from '../../modules/manufactura/almacenamiento.js';

export default function DeshacerCambios({ tabla, registroId, texto = 'Deshacer' }) {
  useManufactura();
  const [mensaje, setMensaje] = useState('');
  const { cambio, motivo } = estadoDeshacer(tabla, registroId);
  const disponible = !!cambio;
  return (
    <span className="deshacer-control">
      <button
        type="button"
        disabled={!disponible}
        title={disponible ? 'Revierte el último cambio guardado. También está disponible después de recargar.' : motivo}
        onClick={() => {
          const resultado = deshacerUltimoCambio(tabla, registroId);
          setMensaje(resultado.errores?.general || 'Cambio deshecho.');
        }}
      >
        {texto}
      </button>
      {!registroId && mensaje && <small role="status">{mensaje}</small>}
      {!tabla && !disponible && <small className="muted">{motivo}</small>}
    </span>
  );
}
