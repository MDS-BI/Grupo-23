import { buscar, eliminarRegistro, fallo, guardarCambios, guardarRegistro, listar, siguienteId } from './almacenamiento.js';
import { MINIMO_PRODUCCION, validarOrden } from './ordenes.js';
import { numero, referencia, texto } from './validacion.js';
import { lotes } from './peluches-ejemplo.js';
import { analizarEliminacion } from './eliminacion.js';

export const obtenerPedidos = (productoId) => listar('pedidos')
  .filter((pedido) => Number(pedido.producto_id) === Number(productoId));
export const obtenerPedidosPendientes = (productoId) => obtenerPedidos(productoId)
  .filter((pedido) => !pedido.orden_id || buscar('ordenes', pedido.orden_id)?.estado === 'Cancelada');

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
  }, (pedido) => {
    const errores = {};
    texto(errores, pedido, 'codigo', 'El código de pedido');
    referencia(errores, pedido, 'producto_id', 'productos', 'un producto');
    referencia(errores, pedido, 'local_id', 'locales', 'un local');
    numero(errores, pedido, 'cantidad', 'La cantidad', { entero: true });
    if (listar('pedidos').some((otro) => otro.pedido_id !== pedido.pedido_id &&
      otro.codigo.toLocaleLowerCase() === pedido.codigo.toLocaleLowerCase())) {
      errores.codigo = 'Ya existe un pedido con ese código.';
    }
    return errores;
  }, id);
}

export function eliminarPedido(id) {
  const estado = analizarEliminacion('pedidos', id);
  if (!estado.permitida) return fallo(estado.motivo);
  return eliminarRegistro('pedidos', id);
}

export function crearOrdenDesdePedidos(datos, pedidoIds) {
  const seleccionados = new Set(pedidoIds.map(Number));
  const pendientes = obtenerPedidosPendientes(datos.producto_id)
    .filter((pedido) => seleccionados.has(pedido.pedido_id));
  if (!seleccionados.size || pendientes.length !== seleccionados.size) {
    return fallo('Los pedidos cambiaron o ya fueron planificados. Revisa el listado.');
  }
  const total = pendientes.reduce((cantidad, pedido) => cantidad + pedido.cantidad, 0);
  if (total < MINIMO_PRODUCCION || Number(datos.cantidad_plan) < total) {
    return fallo('La orden debe cubrir todos los pedidos seleccionados y al menos 64 peluches.');
  }
  const { pedido_ids, ...camposOrden } = datos;
  const orden = {
    ...camposOrden,
    orden_id: siguienteId('ordenes'),
    producto_id: Number(datos.producto_id),
    cantidad_plan: Number(datos.cantidad_plan),
  };
  const errores = validarOrden(orden);
  if (Object.keys(errores).length) return { errores };
  return guardarCambios({
    ordenes: [...listar('ordenes'), orden],
    pedidos: listar('pedidos').map((pedido) =>
      seleccionados.has(pedido.pedido_id) ? { ...pedido, orden_id: orden.orden_id } : pedido,
    ),
  });
}

export function inicializarPedidosDemo() {
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
    locales.forEach((local, i) => {
      const pedido_id = pedidos.length + 1;
      pedidos.push({
        pedido_id,
        codigo: `PED-${String(pedido_id).padStart(4, '0')}`,
        producto_id: producto.producto_id,
        local_id: local.local_id,
        cantidad: cantidades[i],
        orden_id: null,
      });
    });
  }
  if (pedidos.length) guardarCambios({ locales, pedidos, pedidos_demo: [{ version: 1 }] });
}
