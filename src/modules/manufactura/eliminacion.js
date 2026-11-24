import { buscar, listar } from './almacenamiento.js';
import { puedeModificarTabla } from './roles.js';

const codigoOrden = (id) => `OP-${String(id).padStart(4, '0')}`;
const ordenDetalle = (id) => {
  const orden = buscar('ordenes', id);
  return `${codigoOrden(id)} · ${buscar('productos', orden?.producto_id)?.nombre || 'Producto'}${orden?.estado ? ` · ${orden.estado}` : ''}`;
};

// La confirmación y las funciones de dominio consultan las mismas reglas.
// Una restricción se explica antes de ofrecer confirmar, sin borrar historial.
export function analizarEliminacion(tabla, id, { retirarAsignaciones = false } = {}) {
  const bloqueada = (motivo, detalles = []) => ({ permitida: false, motivo, detalles });
  const permitida = (descripcion, detalles = []) => ({ permitida: true, descripcion, detalles });
  if (!buscar(tabla, id)) return bloqueada('El registro ya no existe. Actualiza el listado.');
  if (!puedeModificarTabla(tabla)) return bloqueada('Tu rol no permite eliminar este registro.');
  const relacionados = (nombre, campo) => listar(nombre).filter((r) => Number(r[campo]) === Number(id));
  switch (tabla) {
    case 'etapas': {
      const rutas = relacionados('rutas', 'etapa_id');
      const ejecuciones = relacionados('ejecuciones', 'etapa_id');
      const detalles = [
        ...new Set(rutas.map((r) => `Ruta de ${buscar('productos', r.producto_id)?.nombre || `producto #${r.producto_id}`}`)),
        ...new Set(ejecuciones.map((e) => `Ejecución registrada en ${ordenDetalle(e.orden_id)}`)),
      ];
      if (detalles.length) return bloqueada(
        'La etapa está en uso en una ruta o ejecución y no se puede eliminar. Las ejecuciones conservan el historial de producción. Si solo está en rutas, quítala de esas rutas antes de eliminarla.', detalles,
      );
      break;
    }
    case 'productos': {
      const ordenes = relacionados('ordenes', 'producto_id');
      const pedidos = relacionados('pedidos', 'producto_id');
      if (ordenes.length || pedidos.length) return bloqueada(
        'El producto tiene órdenes o pedidos asociados y no se puede eliminar. Conserva su historial. Los pedidos pendientes pueden eliminarse desde Pedidos por peluche si corresponde.',
        [...ordenes.map((o) => ordenDetalle(o.orden_id)), ...pedidos.map((p) => `Pedido ${p.codigo}${p.orden_id ? ` · ${codigoOrden(p.orden_id)}` : ' · Pendiente'}`)],
      );
      return permitida('Se eliminará el producto junto con sus materiales y su ruta. Deshacer eliminación recuperará todo junto.');
    }
    case 'ordenes': {
      const recepciones = relacionados('recepciones', 'orden_id');
      if (recepciones.length) return bloqueada(
        `La orden tiene ${recepciones.length} recepciones registradas y no se puede eliminar. Las recepciones son un historial permanente. Puedes editar el estado de la orden si corresponde.`,
        [ordenDetalle(id), ...recepciones.map((r) => `Recepción #${r.recepcion_id} · ${r.fecha_recepcion}`)],
      );
      return permitida('Se eliminarán la orden y sus ejecuciones. Sus pedidos volverán a quedar pendientes. Deshacer eliminación recuperará la orden, las ejecuciones y los vínculos con los pedidos.',
        [`${relacionados('ejecuciones', 'orden_id').length} ejecuciones y ${relacionados('pedidos', 'orden_id').length} pedidos vinculados.`]);
    }
    case 'maquinas': {
      const ejecuciones = relacionados('ejecuciones', 'maquina_id');
      if (ejecuciones.length) return bloqueada(
        'La máquina tiene ejecuciones registradas y no se puede eliminar. Conserva su historial cambiando su estado a Fuera de servicio cuando corresponda.',
        [...new Set(ejecuciones.map((e) => ordenDetalle(e.orden_id)))],
      );
      return permitida('Se eliminarán la máquina, sus mantenimientos y los repuestos de esos mantenimientos. Deshacer eliminación recuperará todo junto.',
        [`${relacionados('mantenimientos', 'maquina_id').length} mantenimientos asociados.`]);
    }
    case 'equipamiento': {
      const asignaciones = relacionados('asignaciones', 'equipamiento_id');
      if (asignaciones.length && !retirarAsignaciones) return bloqueada('El equipamiento está asignado a un trabajador. Quita su asignación antes de eliminarlo.');
      return permitida(asignaciones.length
        ? `Se eliminará el equipamiento y sus ${asignaciones.length} asignaciones. Deshacer eliminación recuperará ambos.`
        : 'Se eliminará este equipamiento. Podrás recuperarlo con Deshacer eliminación.');
    }
    case 'pedidos': {
      const pedido = buscar('pedidos', id);
      if (pedido.orden_id && buscar('ordenes', pedido.orden_id)?.estado !== 'Cancelada') return bloqueada(
        'El pedido tiene una orden de producción asociada y no se puede eliminar mientras esa orden siga activa. Revisa la orden antes de modificar el pedido.', [ordenDetalle(pedido.orden_id)],
      );
      break;
    }
    case 'ejecuciones': {
      const ejecucion = buscar('ejecuciones', id);
      if (buscar('ordenes', ejecucion.orden_id)?.estado === 'Finalizada') return bloqueada(
        'La ejecución pertenece a una orden finalizada. Reabre la orden desde su estado antes de corregir sus ejecuciones para que el avance siga siendo coherente.', [ordenDetalle(ejecucion.orden_id)],
      );
      break;
    }
    case 'recepciones': return bloqueada('Una recepción registrada no se puede eliminar. Se conserva como historial de la entrega.');
    case 'mantenimientos': return permitida('Se eliminarán el mantenimiento y sus repuestos utilizados. Deshacer eliminación recuperará ambos.');
    default: break;
  }
  return permitida('Se eliminará este registro del listado. Podrás recuperarlo con Deshacer eliminación.');
}
