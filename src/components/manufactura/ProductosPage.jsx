import { useState, useMemo } from 'react';
import { filtrarProductos } from '../../utils/filtrosManufactura.js';
import BarraFiltros from './BarraFiltros.jsx';
import { useProductos } from '../../hooks/useProductos.js';
import ProductoList from './ProductoList.jsx';
import ProductoForm from './ProductoForm.jsx';
import ProductoDetalle from './ProductoDetalle.jsx';
import portadaPeluches from '../../assets/manufactura/peluches-portada.jpg';
import { puedeModificarTabla } from '../../modules/manufactura/roles.js';
import DeshacerCambios from './DeshacerCambios.jsx';
import useEnfoqueAccion from '../../hooks/useEnfoqueAccion.js';
import { obtenerProductoMaterial } from '../../modules/manufactura/productos.js';
import {
  cargarDemoPeluches,
  demoPeluchesCargada,
  hayRegistrosManufactura,
} from '../../modules/manufactura/demo-peluches.js';

export default function ProductosPage() {
  const { productos, crear, actualizar, eliminar } = useProductos();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [edicion, setEdicion] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [errorDemo, setErrorDemo] = useState('');
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const confirmacion = useEnfoqueAccion(mensaje);

  const productosFiltrados = useMemo(() => {
    return filtrarProductos(productos, busquedaNombre);
  }, [productos, busquedaNombre]);

  const [mostrarGuia, setMostrarGuia] = useState(false);
  const hayRegistros = hayRegistrosManufactura();

  const cargarEjemplo = (reemplazar) => {
    if (
      reemplazar &&
      !window.confirm('¿Sustituir todos los registros de Manufactura de este navegador por el ejemplo de peluches?')
    ) return;

    const resultado = cargarDemoPeluches({ reemplazar });
    setErrorDemo(resultado.errores?.general || '');
    if (!resultado.errores) {
      setDetalle(null);
      setEdicion(null);
      setMostrarFormulario(false);
      setBusquedaNombre('');
      setMensaje('Fábrica de peluches cargada en este navegador.');
    }
  };

  const handleCrear = (datos) => {
    const resultado = edicion
      ? actualizar(edicion.producto_id, datos)
      : crear(datos);
    if (!resultado.errores) {
      setMostrarFormulario(false);
      setEdicion(null);
      setMensaje('Producto guardado.');
    }
    return resultado;
  };

  const handleEliminar = (producto) => {
    if (
      !window.confirm(
        `¿Eliminar el producto ${producto.nombre} y sus materiales y ruta?`,
      )
    )
      return;
    const resultado = eliminar(producto.producto_id);
    setMensaje(resultado.errores?.general || 'Producto eliminado.');
    if (!resultado.errores) setDetalle(null);
  };

  return (
    <section>
      <header className="catalogo-portada">
        <div className="catalogo-portada-contenido">
          <span className="eyebrow">Fábrica de peluches</span>
          <h1>Productos</h1>
          <p>
            Gestiona el catálogo de peluches y los materiales de cada modelo.
          </p>
          <div className="catalogo-acciones">
            <button
              type="button"
              className="primary"
              aria-expanded={mostrarFormulario}
              onClick={() => {
                setEdicion(null);
                setMostrarFormulario((actual) => !actual);
              }}
            >
              {mostrarFormulario ? 'Cerrar formulario' : 'Nuevo producto'}
            </button>
            <button
              type="button"
              aria-expanded={mostrarGuia}
              aria-controls={mostrarGuia ? 'guia-productos' : undefined}
              onClick={() => setMostrarGuia((actual) => !actual)}
            >
              {mostrarGuia ? 'Ocultar guía' : '¿Cómo registrar?'}
            </button>
          </div>
        </div>
        <div className="catalogo-portada-imagen">
          <img
            src={portadaPeluches}
            alt="Oso, dinosaurio y ajolote de peluche sobre pedestales de colores"
            width="1672"
            height="941"
            fetchPriority="high"
          />
        </div>
      </header>

      {puedeModificarTabla('demo_peluches') && !demoPeluchesCargada() && !mostrarFormulario && (
        <article className="card catalogo-demo">
          <h2>Fábrica de peluches de ejemplo</h2>
          <p className="muted">
            Carga cinco productos con sus materiales, proveedores, rutas,
            órdenes, recepciones y máquinas.
          </p>
          {hayRegistros && (
            <p className="muted" id="alcance-reemplazo-demo">
              Puedes conservar tus registros o sustituir todos los registros de
              Manufactura guardados en este navegador por los del ejemplo.
            </p>
          )}
          <div className="catalogo-acciones">
            <button
              className="primary"
              type="button"
              onClick={() => cargarEjemplo(false)}
            >
              {hayRegistros
                ? 'Añadir ejemplo a mis registros'
                : 'Cargar fábrica de peluches'}
            </button>
            {hayRegistros && (
              <button
                className="danger"
                type="button"
                aria-describedby="alcance-reemplazo-demo"
                onClick={() => cargarEjemplo(true)}
              >
                Sustituir registros por el ejemplo
              </button>
            )}
          </div>
          {errorDemo && (
            <p className="error" role="alert">{errorDemo}</p>
          )}
        </article>
      )}

      {mostrarGuia && (
        <article className="card catalogo-guia" id="guia-productos">
          <h2>Cómo registrar un producto</h2>
          <ol>
            <li>Escribe el nombre y el tipo. Puedes usar <em>Oso Bruno</em> y <em>Peluche clásico</em>.</li>
            <li>
              Selecciona un insumo e indica cuánto se usa por peluche. Por
              ejemplo, <strong>0,32 metros</strong> de felpa marrón. Pulsa
              {' '}<strong>Agregar</strong> para incluirlo.
            </li>
            <li>
              Para registrar otro insumo, pulsa <strong>Añadir nuevo material</strong>.
              Por ejemplo, escribe <em>Fieltro azul</em>, elige <em>metro</em>{' '}
              como unidad y pulsa <strong>Guardar material</strong>.
            </li>
          </ol>
        </article>
      )}

      {mensaje && <p ref={confirmacion} tabIndex={-1} className="notice" role="status">
        {mensaje} <DeshacerCambios />
      </p>}

      {mostrarFormulario && (
        <ProductoForm
          key={edicion?.producto_id || 'nuevo'}
          producto={edicion}
          materialesIniciales={
            edicion ? obtenerProductoMaterial(edicion.producto_id) : []
          }
          onSubmit={handleCrear}
          onCancel={() => setMostrarFormulario(false)}
        />
      )}
      <header className="catalogo-listado">
        <h2>Catálogo</h2>
        <span className="muted">
          {productosFiltrados.length}{' '}
          {productosFiltrados.length === 1 ? 'producto' : 'productos'}
        </span>
      </header>
      <BarraFiltros
        placeholderBusqueda="Buscar producto por nombre..."
        valorBusqueda={busquedaNombre}
        onChangeBusqueda={setBusquedaNombre}
        hayFiltrosActivos={busquedaNombre.trim() !== ''}
        onLimpiar={() => setBusquedaNombre('')}
      />
      <ProductoList
        productos={productosFiltrados}
        onEliminar={handleEliminar}
        onEditar={(producto) => {
          setEdicion(producto);
          setMensaje('');
          setMostrarFormulario(true);
          setDetalle(null);
        }}
        onDetalle={setDetalle}
      />

      {detalle && (
        <ProductoDetalle
          producto={productos.find(
            (p) => p.producto_id === detalle.producto_id,
          )}
          onCerrar={() => setDetalle(null)}
        />
      )}
    </section>
  );
}
    
