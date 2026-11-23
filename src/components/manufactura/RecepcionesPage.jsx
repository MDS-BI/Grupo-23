import { useState } from 'react';
import useManufactura from '../../hooks/useManufactura.js';
import { obtenerOrdenes } from '../../modules/manufactura/ordenes.js';
import {
  obtenerRecepciones,
  guardarRecepcion,
} from '../../modules/manufactura/recepciones.js';
import { nombreReferencia, obtenerReferencias } from '../../modules/manufactura/referencias.js';
import { buscar } from '../../modules/manufactura/almacenamiento.js';
import {
  Campo,
  GestionRegistros,
  opcionesExternas,
  formatoFecha,
} from './Controles.jsx';

export function RecepcionesGestion({ ordenId }) {
  useManufactura();
  const ordenesActivas = obtenerOrdenes().filter(
    (o) => !['Finalizada', 'Cancelada'].includes(o.estado),
  );
  const campos = [
    ...(!ordenId
      ? [
          {
            name: 'orden_id',
            label: 'Orden de producción',
            type: 'select',
            options: ordenesActivas.map((o) => ({
              value: o.orden_id,
              label: `OP-${String(o.orden_id).padStart(4, '0')} · ${buscar('productos', o.producto_id)?.nombre || 'Producto'} (${o.estado})`,
            })),
          },
        ]
      : []),
    {
      name: 'material_id',
      label: 'Material recibido',
      type: 'select',
      options: opcionesExternas('materiales', 'material_id'),
    },
    {
      name: 'proveedor_id',
      label: 'Proveedor',
      type: 'select',
      options: opcionesExternas('proveedores', 'proveedor_id', 'razon_social'),
    },
    {
      name: 'cantidad_recibida',
      label: 'Cantidad recibida',
      type: 'number',
      min: '0.001',
    },
    { name: 'fecha_recepcion', label: 'Fecha de recepción', type: 'date' },
  ];
  return (
    <GestionRegistros
      key={ordenId || 'todas'}
      titulo="Recepciones de materiales"
      singular="Recepción"
      nuevoTexto="Registrar recepción"
      idCampo="recepcion_id"
      permitirEditar={false}
      permitirCrear={!ordenId || ordenesActivas.some((o) => Number(o.orden_id) === Number(ordenId))}
      registros={obtenerRecepciones(ordenId)}
      guardar={(d) =>
        guardarRecepcion({ ...d, ...(ordenId ? { orden_id: ordenId } : {}) })
      }
      campos={campos}
      columnas={[
        {
          key: 'orden_id',
          label: 'Orden y producto',
          render: (r) => {
            const orden = buscar('ordenes', r.orden_id);
            return `OP-${String(r.orden_id).padStart(4, '0')} · ${buscar('productos', orden?.producto_id)?.nombre || 'Producto'}`;
          },
        },
        {
          key: 'material_id',
          label: 'Material',
          render: (r) => nombreReferencia('materiales', r.material_id),
        },
        {
          key: 'proveedor_id',
          label: 'Proveedor',
          render: (r) => nombreReferencia('proveedores', r.proveedor_id),
        },
        {
          key: 'cantidad_recibida',
          label: 'Cantidad',
          render: (r) => `${r.cantidad_recibida} ${obtenerReferencias('materiales').find((m) => Number(m.material_id) === Number(r.material_id))?.unidad || ''}`,
        },
        {
          key: 'fecha_recepcion',
          label: 'Fecha',
          render: (r) => formatoFecha(r.fecha_recepcion),
        },
      ]}
    />
  );
}

export default function RecepcionesPage() {
  useManufactura();
  const [ordenId, setOrdenId] = useState('');
  return (
    <section>
      <header className="page-heading">
        <div>
          <span className="eyebrow">Trazabilidad de insumos</span>
          <h1>Recepción de materiales</h1>
          <p>
            Registra las entregas de proveedores y consulta su orden de
            producción.
          </p>
        </div>
      </header>
      <p className="notice">
        Cada recepción se registra una vez. Su orden, material, proveedor,
        cantidad y fecha quedan conservados en el historial.
      </p>
      <div className="filter-bar">
        <Campo
          campo={{
            name: 'filtro_orden',
            label: 'Filtrar por orden',
            emptyLabel: 'Todas las órdenes',
            type: 'select',
            opcional: true,
            options: obtenerOrdenes().map((o) => ({
              value: o.orden_id,
              label: `OP-${String(o.orden_id).padStart(4, '0')} · ${buscar('productos', o.producto_id)?.nombre || 'Producto'}`,
            })),
          }}
          value={ordenId}
          onChange={setOrdenId}
        />
      </div>
      {!obtenerOrdenes().length && (
        <p className="notice">
          Primero crea una orden en Órdenes de producción.
        </p>
      )}
      <RecepcionesGestion ordenId={ordenId} />
    </section>
  );
}
