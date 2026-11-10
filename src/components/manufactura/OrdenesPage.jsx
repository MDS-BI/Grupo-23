import { useState } from 'react';
import useManufactura from '../../hooks/useManufactura.js';
import {
  obtenerOrdenes,
  guardarOrden,
  eliminarOrden,
  obtenerEjecuciones,
  guardarEjecucion,
  avanceOrden,
  ESTADOS_ORDEN,
} from '../../modules/manufactura/ordenes.js';
import { obtenerProductos } from '../../modules/manufactura/productos.js';
import { obtenerRuta } from '../../modules/manufactura/rutas.js';
import {
  buscar,
  eliminarRegistro,
} from '../../modules/manufactura/almacenamiento.js';
import { obtenerMaquinas } from '../../modules/manufactura/recursos.js';
import { nombreReferencia } from '../../modules/manufactura/referencias.js';
import {
  GestionRegistros,
  opciones,
  opcionesExternas,
  formatoFecha,
} from './Controles.jsx';
import { RecepcionesGestion } from './RecepcionesPage.jsx';

export function Progreso({ orden }) {
  const a = avanceOrden(orden);
  return (
    <div className="progress">
      <progress
        max="100"
        value={a.porcentaje}
        aria-label={`Avance de orden ${orden.orden_id}`}
      />
      <span>
        {a.porcentaje}% · {a.completadas}/{a.total} etapas
      </span>
    </div>
  );
}
function OrdenDetalle({ ordenId, cerrar }) {
  useManufactura();
  const orden = buscar('ordenes', ordenId);
  if (!orden) return null;
  const ruta = obtenerRuta(orden.producto_id);
  const avance = avanceOrden(orden);
  const campos = [
    {
      name: 'etapa_id',
      label: 'Etapa de fabricación',
      type: 'select',
      options: ruta.map((r) => ({
        value: r.etapa_id,
        label: `${r.secuencia}. ${buscar('etapas', r.etapa_id)?.nombre}`,
      })),
    },
    {
      name: 'maquina_id',
      label: 'Máquina',
      type: 'select',
      opcional: true,
      options: opciones(obtenerMaquinas(), 'maquina_id'),
    },
    {
      name: 'trabajador_id',
      label: 'Trabajador',
      type: 'select',
      opcional: true,
      options: opcionesExternas('trabajadores', 'trabajador_id'),
    },
    { name: 'inicio_real', label: 'Inicio real', type: 'datetime-local' },
    {
      name: 'fin_real',
      label: 'Fin real',
      type: 'datetime-local',
      opcional: true,
      help: 'Déjalo vacío mientras la etapa esté en curso.',
    },
  ];
  return (
    <article className="card detail-panel">
      <header>
        <div>
          <span className="eyebrow">Seguimiento de producción</span>
          <h2>Orden #{orden.orden_id}</h2>
        </div>
        <button onClick={cerrar}>Cerrar detalle</button>
      </header>
      <dl className="summary-grid">
        <div>
          <dt>Producto</dt>
          <dd>{buscar('productos', orden.producto_id)?.nombre}</dd>
        </div>
        <div>
          <dt>Cantidad planificada</dt>
          <dd>{orden.cantidad_plan}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>{orden.estado}</dd>
        </div>
        <div>
          <dt>Periodo</dt>
          <dd>
            {formatoFecha(orden.fecha_inicio)} — {formatoFecha(orden.fecha_fin)}
          </dd>
        </div>
        <div>
          <dt>Tiempo real acumulado</dt>
          <dd>{avance.minutos} min</dd>
        </div>
      </dl>
      <Progreso orden={orden} />
      <h3>Ruta y avance de las etapas</h3>
      {ruta.length ? (
        <ol className="route-summary">
          {ruta.map((r) => {
            const ejecuciones = obtenerEjecuciones(ordenId).filter(
              (e) => Number(e.etapa_id) === Number(r.etapa_id),
            );
            return (
              <li key={r.ruta_id}>
                <b>
                  {r.secuencia}. {buscar('etapas', r.etapa_id)?.nombre}
                </b>
                <span className="badge">
                  {ejecuciones.some((e) => e.fin_real)
                    ? 'Completada'
                    : ejecuciones.length
                      ? 'En curso'
                      : 'Pendiente'}
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="notice">
          Define primero la ruta de este producto en Etapas y rutas para
          registrar ejecuciones.
        </p>
      )}
      <GestionRegistros
        key={ordenId}
        titulo="Ejecuciones de etapas"
        singular="Ejecución"
        nuevoTexto="Registrar ejecución"
        textoEditar="Finalizar / editar"
        idCampo="ejecucion_id"
        registros={obtenerEjecuciones(ordenId)}
        campos={campos}
        guardar={(d, id) => guardarEjecucion({ ...d, orden_id: ordenId }, id)}
        eliminar={(id) => eliminarRegistro('ejecuciones', id)}
        columnas={[
          {
            key: 'etapa_id',
            label: 'Etapa',
            render: (r) => buscar('etapas', r.etapa_id)?.nombre,
          },
          {
            key: 'maquina_id',
            label: 'Máquina',
            render: (r) =>
              buscar('maquinas', r.maquina_id)?.nombre || 'Sin asignar',
          },
          {
            key: 'trabajador_id',
            label: 'Trabajador',
            render: (r) => nombreReferencia('trabajadores', r.trabajador_id),
          },
          {
            key: 'inicio_real',
            label: 'Inicio',
            render: (r) => formatoFecha(r.inicio_real),
          },
          {
            key: 'fin_real',
            label: 'Fin',
            render: (r) => formatoFecha(r.fin_real),
          },
          {
            key: 'tiempo_uso_min',
            label: 'Tiempo',
            render: (r) =>
              r.fin_real ? `${r.tiempo_uso_min} min` : 'En curso',
          },
        ]}
      />
      <RecepcionesGestion ordenId={ordenId} />
    </article>
  );
}
export default function OrdenesPage() {
  useManufactura();
  const [detalle, setDetalle] = useState(null);
  return (
    <section>
      <header className="page-heading">
        <div>
          <span className="eyebrow">HU3 · Planificación y ejecución</span>
          <h1>Órdenes de producción</h1>
          <p>
            Planifica la fabricación y registra el avance real de cada etapa.
          </p>
        </div>
      </header>
      {!obtenerProductos().length && (
        <p className="notice">
          Primero registra un producto y define su ruta de fabricación.
        </p>
      )}
      <GestionRegistros
        titulo="Órdenes"
        singular="Orden"
        nuevoTexto="Nueva orden"
        idCampo="orden_id"
        registros={obtenerOrdenes()}
        guardar={guardarOrden}
        eliminar={eliminarOrden}
        onVer={(r) => setDetalle(r.orden_id)}
        campos={[
          {
            name: 'producto_id',
            label: 'Producto',
            type: 'select',
            options: opciones(obtenerProductos(), 'producto_id'),
          },
          {
            name: 'cantidad_plan',
            label: 'Cantidad planificada',
            type: 'number',
            min: '0.001',
          },
          {
            name: 'estado',
            label: 'Estado de la orden',
            type: 'select',
            options: ESTADOS_ORDEN.map((v) => ({ value: v, label: v })),
          },
          { name: 'fecha_inicio', label: 'Fecha de inicio', type: 'date' },
          { name: 'fecha_fin', label: 'Fecha de término', type: 'date' },
        ]}
        columnas={[
          {
            key: 'orden_id',
            label: 'Orden',
            render: (r) => `OP-${String(r.orden_id).padStart(4, '0')}`,
          },
          {
            key: 'producto_id',
            label: 'Producto',
            render: (r) => buscar('productos', r.producto_id)?.nombre,
          },
          { key: 'cantidad_plan', label: 'Cantidad' },
          {
            key: 'estado',
            label: 'Estado',
            render: (r) => <span className="badge">{r.estado}</span>,
          },
          {
            key: 'fecha_fin',
            label: 'Término',
            render: (r) => formatoFecha(r.fecha_fin),
          },
          {
            key: 'avance',
            label: 'Avance',
            render: (r) => <Progreso orden={r} />,
          },
        ]}
      />
      {detalle && (
        <OrdenDetalle ordenId={detalle} cerrar={() => setDetalle(null)} />
      )}
    </section>
  );
}
