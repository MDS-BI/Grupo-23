import { useId, useState } from 'react';
import useManufactura from '../../hooks/useManufactura.js';
import {
  obtenerReferencias,
  nombreReferencia,
} from '../../modules/manufactura/referencias.js';

export const opciones = (lista, id, nombre = 'nombre') =>
  lista.map((r) => ({ value: r[id], label: r[nombre] }));
export const opcionesExternas = (tipo, id, nombre) =>
  opciones(obtenerReferencias(tipo), id, nombre);
export const nombreRegistro = (lista, campo, valor) =>
  lista.find((r) => Number(r[campo]) === Number(valor))?.nombre || `#${valor}`;
export const formatoFecha = (valor) => {
  if (!valor) return 'En curso';
  if (!Number.isFinite(new Date(valor).getTime())) return 'Fecha inválida';
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    ...(valor.includes('T') ? { timeStyle: 'short' } : {}),
    timeZone: valor.includes('T') ? undefined : 'UTC',
  }).format(new Date(valor));
};

export function Campo({ campo, value, onChange, error }) {
  const id = useId();
  const { name, label, type = 'text', options = [], opcional = false } = campo;
  const props = {
    id,
    name,
    value: value ?? '',
    onChange: (e) => onChange(e.target.value),
    'aria-invalid': !!error,
    'aria-describedby': error ? `${id}-error` : undefined,
    required: !opcional,
  };
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {opcional && !campo.emptyLabel && (
          <span className="muted"> (opcional)</span>
        )}
      </label>
      {type === 'select' ? (
        <select {...props}>
          <option value="">
            {campo.emptyLabel ||
              (opcional ? 'Sin asignar' : 'Selecciona una opción')}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
          {value && !options.some((o) => String(o.value) === String(value)) && (
            <option value={value}>Referencia #{value}</option>
          )}
        </select>
      ) : (
        <input
          {...props}
          type={type}
          min={campo.min}
          step={campo.step || (type === 'number' ? 'any' : undefined)}
        />
      )}
      {campo.help && <small className="muted">{campo.help}</small>}
      {error && (
        <p className="error" role="alert" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

function RepuestosEditor({ value = [], onChange, onPendiente }) {
  const [repuesto, setRepuesto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [error, setError] = useState('');
  const agregar = () => {
    if (
      !repuesto ||
      !Number.isInteger(Number(cantidad)) ||
      Number(cantidad) <= 0
    ) {
      setError('Selecciona un repuesto y una cantidad entera mayor que 0.');
      return;
    }
    if (value.some((r) => Number(r.repuesto_id) === Number(repuesto))) {
      setError('Ese repuesto ya está incluido.');
      return;
    }
    onChange([
      ...value,
      { repuesto_id: Number(repuesto), cantidad: Number(cantidad) },
    ]);
    setRepuesto('');
    setCantidad('');
    setError('');
    onPendiente(false);
  };
  return (
    <fieldset>
      <legend>Repuestos utilizados</legend>
      <div className="form-grid">
        <Campo
          campo={{
            name: 'repuesto',
            label: 'Repuesto',
            type: 'select',
            options: opcionesExternas('repuestos', 'repuesto_id'),
            opcional: true,
          }}
          value={repuesto}
          onChange={(v) => {
            setRepuesto(v);
            onPendiente(!!(v || cantidad));
          }}
        />
        <Campo
          campo={{
            name: 'cantidad_repuesto',
            label: 'Cantidad de repuesto',
            type: 'number',
            min: 1,
            step: '1',
            opcional: true,
          }}
          value={cantidad}
          onChange={(v) => {
            setCantidad(v);
            onPendiente(!!(v || repuesto));
          }}
        />
        <button type="button" onClick={agregar}>
          Agregar repuesto
        </button>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <ul>
        {value.map((r, i) => (
          <li key={r.repuesto_id}>
            {nombreReferencia('repuestos', r.repuesto_id)} · {r.cantidad}{' '}
            unidades{' '}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, index) => i !== index))}
            >
              Quitar repuesto
            </button>
          </li>
        ))}
      </ul>
      {(repuesto || cantidad) && (
        <p className="muted">
          Pulsa Agregar repuesto para incluirlo antes de guardar.
        </p>
      )}
    </fieldset>
  );
}

export function Formulario({
  titulo,
  campos,
  inicial = {},
  onGuardar,
  onCancelar,
  textoGuardar = 'Guardar',
  conRepuestos = false,
}) {
  const [datos, setDatos] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [repuestoPendiente, setRepuestoPendiente] = useState(false);
  const cambiar = (name, value) => {
    setDatos((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, [name]: undefined }));
  };
  const guardar = (e) => {
    e.preventDefault();
    if (repuestoPendiente) {
      setErrores({
        general: 'Pulsa Agregar repuesto para incluirlo antes de guardar.',
      });
      return;
    }
    try {
      const resultado = onGuardar(datos);
      setErrores(resultado?.errores || {});
    } catch {
      setErrores({
        general:
          'No se pudo completar la operación. Revisa los datos e inténtalo de nuevo.',
      });
    }
  };
  return (
    <form className="card record-form" noValidate onSubmit={guardar}>
      <h3>{titulo}</h3>
      {errores.general && (
        <p className="error" role="alert">
          {errores.general}
        </p>
      )}
      <div className="form-grid">
        {campos.map((campo) => (
          <Campo
            key={campo.name}
            campo={campo}
            value={datos[campo.name]}
            onChange={(value) => cambiar(campo.name, value)}
            error={errores[campo.name]}
          />
        ))}
      </div>
      {conRepuestos && (
        <RepuestosEditor
          value={datos.repuestos || []}
          onChange={(value) => cambiar('repuestos', value)}
          onPendiente={setRepuestoPendiente}
        />
      )}
      {Object.entries(errores)
        .filter(([k]) => !campos.some((c) => c.name === k) && k !== 'general')
        .map(([k, v]) => (
          <p className="error" role="alert" key={k}>
            {v}
          </p>
        ))}
      <div className="actions">
        <button type="button" onClick={onCancelar}>
          Cancelar
        </button>
        <button className="primary" type="submit">
          {textoGuardar}
        </button>
      </div>
    </form>
  );
}

export function GestionRegistros({
  titulo,
  singular,
  idCampo,
  registros,
  columnas,
  campos,
  guardar,
  eliminar,
  nuevoTexto,
  vacio,
  preparar = (r) => r,
  onVer,
  conRepuestos = false,
  textoEditar = 'Editar',
}) {
  useManufactura();
  const [edicion, setEdicion] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const guardarDatos = (datos) => {
    const resultado = guardar(datos, edicion?.[idCampo]);
    if (!resultado.errores) {
      setEdicion(null);
      setMensaje('Cambios guardados correctamente.');
    }
    return resultado;
  };
  const borrar = (registro) => {
    if (
      !window.confirm(
        `¿Eliminar ${singular.toLowerCase()} #${registro[idCampo]}? Se eliminarán sus registros dependientes cuando corresponda.`,
      )
    )
      return;
    const resultado = eliminar(registro[idCampo]);
    setMensaje(resultado?.errores?.general || 'Registro eliminado.');
  };
  return (
    <div className="management">
      <header className="section-heading">
        <h2>{titulo}</h2>
        <button
          className="primary"
          type="button"
          onClick={() => {
            setEdicion({});
            setMensaje('');
          }}
        >
          {nuevoTexto || `Nuevo ${singular.toLowerCase()}`}
        </button>
      </header>
      {mensaje && (
        <p role="status" className="notice">
          {mensaje}
        </p>
      )}
      {edicion && (
        <Formulario
          key={edicion[idCampo] || 'nuevo'}
          titulo={`${edicion[idCampo] ? 'Editar' : 'Registrar'} ${singular.toLowerCase()}`}
          campos={campos}
          inicial={edicion}
          onGuardar={guardarDatos}
          onCancelar={() => setEdicion(null)}
          conRepuestos={conRepuestos}
        />
      )}
      {registros.length ? (
        <div className="table-wrap">
          <table>
            <caption className="sr-only">{titulo}</caption>
            <thead>
              <tr>
                {columnas.map((c) => (
                  <th key={c.key} scope="col">
                    {c.label}
                  </th>
                ))}
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r[idCampo]}>
                  {columnas.map((c) => (
                    <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>
                  ))}
                  <td className="row-actions">
                    {onVer && (
                      <button type="button" onClick={() => onVer(r)}>
                        Ver detalle
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setEdicion(preparar(r));
                        setMensaje('');
                      }}
                    >
                      {textoEditar}
                    </button>
                    {eliminar && (
                      <button
                        className="danger"
                        type="button"
                        onClick={() => borrar(r)}
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <span aria-hidden="true">◇</span>
          <p>{vacio || `No hay registros de ${titulo.toLowerCase()}.`}</p>
          <small>Comienza con el botón de registro.</small>
        </div>
      )}
    </div>
  );
}
