import { useState } from 'react';
import { registrarMaterialLocal } from '../../modules/manufactura/referencias.js';
import { Campo } from './Controles.jsx';

export default function NuevoMaterial({ onCreado, onCancelar }) {
  const [nombre, setNombre] = useState('');
  const [unidad, setUnidad] = useState('unidad');
  const [errores, setErrores] = useState({});

  const guardar = () => {
    const resultado = registrarMaterialLocal({ nombre, unidad });
    if (resultado.errores) {
      setErrores(resultado.errores);
    } else {
      onCreado(resultado.registro);
    }
  };

  return (
    <fieldset id="nuevo-material">
      <legend>Registrar un material para reutilizar</legend>
      <p className="muted">
        Escribe un nombre y una unidad de medida. Por ejemplo,{' '}
        <strong>Clavos</strong> y <strong>unidad</strong>. Pulsa{' '}
        <strong>Guardar material</strong> y se seleccionará en el producto. Si
        cada mesa usa 12 clavos, escribe <strong>12</strong> en Cantidad por
        unidad y pulsa <strong>Agregar</strong>.
      </p>
      <div className="form-grid">
        <Campo
          campo={{
            name: 'nombre_material_nuevo',
            label: 'Nombre del nuevo material',
          }}
          value={nombre}
          onChange={(valor) => {
            setNombre(valor);
            setErrores((actual) => ({ ...actual, nombre: undefined }));
          }}
          error={errores.nombre}
        />
        <Campo
          campo={{
            name: 'unidad_material_nuevo',
            label: 'Unidad de medida',
            help: 'Ej. unidad, kg, litro o metro.',
          }}
          value={unidad}
          onChange={(valor) => {
            setUnidad(valor);
            setErrores((actual) => ({ ...actual, unidad: undefined }));
          }}
          error={errores.unidad}
        />
      </div>
      {errores.general && (
        <p className="error" role="alert">
          {errores.general}
        </p>
      )}
      <div className="actions">
        <button type="button" onClick={onCancelar}>
          Cancelar nuevo material
        </button>
        <button type="button" className="primary" onClick={guardar}>
          Guardar material
        </button>
      </div>
    </fieldset>
  );
}
