export const ROLES = {
  supervisor: {
    nombre: 'Supervisor',
    paginas: ['resumen', 'productos', 'etapas', 'ordenes', 'recepciones', 'recursos', 'referencias'],
    inicio: 'productos',
    tablas: [
      'productos', 'producto_material', 'materiales_locales', 'etapas', 'rutas',
      'ordenes', 'ejecuciones', 'recepciones', 'maquinas', 'mantenimientos',
      'mantenimiento_repuestos', 'equipamiento', 'asignaciones', 'demo_peluches',
      'locales', 'pedidos', 'pedidos_demo',
    ],
    descripcion: 'Supervisa producción, insumos y recursos de planta.',
  },
  planificacion: {
    nombre: 'Planificación',
    paginas: ['productos', 'etapas', 'ordenes'],
    inicio: 'productos',
    tablas: ['productos', 'producto_material', 'materiales_locales', 'etapas', 'rutas', 'ordenes', 'pedidos'],
    descripcion: 'Define productos, rutas y órdenes de fabricación.',
  },
  ensamble: {
    nombre: 'Ensamble',
    paginas: ['ordenes'],
    inicio: 'ordenes',
    tablas: ['ejecuciones'],
    descripcion: 'Registra el inicio y fin de las etapas de ensamblaje.',
  },
  bodega: {
    nombre: 'Bodega',
    paginas: ['recepciones'],
    inicio: 'recepciones',
    tablas: ['recepciones'],
    descripcion: 'Registra las entregas de materiales para cada orden.',
  },
  mantenimiento: {
    nombre: 'Mantenimiento',
    paginas: ['recursos'],
    inicio: 'recursos',
    tablas: ['maquinas', 'mantenimientos', 'mantenimiento_repuestos', 'equipamiento', 'asignaciones'],
    descripcion: 'Gestiona máquinas, intervenciones y equipamiento.',
  },
};

export function rolActual() {
  try {
    const rol = window.localStorage.getItem('manufactura:rol');
    if (rol === null) return 'supervisor';
    return Object.hasOwn(ROLES, rol) ? rol : 'ensamble';
  } catch {
    return 'ensamble';
  }
}

export function cambiarRol(rol) {
  if (!Object.hasOwn(ROLES, rol)) {
    return { errores: { general: 'Selecciona un rol válido.' } };
  }
  try {
    window.localStorage.setItem('manufactura:rol', rol);
    window.dispatchEvent(new Event('manufactura:cambio'));
    return { errores: null };
  } catch {
    return { errores: { general: 'No se pudo guardar el rol en este navegador.' } };
  }
}

export const puedeAcceder = (pagina) => ROLES[rolActual()].paginas.includes(pagina);
export const puedeModificarTabla = (tabla) => ROLES[rolActual()].tablas.includes(tabla);
export const esEtapaEnsamble = (etapa) =>
  ['ensamble', 'ensamblaje'].includes(String(etapa?.tipo ?? '').trim().toLocaleLowerCase('es'));
