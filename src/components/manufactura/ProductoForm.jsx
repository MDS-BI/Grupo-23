import { useState } from 'react';
import {
  validarProducto,
  validarMaterialProducto,
} from '../../modules/manufactura/productos.js';

const FORMULARIO_VACIO = { nombre: '', tipo: '' };
const MATERIAL_VACIO = { material_id: '', cantidad_por_unidad: '' };

export default function ProductoForm({ onSubmit, onCancel }) {
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [material, setMaterial] = useState(MATERIAL_VACIO);
  const [materiales, setMateriales] = useState([]);
  const [erroresProducto, setErroresProducto] = useState({});
  const [erroresMaterial, setErroresMaterial] = useState({});

  const handleCambioProducto = (evento) => {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    setErroresProducto((actual) => ({ ...actual, [name]: undefined }));
  };

  const handleCambioMaterial = (evento) => {
    const { name, value } = evento.target;
    setMaterial((actual) => ({ ...actual, [name]: value }));
    setErroresMaterial((actual) => ({ ...actual, [name]: undefined }));
  };

  const agregarMaterial = () => {
    const errores = validarMaterialProducto(material);
    if (Object.keys(errores).length > 0) {
      setErroresMaterial(errores);
      return;
    }

    setMateriales((actual) => [
      ...actual,
      {
        material_id: Number(material.material_id),
        cantidad_por_unidad: Number(material.cantidad_por_unidad),
      },
    ]);
    setMaterial(MATERIAL_VACIO);
    setErroresMaterial({});
  };

  const quitarMaterial = (indice) => {
    setMateriales((actual) => actual.filter((_, posicion) => posicion !== indice));
  };

  const limpiarFormulario = () => {
    setFormulario(FORMULARIO_VACIO);
    setMaterial(MATERIAL_VACIO);
    setMateriales([]);
    setErroresProducto({});
    setErroresMaterial({});
  };

  const handleSubmit = (evento) => {
    evento.preventDefault();

    const errores = validarProducto(formulario);
    if (Object.keys(errores).length > 0) {
      setErroresProducto(errores);
      return;
    }

    const resultado = onSubmit?.({ ...formulario, materiales });
    if (resultado?.errores) {
      setErroresProducto(resultado.errores);
      return;
    }

    limpiarFormulario();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      noValidate
    >
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-slate-900">Datos del producto</h3>

        <div>
          <label
            htmlFor="nombre"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={formulario.nombre}
            onChange={handleCambioProducto}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            placeholder="Nombre del producto"
          />
          {erroresProducto.nombre && (
            <p className="mt-1 text-sm text-red-600">{erroresProducto.nombre}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="tipo"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Tipo
          </label>
          <input
            id="tipo"
            name="tipo"
            type="text"
            value={formulario.tipo}
            onChange={handleCambioProducto}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            placeholder="Tipo del producto"
          />
          {erroresProducto.tipo && (
            <p className="mt-1 text-sm text-red-600">{erroresProducto.tipo}</p>
          )}
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-200 pt-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Materiales</h3>
          <p className="mt-1 text-sm text-slate-500">
            Agrega los materiales requeridos y la cantidad por unidad.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label
              htmlFor="material_id"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Material (ID)
            </label>
            <input
              id="material_id"
              name="material_id"
              type="number"
              min="1"
              step="1"
              value={material.material_id}
              onChange={handleCambioMaterial}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="Ej. 1"
            />
            {erroresMaterial.material_id && (
              <p className="mt-1 text-sm text-red-600">{erroresMaterial.material_id}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="cantidad_por_unidad"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Cantidad por unidad
            </label>
            <input
              id="cantidad_por_unidad"
              name="cantidad_por_unidad"
              type="number"
              min="0"
              step="any"
              value={material.cantidad_por_unidad}
              onChange={handleCambioMaterial}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="Ej. 2.5"
            />
            {erroresMaterial.cantidad_por_unidad && (
              <p className="mt-1 text-sm text-red-600">
                {erroresMaterial.cantidad_por_unidad}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={agregarMaterial}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Agregar
          </button>
        </div>

        {materiales.length > 0 && (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {materiales.map((registro, indice) => (
              <li
                key={`${registro.material_id}-${indice}`}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <span className="text-sm text-slate-700">
                  Material <span className="font-mono">{registro.material_id}</span>
                  <span className="mx-2 text-slate-300">|</span>
                  Cantidad por unidad:{' '}
                  <span className="font-medium">{registro.cantidad_por_unidad}</span>
                </span>
                <button
                  type="button"
                  onClick={() => quitarMaterial(indice)}
                  className="text-sm font-medium text-red-600 transition hover:text-red-700"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Guardar producto
        </button>
      </div>
    </form>
  );
}
