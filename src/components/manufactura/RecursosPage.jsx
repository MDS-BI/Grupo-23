import { useState } from 'react';
import useManufactura from '../../hooks/useManufactura.js';
import {
  obtenerMaquinas,
  guardarMaquina,
  eliminarMaquina,
  ESTADOS_MAQUINA,
  obtenerMantenimientos,
  guardarMantenimiento,
  eliminarMantenimiento,
  obtenerRepuestosMantenimiento,
  obtenerEquipamiento,
  guardarEquipamiento,
  eliminarEquipamiento,
  obtenerAsignaciones,
  guardarAsignacion,
  eliminarAsignacion,
} from '../../modules/manufactura/recursos.js';
import { buscar } from '../../modules/manufactura/almacenamiento.js';
import { nombreReferencia } from '../../modules/manufactura/referencias.js';
import {
  Campo,
  GestionRegistros,
  opciones,
  opcionesExternas,
  formatoFecha,
} from './Controles.jsx';

function Mantenimientos({ maquinaId }) {
  useManufactura();
  const [detalle, setDetalle] = useState(null);
  return (
    <>
      <GestionRegistros
        key={maquinaId || 'todas'}
        titulo="Historial de mantenimiento"
        singular="Mantenimiento"
        nuevoTexto="Registrar mantenimiento"
        idCampo="mantenimiento_id"
        registros={obtenerMantenimientos(maquinaId)}
        guardar={(d, id) =>
          guardarMantenimiento(
            { ...d, ...(maquinaId ? { maquina_id: maquinaId } : {}) },
            id,
          )
        }
        eliminar={eliminarMantenimiento}
        conRepuestos
        preparar={(r) => ({
          ...r,
          repuestos: obtenerRepuestosMantenimiento(r.mantenimiento_id),
        })}
        onVer={(r) => setDetalle(r.mantenimiento_id)}
        campos={[
          ...(!maquinaId
            ? [
                {
                  name: 'maquina_id',
                  label: 'Máquina del mantenimiento',
                  type: 'select',
                  options: opciones(obtenerMaquinas(), 'maquina_id'),
                },
              ]
            : []),
          {
            name: 'tecnico_id',
            label: 'Técnico responsable',
            type: 'select',
            options: opcionesExternas('trabajadores', 'trabajador_id'),
          },
          { name: 'tipo', label: 'Tipo de mantenimiento' },
          {
            name: 'costo_tecnico',
            label: 'Costo del técnico',
            type: 'number',
            min: 0,
          },
          { name: 'fecha', label: 'Fecha del mantenimiento', type: 'date' },
        ]}
        columnas={[
          {
            key: 'maquina_id',
            label: 'Máquina',
            render: (r) => buscar('maquinas', r.maquina_id)?.nombre,
          },
          {
            key: 'tecnico_id',
            label: 'Técnico',
            render: (r) => nombreReferencia('trabajadores', r.tecnico_id),
          },
          { key: 'tipo', label: 'Tipo' },
          {
            key: 'fecha',
            label: 'Fecha',
            render: (r) => formatoFecha(r.fecha),
          },
          {
            key: 'costo_tecnico',
            label: 'Costo',
            render: (r) => Number(r.costo_tecnico).toLocaleString('es-CL'),
          },
        ]}
      />
      {detalle && buscar('mantenimientos', detalle) && (
        <article className="card">
          <header>
            <h3>Repuestos del mantenimiento #{detalle}</h3>
            <button onClick={() => setDetalle(null)}>Cerrar repuestos</button>
          </header>
          {obtenerRepuestosMantenimiento(detalle).length ? (
            <ul>
              {obtenerRepuestosMantenimiento(detalle).map((r) => (
                <li key={r.mant_repuesto_id}>
                  {nombreReferencia('repuestos', r.repuesto_id)} · {r.cantidad}{' '}
                  unidades
                </li>
              ))}
            </ul>
          ) : (
            <p>Este mantenimiento no registra consumo de repuestos.</p>
          )}
        </article>
      )}
    </>
  );
}

function Equipamiento() {
  useManufactura();
  const [trabajador, setTrabajador] = useState('');
  const [equipo, setEquipo] = useState('');
  return (
    <>
      <GestionRegistros
        titulo="Tipos de equipamiento"
        singular="Equipamiento"
        nuevoTexto="Nuevo equipamiento"
        idCampo="equipamiento_id"
        registros={obtenerEquipamiento()}
        guardar={guardarEquipamiento}
        eliminar={eliminarEquipamiento}
        campos={[
          { name: 'nombre', label: 'Nombre del equipamiento' },
          { name: 'tipo', label: 'Tipo de equipamiento' },
        ]}
        columnas={[
          { key: 'nombre', label: 'Nombre' },
          { key: 'tipo', label: 'Tipo' },
        ]}
      />
      <div className="filter-bar form-grid">
        <Campo
          campo={{
            name: 'filtro_trabajador',
            label: 'Filtrar por trabajador',
            emptyLabel: 'Todos los trabajadores',
            type: 'select',
            opcional: true,
            options: opcionesExternas('trabajadores', 'trabajador_id'),
          }}
          value={trabajador}
          onChange={setTrabajador}
        />
        <Campo
          campo={{
            name: 'filtro_equipo',
            label: 'Filtrar por equipamiento',
            emptyLabel: 'Todos los equipos',
            type: 'select',
            opcional: true,
            options: opciones(obtenerEquipamiento(), 'equipamiento_id'),
          }}
          value={equipo}
          onChange={setEquipo}
        />
      </div>
      <GestionRegistros
        titulo="Asignaciones al personal"
        singular="Asignación"
        nuevoTexto="Asignar equipamiento"
        idCampo="asignacion_id"
        registros={obtenerAsignaciones().filter(
          (r) =>
            (!trabajador || Number(r.trabajador_id) === Number(trabajador)) &&
            (!equipo || Number(r.equipamiento_id) === Number(equipo)),
        )}
        guardar={guardarAsignacion}
        eliminar={eliminarAsignacion}
        campos={[
          {
            name: 'trabajador_id',
            label: 'Trabajador asignado',
            type: 'select',
            options: opcionesExternas('trabajadores', 'trabajador_id'),
          },
          {
            name: 'equipamiento_id',
            label: 'Equipamiento',
            type: 'select',
            options: opciones(obtenerEquipamiento(), 'equipamiento_id'),
          },
          { name: 'fecha_entrega', label: 'Fecha de entrega', type: 'date' },
        ]}
        columnas={[
          {
            key: 'trabajador_id',
            label: 'Trabajador',
            render: (r) => nombreReferencia('trabajadores', r.trabajador_id),
          },
          {
            key: 'equipamiento_id',
            label: 'Equipamiento',
            render: (r) => buscar('equipamiento', r.equipamiento_id)?.nombre,
          },
          {
            key: 'fecha_entrega',
            label: 'Entregado el',
            render: (r) => formatoFecha(r.fecha_entrega),
          },
        ]}
      />
    </>
  );
}

export default function RecursosPage() {
  useManufactura();
  const [pestana, setPestana] = useState('maquinas');
  const [maquina, setMaquina] = useState(null);
  return (
    <section>
      <header className="page-heading">
        <div>
          <span className="eyebrow">HU5 · Recursos de planta</span>
          <h1>Máquinas y equipamiento</h1>
          <p>
            Cuida la disponibilidad de los equipos y la trazabilidad de sus
            intervenciones.
          </p>
        </div>
      </header>
      <nav className="subnav" aria-label="Recursos de planta">
        {[
          ['maquinas', 'Máquinas'],
          ['mantenimiento', 'Mantenimiento'],
          ['equipamiento', 'Equipamiento y asignaciones'],
        ].map(([id, label]) => (
          <button
            type="button"
            key={id}
            aria-current={pestana === id ? 'page' : undefined}
            onClick={() => setPestana(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      {pestana === 'maquinas' && (
        <>
          <GestionRegistros
            titulo="Máquinas de planta"
            singular="Máquina"
            nuevoTexto="Nueva máquina"
            idCampo="maquina_id"
            registros={obtenerMaquinas()}
            guardar={guardarMaquina}
            eliminar={eliminarMaquina}
            onVer={(r) => setMaquina(r.maquina_id)}
            campos={[
              { name: 'codigo', label: 'Código de máquina' },
              { name: 'nombre', label: 'Nombre de máquina' },
              {
                name: 'estado',
                label: 'Estado de máquina',
                type: 'select',
                options: ESTADOS_MAQUINA.map((v) => ({ value: v, label: v })),
              },
              {
                name: 'capacidad_hora',
                label: 'Capacidad por hora',
                type: 'number',
                min: '0.001',
              },
            ]}
            columnas={[
              { key: 'codigo', label: 'Código' },
              { key: 'nombre', label: 'Nombre' },
              {
                key: 'estado',
                label: 'Estado',
                render: (r) => <span className="badge">{r.estado}</span>,
              },
              { key: 'capacidad_hora', label: 'Unidades / hora' },
            ]}
          />
          {maquina && buscar('maquinas', maquina) && (
            <article className="card">
              <header>
                <h2>{buscar('maquinas', maquina).nombre}</h2>
                <button onClick={() => setMaquina(null)}>
                  Cerrar historial
                </button>
              </header>
              <Mantenimientos maquinaId={maquina} />
            </article>
          )}
        </>
      )}
      {pestana === 'mantenimiento' && <Mantenimientos />}
      {pestana === 'equipamiento' && <Equipamiento />}
    </section>
  );
}
