import { useState } from 'react';
import ProductosPage from './components/manufactura/ProductosPage.jsx';
import EtapasPage from './components/manufactura/EtapasPage.jsx';
import OrdenesPage from './components/manufactura/OrdenesPage.jsx';
import RecepcionesPage from './components/manufactura/RecepcionesPage.jsx';
import RecursosPage from './components/manufactura/RecursosPage.jsx';
import ReferenciasPage from './components/manufactura/ReferenciasPage.jsx';
import ResumenPage from './components/manufactura/ResumenPage.jsx';

export default function App() {
  const [pagina, setPagina] = useState('productos');
  const menu = [
    ['resumen', '00', 'Panel de producción'],
    ['productos', '01', 'Productos y materiales'],
    ['etapas', '02', 'Etapas y rutas'],
    ['ordenes', '03', 'Órdenes de producción'],
    ['recepciones', '04', 'Recepción de materiales'],
    ['recursos', '05', 'Máquinas y equipamiento'],
    ['referencias', '↗', 'Catálogos de referencia'],
  ];
  const paginas = {
    productos: <ProductosPage />,
    etapas: <EtapasPage />,
    ordenes: <OrdenesPage />,
    recepciones: <RecepcionesPage />,
    recursos: <RecursosPage />,
    referencias: <ReferenciasPage />,
    resumen: <ResumenPage navegar={setPagina} />,
  };
  return (
    <div className="erp-shell">
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">M</span>
          <div>
            <b>Manufactura</b>
            <small>ERP BASE · GRUPO 23</small>
          </div>
        </div>
        <p className="nav-label">ESPACIO DE TRABAJO</p>
        <nav aria-label="Navegación de Manufactura">
          {menu.map(([id, numero, label]) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-current={pagina === id ? 'page' : undefined}
              onClick={() => setPagina(id)}
            >
              <span aria-hidden="true">{numero}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="status-dot" /> Módulo 7
          <small>Manufactura y operaciones</small>
        </div>
      </aside>
      <div className="workspace">
        <div className="topbar">
          <span>
            ERP Base <span className="muted">/</span> <b>Manufactura</b>
          </span>
          <span className="storage-chip">Guardado en este navegador</span>
        </div>
        <main id="contenido" className="manufactura-app" key={pagina}>
          {paginas[pagina]}
        </main>
        <footer className="workspace-footer">
          Grupo 23 · Modelación de Sistemas{' '}
          <span>Productos · Procesos · Personas</span>
        </footer>
      </div>
    </div>
  );
}
