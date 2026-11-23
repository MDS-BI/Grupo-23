# Manufactura y Operaciones — Grupo 23

La aplicación actual utiliza React y Vite e implementa las cinco historias de `Historias_de_Usuario_Modulo_Manufactura_FINAL.pdf`: productos y materiales; etapas y rutas; órdenes y ejecución real; recepción de materiales; máquinas, mantenimiento y equipamiento.

## Ejecución reproducible

Use Node.js 24.19.0 y npm 11.17.0. La versión de Node está en `.nvmrc` y las
dependencias exactas en `package-lock.json`. Desde la carpeta del repositorio
ejecute lo siguiente.

```bash
npm ci
npm run dev
```

Abra la dirección que muestre Vite, normalmente `http://localhost:5173/`.
Con la misma revisión del repositorio y un perfil nuevo de navegador, se cargan
los mismos cinco peluches, seis etapas, cinco rutas, cinco órdenes, 28 recepciones
y cinco máquinas. El dataset usa como fecha base el 16 de noviembre de 2026.
Las alertas de vencimiento usan la fecha actual del navegador.

Los datos existentes se conservan en las claves `manufactura:` del navegador.
Cada navegador tiene su propia copia. Para comparar el estado inicial use un
perfil nuevo. La imagen y la fuente están incluidas en `src/assets/manufactura/`.
Los catálogos externos se representan con muestras y un adaptador sustituible.

## Vistas por rol

El selector **Rol de demostración** permite probar los perfiles del MVP local.
El primer arranque usa Supervisor y el perfil elegido se conserva al recargar.

| Rol | Funciones |
|---|---|
| Supervisor | Supervisa todas las áreas y prepara los datos de ejemplo |
| Planificación | Gestiona productos, materiales, rutas y órdenes; consulta ejecuciones |
| Ensamble | Consulta órdenes abiertas y registra sus etapas de ensamblaje |
| Bodega | Registra recepciones y consulta el historial de entregas |
| Mantenimiento | Gestiona máquinas, mantenimientos, repuestos y equipamiento |

Las operaciones de persistencia también comprueban el perfil. Ensamble ve sus
etapas y Bodega ve las entregas. Los perfiles son una simulación de interfaz en
el navegador. Un despliegue multiusuario requiere cuentas y autorización en un
servidor, dentro de una ampliación del alcance.

Las recepciones son registros históricos de alta y consulta. Después de guardar,
la edición y la eliminación se rechazan, incluso al borrar la orden asociada.
Una entrega posterior se registra como otra recepción.

Las entregas nuevas requieren una orden abierta. Para finalizar una orden,
su producto debe tener una ruta completa y todas las ejecuciones deben estar
cerradas. Las recepciones anteriores se conservan después del cierre.

## Deshacer y planificar pedidos

**Deshacer cambios** restaura el borrador de un formulario o ruta.
**Deshacer** revierte el último cambio guardado de la pestaña. Permite recuperar
eliminaciones válidas junto con sus relaciones, hasta veinte operaciones en
orden. Está disponible en la barra global y en las acciones de los registros
afectados. Respeta los perfiles y detecta modificaciones de otras pestañas.
Las recepciones confirmadas conservan su historial.

Al pulsar **Eliminar**, confirme dentro de la página. Tras confirmar,
**Deshacer eliminación** aparece en el aviso y en una fila marcada **Eliminado**
en la tabla. Esa fila permite recuperar el registro aunque salga y vuelva al
apartado, mientras la eliminación siga siendo el último cambio deshacible.

En **Órdenes de producción**, pulse un modelo en **Pedidos por peluche**.
El menú muestra el código de cada pedido, el código y nombre del local y su
cantidad. La demo incluye cinco locales ficticios y cinco pedidos por modelo,
que suman 64. Los perfiles de Supervisor y Planificación pueden registrar pedidos
y abrir una orden con **Planificar estos pedidos**.

Cada orden nueva requiere al menos 64 peluches enteros. Las órdenes históricas
mantienen sus cantidades al editar otros campos. Los pedidos se asignan a la
orden al guardar y vuelven a quedar pendientes si se deshace esa creación.
Los botones de apertura desplazan la vista y enfocan el formulario o detalle.

## Comprobación y trazabilidad

```bash
npm test -- --run
npm run build
```

`npm run test:manufactura` ejecuta las pruebas del módulo. Se cubren los flujos
de HU1-HU5, las diferencias entre perfiles, las operaciones rechazadas, la
conservación de recepciones y el dataset independiente del reloj.

La guía de evaluación está en [quickstart.md](specs/001-erp-base-module/quickstart.md).
Las reglas están en [spec.md](specs/001-erp-base-module/spec.md), las decisiones
técnicas en [plan.md](specs/001-erp-base-module/plan.md) y su trazabilidad en
[tasks.md](specs/001-erp-base-module/tasks.md).

El desarrollo utiliza apoyo de OpenCode y Codex para redactar especificaciones,
implementar las historias y proponer correcciones. Las decisiones de la revisión
del 23 de noviembre de 2026 se registran en spec, plan y tasks. Las pruebas
automatizadas validan los perfiles y las reglas. La revisión de escritorio y
móvil se documenta según lo efectivamente comprobado.

<details>
<summary>Documentación histórica de la plantilla original</summary>

Esta sección describe el ERP base anterior. Las instrucciones vigentes para
Manufactura están arriba y en la guía de evaluación.

---

# ERP Software Base Module (Vite + Vanilla JS)

Minimal single-page app serving as an Enterprise Resource Planning (ERP) software base module. It provides the common foundation for building custom ERP modules: master data management (Entities) and linked transactional documents (Documents) with create/edit/delete/search, validation, and browser localStorage persistence — using Vite and vanilla HTML, CSS, and JavaScript.

The user interface is fully in **Spanish** (default terms: Entidad / Documento; module name: Módulo Base ERP), including labels, validation messages, empty states, and dialogs.

Entities carry standard ERP master-data fields (name, code, tax ID, email, phone, address, category, target date, credit limit, payment terms). Documents use series + folio numbering and carry a monetary breakdown (subtotal, discount, tax, total), currency, payment terms, notes, quantity, dates, and status.

The app presents itself as a coherent ERP workspace:

- **Workspace shell** — every screen lives inside a branded chrome: a top bar with a logo (an SVG monogram derived from the module name) and module name, plus a persistent sidebar of module buttons (Panel, Entidades, Documentos, Búsqueda). The active module is highlighted (`aria-current="page"`), and the sidebar collapses to an icon rail on narrow viewports.
- **Home dashboard** — the entry screen offers quick-action buttons for key ERP tasks (new entity, new document, open management areas, find records) and live statistic cards showing record counts.
- **Design tokens** — styling is driven by CSS custom properties in `src/styles.css`, so branding changes apply globally.

## Setup

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:5173 (or the URL Vite prints).

## Tests

Run the full test suite (unit + integration) with:

```bash
npm test
```

Or a one-off run without watch mode:

```bash
npx vitest run
```

## Building Custom Modules

Custom ERP modules built on this base define:

- What an **Entity** represents (e.g., customer, product, asset) plus domain-specific fields.
- What a **Document** represents (e.g., order, invoice, contract).
- Module-specific labels and validation rules.

The base module handles identity generation, timestamps, referential integrity between entities and documents, cascade deletion, navigation, and search. See `specs/001-erp-base-module/` for the full specification.

## Tailoring via Configuration

All tailoring lives in one place: the `userConfig` object at the top of `src/module-config.js`. Developers edit this single export; no core code changes are required. Available knobs:

- `moduleName` — display name shown in the top bar, dashboard, and document title; also derives the logo monogram.
- `labels` — rename Entity/Document terms across every screen, including sidebar buttons, quick actions, forms, and messages. Spanish articles and agreements (el/la, seleccionado/a) are derived from the first word of each configured term.
- `customFields` — declare extra fields per record type with `target` (`entity` or `document`), `key`, `label`, `type` (`text`, `number`, `date`, or `select`), optional `required`, and `options` for selects. Keys must not collide with base field names (see `specs/001-erp-base-module/data-model.md`). Values persist alongside records and appear in search results.
- `statusLifecycle` — restrict document statuses to a configured list of `statuses` with permitted `transitions` between them. Without it, status stays a free-form field.
- `theme.accentColor` — a hex color (e.g., `"#0f62fe"`) applied across the shell as highlights and primary controls. Invalid values fall back to the default.

If the configuration is invalid (unknown types, bad keys, transitions referencing unknown statuses, non-hex accent colors), the app shows the problems in a banner and falls back to defaults instead of breaking.

## Notes

- Data is persisted to `localStorage` under the keys `erp_base_module:entities` and `erp_base_module:documents`.
- Deleting an entity also deletes its documents (cascade).
- This project intentionally uses vanilla HTML, CSS, and JavaScript for simplicity.

</details>
