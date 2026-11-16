import { useState, useMemo } from 'react';
import { filtrarProductos } from '../../utils/filtrosManufactura.js';
import BarraFiltros from './BarraFiltros.jsx';
import { useProductos } from '../../hooks/useProductos.js';
import ProductoList from './ProductoList.jsx';
import ProductoForm from './ProductoForm.jsx';
import ProductoDetalle from './ProductoDetalle.jsx';
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
    <section className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow">Catálogo de fabricación</span>
          <h1 className="text-2xl font-semibold text-slate-900">Productos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona los productos y los materiales requeridos para fabricarlos.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMostrarGuia((actual) => !actual)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {mostrarGuia ? 'Ocultar guía' : '💡 ¿Cómo registrar?'}
          </button>
          <button
            type="button"
            onClick={() => {
              setEdicion(null);
              setMostrarFormulario((actual) => !actual);
            }}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {mostrarFormulario ? 'Cerrar formulario' : 'Nuevo producto'}
          </button>
        </div>
      </header>

      {!demoPeluchesCargada() && !mostrarFormulario && (
        <article className="card">
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
          <div className="row-actions">
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

      {/* Cuadro de ejemplo y orientación para el usuario */}
      {mostrarGuia && (
        <article className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 text-sm text-blue-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-blue-950 flex items-center gap-2">
              📖 Guía rápida: Registro de Productos y Materiales
            </h3>
            <button 
              onClick={() => setMostrarGuia(false)}
              className="text-blue-700 hover:text-blue-900 text-xs font-semibold"
            >
              ✕ Cerrar
            </button>
          </div>
          <p className="text-blue-800">
            Sigue estos pasos para dar de alta un producto correctamente en el sistema:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-blue-800">
            <li><strong>Nombre:</strong> Ingresa el nombre comercial o técnico del artículo (Ej. <em>Taladro Industrial A1</em>).</li>
            <li><strong>Tipo:</strong> Define la categoría o línea de fabricación (Ej. <em>Ensamblaje</em> o <em>Pieza mecanizada</em>).</li>
            <li><strong>Materiales:</strong> Selecciona los insumos requeridos desde el inventario y especifica la cantidad exacta que consume por cada unidad fabricada (Ej. <em>Acero en barra - 2.5 unidades</em>). No olvides hacer clic en <strong>Agregar</strong> antes de guardar.</li>
            <li>
              <strong>Si un material falta:</strong> pulsa <strong>Añadir nuevo material</strong>.
              Por ejemplo, escribe <em>Memoria RAM de 8 GB</em>, usa <em>unidad</em>{' '}
              como medida y pulsa <strong>Guardar material</strong>. Para un computador
              que usa dos módulos, indica <strong>2</strong> y pulsa <strong>Agregar</strong>.
            </li>
          </ul>
        </article>
      )}

      {mensaje && <p role="status">{mensaje}</p>}

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
    
