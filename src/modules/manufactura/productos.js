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
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function guardarLista(clave, lista) {
  window.localStorage.setItem(clave, JSON.stringify(lista));
}

function siguienteId(lista, campo) {
  return lista.reduce((maximo, item) => {
    const valor = Number(item[campo]);
    return Number.isFinite(valor) && valor > maximo ? valor : maximo;
  }, 0) + 1;
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
  const materialVacio = material_id === '' || material_id === null || material_id === undefined;
  const cantidadVacia =
    cantidad_por_unidad === '' || cantidad_por_unidad === null || cantidad_por_unidad === undefined;

  if (materialVacio) {
    errores.material_id = 'El material es obligatorio.';
  } else if (!Number.isInteger(Number(material_id)) || Number(material_id) <= 0) {
    errores.material_id = 'El material debe ser un identificador válido.';
  }

  if (cantidadVacia) {
    errores.cantidad_por_unidad = 'La cantidad por unidad es obligatoria.';
  } else if (Number.isNaN(Number(cantidad_por_unidad)) || Number(cantidad_por_unidad) <= 0) {
    errores.cantidad_por_unidad = 'La cantidad por unidad debe ser mayor que 0.';
  }

  return errores;
}

export function crearProducto({ nombre, tipo, materiales = [] }) {
  const erroresProducto = validarProducto({ nombre, tipo });
  if (Object.keys(erroresProducto).length > 0) {
    return { producto: null, errores: erroresProducto };
  }

  const erroresMateriales = [];
  materiales.forEach((material, indice) => {
    const errores = validarMaterialProducto(material);
    if (Object.keys(errores).length > 0) {
      erroresMateriales.push({ indice, errores });
    }
  });

  if (erroresMateriales.length > 0) {
    return { producto: null, errores: { materiales: erroresMateriales } };
  }

  const productos = leerLista(PRODUCTO_STORAGE_KEY);
  const producto = {
    producto_id: siguienteId(productos, 'producto_id'),
    nombre: String(nombre).trim(),
    tipo: String(tipo).trim(),
  };

  const relaciones = leerLista(PRODUCTO_MATERIAL_STORAGE_KEY);
  let siguienteProdMat = siguienteId(relaciones, 'prod_mat_id');

  materiales.forEach((material) => {
    relaciones.push({
      prod_mat_id: siguienteProdMat,
      producto_id: producto.producto_id,
      material_id: Number(material.material_id),
      cantidad_por_unidad: Number(material.cantidad_por_unidad),
    });
    siguienteProdMat += 1;
  });

  guardarLista(PRODUCTO_STORAGE_KEY, [...productos, producto]);
  guardarLista(PRODUCTO_MATERIAL_STORAGE_KEY, relaciones);

  return { producto, errores: null };
}

export function eliminarProducto(producto_id) {
  const id = Number(producto_id);
  guardarLista(
    PRODUCTO_STORAGE_KEY,
    leerLista(PRODUCTO_STORAGE_KEY).filter((producto) => Number(producto.producto_id) !== id),
  );
  guardarLista(
    PRODUCTO_MATERIAL_STORAGE_KEY,
    leerLista(PRODUCTO_MATERIAL_STORAGE_KEY).filter(
      (registro) => Number(registro.producto_id) !== id,
    ),
  );
}
