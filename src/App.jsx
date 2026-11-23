import { useState } from 'react';
import ProductosPage from './components/manufactura/ProductosPage.jsx';
import EtapasPage from './components/manufactura/EtapasPage.jsx';
import OrdenesPage from './components/manufactura/OrdenesPage.jsx';
import RecepcionesPage from './components/manufactura/RecepcionesPage.jsx';
import RecursosPage from './components/manufactura/RecursosPage.jsx';
import ReferenciasPage from './components/manufactura/ReferenciasPage.jsx';
import ResumenPage from './components/manufactura/ResumenPage.jsx';
import useManufactura from './hooks/useManufactura.js';
import { cambiarRol, puedeAcceder, ROLES, rolActual } from './modules/manufactura/roles.js';
import DeshacerCambios from './components/manufactura/DeshacerCambios.jsx';
import useEnfoqueAccion from './hooks/useEnfoqueAccion.js';

export default function App() {
  useManufactura();
  const rol = rolActual();
  const [pagina, setPagina] = useState('productos');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [errorRol, setErrorRol] = useState('');
  const paginaActual = puedeAcceder(pagina) ? pagina : ROLES[rol].inicio;
  const destinoPagina = useEnfoqueAccion(`${rol}-${paginaActual}`, false);
  const menu = [
    ['resumen', 'Panel de producción'],
    ['productos', 'Productos y materiales'],
    ['etapas', 'Etapas y rutas'],
    ['ordenes', 'Órdenes de producción'],
    ['recepciones', 'Recepción de materiales'],
    ['recursos', 'Máquinas y equipamiento'],
    ['referencias', 'Catálogos de referencia', '↗'],
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
        <div className="sidebar-heading">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">M</span>
            <div>
              <b>Manufactura</b>
              <small>ERP BASE · GRUPO 23</small>
            </div>
          </div>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuAbierto}
            aria-controls="menu-manufactura"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
          >
            Menú
          </button>
        </div>
        <p className="nav-label">ESPACIO DE TRABAJO</p>
        <nav
          id="menu-manufactura"
          aria-label="Navegación de Manufactura"
          data-abierto={menuAbierto}
        >
          {menu.filter(([id]) => puedeAcceder(id)).map(([id, label, icono]) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-current={paginaActual === id ? 'page' : undefined}
              className={`nav-item transition-all duration-200 ${
                paginaActual === id ? 'nav-activo' : ''
              }`}
              onClick={() => {
                setPagina(id);
                setMenuAbierto(false);
              }}
            >
              {label}
              {icono && <span aria-hidden="true">{icono}</span>}
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
          <div className="rol-selector">
            <label htmlFor="rol-manufactura">Rol de demostración</label>
            <select
              id="rol-manufactura"
              value={rol}
              onChange={(event) => {
                const nuevoRol = event.target.value;
                const resultado = cambiarRol(nuevoRol);
                setErrorRol(resultado.errores?.general || '');
                if (!resultado.errores) {
                  setPagina(ROLES[nuevoRol].inicio);
                  setMenuAbierto(false);
                }
              }}
            >
              {Object.entries(ROLES).map(([id, perfil]) => (
                <option key={id} value={id}>{perfil.nombre}</option>
              ))}
            </select>
          </div>
        </div>
        <main ref={destinoPagina} tabIndex={-1} id="contenido" className="manufactura-app" key={`${rol}-${paginaActual}`}>
          {errorRol && <p className="error" role="alert">{errorRol}</p>}
          <p className="rol-perspectiva">{ROLES[rol].descripcion}</p>
          <div className="deshacer-global">
            <span>Último cambio guardado</span>
            <DeshacerCambios />
          </div>
          {paginas[paginaActual]}
        </main>
        <footer className="workspace-footer">
          Grupo 23 · Modelación de Sistemas{' '}
          <span>Productos · Procesos · Personas</span>
        </footer>
      </div>
    </div>
  );
}
