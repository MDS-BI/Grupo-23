import { useEffect, useId, useState } from 'react';
import useManufactura from '../../hooks/useManufactura.js';
import { cambioParaDeshacer, listar, tablas } from '../../modules/manufactura/almacenamiento.js';
import { puedeModificarTabla } from '../../modules/manufactura/roles.js';
import useEnfoqueAccion from '../../hooks/useEnfoqueAccion.js';
import DeshacerCambios from './DeshacerCambios.jsx';
import HistorialCambios from './HistorialCambios.jsx';
import ConfirmarEliminacion from './ConfirmarEliminacion.jsx';
import AvisoOperacion from './AvisoOperacion.jsx';
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
    disabled: !!campo.disabled,
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
  const [reinicio, setReinicio] = useState(0);
  const destino = useEnfoqueAccion();
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
    <form ref={destino} className="card record-form" noValidate onSubmit={guardar}>
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
          key={reinicio}
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
        <button
          type="button"
          onClick={() => {
            setDatos(inicial);
            setErrores({});
            setRepuestoPendiente(false);
            setReinicio((n) => n + 1);
          }}
        >
          Deshacer cambios
        </button>
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
  permitirEditar = true,
  permitirCrear = true,
  inicialNuevo = {},
  solicitudNueva,
  descripcionEliminar,
  mostrarEliminadosEnTabla = false,
  renderFormulario,
  accionesRegistro,
  mostrarDeshacerFilas = true,
  mostrarBotonCrear = true,
}) {
  useManufactura();
  const tabla = Object.keys(tablas).find((nombre) => tablas[nombre] === idCampo);
  const puedeModificar = puedeModificarTabla(tabla);
  const hayAcciones = onVer || (puedeModificar && (permitirEditar || eliminar));
  const [edicion, setEdicion] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [errorOperacion, setErrorOperacion] = useState('');
  const [formularioId, setFormularioId] = useState(0);
  const [pendienteEliminar, setPendienteEliminar] = useState(null);
  const [eliminado, setEliminado] = useState(null);
  const cambio = cambioParaDeshacer(tabla);
  const registrosEliminados = puedeModificar && cambio
    ? cambio.anteriores[tabla].filter((anterior) =>
        !cambio.posteriores[tabla].some((posterior) =>
          Number(posterior[idCampo]) === Number(anterior[idCampo]),
        ),
      )
    : [];
  const recuperado = eliminado && registros.some((r) =>
    Number(r[idCampo]) === Number(eliminado[idCampo]),
  );
  const mensajeVisible = recuperado
    ? `Eliminación deshecha. Se recuperó ${singular.toLowerCase()} «${eliminado.nombre || `#${eliminado[idCampo]}`}».`
    : mensaje;
  useEffect(() => {
    if (recuperado) {
      setMensaje(mensajeVisible);
      setEliminado(null);
    }
  }, [recuperado, mensajeVisible]);
  const abrirFormulario = (datos) => {
    setEdicion(datos);
    setFormularioId((n) => n + 1);
    setMensaje('');
    setErrorOperacion('');
    setEliminado(null);
    setPendienteEliminar(null);
  };
  const confirmacion = useEnfoqueAccion(mensajeVisible);
  useEffect(() => {
    const alDeshacer = (evento) => {
      if (evento.detail?.accion === 'descartar') {
        setMensaje('');
        setEliminado(null);
        return;
      }
      if (!['deshacer', 'rehacer'].includes(evento.detail?.accion) || !evento.detail.tablas.includes(tabla)) return;
      setEdicion(null);
      setPendienteEliminar(null);
      setErrorOperacion('');
      setMensaje(evento.detail.accion === 'rehacer' ? 'Cambio rehecho. Se actualizó el listado.' : eliminado && listar(tabla).some((r) => Number(r[idCampo]) === Number(eliminado[idCampo]))
        ? `Eliminación deshecha. Se recuperó ${singular.toLowerCase()} «${eliminado.nombre || `#${eliminado[idCampo]}`}».`
        : 'Cambio deshecho. Se actualizó el listado.');
      setEliminado(null);
    };
    window.addEventListener('manufactura:cambio', alDeshacer);
    return () => window.removeEventListener('manufactura:cambio', alDeshacer);
  }, [tabla, eliminado, singular, idCampo]);
  useEffect(() => {
    if (solicitudNueva) {
      abrirFormulario({ ...solicitudNueva.datos });
    }
  }, [solicitudNueva]);
  const guardarDatos = (datos) => {
    const resultado = guardar(datos, edicion?.[idCampo]);
    if (!resultado.errores) {
      setEdicion(null);
      setMensaje('Cambios guardados correctamente.');
      setErrorOperacion('');
    }
    return resultado;
  };
  const borrar = (registro) => {
    let resultado;
    try {
      resultado = eliminar(registro[idCampo]);
    } catch {
      setErrorOperacion('No se pudo completar la eliminación. No se confirmó ningún cambio. Revisa el listado e inténtalo de nuevo.');
      return;
    }
    if (!resultado || resultado.errores) {
      setErrorOperacion(resultado?.errores?.general || 'No se pudo eliminar el registro. Revisa sus datos y permisos.');
      setPendienteEliminar(null);
      return;
    }
    setPendienteEliminar(null);
    setErrorOperacion('');
    setEliminado(registro);
    setMensaje(
      `Se eliminó ${singular.toLowerCase()} «${registro.nombre || `#${registro[idCampo]}`}». Puedes recuperarlo con Deshacer eliminación.`);
  };
  return (
    <div className="management">
      <header className="section-heading">
        <h2>{titulo}</h2>
        {puedeModificar && permitirCrear && mostrarBotonCrear && (
          <button
            className="primary"
            type="button"
            onClick={() => {
              abrirFormulario({ ...inicialNuevo });
            }}
          >
            {nuevoTexto || `Nuevo ${singular.toLowerCase()}`}
          </button>
        )}
      </header>
      {pendienteEliminar && (
        <ConfirmarEliminacion
          tabla={tabla}
          registroId={pendienteEliminar[idCampo]}
          nombre={pendienteEliminar.nombre || pendienteEliminar.codigo || `#${pendienteEliminar[idCampo]}`}
          singular={singular.toLowerCase()}
          retirarAsignaciones={tabla === 'equipamiento'}
          descripcion={descripcionEliminar?.(pendienteEliminar)}
          cancelar={() => setPendienteEliminar(null)}
          confirmar={() => borrar(pendienteEliminar)}
        />
      )}
      {errorOperacion && <p role="alert" className="error">{errorOperacion}</p>}
      {!errorOperacion && mensajeVisible && (
        <AvisoOperacion ref={confirmacion} tabIndex={-1} className="operation-feedback" onCerrar={() => { setMensaje(''); setEliminado(null); }}>
          {mensajeVisible}
        </AvisoOperacion>
      )}
      <HistorialCambios tabla={tabla} />
      {edicion && puedeModificar && permitirCrear && (
        renderFormulario ? renderFormulario({ inicial: edicion, onGuardar: guardarDatos, onCancelar: () => setEdicion(null), clave: formularioId }) : <Formulario
          key={formularioId}
          titulo={`${edicion[idCampo] ? 'Editar' : 'Registrar'} ${singular.toLowerCase()}`}
          campos={campos}
          inicial={edicion}
          onGuardar={guardarDatos}
          onCancelar={() => setEdicion(null)}
          conRepuestos={conRepuestos}
        />
      )}
      {registros.length || (mostrarEliminadosEnTabla && registrosEliminados.length) ? (
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
                {hayAcciones && <th scope="col">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r[idCampo]}>
                  {columnas.map((c) => (
                    <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>
                  ))}
                  {hayAcciones && (
                    <td className="row-actions">
                    {onVer && (
                      <button type="button" onClick={() => onVer(r)}>
                        Ver detalle
                      </button>
                    )}
                    {accionesRegistro?.(r, abrirFormulario)}
                    {permitirEditar && puedeModificar && (
                      <button
                        type="button"
                        onClick={() => {
                          abrirFormulario(preparar(r));
                        }}
                      >
                        {textoEditar}
                      </button>
                    )}
                    {eliminar && puedeModificar && (
                      <button
                        className="danger"
                        type="button"
                        onClick={() => {
                          setPendienteEliminar(r);
                          setMensaje('');
                          setErrorOperacion('');
                          setEliminado(null);
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                    {mostrarDeshacerFilas && puedeModificar && tabla !== 'recepciones' &&
                      <DeshacerCambios tabla={tabla} registroId={r[idCampo]} />}
                    </td>
                  )}
                </tr>
              ))}
              {mostrarEliminadosEnTabla && registrosEliminados.map((r) => (
                <tr key={`eliminado-${r[idCampo]}`} className="deleted-record">
                  {columnas.map((c, i) => (
                    <td key={c.key}>
                      {c.render ? c.render(r) : r[c.key]}
                      {i === 0 && <> <span className="badge">Eliminado</span></>}
                    </td>
                  ))}
                  {hayAcciones && <td className="row-actions">
                    <DeshacerCambios tabla={tabla} registroId={r[idCampo]} texto="Deshacer eliminación" />
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <span aria-hidden="true">◇</span>
          <p>{vacio || `No hay registros de ${titulo.toLowerCase()}.`}</p>
          {puedeModificar && permitirCrear && <small>Comienza con el botón de registro.</small>}
        </div>
      )}
    </div>
  );
}
