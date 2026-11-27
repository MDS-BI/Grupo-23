import { useId, useState } from 'react';
import { calcularMetricasProduccion } from '../../modules/manufactura/metricas.js';

const formato = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 });
const numero = (valor) => formato.format(valor);
const colores = ['#c4a5e7', '#69439b', '#277568', '#a5a0aa', '#a56a37'];

function Leyenda({ elementos }) {
  return <div className="chart-key" aria-label="Leyenda">
    {elementos.map(([color, nombre]) => <span key={nombre}>
      <i style={{ backgroundColor: color }} aria-hidden="true" />{nombre}
    </span>)}
  </div>;
}

function GraficoEstados({ estados, total }) {
  let acumulado = 0;
  const radio = 64;
  const perimetro = 2 * Math.PI * radio;
  return <div className="state-chart">
    <svg viewBox="0 0 180 180" role="img" aria-label={`Distribución de ${total} ${total === 1 ? 'orden' : 'órdenes'} por estado`}>
      <circle cx="90" cy="90" r={radio} fill="none" stroke="#eee8f2" strokeWidth="22" />
      {estados.map((estado, indice) => {
        const longitud = total ? (estado.cantidad / total) * perimetro : 0;
        const inicio = acumulado;
        acumulado += longitud;
        return estado.cantidad > 0 && <circle key={estado.nombre}
          cx="90" cy="90" r={radio} fill="none" stroke={colores[indice]}
          strokeWidth="22" strokeDasharray={`${longitud} ${perimetro - longitud}`}
          strokeDashoffset={-inicio} transform="rotate(-90 90 90)">
          <title>{estado.nombre}: {estado.cantidad} órdenes</title>
        </circle>;
      })}
      <text x="90" y="88" textAnchor="middle" className="donut-total">{total}</text>
      <text x="90" y="109" textAnchor="middle" className="donut-caption">órdenes</text>
    </svg>
    <ul className="state-chart-legend">
      {estados.map((estado, indice) => <li key={estado.nombre}>
        <span><i style={{ backgroundColor: colores[indice] }} aria-hidden="true" />{estado.nombre}</span>
        <strong>{estado.cantidad}</strong>
        <small>{numero(total ? estado.cantidad * 100 / total : 0)} %</small>
      </li>)}
    </ul>
  </div>;
}

export default function MetricasProduccion({ ordenes, productos, etapas, ejecuciones }) {
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const filtroId = useId();
  const tituloId = useId();
  const productoId = productos.some((producto) => String(producto.producto_id) === productoSeleccionado)
    ? productoSeleccionado : '';
  const metricas = calcularMetricasProduccion({ ordenes, productos, etapas, ejecuciones, productoId });
  const maximoVolumen = Math.max(1, ...metricas.porProducto.map((producto) => producto.planificadas));
  const maximoTiempo = Math.max(1, ...metricas.porEtapa.flatMap((etapa) => [etapa.promedio, etapa.estandar || 0]));
  const indicadores = [
    ['Unidades previstas', numero(metricas.unidadesPlanificadas), 'Total previsto de órdenes no canceladas', '01'],
    ['Unidades terminadas', numero(metricas.unidadesFinalizadas), 'Peluches de órdenes finalizadas', '02'],
    ['Volumen terminado', `${numero(metricas.cumplimiento)} %`, 'Unidades terminadas / previstas', '03'],
    ['Horas registradas', numero(metricas.minutosRegistrados / 60), 'Suma de ejecuciones terminadas', '04'],
  ];
  return <section className="production-analytics" aria-labelledby={tituloId}>
    <header className="analytics-heading">
      <div>
        <span className="eyebrow">La fábrica en cifras</span>
        <h2 id={tituloId}>Rendimiento de producción</h2>
        <p className="muted">Todos los registros guardados · Se actualiza al registrar o deshacer cambios.</p>
      </div>
      <div className="analytics-filter">
        <label htmlFor={filtroId}>Filtrar métricas por peluche</label>
        <select id={filtroId} value={productoId} onChange={(event) => setProductoSeleccionado(event.target.value)}>
          <option value="">Todos los peluches</option>
          {productos.map((producto) => <option key={producto.producto_id} value={producto.producto_id}>{producto.nombre}</option>)}
        </select>
      </div>
    </header>
    <div className="production-kpis" aria-label="Métricas de producción">
      {indicadores.map(([nombre, valor, descripcion, indice]) => <article className="production-kpi" key={nombre}>
        <span className="metric-index" aria-hidden="true">{indice}</span>
        <h3>{nombre}</h3><strong>{valor}</strong><small>{descripcion}</small>
      </article>)}
    </div>
    <p className="analytics-note">El avance por etapas se consulta en cada orden; no representa un conteo de peluches terminados. Las unidades se cuentan como terminadas al finalizar la orden completa. Las órdenes canceladas solo se incluyen en el gráfico de estados.</p>
    <div className="production-charts">
      <article className="card chart-card" aria-label="Órdenes por estado">
        <header><h3>Órdenes por estado</h3><span className="chart-unit">órdenes</span></header>
        <p className="muted">Cuenta órdenes por estado. El porcentaje se calcula sobre el total de órdenes de esta selección.</p>
        <GraficoEstados estados={metricas.estados} total={metricas.totalOrdenes} />
        {!metricas.totalOrdenes && <p className="chart-empty">Todavía no hay órdenes para esta selección.</p>}
      </article>
      <article className="card chart-card" aria-label="Volumen por peluche">
        <header><h3>Volumen por peluche</h3><span className="chart-unit">peluches</span></header>
        <p className="muted">Las unidades previstas incluyen órdenes planificadas, en producción y finalizadas. Las terminadas pertenecen a órdenes finalizadas.</p>
        <Leyenda elementos={[[colores[0], 'Unidades previstas'], [colores[1], 'Unidades terminadas']]} />
        <ul className="bar-chart-list">
          {metricas.porProducto.map((producto) => <li key={producto.producto_id}>
            <b>{producto.nombre}</b>
            <span className="chart-values">{numero(producto.planificadas)} previstas · {numero(producto.finalizadas)} terminadas</span>
            <div className="paired-bars" aria-hidden="true">
              <span style={{ width: `${producto.planificadas / maximoVolumen * 100}%`, backgroundColor: colores[0] }} />
              <span style={{ width: `${producto.finalizadas / maximoVolumen * 100}%`, backgroundColor: colores[1] }} />
            </div>
          </li>)}
        </ul>
        {!metricas.porProducto.length && <p className="chart-empty">No hay unidades previstas para esta selección.</p>}
      </article>
      <article className="card chart-card chart-card--wide" aria-label="Tiempos por etapa">
        <header><h3>Tiempos por etapa</h3><span className="chart-unit">minutos por ejecución</span></header>
        <p className="muted">Promedio real de ejecuciones terminadas frente al tiempo estándar registrado. Las ejecuciones en curso no se incluyen.</p>
        <Leyenda elementos={[[colores[0], 'Tiempo estándar'], [colores[1], 'Promedio real'], ['#b26937', 'Promedio sobre el estándar']]} />
        <ul className="bar-chart-list stage-chart-list">
          {metricas.porEtapa.map((etapa) => {
            const excedida = etapa.estandar != null && etapa.promedio > etapa.estandar;
            return <li key={etapa.etapa_id}>
              <b>{etapa.nombre}</b>
              <span className="chart-values">Estándar: {etapa.estandar == null ? 'sin definir' : `${numero(etapa.estandar)} min`} · Real: {numero(etapa.promedio)} min</span>
              <div className="paired-bars" aria-hidden="true">
                <span style={{ width: `${(etapa.estandar || 0) / maximoTiempo * 100}%`, backgroundColor: colores[0] }} />
                <span style={{ width: `${etapa.promedio / maximoTiempo * 100}%`, backgroundColor: excedida ? '#b26937' : colores[1] }} />
              </div>
              <small className={excedida ? 'chart-exceeded' : 'muted'}>
                {etapa.muestras} {etapa.muestras === 1 ? 'ejecución terminada' : 'ejecuciones terminadas'}
                {excedida && ` · +${numero(etapa.promedio - etapa.estandar)} min sobre el estándar`}
              </small>
            </li>;
          })}
        </ul>
        {!metricas.porEtapa.length && <p className="chart-empty">Registra el término de una ejecución para comparar sus tiempos.</p>}
      </article>
    </div>
  </section>;
}
