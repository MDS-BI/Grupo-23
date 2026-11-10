import { useEffect, useState } from 'react';
import {
  obtenerEtapas,
  guardarEtapa,
  eliminarEtapa,
} from '../../modules/manufactura/etapas.js';
import { obtenerProductos } from '../../modules/manufactura/productos.js';
import { obtenerRuta, guardarRuta } from '../../modules/manufactura/rutas.js';
import useManufactura from '../../hooks/useManufactura.js';
import { Campo, GestionRegistros, opciones } from './Controles.jsx';

export default function EtapasPage() {
  useManufactura();
  const [producto, setProducto] = useState('');
  const [filas, setFilas] = useState([]);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  useEffect(() => {
    setFilas(producto ? obtenerRuta(producto) : []);
    setErrores({});
    setMensaje('');
  }, [producto]);
  const mover = (indice, cambio) => {
    const nuevas = [...filas];
    const destino = indice + cambio;
    if (destino < 0 || destino >= nuevas.length) return;
    [nuevas[indice], nuevas[destino]] = [nuevas[destino], nuevas[indice]];
    setFilas(nuevas.map((r, i) => ({ ...r, secuencia: i + 1 })));
  };
  return (
    <section>
      <header className="page-heading">
        <div>
          <span className="eyebrow">HU2 · Proceso productivo</span>
          <h1>Etapas y rutas</h1>
          <p>
            Define las actividades y el orden de fabricación de cada producto.
          </p>
        </div>
      </header>
      <GestionRegistros
        titulo="Etapas de fabricación"
        singular="Etapa"
        idCampo="etapa_id"
        registros={obtenerEtapas()}
        guardar={guardarEtapa}
        eliminar={eliminarEtapa}
        nuevoTexto="Nueva etapa"
        columnas={[
          { key: 'nombre', label: 'Nombre' },
          { key: 'tipo', label: 'Tipo' },
          {
            key: 'tiempo_estandar_min',
            label: 'Tiempo estándar',
            render: (r) => `${r.tiempo_estandar_min} min`,
          },
        ]}
        campos={[
          { name: 'nombre', label: 'Nombre de la etapa' },
          { name: 'tipo', label: 'Tipo de etapa' },
          {
            name: 'tiempo_estandar_min',
            label: 'Tiempo estándar (min)',
            type: 'number',
            min: 1,
            step: '1',
          },
        ]}
      />
      <article className="card">
        <h2>Ruta del producto</h2>
        <p className="muted">
          Asigna etapas y secuencias únicas. Se mostrarán ordenadas al guardar.
        </p>
        <Campo
          campo={{
            name: 'producto_ruta',
            label: 'Producto de la ruta',
            type: 'select',
            options: opciones(obtenerProductos(), 'producto_id'),
          }}
          value={producto}
          onChange={setProducto}
        />
        {producto && (
          <>
            <div className="route-editor">
              {filas.map((r, i) => (
                <div className="route-step" key={i}>
                  <span className="step-number">{i + 1}</span>
                  <Campo
                    campo={{
                      name: `etapa_${i}`,
                      label: `Etapa ${i + 1}`,
                      type: 'select',
                      options: opciones(obtenerEtapas(), 'etapa_id'),
                    }}
                    value={r.etapa_id}
                    onChange={(v) =>
                      setFilas(
                        filas.map((f, n) =>
                          n === i ? { ...f, etapa_id: v } : f,
                        ),
                      )
                    }
                  />
                  <Campo
                    campo={{
                      name: `secuencia_${i}`,
                      label: `Secuencia ${i + 1}`,
                      type: 'number',
                      min: 1,
                      step: '1',
                    }}
                    value={r.secuencia}
                    onChange={(v) =>
                      setFilas(
                        filas.map((f, n) =>
                          n === i ? { ...f, secuencia: v } : f,
                        ),
                      )
                    }
                  />
                  <div className="row-actions">
                    <button
                      type="button"
                      aria-label={`Subir etapa ${i + 1}`}
                      disabled={i === 0}
                      onClick={() => mover(i, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Bajar etapa ${i + 1}`}
                      disabled={i === filas.length - 1}
                      onClick={() => mover(i, 1)}
                    >
                      ↓
                    </button>
                    <button
                      className="danger"
                      type="button"
                      onClick={() => setFilas(filas.filter((_, n) => n !== i))}
                    >
                      Quitar etapa
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {!filas.length && <p>No hay etapas en esta ruta.</p>}
            {Object.entries(errores).map(([k, v]) => (
              <p role="alert" className="error" key={k}>
                {k.startsWith('fila_')
                  ? `Etapa ${Number(k.slice(5)) + 1}: `
                  : ''}
                {v}
              </p>
            ))}
            <div className="actions">
              <button
                type="button"
                disabled={!obtenerEtapas().length}
                onClick={() =>
                  setFilas([
                    ...filas,
                    {
                      etapa_id: '',
                      secuencia:
                        Math.max(
                          0,
                          ...filas.map((f) => Number(f.secuencia) || 0),
                        ) + 1,
                    },
                  ])
                }
              >
                Agregar etapa a la ruta
              </button>
              <button
                className="primary"
                type="button"
                onClick={() => {
                  const r = guardarRuta(producto, filas);
                  setErrores(r.errores || {});
                  if (!r.errores) {
                    setFilas(obtenerRuta(producto));
                    setMensaje('Ruta guardada en orden de secuencia.');
                  }
                }}
              >
                Guardar ruta
              </button>
            </div>
            {!obtenerEtapas().length && (
              <p className="muted">
                Registra una etapa de fabricación para comenzar.
              </p>
            )}
          </>
        )}
        {mensaje && (
          <p role="status" className="notice">
            {mensaje}
          </p>
        )}
      </article>
    </section>
  );
}
