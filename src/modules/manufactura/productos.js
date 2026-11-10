import { guardarCambios, listar, fallo } from './almacenamiento.js';
import { referencia } from './validacion.js';

export const PRODUCTO_STORAGE_KEY = 'manufactura:productos';
export const PRODUCTO_MATERIAL_STORAGE_KEY = 'manufactura:producto_material';

export const PRODUCTO_CAMPOS = ['producto_id', 'nombre', 'tipo'];
export const PRODUCTO_MATERIAL_CAMPOS = [
  'prod_mat_id',
  'producto_id',
  'material_id',
  'cantidad_por_unidad',
];

function leerLista(clave) {
  try {
    const contenido = window.localStorage.getItem(clave);
    const datos = contenido ? JSON.parse(contenido) : [];
    return Array.isArray(datos)
      ? datos.filter((dato) => dato && typeof dato === 'object')
      : [];
  } catch {
    return [];
  }
}

function siguienteId(lista, campo) {
  return (
    lista.reduce((maximo, item) => {
      const valor = Number(item[campo]);
      return Number.isFinite(valor) && valor > maximo ? valor : maximo;
    }, 0) + 1
  );
}

export function obtenerProductos() {
  return leerLista(PRODUCTO_STORAGE_KEY);
}

export function obtenerProductoMaterial(producto_id) {
  return leerLista(PRODUCTO_MATERIAL_STORAGE_KEY).filter(
    (registro) => Number(registro.producto_id) === Number(producto_id),
  );
}

export function validarProducto({ nombre, tipo }) {
  const errores = {};
  if (!nombre || !String(nombre).trim()) {
    errores.nombre = 'El nombre es obligatorio.';
  }
  if (!tipo || !String(tipo).trim()) {
    errores.tipo = 'El tipo es obligatorio.';
  }
  return errores;
}

export function validarMaterialProducto({ material_id, cantidad_por_unidad }) {
  const errores = {};
  const materialVacio =
    material_id === '' || material_id === null || material_id === undefined;
  const cantidadVacia =
    cantidad_por_unidad === '' ||
    cantidad_por_unidad === null ||
    cantidad_por_unidad === undefined;

  if (materialVacio) {
    errores.material_id = 'El material es obligatorio.';
  } else if (
    !Number.isInteger(Number(material_id)) ||
    Number(material_id) <= 0
  ) {
    errores.material_id = 'El material debe ser un identificador válido.';
  }

  if (cantidadVacia) {
    errores.cantidad_por_unidad = 'La cantidad por unidad es obligatoria.';
  } else if (
    !Number.isFinite(Number(cantidad_por_unidad)) ||
    Number(cantidad_por_unidad) <= 0
  ) {
    errores.cantidad_por_unidad =
      'La cantidad por unidad debe ser mayor que 0.';
  }

  if (!errores.material_id)
    referencia(
      errores,
      { material_id },
      'material_id',
      'materiales',
      'un material',
    );
  return errores;
}

export function crearProducto(
  { nombre, tipo, materiales = [] },
  productoId = null,
) {
  const erroresProducto = validarProducto({ nombre, tipo });
  if (Object.keys(erroresProducto).length > 0) {
    return { producto: null, errores: erroresProducto };
  }

  const erroresMateriales = [];
  const incluidos = new Set();
  materiales.forEach((material, indice) => {
    const errores = validarMaterialProducto(material);
    if (incluidos.has(Number(material.material_id)))
      errores.material_id = 'Este material ya está incluido.';
    incluidos.add(Number(material.material_id));
    if (Object.keys(errores).length > 0) {
      erroresMateriales.push({ indice, errores });
    }
  });

  if (erroresMateriales.length > 0) {
    return { producto: null, errores: { materiales: erroresMateriales } };
  }

  const productos = leerLista(PRODUCTO_STORAGE_KEY);
  const previo = productos.find(
    (p) => Number(p.producto_id) === Number(productoId),
  );
  if (productoId != null && !previo) return fallo('El producto ya no existe.');
  const producto = {
    ...previo,
    producto_id: previo?.producto_id ?? siguienteId(productos, 'producto_id'),
    nombre: String(nombre).trim(),
    tipo: String(tipo).trim(),
  };

  const anteriores = leerLista(PRODUCTO_MATERIAL_STORAGE_KEY);
  const relaciones = anteriores.filter(
    (r) => Number(r.producto_id) !== Number(producto.producto_id),
  );
  let siguienteProdMat = siguienteId(anteriores, 'prod_mat_id');

  materiales.forEach((material) => {
    relaciones.push({
      prod_mat_id:
        anteriores.find(
          (r) =>
            Number(r.producto_id) === Number(producto.producto_id) &&
            Number(r.material_id) === Number(material.material_id),
        )?.prod_mat_id ?? siguienteProdMat,
      producto_id: producto.producto_id,
      material_id: Number(material.material_id),
      cantidad_por_unidad: Number(material.cantidad_por_unidad),
    });
    siguienteProdMat += 1;
  });

  const resultado = guardarCambios({
    productos: previo
      ? productos.map((p) =>
          Number(p.producto_id) === Number(productoId) ? producto : p,
        )
      : [...productos, producto],
    producto_material: relaciones,
  });
  return { ...resultado, producto: resultado.errores ? null : producto };
}

export const actualizarProducto = (id, datos) => crearProducto(datos, id);

export function eliminarProducto(producto_id) {
  const id = Number(producto_id);
  if (listar('ordenes').some((o) => Number(o.producto_id) === id))
    return fallo(
      'El producto tiene órdenes asociadas. Conserva su historial; no se puede eliminar.',
    );
  return guardarCambios({
    productos: obtenerProductos().filter((p) => Number(p.producto_id) !== id),
    producto_material: leerLista(PRODUCTO_MATERIAL_STORAGE_KEY).filter(
      (r) => Number(r.producto_id) !== id,
    ),
    rutas: listar('rutas').filter((r) => Number(r.producto_id) !== id),
  });
}
