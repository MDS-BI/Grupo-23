import { formatoFecha } from './Controles.jsx';
import './alertas-produccion.css';

const codigoOrden = (id) => `OP-${String(id).padStart(4, '0')}`;

function GrupoAlertas({ titulo, vacio, registros, accion, onVer }) {
  return (
    <div className="alertas-grupo" data-activo={registros.length > 0}>
      <h3>
        {titulo}
        <span className="alertas-cantidad">{registros.length}</span>
      </h3>
      {registros.length ? (
        <>
          <ul
            aria-label={titulo}
            tabIndex={registros.length > 3 ? 0 : undefined}
          >
            {registros.map(({ id, nombre, detalle }) => (
              <li key={id}>
                <strong>{nombre}</strong>
                <small>{detalle}</small>
              </li>
            ))}
          </ul>
          <button type="button" onClick={onVer}>{accion} →</button>
        </>
      ) : (
        <p>{vacio}</p>
      )}
    </div>
  );
}

export default function AlertasProduccion({ alertas, navegar }) {
  return (
    <section className="card alertas-produccion" aria-labelledby="titulo-alertas">
      <h2 id="titulo-alertas">Alertas de producción</h2>
      <div className="alertas-grid">
        <GrupoAlertas
          titulo="Órdenes atrasadas"
          vacio="No hay órdenes abiertas con fecha de término vencida."
          registros={alertas.ordenesAtrasadas.map((orden) => ({
            id: orden.orden_id,
            nombre: codigoOrden(orden.orden_id),
            detalle: `Venció el ${formatoFecha(orden.fecha_fin)} · ${orden.estado}`,
          }))}
          accion="Ir a órdenes"
          onVer={() => navegar('ordenes')}
        />
        <GrupoAlertas
          titulo="Máquinas fuera de servicio"
          vacio="No hay máquinas marcadas como fuera de servicio."
          registros={alertas.maquinasFueraDeServicio.map((maquina) => ({
            id: maquina.maquina_id,
            nombre: maquina.nombre,
            detalle: maquina.codigo,
          }))}
          accion="Ir a máquinas"
          onVer={() => navegar('recursos')}
        />
        <GrupoAlertas
          titulo="Etapas que excedieron el tiempo estándar"
          vacio="No hay ejecuciones terminadas que superen el tiempo estándar."
          registros={alertas.ejecucionesExcedidas.map(({ ejecucion, etapa, real, estandar, exceso }) => ({
            id: ejecucion.ejecucion_id,
            nombre: `${etapa.nombre} · ${codigoOrden(ejecucion.orden_id)}`,
            detalle: `${real} min reales · ${estandar} min estándar · +${exceso} min`,
          }))}
          accion="Ir a ejecuciones por orden"
          onVer={() => navegar('ordenes')}
        />
      </div>
    </section>
  );
}
