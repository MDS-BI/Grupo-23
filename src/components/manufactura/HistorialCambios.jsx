import { useState } from 'react';
import useManufactura from '../../hooks/useManufactura.js';
import { deshacerCambio, estadoCambio, historialCambios, listar, rehacerCambio, tablas } from '../../modules/manufactura/almacenamiento.js';
import { diferencias } from '../../modules/manufactura/historial-cambios.js';

const nombres = {
  productos: 'producto', etapas: 'etapa', rutas: 'ruta', ordenes: 'orden',
  ejecuciones: 'ejecución', recepciones: 'recepción', maquinas: 'máquina',
  mantenimientos: 'mantenimiento', equipamiento: 'equipamiento', asignaciones: 'asignación',
  materiales_locales: 'material', pedidos: 'pedido', locales: 'local', producto_material: 'material del producto',
};

function descripcion(paso, tabla) {
  const campo = tablas[tabla] || 'material_id';
  const cambios = diferencias(paso.anteriores[tabla], paso.posteriores[tabla], campo);
  const registro = cambios[0]?.despues || cambios[0]?.antes;
  const producto = registro?.producto_id && listar('productos').find((p) => Number(p.producto_id) === Number(registro.producto_id));
  if (tabla === 'rutas') return `Ruta guardada: ${producto?.nombre || `producto #${registro?.producto_id}`}.`;
  const accion = cambios.every((c) => !c.antes) ? 'Se agregó' : cambios.every((c) => !c.despues) ? 'Se eliminó' : 'Se actualizó';
  const nombre = registro?.nombre || registro?.codigo || (tabla === 'ordenes' ? `OP${String(registro?.orden_id).padStart(4, '0')}` : `#${registro?.[campo]}`);
  const dependientes = Object.entries(paso.anteriores).filter(([t]) => t !== tabla)
    .reduce((total, [t, antes]) => total + diferencias(antes, paso.posteriores[t], tablas[t] || 'material_id').length, 0);
  return `${accion} ${nombres[tabla] || tabla} «${nombre}»${cambios.length > 1 ? ` y ${cambios.length - 1} más` : ''}.${dependientes ? ` Incluye ${dependientes} registro(s) relacionado(s).` : ''}`;
}

export default function HistorialCambios({ tabla }) {
  useManufactura();
  const [error, setError] = useState('');
  const pasos = historialCambios(tabla);
  if (!pasos.length) return null;
  return (
    <section className="historial-cambios" aria-label={`Historial de cambios de ${nombres[tabla] || tabla}`}>
      <p className="historial-ayuda muted">Últimos 20 cambios. Cada acción conserva su opción de deshacer o rehacer al guardar otro cambio.</p>
      {error && <p className="error" role="alert">{error}</p>}
      <ol>
        {pasos.map((paso) => {
          const { cambio, motivo } = estadoCambio(paso.id);
          const eliminado = paso.anteriores[tabla].length > paso.posteriores[tabla].length;
          return (
            <li key={paso.id} data-cambio-id={paso.id}>
              <div className={`notice historial-cambio${paso.deshecho ? ' cambio-deshecho' : ''}${eliminado && !paso.deshecho ? ' recovery-notice' : ''}`}>
                <div className="historial-detalle">
                  <span>{descripcion(paso, tabla)}</span>
                  <small className="muted">
                    {paso.deshecho ? 'Deshecho · ' : ''}
                    {paso.fecha && Number.isFinite(new Date(paso.fecha).getTime()) ? <time dateTime={paso.fecha}>{new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(paso.fecha))}</time> : 'Cambio anterior'}
                  </small>
                  {!cambio && <small className="muted">{motivo}</small>}
                </div>
                <button type="button" disabled={!cambio} title={motivo || 'Aplica solo este cambio y conserva los demás.'}
                  onClick={() => {
                    const resultado = paso.deshecho ? rehacerCambio(paso.id) : deshacerCambio(paso.id);
                    setError(resultado.errores?.general || '');
                  }}>
                  {paso.deshecho ? 'Rehacer' : eliminado ? 'Deshacer eliminación' : 'Deshacer'}
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
