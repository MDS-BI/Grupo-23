import { buscar, eliminarRegistro, fallo, guardarCambios, guardarRegistro, listar, siguienteId } from './almacenamiento.js';
import { MINIMO_PRODUCCION, validarOrden } from './ordenes.js';
import { numero, referencia, texto } from './validacion.js';
import { lotes } from './peluches-ejemplo.js';
import { analizarEliminacion } from './eliminacion.js';
import { puedeModificarTabla } from './roles.js';

export const obtenerPedidos = (productoId) => listar('pedidos')
  .filter((pedido) => Number(pedido.producto_id) === Number(productoId));
export const obtenerPedidosPendientes = (productoId) => obtenerPedidos(productoId)
  .filter((pedido) => !pedido.orden_id || buscar('ordenes', pedido.orden_id)?.estado === 'Cancelada');

export const obtenerPedidosDeOrden = (ordenId) => listar('pedidos')
  .filter((p) => Number(p.orden_id) === Number(ordenId));

export function resumenPedidosOrden(orden) {
  const pedidos = obtenerPedidosDeOrden(orden.orden_id);
  const asignadas = pedidos.reduce((total, p) => total + Number(p.cantidad), 0);
  return { pedidos, asignadas, disponibles: Number(orden.cantidad_plan) - asignadas,
    aceptaPedidos: orden.estado === 'Planificada' };
}

export function validarPedido(pedido) {
  const errores = {};
  texto(errores, pedido, 'codigo', 'El código de pedido');
  referencia(errores, pedido, 'producto_id', 'productos', 'un producto');
  referencia(errores, pedido, 'local_id', 'locales', 'un local');
  numero(errores, pedido, 'cantidad', 'La cantidad', { entero: true });
  if (listar('pedidos').some((otro) => Number(otro.pedido_id) !== Number(pedido.pedido_id) &&
    String(otro.codigo).toLocaleLowerCase() === String(pedido.codigo).trim().toLocaleLowerCase()))
    errores.codigo = 'Ya existe un pedido con ese código.';
  return errores;
}

export function guardarPedido(datos, id) {
  const anterior = id == null ? null : buscar('pedidos', id);
  if (anterior?.orden_id && buscar('ordenes', anterior.orden_id)?.estado !== 'Cancelada') {
    return fallo('El pedido ya está vinculado a una orden de producción.');
  }
  return guardarRegistro('pedidos', {
    ...datos,
    codigo: String(datos.codigo || '').trim(),
    producto_id: Number(datos.producto_id),
    local_id: Number(datos.local_id),
    cantidad: Number(datos.cantidad),
    orden_id: null,
  }, validarPedido, id);
}

export function eliminarPedido(id) {
  const estado = analizarEliminacion('pedidos', id);
  if (!estado.permitida) return fallo(estado.motivo);
  return eliminarRegistro('pedidos', id);
}

// Crear, editar y asignar usan una única transacción y conservan los mismos IDs.
export function guardarOrdenConPedidos(datos, pedidoIds = [], id = null, pedidosNuevos = []) {
  if (!puedeModificarTabla('ordenes') || !puedeModificarTabla('pedidos'))
    return fallo('Tu rol no permite planificar órdenes ni asignar pedidos.');
  const anterior = id == null ? null : buscar('ordenes', id);
  if (id != null && !anterior) return fallo('La orden ya no existe. Actualiza el listado.');
  if (!Array.isArray(pedidoIds) || !Array.isArray(pedidosNuevos)) return fallo('Revisa la selección de pedidos.');
  const seleccionados = new Set(pedidoIds.map(Number));
  if (seleccionados.size !== pedidoIds.length || [...seleccionados].some((p) => !Number.isSafeInteger(p) || p <= 0))
    return fallo('Selecciona cada pedido una sola vez.');
  const pedidos = listar('pedidos');
  const elegidos = pedidos.filter((p) => seleccionados.has(Number(p.pedido_id)));
  if (elegidos.length !== seleccionados.size || elegidos.some((p) =>
    Number(p.producto_id) !== Number(datos.producto_id) ||
    (p.orden_id && Number(p.orden_id) !== Number(id) && buscar('ordenes', p.orden_id)?.estado !== 'Cancelada')))
    return fallo('Los pedidos cambiaron, pertenecen a otro peluche o ya están asignados a otra orden. Revisa la selección.');
  const actuales = anterior ? obtenerPedidosDeOrden(id) : [];
  const cambiaAsignacion = pedidosNuevos.length > 0 || actuales.length !== seleccionados.size ||
    actuales.some((p) => !seleccionados.has(Number(p.pedido_id)));
  if (cambiaAsignacion && anterior && anterior.estado !== 'Planificada')
    return fallo('Solo se pueden cambiar los pedidos de una orden planificada. El lote queda cerrado a nuevos pedidos al empezar su producción.');
  if (cambiaAsignacion && !['Planificada', 'En producción'].includes(datos.estado))
    return fallo('Asigna los pedidos en planificación, antes de iniciar la producción o cerrar la orden.');
  const { pedido_ids, pedidos_nuevos, modo_asignacion, ...camposOrden } = datos;
  const orden = {
    ...anterior,
    ...camposOrden,
    orden_id: anterior?.orden_id ?? siguienteId('ordenes'),
    producto_id: Number(datos.producto_id),
    cantidad_plan: Number(datos.cantidad_plan),
  };
  let proximo = siguienteId('pedidos');
  const codigos = new Set();
  const nuevos = pedidosNuevos.map((p) => ({
    pedido_id: proximo++, codigo: String(p.codigo || '').trim(), local_id: Number(p.local_id),
    cantidad: Number(p.cantidad), producto_id: orden.producto_id, orden_id: orden.orden_id,
  }));
  for (const p of nuevos) {
    const error = validarPedido(p);
    const codigo = p.codigo.toLocaleLowerCase();
    if (Object.keys(error).length) return fallo(Object.values(error).join(' '));
    if (codigos.has(codigo)) return fallo('Los pedidos nuevos deben tener códigos diferentes.');
    codigos.add(codigo);
  }
  const total = [...elegidos, ...nuevos].reduce((suma, p) => suma + Number(p.cantidad), 0);
  if (!anterior && total < MINIMO_PRODUCCION)
    return { errores: { pedidos: 'Incluye pedidos por al menos 64 peluches del mismo modelo para crear esta orden.' } };
  const errores = validarOrden(orden, { cantidadPedidos: total });
  if (Object.keys(errores).length) return { errores };
  if (total > orden.cantidad_plan)
    return { errores: { pedidos: `Los pedidos suman ${total} peluches y el lote tiene ${orden.cantidad_plan}. Aumenta el lote o quita pedidos de la selección.` } };
  const resultado = guardarCambios({
    ordenes: anterior ? listar('ordenes').map((o) => Number(o.orden_id) === Number(id) ? orden : o) : [...listar('ordenes'), orden],
    pedidos: [...pedidos.map((p) => seleccionados.has(Number(p.pedido_id)) ? { ...p, orden_id: orden.orden_id }
      : anterior && Number(p.orden_id) === Number(id) ? { ...p, orden_id: null } : p), ...nuevos],
  });
  return { ...resultado, registro: resultado.errores ? null : orden };
}

export function crearOrdenDesdePedidos(datos, pedidoIds) {
  if (!pedidoIds.length) return fallo('Selecciona al menos un pedido.');
  const total = listar('pedidos').filter((p) => pedidoIds.map(Number).includes(Number(p.pedido_id))).reduce((suma, p) => suma + Number(p.cantidad), 0);
  if (total < MINIMO_PRODUCCION) return fallo('Se necesitan pedidos por al menos 64 peluches del mismo modelo para planificar la producción.');
  return guardarOrdenConPedidos(datos, pedidoIds);
}

export function asignarPedidosAOrden(ordenId, pedidoIds) {
  const orden = buscar('ordenes', ordenId);
  if (!orden) return fallo('La orden ya no existe.');
  return guardarOrdenConPedidos(orden, pedidoIds, ordenId);
}

export function inicializarPedidosDemo({ asignarLotesIniciados = false } = {}) {
  if (!listar('demo_peluches').length || listar('pedidos_demo').length ||
    listar('pedidos').length || listar('locales').length) return;
  const locales = [
    'Juguetería Nube · Concepción',
    'Tienda Abrazo · Talcahuano',
    'Regalería Bosque · Chiguayante',
    'Mundo Peluche · San Pedro',
    'Pequeños Amigos · Los Ángeles',
  ].map((nombre, i) => ({ local_id: i + 1, codigo: `LOC-${String(i + 1).padStart(3, '0')}`, nombre }));
  const cantidades = [16, 12, 10, 14, 12];
  const pedidos = [];
  for (const lote of lotes) {
    const producto = listar('productos').find((p) => p.nombre === lote.nombre);
    if (!producto) continue;
    const iniciada = asignarLotesIniciados && listar('ordenes').find((o) => Number(o.producto_id) === Number(producto.producto_id) && ['En producción', 'Finalizada'].includes(o.estado));
    locales.forEach((local, i) => {
      const pedido_id = pedidos.length + 1;
      pedidos.push({
        pedido_id,
        codigo: `PED-${String(pedido_id).padStart(4, '0')}`,
        producto_id: producto.producto_id,
        local_id: local.local_id,
        cantidad: cantidades[i],
        orden_id: iniciada ? iniciada.orden_id : null,
      });
    });
  }
  if (pedidos.length) return guardarCambios({ locales, pedidos, pedidos_demo: [{ version: 1 }] });
}
