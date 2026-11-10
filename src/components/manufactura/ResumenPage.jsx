import { listar } from '../../modules/manufactura/almacenamiento.js';
import { avanceOrden } from '../../modules/manufactura/ordenes.js';
import useManufactura from '../../hooks/useManufactura.js';
import { Progreso } from './OrdenesPage.jsx';
export default function ResumenPage({ navegar }) {
  useManufactura();
  const ordenes = listar('ordenes');
  const indicadores = [
    [
      'productos',
      'Productos',
      listar('productos').length,
      'Artículos registrados',
    ],
    [
      'ordenes',
      'Órdenes abiertas',
      ordenes.filter((o) => !['Finalizada', 'Cancelada'].includes(o.estado))
        .length,
      'Producción por realizar',
    ],
    [
      'recursos',
      'Máquinas disponibles',
      listar('maquinas').filter((m) => m.estado === 'Disponible').length,
      'Recursos de planta',
    ],
    [
      'recepciones',
      'Recepciones',
      listar('recepciones').length,
      'Entregas registradas',
    ],
  ];
  return (
    <section>
      <header className="page-heading">
        <div>
          <span className="eyebrow">Grupo 23 · Manufactura y operaciones</span>
          <h1>Panel de producción</h1>
          <p>Del producto terminado a cada recurso que lo hace posible.</p>
        </div>
        <button className="primary" onClick={() => navegar('ordenes')}>
          Gestionar producción →
        </button>
      </header>
      <div className="stat-grid">
        {indicadores.map(([destino, label, valor, descripcion]) => (
          <button
            className="stat-card"
            onClick={() => navegar(destino)}
            key={label}
          >
            <span>{label}</span>
            <strong>{valor}</strong>
            <small>{descripcion} ↗</small>
          </button>
        ))}
      </div>
      <article className="card">
        <h2>Tu flujo de trabajo</h2>
        <p className="muted">
          Cada etapa conecta los registros de la siguiente.
        </p>
        <div className="workflow">
          {[
            ['productos', '01', 'Productos', 'Define su composición'],
            ['etapas', '02', 'Etapas y rutas', 'Ordena la fabricación'],
            ['ordenes', '03', 'Producción', 'Planifica y ejecuta'],
            ['recepciones', '04', 'Recepciones', 'Traza tus materiales'],
            ['recursos', '05', 'Recursos', 'Mantén la planta lista'],
          ].map(([id, n, label, descripcion]) => (
            <button key={id} onClick={() => navegar(id)}>
              <span>{n}</span>
              <b>{label}</b>
              <small>{descripcion}</small>
            </button>
          ))}
        </div>
      </article>
      <article className="card">
        <header>
          <h2>Seguimiento de órdenes</h2>
          <button onClick={() => navegar('ordenes')}>
            Ver todas las órdenes →
          </button>
        </header>
        {ordenes.length ? (
          <ul className="order-summary">
            {ordenes
              .slice(-5)
              .reverse()
              .map((o) => (
                <li key={o.orden_id}>
                  <div>
                    <b>OP-{String(o.orden_id).padStart(4, '0')}</b>
                    <small>
                      {o.estado} · {avanceOrden(o).minutos} minutos registrados
                    </small>
                  </div>
                  <Progreso orden={o} />
                </li>
              ))}
          </ul>
        ) : (
          <div className="empty">
            <p>Aún no hay órdenes de producción.</p>
            <small>Registra un producto y su ruta para comenzar.</small>
          </div>
        )}
      </article>
    </section>
  );
}
