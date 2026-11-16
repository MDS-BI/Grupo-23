import {
  obtenerReferencias,
  usandoReferenciasDeMuestra,
} from '../../modules/manufactura/referencias.js';
import { demoPeluchesCargada } from '../../modules/manufactura/demo-peluches.js';

export default function ReferenciasPage() {
  return (
    <section>
      <header className="page-heading">
        <div>
          <span className="eyebrow">Integración entre módulos</span>
          <h1>Catálogos de referencia</h1>
          <p>
            Consulta los materiales de fabricación y las referencias de los
            otros módulos.
          </p>
        </div>
      </header>
      {usandoReferenciasDeMuestra() && (
        <p className="notice">
          Estás usando referencias de muestra para probar los flujos. Los
          catálogos reales de los otros módulos aún no están conectados.
        </p>
      )}
      {demoPeluchesCargada() && (
        <p className="notice">
          La fábrica de ejemplo usa proveedores y personal ficticios.
        </p>
      )}
      <div className="reference-grid">
        {[
          ['materiales', 'Materiales', 'Logística y materiales locales'],
          ['repuestos', 'Repuestos', 'Logística e inventario'],
          ['trabajadores', 'Trabajadores', 'Recursos Humanos'],
          ['proveedores', 'Proveedores', 'Adquisición y compras'],
        ].map(([tipo, titulo, origen]) => (
          <article className="card" key={tipo}>
            <span className="eyebrow">Solo lectura · {origen}</span>
            <h2>{titulo}</h2>
            <ul className="reference-list">
              {obtenerReferencias(tipo).map((r, i) => (
                <li key={i}>
                  {r.nombre || r.razon_social}
                  {r.unidad && (
                    <small>
                      {r.unidad}
                      {r.material_id < 0 ? ' · Material local' : ''}
                    </small>
                  )}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
