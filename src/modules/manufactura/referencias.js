import { guardarCambios, listar } from './almacenamiento.js';

// Las muestras siguen disponibles hasta conectar los catálogos de los otros módulos.
const muestras = {
  materiales: [
    { material_id: 1, nombre: 'Tablero de madera', unidad: 'unidad' },
    { material_id: 2, nombre: 'Tornillos', unidad: 'unidad' },
    { material_id: 3, nombre: 'Pintura', unidad: 'litro' },
  ],
  repuestos: [
    { repuesto_id: 1, nombre: 'Rodamiento' },
    { repuesto_id: 2, nombre: 'Correa de transmisión' },
    { repuesto_id: 3, nombre: 'Disco de corte' },
  ],
  trabajadores: [
    { trabajador_id: 1, nombre: 'Operador de muestra' },
    { trabajador_id: 2, nombre: 'Técnico de muestra' },
    { trabajador_id: 3, nombre: 'Encargado de muestra' },
  ],
  proveedores: [
    { proveedor_id: 1, razon_social: 'Proveedor de materiales de muestra' },
    { proveedor_id: 2, razon_social: 'Proveedor industrial de muestra' },
  ],
};
let proveedor = null;
export function configurarReferencias(adaptador) {
  proveedor = adaptador;
}
export function obtenerReferencias(tipo) {
  const lista = proveedor ? proveedor(tipo) : muestras[tipo];
  const catalogo = Array.isArray(lista) ? lista.map((r) => ({ ...r })) : [];
  if (tipo === 'materiales') {
    const externos = catalogo.filter(({ material_id }) => {
      const id = Number(material_id);
      return Number.isSafeInteger(id) && id > 0;
    });
    return [...externos, ...listar('materiales_locales')];
  }
  return catalogo;
}

const compararNombres = new Intl.Collator('es', { sensitivity: 'base' });
const limpiarTexto = (valor) =>
  String(valor ?? '')
    .trim()
    .replace(/\s+/g, ' ');

export function registrarMaterialLocal(datos) {
  const nombre = limpiarTexto(datos.nombre);
  const unidad = limpiarTexto(datos.unidad);
  const errores = {};
  if (!nombre) errores.nombre = 'Escribe el nombre del material.';
  if (!unidad) errores.unidad = 'Escribe una unidad de medida.';
  if (
    nombre &&
    obtenerReferencias('materiales').some(
      (material) =>
        compararNombres.compare(limpiarTexto(material.nombre), nombre) === 0,
    )
  ) {
    errores.nombre =
      'Ya existe un material con ese nombre. Selecciónalo en la lista.';
  }
  if (Object.keys(errores).length) return { registro: null, errores };

  const locales = listar('materiales_locales');
  // Los identificadores locales son negativos para reservar los positivos al catálogo externo.
  const materialId =
    locales.reduce((menor, material) => {
      const id = Number(material.material_id);
      return Number.isSafeInteger(id) ? Math.min(menor, id) : menor;
    }, 0) - 1;
  const registro = { material_id: materialId, nombre, unidad };
  const resultado = guardarCambios({
    materiales_locales: [...locales, registro],
  });
  return { ...resultado, registro: resultado.errores ? null : registro };
}

export const usandoReferenciasDeMuestra = () => proveedor === null;
export const nombreReferencia = (tipo, id) => {
  const campo = {
    materiales: 'material_id',
    repuestos: 'repuesto_id',
    trabajadores: 'trabajador_id',
    proveedores: 'proveedor_id',
  }[tipo];
  const registro = obtenerReferencias(tipo).find(
    (r) => Number(r[campo]) === Number(id),
  );
  return (
    registro?.nombre ||
    registro?.razon_social ||
    (id ? `Referencia #${id}` : 'Sin asignar')
  );
};
