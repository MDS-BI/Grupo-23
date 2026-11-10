import {
  obtenerReferencias,
  usandoReferenciasDeMuestra,
} from '../../modules/manufactura/referencias.js';
export default function ReferenciasPage() {
  return (
    <section>
      <header className="page-heading">
        <div>
          <span className="eyebrow">Integración entre módulos</span>
          <h1>Catálogos de referencia</h1>
          <p>
            Consulta los registros de Logística, Compras y Recursos Humanos.
          </p>
        </div>
      </header>
      {usandoReferenciasDeMuestra() && (
        <p className="notice">
          Estás usando referencias de muestra para probar los flujos. Los
          catálogos reales de los otros módulos aún no están conectados.
        </p>
      )}
      <div className="reference-grid">
        {[
          ['materiales', 'Materiales', 'Logística e inventario'],
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
                  {r.unidad && <small>{r.unidad}</small>}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
