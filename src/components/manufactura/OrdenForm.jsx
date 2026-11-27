import { useEffect, useState } from 'react';
import { Campo, opciones } from './Controles.jsx';
import { buscar, listar, siguienteId } from '../../modules/manufactura/almacenamiento.js';
import { MINIMO_PRODUCCION, ESTADOS_ORDEN } from '../../modules/manufactura/ordenes.js';
import { referencia, fecha, rango } from '../../modules/manufactura/validacion.js';
import { obtenerPedidosDeOrden, obtenerPedidosPendientes, validarPedido } from '../../modules/manufactura/pedidos-locales.js';
import useManufactura from '../../hooks/useManufactura.js';
import useEnfoqueAccion from '../../hooks/useEnfoqueAccion.js';

const nuevoPedido = (indice = 0) => ({ codigo: `PED-${String(siguienteId('pedidos') + indice).padStart(4, '0')}`, local_id: '', cantidad: '' });

export default function OrdenForm({ inicial, onGuardar, onCancelar }) {
  useManufactura();
  const asignar = !!inicial.modo_asignacion;
  const editando = !!inicial.orden_id;
  const iniciales = inicial.pedido_ids ?? (editando ? obtenerPedidosDeOrden(inicial.orden_id).map((p) => p.pedido_id) : []);
  const [datos, setDatos] = useState({ cantidad_plan: 64, estado: 'Planificada', ...inicial });
  const [ids, setIds] = useState(iniciales.map(Number));
  const [nuevos, setNuevos] = useState([]);
  const [creandoPedido, setCreandoPedido] = useState(!editando && !iniciales.length);
  const [borrador, setBorrador] = useState(nuevoPedido);
  const [errores, setErrores] = useState({});
  const [errorPedido, setErrorPedido] = useState({});
  const destino = useEnfoqueAccion(undefined, false);
  useEffect(() => {
    destino.current?.querySelector(asignar ? 'input[type="checkbox"], input:not([disabled]), select:not([disabled])' : '[name="fecha_inicio"]')?.focus({ preventScroll: true });
  }, [asignar, destino]);
  const producto = buscar('productos', datos.producto_id);
  const cerrada = editando && inicial.estado !== 'Planificada';
  const actuales = editando ? obtenerPedidosDeOrden(inicial.orden_id) : [];
  const opcionesPedidos = [...new Map([...actuales, ...obtenerPedidosPendientes(datos.producto_id)].map((p) => [Number(p.pedido_id), p])).values()];
  const elegidos = listar('pedidos').filter((p) => ids.includes(Number(p.pedido_id)));
  const cantidadGuardada = [...elegidos, ...nuevos].reduce((suma, p) => suma + Number(p.cantidad), 0);
  const total = cantidadGuardada + (creandoPedido && producto ? Number(borrador.cantidad) || 0 : 0);
  const cantidadLote = editando ? Number(datos.cantidad_plan || 0) : total;
  const libres = cantidadLote - total;
  const productoBloqueado = cerrada || asignar || actuales.length > 0 || nuevos.length > 0 || (editando &&
    ['ejecuciones', 'recepciones'].some((tabla) => listar(tabla).some((r) => Number(r.orden_id) === Number(inicial.orden_id))));
  const cambiar = (campo, valor) => {
    setDatos((d) => ({ ...d, [campo]: valor }));
    setErrores({});
    if (campo === 'producto_id') { setIds([]); setCreandoPedido(!editando); }
  };
  const campo = (name, label, extra = {}) => <Campo key={name} campo={{ name, label, ...extra }} value={datos[name]} onChange={(valor) => cambiar(name, valor)} error={errores[name]} />;
  const prepararPedido = () => {
    const pedido = { ...borrador, producto_id: Number(datos.producto_id), cantidad: Number(borrador.cantidad), local_id: Number(borrador.local_id), codigo: borrador.codigo.trim() };
    const errores = validarPedido(pedido);
    if (nuevos.some((p) => p.codigo.toLocaleLowerCase() === pedido.codigo.toLocaleLowerCase())) errores.codigo = 'Ese código ya está en la selección.';
    setErrorPedido(errores);
    return Object.keys(errores).length ? null : pedido;
  };
  const siguienteBorrador = (lista) => {
    let indice = 0;
    while (lista.some((p) => p.codigo === nuevoPedido(indice).codigo)) indice++;
    return nuevoPedido(indice);
  };
  const agregarPedido = () => {
    const pedido = prepararPedido();
    if (!pedido) return;
    setNuevos((lista) => [...lista, pedido]);
    setBorrador(siguienteBorrador([...nuevos, pedido]));
    setCreandoPedido(false);
    setErrores({});
  };
  return (
    <form ref={destino} tabIndex={-1} className="card orden-form" noValidate onSubmit={(e) => {
      e.preventDefault();
      const basicos = {};
      referencia(basicos, datos, 'producto_id', 'productos', 'un producto');
      if (!asignar) {
        fecha(basicos, datos, 'fecha_inicio', 'una fecha de inicio');
        fecha(basicos, datos, 'fecha_fin', 'una fecha de término');
        rango(basicos, datos, 'fecha_inicio', 'fecha_fin');
      }
      if (Object.keys(basicos).length) { setErrores(basicos); return; }
      const pendiente = creandoPedido ? prepararPedido() : null;
      if (creandoPedido && !pendiente) return;
      const pedidosGuardar = pendiente ? [...nuevos, pendiente] : nuevos;
      const totalGuardar = cantidadGuardada + (pendiente?.cantidad || 0);
      if (!editando && totalGuardar < MINIMO_PRODUCCION) { setErrores({ pedidos: 'Incluye pedidos por al menos 64 peluches del mismo modelo para crear la orden.' }); return; }
      const resultado = onGuardar({ ...datos, cantidad_plan: editando ? datos.cantidad_plan : totalGuardar, pedido_ids: ids, pedidos_nuevos: pedidosGuardar });
      setErrores(resultado?.errores || {});
    }}>
      <header className="section-heading">
        <div><span className="eyebrow">{asignar ? 'Distribución del lote' : 'Planificación del lote'}</span>
          <h3>{asignar ? `Asignar pedidos a OP-${String(inicial.orden_id).padStart(4, '0')}` : editando ? 'Editar orden' : 'Nueva orden de producción'}</h3>
        </div>
        <button type="button" onClick={onCancelar}>Cerrar formulario</button>
      </header>
      {errores.general && <p role="alert" className="error">{errores.general}</p>}
      {!asignar && <fieldset><legend>Fechas de la orden</legend><div className="form-grid">
        {campo('fecha_inicio', 'Fecha de inicio', { type: 'date' })}
        {campo('fecha_fin', 'Fecha de término', { type: 'date' })}
        {editando && campo('estado', 'Estado de la orden', { type: 'select', options: ESTADOS_ORDEN.map((v) => ({ value: v, label: v })) })}
      </div></fieldset>}
      {asignar ? <fieldset><legend>{producto?.nombre}</legend>
        {campo('cantidad_plan', 'Cantidad planificada', { type: 'number', min: 64, step: '1', help: 'Si añades más pedidos, puedes ampliar el lote aquí. Mínimo 64 peluches.' })}
      </fieldset> : <fieldset>
        <legend>Peluche del lote</legend>
        <div className="form-grid">
          {campo('producto_id', 'Producto', { type: 'select', options: opciones(listar('productos'), 'producto_id'), disabled: productoBloqueado })}
          {editando && campo('cantidad_plan', 'Cantidad planificada', { type: 'number', min: MINIMO_PRODUCCION, step: '1', disabled: cerrada, help: cerrada ? 'El lote ya salió de planificación y conserva su cantidad.' : 'Mínimo 64 peluches por lote. Puede ser una cantidad mayor.' })}
        </div>
        {!editando && <p className="muted">La cantidad a fabricar será la suma de los pedidos que incluyas. Cada orden corresponde a un modelo de peluche.</p>}
      </fieldset>}
      <fieldset className="orden-pedidos">
        <legend>Pedidos que cubrirá esta orden</legend>
        <p className="muted">Reúne al menos 64 peluches del mismo modelo entre uno o varios locales. Por ejemplo: 30 + 15 + 19. Todos se fabrican con las fechas de esta orden.</p>
        <div className={`orden-reparto${libres < 0 ? ' reparto-excedido' : ''}`} role="status" aria-live="polite">
          <span><strong>{total}</strong> en los pedidos seleccionados</span>
          <span><strong>{libres < 0 ? -libres : libres}</strong> {libres < 0 ? 'por encima del lote' : 'disponibles en el lote'}</span>
          <span><strong>{cantidadLote}</strong> a fabricar</span>
        </div>
        {!editando && producto && total > 0 && total < MINIMO_PRODUCCION && <p className="notice">Faltan {MINIMO_PRODUCCION - total} peluches para completar el mínimo del lote. Puedes sumar pedidos de otros locales del mismo modelo.</p>}
        {!producto ? <p>Selecciona un producto para ver sus pedidos.</p> : <>
          {cerrada && <p className="notice">Los pedidos de esta orden {inicial.estado.toLowerCase()} son de consulta. Solo se pueden añadir pedidos o ampliar el lote mientras esté en planificación.</p>}
          {opcionesPedidos.length ? <details className="pedidos-existentes" open={editando || ids.length > 0}><summary>Usar pedidos ya registrados ({opcionesPedidos.length})</summary><ul className="orden-pedidos-lista">
            {opcionesPedidos.map((p) => <li key={p.pedido_id}>
              <label><input type="checkbox" checked={ids.includes(Number(p.pedido_id))} disabled={cerrada}
                onChange={(e) => { setIds((lista) => e.target.checked ? [...lista, Number(p.pedido_id)] : lista.filter((id) => id !== Number(p.pedido_id))); setErrores({}); }} />
                <span><strong>{p.codigo}</strong> · {buscar('locales', p.local_id)?.nombre}<small>{p.cantidad} peluches{Number(p.orden_id) === Number(inicial.orden_id) ? ' · Ya asignado a esta orden' : ' · Pendiente'}</small></span>
              </label>
            </li>)}
          </ul></details> : <p>No hay pedidos pendientes de este peluche. Puedes añadir uno aquí.</p>}
          {!!nuevos.length && <ul className="orden-pedidos-lista pedidos-nuevos">{nuevos.map((p, i) => <li key={p.codigo}>
            <span><strong>{p.codigo}</strong> · {buscar('locales', p.local_id)?.nombre}<small>{p.cantidad} peluches · Nuevo, se guardará con la orden</small></span>
            <button type="button" aria-label={`Quitar pedido nuevo ${p.codigo}`} onClick={() => setNuevos((lista) => lista.filter((_, n) => n !== i))}>Quitar</button>
          </li>)}</ul>}
          {!cerrada && !creandoPedido && <button type="button" onClick={() => { setCreandoPedido(true); setErrorPedido({}); setBorrador(siguienteBorrador(nuevos)); }}>Añadir pedido de local</button>}
          {creandoPedido && <div className="pedido-borrador">
            <h4>¿Para qué local y cuántos peluches?</h4>
            <div className="form-grid">{[
              { name: 'local_id', label: 'Local solicitante', type: 'select', options: opciones(listar('locales'), 'local_id') },
              { name: 'cantidad', label: 'Cantidad del pedido', type: 'number', min: 1, step: '1', help: 'Este local puede pedir menos de 64. La suma de la orden debe llegar a 64 o más.' },
              { name: 'codigo', label: 'Código del pedido', help: 'Se propone automáticamente. Puedes conservarlo.' },
            ].map((c) => <Campo key={c.name} campo={c} value={borrador[c.name]} onChange={(valor) => {
              setBorrador((b) => ({ ...b, [c.name]: valor }));
              setErrorPedido((errores) => ({ ...errores, [c.name]: undefined }));
            }} error={errorPedido[c.name]} />)}</div>
            <div className="actions"><button type="button" onClick={() => setCreandoPedido(false)}>Cancelar pedido nuevo</button><button type="button" onClick={agregarPedido}>Incluir este pedido</button></div>
            <p className="muted">También puedes pulsar {asignar ? 'Guardar asignación' : editando ? 'Guardar cambios de orden' : 'Crear orden'} directamente: el pedido y su vínculo se guardarán juntos.</p>
          </div>}
        </>}
        {libres < 0 && <p role="alert" className="error">La selección supera el lote en {-libres} peluches. {asignar ? 'Quita pedidos o edita la cantidad de la orden.' : 'Aumenta la cantidad a fabricar o quita pedidos.'}</p>}
        {errores.pedidos && <p role="alert" className="error">{errores.pedidos}</p>}
        {!total && producto && !cerrada && <p className="muted">Selecciona pedidos pendientes o añade un pedido de local.</p>}
      </fieldset>
      {errores.estado && !editando && <p role="alert" className="error">{errores.estado}</p>}
      <div className="actions orden-form-acciones">
        <button type="button" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="primary" disabled={libres < 0}>{asignar ? 'Guardar asignación' : editando ? 'Guardar cambios de orden' : 'Crear orden'}</button>
      </div>
    </form>
  );
}
