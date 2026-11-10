import { useState } from 'react';
import useManufactura from '../../hooks/useManufactura.js';
import { obtenerOrdenes } from '../../modules/manufactura/ordenes.js';
import {
  obtenerRecepciones,
  guardarRecepcion,
  eliminarRecepcion,
} from '../../modules/manufactura/recepciones.js';
import { nombreReferencia } from '../../modules/manufactura/referencias.js';
import {
  Campo,
  GestionRegistros,
  opcionesExternas,
  formatoFecha,
} from './Controles.jsx';

export function RecepcionesGestion({ ordenId }) {
  useManufactura();
  const campos = [
    ...(!ordenId
      ? [
          {
            name: 'orden_id',
            label: 'Orden de producción',
            type: 'select',
            options: obtenerOrdenes().map((o) => ({
              value: o.orden_id,
              label: `Orden #${o.orden_id}`,
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
      registros={obtenerRecepciones(ordenId)}
      guardar={(d, id) =>
        guardarRecepcion(
          { ...d, ...(ordenId ? { orden_id: ordenId } : {}) },
          id,
        )
      }
      eliminar={eliminarRecepcion}
      campos={campos}
      columnas={[
        { key: 'orden_id', label: 'Orden', render: (r) => `#${r.orden_id}` },
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
        { key: 'cantidad_recibida', label: 'Cantidad' },
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
          <span className="eyebrow">HU4 · Trazabilidad de insumos</span>
          <h1>Recepción de materiales</h1>
          <p>
            Registra las entregas de proveedores y consulta su orden de
            producción.
          </p>
        </div>
      </header>
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
              label: `Orden #${o.orden_id}`,
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
