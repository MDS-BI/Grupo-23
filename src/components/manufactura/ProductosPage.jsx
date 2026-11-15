import { useState, useMemo } from 'react';
import { filtrarProductos } from '../../utils/filtrosManufactura.js';
import BarraFiltros from './BarraFiltros.jsx';
import { useProductos } from '../../hooks/useProductos.js';
import ProductoList from './ProductoList.jsx';
import ProductoForm from './ProductoForm.jsx';
import ProductoDetalle from './ProductoDetalle.jsx';
import { obtenerProductoMaterial } from '../../modules/manufactura/productos.js';

export default function ProductosPage() {
  const { productos, crear, actualizar, eliminar } = useProductos();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [edicion, setEdicion] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [busquedaNombre, setBusquedaNombre] = useState('');

  const productosFiltrados = useMemo(() => {
    return filtrarProductos(productos, busquedaNombre);
  }, [productos, busquedaNombre]);

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
          <span className="eyebrow">HU1 · Catálogo de fabricación</span>
          <h1 className="text-2xl font-semibold text-slate-900">Productos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona los productos y los materiales requeridos para fabricarlos.
          </p>
        </div>
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
      </header>

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
