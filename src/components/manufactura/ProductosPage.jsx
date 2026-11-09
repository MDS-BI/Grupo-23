import { useState } from 'react';
import { useProductos } from '../../hooks/useProductos.js';
import ProductoList from './ProductoList.jsx';
import ProductoForm from './ProductoForm.jsx';

export default function ProductosPage() {
  const { productos, crear, eliminar } = useProductos();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleCrear = (datos) => {
    const resultado = crear(datos);
    if (!resultado.errores) {
      setMostrarFormulario(false);
    }
    return resultado;
  };

  const handleEliminar = (producto) => {
    eliminar(producto.producto_id);
  };

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Productos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona los productos y los materiales requeridos para fabricarlos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMostrarFormulario((actual) => !actual)}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {mostrarFormulario ? 'Cerrar formulario' : 'Nuevo producto'}
        </button>
      </header>

      {mostrarFormulario && (
        <ProductoForm
          onSubmit={handleCrear}
          onCancel={() => setMostrarFormulario(false)}
        />
      )}

      <ProductoList productos={productos} onEliminar={handleEliminar} />
    </section>
  );
}
