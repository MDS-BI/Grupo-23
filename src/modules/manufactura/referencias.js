// Adaptador de los módulos externos. Las muestras permiten probar el MVP sin crear catálogos propios.
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
  return Array.isArray(lista) ? lista.map((r) => ({ ...r })) : [];
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
