import { guardarCambios, listar, siguienteId } from './almacenamiento.js';

// Catálogos de respaldo textiles para un almacén sin la fábrica de ejemplo.
const muestras = {
  materiales: [
    { material_id: 1, nombre: 'Tela de felpa', unidad: 'metro' },
    { material_id: 2, nombre: 'Relleno de poliéster', unidad: 'kilogramo' },
    { material_id: 3, nombre: 'Ojos de seguridad', unidad: 'unidad' },
  ],
  repuestos: [
    { repuesto_id: 1, nombre: 'Aguja para máquina de coser' },
    { repuesto_id: 2, nombre: 'Prensatelas para felpa' },
    { repuesto_id: 3, nombre: 'Canilla para máquina de coser' },
  ],
  trabajadores: [
    { trabajador_id: 1, nombre: 'Operario de costura de peluches' },
    { trabajador_id: 2, nombre: 'Técnico de maquinaria textil' },
    { trabajador_id: 3, nombre: 'Encargado del taller de peluches' },
  ],
  proveedores: [
    { proveedor_id: 1, razon_social: 'Proveedor de telas y felpa' },
    { proveedor_id: 2, razon_social: 'Proveedor de accesorios para peluches' },
  ],
};
const relaciones = {
  materiales: ['material_id', [['producto_material', 'material_id'], ['recepciones', 'material_id']]],
  repuestos: ['repuesto_id', [['mantenimiento_repuestos', 'repuesto_id']]],
  trabajadores: ['trabajador_id', [['ejecuciones', 'trabajador_id'], ['mantenimientos', 'tecnico_id'], ['asignaciones', 'trabajador_id']]],
  proveedores: ['proveedor_id', [['recepciones', 'proveedor_id']]],
};

function muestrasEnUso(tipo) {
  const [campo, enlaces] = relaciones[tipo] || [];
  if (!campo) return [];
  const usados = new Set(enlaces.flatMap(([tabla, columna]) =>
    listar(tabla).map((registro) => Number(registro[columna])),
  ));
  return muestras[tipo].filter((registro) => usados.has(Number(registro[campo])));
}

let proveedor = null;
export function configurarReferencias(adaptador) {
  proveedor = adaptador;
}
export function obtenerReferencias(tipo) {
  const fabrica = listar('demo_peluches')[0];
  // La fábrica usa sus propios catálogos; los respaldos solo permanecen si
  // están referenciados por registros previos para conservar sus relaciones.
  const lista = proveedor ? proveedor(tipo) : fabrica ? muestrasEnUso(tipo) : muestras[tipo];
  const catalogo = Array.isArray(lista) ? lista.map((r) => ({ ...r })) : [];
  if (tipo === 'materiales') {
    const externos = catalogo.filter(({ material_id }) => {
      const id = Number(material_id);
      return Number.isSafeInteger(id) && id > 0;
    });
    return [...externos, ...listar('materiales_locales')];
  }
  const demo = fabrica?.[tipo];
  return Array.isArray(demo) ? [...catalogo, ...demo] : catalogo;
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
  const materialId = siguienteId('materiales_locales');
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
