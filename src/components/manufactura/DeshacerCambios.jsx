import { useState } from 'react';
import useManufactura from '../../hooks/useManufactura.js';
import {
  cambioParaDeshacer,
  deshacerUltimoCambio,
} from '../../modules/manufactura/almacenamiento.js';

export default function DeshacerCambios({ tabla, registroId, texto = 'Deshacer' }) {
  useManufactura();
  const [mensaje, setMensaje] = useState('');
  const disponible = !!cambioParaDeshacer(tabla, registroId);
  return (
    <span className="deshacer-control">
      <button
        type="button"
        disabled={!disponible}
        title="Revierte el cambio guardado más reciente de esta sesión"
        onClick={() => {
          const resultado = deshacerUltimoCambio(tabla, registroId);
          setMensaje(resultado.errores?.general || 'Cambio deshecho.');
        }}
      >
        {texto}
      </button>
      {!registroId && mensaje && <small role="status">{mensaje}</small>}
    </span>
  );
}
