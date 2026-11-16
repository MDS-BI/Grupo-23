Feedback Avance 01 (26/10/26)

- no hay cambios en el repositorio, por lo cual no se puede dar feedback.

Proximos pasos:
 
- rectificar puntos anteriores 
- trabajar en los specs (historias de usuario, US) para definir tareas
- dividirse las US y tareas para una siguiente iteracion (avances cada semana)
- ejecutar una version integrada de prueba


Feedback Avance 02 (2/11/26)

- Buen manejo de estructura de proyecto, pero el trabajo en ramas no permite revisar avance incremental
- no se observan historias de usuario por miembro del grupo (solo actividad de 3 persona)
- Evitar trabajar con modelos de IA fuera de speckit en local, porque crean ramas nuevas y se pierde la integridad del proyecto

Proximos pasos:

- rectificar puntos anteriores  y crear tareas a partir de los specs
- hacer primera implmentacion, registar modificaciones/incremental y volver al spec
- dividir el grupo entre modificaciones (ajustes previos) e incremental (nueva funcionalidad)
- integrar nueva version en 2 semanas

Feedback Avance 03 (16/11/26)

- Cambios en la especificación: spec.md y tasks.md se reescribieron del ERP base genérico al Módulo 7 Manufactura y Operaciones (HU1–HU5, FR-001 a FR-038). Son claros y coherentes entre sí: la tabla de trazabilidad FR/XR/SC → tareas cubre todo. Falta que tasks.md se actualice a nivel de tarea: T001–T114 siguen con "[ ]" y solo el bloque final "Implementación React" tiene casillas marcadas.
- Consistencia sitio–especificación:
  - T001, T002 y T012–T014: `src/modules/manufactura/*.js` existe, pero tasks.md las deja sin marcar. Además, las rutas planificadas no coinciden: el sitio usa `.jsx`, `almacenamiento.js` en vez de `src/storage.js` y `src/App.jsx` en vez de `src/app.js`.
  - FR-017 y FR-023 a FR-030: hay implementación (`RecursosPage.jsx`, `recursos.js`), pero su contenido no se incluyó; no verificable.
  - Sin especificar: panel de alertas de producción (`AlertasProduccion.jsx`, `alertas.js`), filtros (`BarraFiltros.jsx`), alta de materiales locales (`NuevoMaterial.jsx`) y datos de demo (`demo-peluches.js`) no están en spec.md ni tasks.md.
  - Quedan tests del ERP base (`tests/integration/*.test.js`, `tests/unit/storage.test.js`) que importan `src/storage.js` y `src/app.js`, que ya no existen.

Proximos pasos:

- Marcar en tasks.md las tareas T001–T114 ya implementadas y corregir las rutas a `.jsx`/`almacenamiento.js`
- Agregar a spec.md (FR) y tasks.md las alertas de producción, filtros, materiales locales y demo
- hacer mejoras de funcionalidad e interfaz de usuario, incluir data simulada para probar campos, incluir mejoras de estilo, transicion, navegacion, etcetera.

Presentacion de MVP final en 2 semanas.

