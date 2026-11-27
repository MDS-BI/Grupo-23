import { useState } from 'react';
import useManufactura from '../../hooks/useManufactura.js';
import { useFiltros } from '../../hooks/useFiltros.js';
import { filtrarOrdenes } from '../../utils/filtrosManufactura.js';
import BarraFiltros from './BarraFiltros.jsx';
import {
  obtenerOrdenes,
  eliminarOrden,
  eliminarEjecucion,
  obtenerEjecuciones,
  guardarEjecucion,
  avanceOrden,
  ESTADOS_ORDEN,
  MINIMO_PRODUCCION,
} from '../../modules/manufactura/ordenes.js';
import { obtenerProductos } from '../../modules/manufactura/productos.js';
import { obtenerRuta } from '../../modules/manufactura/rutas.js';
import {
  buscar,
} from '../../modules/manufactura/almacenamiento.js';
import { obtenerMaquinas } from '../../modules/manufactura/recursos.js';
import { nombreReferencia } from '../../modules/manufactura/referencias.js';
import {
  GestionRegistros,
  opciones,
  opcionesExternas,
  formatoFecha,
} from './Controles.jsx';
import { RecepcionesGestion } from './RecepcionesPage.jsx';
import { esEtapaEnsamble, puedeAcceder, puedeModificarTabla, rolActual } from '../../modules/manufactura/roles.js';
import { guardarOrdenConPedidos, obtenerPedidosDeOrden, resumenPedidosOrden } from '../../modules/manufactura/pedidos-locales.js';
import PedidosLocales from './PedidosLocales.jsx';
import OrdenForm from './OrdenForm.jsx';
import useEnfoqueAccion from '../../hooks/useEnfoqueAccion.js';

export function Progreso({ orden }) {
  const a = avanceOrden(orden);
  return (
    <div className="progress">
      <progress
        max="100"
        value={a.porcentaje}
        aria-label={`Avance de orden ${orden.orden_id}`}
      />
      <span>
        {a.porcentaje}% · {a.completadas}/{a.total} etapas
      </span>
    </div>
  );
}

function OrdenDetalle({ ordenId, cerrar, asignarPedidos }) {
  useManufactura();
  const destino = useEnfoqueAccion(ordenId);
  const orden = buscar('ordenes', ordenId);
  if (!orden) return null;
  const ensamble = rolActual() === 'ensamble';
  const ruta = obtenerRuta(orden.producto_id).filter(
    (paso) => !ensamble || esEtapaEnsamble(buscar('etapas', paso.etapa_id)),
  );
  const avance = avanceOrden(orden);
  const campos = [
    {
      name: 'etapa_id',
      label: 'Etapa de fabricación',
      type: 'select',
      options: ruta.map((r) => ({
        value: r.etapa_id,
        label: `${r.secuencia}. ${buscar('etapas', r.etapa_id)?.nombre}`,
      })),
    },
    {
      name: 'maquina_id',
      label: 'Máquina',
      type: 'select',
      opcional: true,
      options: opciones(
        obtenerMaquinas().filter(
          (m) => !['Fuera de servicio', 'En mantenimiento'].includes(m.estado),
        ),
        'maquina_id',
      ),
    },
    {
      name: 'trabajador_id',
      label: 'Trabajador',
      type: 'select',
      opcional: true,
      options: opcionesExternas('trabajadores', 'trabajador_id'),
    },
    { name: 'inicio_real', label: 'Inicio real', type: 'datetime-local' },
    {
      name: 'fin_real',
      label: 'Fin real',
      type: 'datetime-local',
      opcional: true,
      help: 'Déjalo vacío mientras la etapa esté en curso.',
    },
  ];
  return (
    <article ref={destino} className="card detail-panel">
      <header>
        <div>
          <span className="eyebrow">Seguimiento de producción</span>
          <h2>Orden #{orden.orden_id}</h2>
        </div>
        <button onClick={cerrar}>Cerrar detalle</button>
      </header>
      <dl className="summary-grid">
        <div>
          <dt>Producto</dt>
          <dd>{buscar('productos', orden.producto_id)?.nombre}</dd>
        </div>
        <div>
          <dt>Cantidad planificada</dt>
          <dd>{orden.cantidad_plan}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>{orden.estado}</dd>
        </div>
        {!ensamble && <div>
          <dt>Periodo</dt>
          <dd>
            {formatoFecha(orden.fecha_inicio)} — {formatoFecha(orden.fecha_fin)}
          </dd>
        </div>}
        <div>
          <dt>Tiempo real acumulado</dt>
          <dd>{avance.minutos} min</dd>
        </div>
      </dl>
      {puedeModificarTabla('ordenes') && <section className="orden-locales-resumen" aria-label="Pedidos vinculados a la orden">
        <header className="section-heading"><h3>Locales y pedidos de esta orden</h3>
          {resumenPedidosOrden(orden).aceptaPedidos && <button type="button" onClick={() => asignarPedidos(orden)}>Asignar pedidos</button>}
        </header>
        <p>{resumenPedidosOrden(orden).asignadas} de {orden.cantidad_plan} peluches asignados a locales · {resumenPedidosOrden(orden).disponibles} {resumenPedidosOrden(orden).aceptaPedidos ? 'disponibles' : 'sin asignar; asignación cerrada'}.</p>
        {!resumenPedidosOrden(orden).aceptaPedidos && <p className="notice">Esta orden está {orden.estado.toLowerCase()} y no admite nuevos pedidos. Sus unidades sin asignar no se cuentan como cupo disponible.</p>}
        {obtenerPedidosDeOrden(ordenId).length ? <ul className="orden-pedidos-lista">{obtenerPedidosDeOrden(ordenId).map((p) => <li key={p.pedido_id}>
          <span><strong>{p.codigo}</strong> · {buscar('locales', p.local_id)?.nombre}</span><strong>{p.cantidad} peluches</strong>
        </li>)}</ul> : <p className="muted">Esta orden todavía no tiene pedidos vinculados. Usa Asignar pedidos para elegirlos o registrar uno nuevo.</p>}
      </section>}
      <Progreso orden={orden} />
      <h3>Ruta y avance de las etapas</h3>
      {ruta.length ? (
        <ol className="route-summary">
          {ruta.map((r) => {
            const ejecuciones = obtenerEjecuciones(ordenId).filter(
              (e) => Number(e.etapa_id) === Number(r.etapa_id),
            );
            return (
              <li key={r.ruta_id}>
                <b>
                  {r.secuencia}. {buscar('etapas', r.etapa_id)?.nombre}
                </b>
                <span className="badge">
                  {ejecuciones.some((e) => e.fin_real)
                    ? 'Completada'
                    : ejecuciones.length
                      ? 'En curso'
                      : 'Pendiente'}
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="notice">
          Define primero la ruta de este producto en Etapas y rutas para
          registrar ejecuciones.
        </p>
      )}
      <GestionRegistros
        key={ordenId}
        titulo="Ejecuciones de etapas"
        singular="Ejecución"
        nuevoTexto="Registrar ejecución"
        textoEditar="Finalizar / editar"
        idCampo="ejecucion_id"
        registros={obtenerEjecuciones(ordenId).filter(
          (ejecucion) => !ensamble || esEtapaEnsamble(buscar('etapas', ejecucion.etapa_id)),
        )}
        campos={campos}
        guardar={(d, id) => guardarEjecucion({ ...d, orden_id: ordenId }, id)}
        eliminar={eliminarEjecucion}
        columnas={[
          {
            key: 'etapa_id',
            label: 'Etapa',
            render: (r) => buscar('etapas', r.etapa_id)?.nombre,
          },
          {
            key: 'maquina_id',
            label: 'Máquina',
            render: (r) =>
              buscar('maquinas', r.maquina_id)?.nombre || 'Sin asignar',
          },
          {
            key: 'trabajador_id',
            label: 'Trabajador',
            render: (r) => nombreReferencia('trabajadores', r.trabajador_id),
          },
          {
            key: 'inicio_real',
            label: 'Inicio',
            render: (r) => formatoFecha(r.inicio_real),
          },
          {
            key: 'fin_real',
            label: 'Fin',
            render: (r) => formatoFecha(r.fin_real),
          },
          {
            key: 'tiempo_uso_min',
            label: 'Tiempo',
            render: (r) =>
              r.fin_real ? `${r.tiempo_uso_min} min` : 'En curso',
          },
        ]}
      />
      {puedeAcceder('recepciones') && <RecepcionesGestion ordenId={ordenId} />}
    </article>
  );
}

export default function OrdenesPage() {
  useManufactura();
  const [detalle, setDetalle] = useState(null);
  const [solicitudNueva, setSolicitudNueva] = useState(null);

  const productos = obtenerProductos();
  const ensamble = rolActual() === 'ensamble';
  const ordenes = obtenerOrdenes().filter(
    (orden) => !ensamble || ['Planificada', 'En producción'].includes(orden.estado),
  );

  const {
    filtros,
    actualizarFiltro,
    limpiarFiltros,
    itemsFiltrados: ordenesFiltradas,
    hayFiltrosActivos,
  } = useFiltros(ordenes, filtrarOrdenes, {
    busquedaNumero: '',
    estado: '',
    productoId: '',
    fechaDesde: '',
    fechaHasta: '',
  });
  const productoPedidos = filtros.productoId ? Number(filtros.productoId) : null;
  const ordenesConCupo = ordenesFiltradas.filter((orden) =>
    resumenPedidosOrden(orden).aceptaPedidos && resumenPedidosOrden(orden).disponibles > 0,
  );
  const seleccionarProducto = (id) => actualizarFiltro('productoId', id || '');
  const planifica = puedeModificarTabla('ordenes');
  const abrirAsignacion = (orden) => {
    setDetalle(null);
    setSolicitudNueva((anterior) => ({ datos: { ...orden, modo_asignacion: true }, clave: (anterior?.clave || 0) + 1 }));
  };

  return (
    <section>
      <header className="page-heading">
        <div>
          <span className="eyebrow">Planificación y ejecución</span>
          <h1>Órdenes de producción</h1>
          <p>{ensamble
            ? 'Consulta las órdenes abiertas y registra tus etapas de ensamblaje.'
            : 'Planifica la fabricación y registra el avance real de cada etapa.'}</p>
        </div>
        {planifica && <button type="button" className="primary" onClick={() => {
          setDetalle(null);
          setSolicitudNueva((anterior) => ({ datos: { producto_id: productoPedidos || '', cantidad_plan: 64, estado: 'Planificada' }, clave: (anterior?.clave || 0) + 1 }));
        }}>Nueva orden</button>}
      </header>
      {planifica && <div className="ordenes-guia"><strong>Una orden, un lote de peluches.</strong>
        <span>En Nueva orden eliges fechas y reúnes pedidos del mismo peluche: uno grande o varios pequeños que sumen 64 o más. Todos comparten las fechas del lote.</span>
      </div>}
      <nav className="pedidos-productos selector-modelos" aria-label="Filtrar órdenes por peluche">
        <button type="button" aria-pressed={!productoPedidos} onClick={() => seleccionarProducto(null)}>Todos los peluches</button>
        {productos.map((p) => <button type="button" key={p.producto_id} aria-pressed={productoPedidos === Number(p.producto_id)} onClick={() => seleccionarProducto(p.producto_id)}>{p.nombre}</button>)}
      </nav>
      {planifica && <div className="ordenes-indicadores">
        <div><strong>{ordenesFiltradas.length}</strong><span>órdenes en esta vista</span></div>
        <div title="Solo órdenes planificadas con unidades sin asignar. Al empezar la producción se cierra el lote a nuevos pedidos."><strong>{ordenesConCupo.length}</strong><span>órdenes con cupo para pedidos</span><small className="muted">Solo en planificación.</small></div>
        <div><strong>{ordenesConCupo.reduce((suma, o) => suma + resumenPedidosOrden(o).disponibles, 0)}</strong><span>peluches disponibles para asignar</span></div>
      </div>}
      {!productos.length && (
        <p className="notice">
          Primero registra un producto y define su ruta de fabricación.
        </p>
      )}
      <BarraFiltros
        placeholderBusqueda="Buscar orden por N° (ej: OP-0001 o 1)..."
        valorBusqueda={filtros.busquedaNumero}
        onChangeBusqueda={(val) => actualizarFiltro('busquedaNumero', val)}
        mostrarFiltrosOrden={true}
        filtros={filtros}
        onChangeFiltro={actualizarFiltro}
        onLimpiar={limpiarFiltros}
        hayFiltrosActivos={hayFiltrosActivos}
        listaProductos={productos}
        estadosDisponibles={ESTADOS_ORDEN}
      />
      <GestionRegistros
        titulo="Órdenes"
        singular="Orden"
        nuevoTexto="Nueva orden"
        mostrarBotonCrear={false}
        mostrarDeshacerFilas={false}
        idCampo="orden_id"
        registros={ordenesFiltradas}
        inicialNuevo={{ cantidad_plan: MINIMO_PRODUCCION, estado: 'Planificada' }}
        solicitudNueva={solicitudNueva}
        guardar={(datos, id) => {
          const resultado = guardarOrdenConPedidos(datos, datos.pedido_ids, id, datos.pedidos_nuevos);
          if (!resultado.errores) { limpiarFiltros(); seleccionarProducto(datos.producto_id); }
          return resultado;
        }}
        renderFormulario={({ inicial, onGuardar, onCancelar, clave }) => <OrdenForm key={clave} inicial={inicial} onGuardar={onGuardar} onCancelar={onCancelar} />}
        accionesRegistro={(orden, abrir) => planifica && resumenPedidosOrden(orden).aceptaPedidos && <button type="button" onClick={() => { setDetalle(null); abrir({ ...orden, modo_asignacion: true }); }}>Asignar pedidos</button>}
        eliminar={eliminarOrden}
        onVer={(r) => setDetalle(r.orden_id)}
        campos={[
          {
            name: 'producto_id',
            label: 'Producto',
            type: 'select',
            options: opciones(productos, 'producto_id'),
          },
          {
            name: 'cantidad_plan',
            label: 'Cantidad planificada',
            type: 'number',
            min: MINIMO_PRODUCCION,
            step: '1',
            help: 'Cada lote nuevo requiere al menos 64 peluches. Las cantidades de órdenes históricas se conservan.',
          },
          {
            name: 'estado',
            label: 'Estado de la orden',
            type: 'select',
            options: ESTADOS_ORDEN.map((v) => ({ value: v, label: v })),
          },
          { name: 'fecha_inicio', label: 'Fecha de inicio', type: 'date' },
          { name: 'fecha_fin', label: 'Fecha de término', type: 'date' },
        ]}
        columnas={[
          {
            key: 'orden_id',
            label: 'Orden',
            render: (r) => `OP-${String(r.orden_id).padStart(4, '0')}`,
          },
          {
            key: 'producto_id',
            label: 'Producto',
            render: (r) => buscar('productos', r.producto_id)?.nombre,
          },
          { key: 'cantidad_plan', label: 'Cantidad' },
          ...(planifica ? [{ key: 'pedidos', label: 'Pedidos y locales', render: (r) => {
            const resumen = resumenPedidosOrden(r);
            return <div className="orden-vinculos"><strong>{resumen.asignadas} / {r.cantidad_plan} asignados</strong>
              <small>{resumen.pedidos.length} pedidos · {!resumen.aceptaPedidos ? 'Asignación cerrada' : resumen.disponibles < 0 ? 'Revisar cantidades' : `${resumen.disponibles} disponibles`}</small>
            </div>;
          } }] : []),
          {
            key: 'estado',
            label: 'Estado',
            render: (r) => <span className="badge">{r.estado}</span>,
          },
          ...(!ensamble ? [{
            key: 'fecha_fin',
            label: 'Término',
            render: (r) => formatoFecha(r.fecha_fin),
          }] : []),
          {
            key: 'avance',
            label: 'Avance',
            render: (r) => <Progreso orden={r} />,
          },
        ]}
      />
      {detalle && (
        <OrdenDetalle ordenId={detalle} cerrar={() => setDetalle(null)} asignarPedidos={abrirAsignacion} />
      )}
      {planifica && productoPedidos && <PedidosLocales
        productos={productos} productoId={productoPedidos} seleccionarProducto={seleccionarProducto} mostrarSelector={false}
        planificar={(datos) => {
          setDetalle(null);
          setSolicitudNueva((anterior) => ({ datos, clave: (anterior?.clave || 0) + 1 }));
        }}
      />}
    </section>
  );
}
