import { fallo, guardarCambios, listar, siguienteId, tablas } from './almacenamiento.js';
import { FECHA_BASE_DEMO } from './demo-peluches.js';
import { estaciones, proveedores } from './peluches-ejemplo.js';
import { obtenerReferencias } from './referencias.js';
import { puedeModificarTabla } from './roles.js';

export const NOMBRE_OSO_CASCABEL = 'Oso Bruno con cascabel de 30 cm';
export const ejemploOsoCascabelCargado = () =>
  !!listar('demo_peluches')[0]?.ejemplos?.oso_cascabel;

export const COMPOSICION_OSO_CASCABEL = [
  ['Felpa marrón de pelo corto', 'metro', 0.32, 'textiles'],
  ['Tela de algodón para detalles', 'metro', 0.06, 'textiles'],
  ['Fibra de poliéster siliconada', 'kilogramo', 0.19, 'rellenos'],
  ['Hilo de poliéster para costura', 'metro', 13, 'hilos'],
  ['Hilo para bordado de caras', 'metro', 2, 'hilos'],
  ['Ojos plásticos de 12 mm con arandela', 'unidad', 2, 'accesorios'],
  ['Cascabel para peluche', 'unidad', 1, 'accesorios'],
  ['Bolsillo textil protector para cascabel', 'unidad', 1, 'textiles'],
  ['Bolsa kraft termosellable para peluche', 'unidad', 1, 'embalajes'],
];

const rutaEjemplo = ['corte', 'bordado', 'costura', 'cascabel', 'relleno', 'control', 'sonido', 'empaque'];
const etapasAdicionales = {
  cascabel: {
    etapa: 'Montaje y fijación del cascabel interior', tipo: 'Ensamblaje', minutos: 25,
    trabajador: estaciones.costura.trabajador,
    maquina: estaciones.costura.maquina,
  },
  sonido: {
    etapa: 'Prueba de sonido y fijación del cascabel', tipo: 'Control de calidad', minutos: 15,
    trabajador: estaciones.control.trabajador,
  },
};

const normalizar = (valor) => String(valor || '').trim().toLocaleLowerCase('es');
const mismoNombre = (a, b) => normalizar(a) === normalizar(b);
function fechaRelativa(dias) {
  const fecha = new Date(`${FECHA_BASE_DEMO}T12:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}
const hora = (minutos) => `${fechaRelativa(1)}T${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;

// Amplía la fábrica una sola vez. La composición, ruta, orden, entregas y
// pedidos se guardan juntos; no se reemplazan los cinco modelos originales.
export function agregarEjemploOsoCascabel() {
  if (ejemploOsoCascabelCargado()) return { errores: null, cargada: false };
  const fabrica = listar('demo_peluches')[0];
  if (!fabrica) return fallo('Carga primero la fábrica de peluches para añadir el oso con cascabel.');
  if (!puedeModificarTabla('demo_peluches')) return fallo('Solo Supervisor puede añadir este ejemplo completo.');
  if (listar('productos').some((producto) => mismoNombre(producto.nombre, NOMBRE_OSO_CASCABEL))) {
    return fallo('Ya existe un producto con el nombre del oso con cascabel. No se modificaron sus datos.');
  }
  const locales = listar('locales').slice(0, 5);
  if (locales.length < 5) return fallo('Se necesitan los cinco locales de la fábrica para crear los pedidos del oso con cascabel.');

  const nombresTablas = ['productos', 'producto_material', 'materiales_locales', 'etapas', 'rutas', 'ordenes', 'ejecuciones', 'recepciones', 'pedidos'];
  const cambios = Object.fromEntries(nombresTablas.map((tabla) => [tabla, listar(tabla)]));
  const ids = Object.fromEntries(nombresTablas.filter((tabla) => tablas[tabla]).map((tabla) => [tabla, siguienteId(tabla)]));
  const agregar = (tabla, datos) => {
    const registro = { ...datos, [tablas[tabla]]: ids[tabla]++ };
    cambios[tabla].push(registro);
    return registro;
  };
  const materiales = obtenerReferencias('materiales');
  const todosProveedores = obtenerReferencias('proveedores');
  const trabajadores = obtenerReferencias('trabajadores');
  const maquinas = listar('maquinas');
  let materialId = cambios.materiales_locales.reduce((minimo, material) => Math.min(minimo, Number(material.material_id) || 0), 0) - 1;
  const composicion = [];
  for (const [nombre, unidad, cantidad, origen] of COMPOSICION_OSO_CASCABEL) {
    const suministrador = todosProveedores.find((registro) => mismoNombre(registro.razon_social, proveedores[origen]));
    if (!suministrador) return fallo(`No se encontró ${proveedores[origen]}. No se añadieron registros incompletos.`);
    const mismoMaterial = materiales.find((material) => mismoNombre(material.nombre, nombre));
    if (mismoMaterial && !mismoNombre(mismoMaterial.unidad, unidad)) {
      return fallo(`El material «${nombre}» usa otra unidad de medida. No se modificaron sus datos.`);
    }
    const material = mismoMaterial || { material_id: materialId--, nombre, unidad };
    if (!mismoMaterial) cambios.materiales_locales.push(material);
    composicion.push({ material_id: material.material_id, cantidad_por_unidad: cantidad, proveedor_id: suministrador.proveedor_id });
  }

  const pasos = [];
  for (const clave of rutaEjemplo) {
    const configuracion = etapasAdicionales[clave] || estaciones[clave];
    const trabajador = trabajadores.find((registro) => mismoNombre(registro.nombre, configuracion.trabajador));
    const maquina = configuracion.maquina && maquinas.find((registro) => mismoNombre(registro.nombre, configuracion.maquina[1]));
    if (!trabajador || (configuracion.maquina && !maquina)) {
      return fallo(`Faltan recursos de «${configuracion.etapa}». No se añadieron registros incompletos.`);
    }
    if (maquina && ['Fuera de servicio', 'En mantenimiento'].includes(maquina.estado)) {
      return fallo(`La máquina «${maquina.nombre}» no está disponible para el ejemplo.`);
    }
    const etapa = cambios.etapas.find((registro) => mismoNombre(registro.nombre, configuracion.etapa)) || agregar('etapas', {
      nombre: configuracion.etapa, tipo: configuracion.tipo, tiempo_estandar_min: configuracion.minutos,
    });
    pasos.push({ etapa_id: etapa.etapa_id, trabajador_id: trabajador.trabajador_id, maquina_id: maquina?.maquina_id ?? null });
  }

  const producto = agregar('productos', { nombre: NOMBRE_OSO_CASCABEL, tipo: 'Peluche con accesorio sonoro' });
  const orden = agregar('ordenes', {
    producto_id: producto.producto_id, cantidad_plan: 64, estado: 'En producción',
    fecha_inicio: fechaRelativa(1), fecha_fin: fechaRelativa(4),
  });
  for (const material of composicion) {
    agregar('producto_material', { producto_id: producto.producto_id, material_id: material.material_id, cantidad_por_unidad: material.cantidad_por_unidad });
    agregar('recepciones', {
      orden_id: orden.orden_id, material_id: material.material_id, proveedor_id: material.proveedor_id,
      cantidad_recibida: Math.round(material.cantidad_por_unidad * 64 * 1000) / 1000,
      fecha_recepcion: fechaRelativa(0),
    });
  }
  let inicio = 8 * 60;
  const tiempos = [48, 62, 92, 24];
  pasos.forEach((paso, indice) => {
    agregar('rutas', { producto_id: producto.producto_id, etapa_id: paso.etapa_id, secuencia: indice + 1 });
    if (indice >= tiempos.length) return;
    const duracion = tiempos[indice];
    agregar('ejecuciones', { ...paso, orden_id: orden.orden_id, inicio_real: hora(inicio), fin_real: hora(inicio + duracion), tiempo_uso_min: duracion });
    inicio += duracion + 15;
  });
  const codigos = new Set(cambios.pedidos.map((pedido) => normalizar(pedido.codigo)));
  const cantidades = [16, 12, 10, 14, 12];
  locales.forEach((local, indice) => {
    let codigo = `PED-${String(ids.pedidos).padStart(4, '0')}`;
    while (codigos.has(normalizar(codigo))) codigo = `PED-${String(++ids.pedidos).padStart(4, '0')}`;
    codigos.add(normalizar(codigo));
    agregar('pedidos', { codigo, producto_id: producto.producto_id, local_id: local.local_id, cantidad: cantidades[indice], orden_id: orden.orden_id });
  });
  cambios.demo_peluches = [{ ...fabrica, ejemplos: { ...fabrica.ejemplos, oso_cascabel: { version: 1, producto_id: producto.producto_id, orden_id: orden.orden_id } } }];
  const resultado = guardarCambios(cambios);
  return { ...resultado, cargada: !resultado.errores, producto: resultado.errores ? null : producto };
}
