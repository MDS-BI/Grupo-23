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
los mismos seis peluches, ocho etapas, seis rutas, seis órdenes, 38 recepciones
y cinco máquinas. El dataset reconstruido usa como fecha base el 27 de noviembre de 2026.
Las alertas de vencimiento usan la fecha actual del navegador.

Los datos se guardan en las claves `manufactura:` del navegador. Por autorización
del usuario del 27 de noviembre de 2026, el primer arranque con Supervisor de
esta versión respalda los ejemplos anteriores y reconstruye únicamente los
datos de Manufactura. **Descargar respaldo anterior** conserva acceso al JSON
previo. Si el respaldo falla, no se sustituyen registros; si falla la carga,
se recuperan los datos anteriores. La reconstrucción se ejecuta una sola vez
por navegador y las ediciones posteriores se conservan al recargar.
Cada navegador tiene su propia copia. Para comparar el estado inicial use un
perfil nuevo. La imagen y la fuente están incluidas en `src/assets/manufactura/`.
Los catálogos externos se representan con muestras y un adaptador sustituible.

La fábrica de ejemplo muestra 14 materiales textiles, 5 repuestos de sus
máquinas, 6 trabajadores y 5 proveedores. Los catálogos y los selectores usan
las mismas referencias. Los respaldos de un almacén vacío también son textiles;
cuando se carga la fábrica solo se conservan respaldos que tengan relaciones
previas. Esta selección no modifica productos, mantenimientos ni recepciones.

El **Oso Bruno con cascabel de 30 cm** es un sexto modelo independiente del
oso original. Cada unidad lleva nueve insumos, incluidos un cascabel y un
bolsillo textil protector. Su ruta tiene ocho etapas, con montaje del cascabel
y prueba de sonido. Su orden de 64 unidades está en producción, con cuatro
etapas terminadas, nueve recepciones completas y cinco pedidos de locales
asignados (16, 12, 10, 14 y 12 unidades).

La fábrica reconstruida incluye 30 pedidos de cinco locales. Las dos órdenes
finalizadas y las tres en producción tienen 64/64 unidades asignadas y todos
sus materiales recibidos. Las finalizadas tienen el 100 % de su ruta terminada;
las iniciadas muestran avances parciales. El lote planificado de Ajolote Lila
tiene cinco pedidos pendientes que suman 64 y tres materiales pendientes de
recepción para demostrar el trabajo previo al inicio. El oso con cascabel ya
está incluido; su ampliación manual conserva la protección contra duplicados.

## Vistas por rol

El selector **Rol de demostración** permite probar los perfiles del MVP local.
El primer arranque usa Supervisor y el perfil elegido se conserva al recargar.

| Rol | Funciones |
|---|---|
| Supervisor | Supervisa todas las áreas y prepara los datos de ejemplo |
| Planificador de producción | Gestiona productos, materiales, rutas y órdenes; consulta ejecuciones |
| Operario de producción | Consulta órdenes abiertas y registra sus etapas de ensamblaje |
| Bodega | Registra recepciones y consulta el historial de entregas |
| Mantenimiento | Gestiona máquinas, mantenimientos, repuestos y equipamiento |

Las operaciones de persistencia también comprueban el perfil. El operario de producción ve sus
etapas y Bodega ve las entregas. Los perfiles son una simulación de interfaz en
el navegador. Un despliegue multiusuario requiere cuentas y autorización en un
servidor, dentro de una ampliación del alcance.

Las recepciones son registros históricos de alta y consulta. Después de guardar,
la edición y la eliminación se rechazan, incluso al borrar la orden asociada.
Una entrega posterior se registra como otra recepción.

Las entregas nuevas requieren una orden abierta. Para finalizar una orden,
su producto debe tener una ruta completa y todas las ejecuciones deben estar
cerradas. Las recepciones anteriores se conservan después del cierre.

## Métricas del panel de producción

En el perfil **Supervisor**, el **Panel de producción** incluye un filtro por
peluche y cuatro métricas: unidades planificadas, unidades de órdenes
finalizadas, cumplimiento del volumen y horas registradas en ejecuciones
terminadas. Los gráficos comparan estados de órdenes, volumen por peluche y
tiempos promedio por etapa frente al estándar. Se actualizan al guardar o
deshacer; no requieren servicios ni dependencias adicionales.

El volumen y los tiempos excluyen órdenes canceladas. El gráfico de estados sí
las incluye. El cierre de una orden aporta su cantidad planificada a las
unidades finalizadas; terminar varias etapas no suma peluches adicionales.
Las alertas de planta y los indicadores generales conservan su alcance global.
Los faltantes se calculan por orden abierta y luego se agrupan por material.
Las entregas de lotes cerrados y los excedentes de otra orden no cubren esos
faltantes: cada recepción está destinada a su propia orden.

## Deshacer y planificar pedidos

**Deshacer cambios** restaura el borrador de un formulario o ruta.
Cada apartado muestra una lista de los últimos veinte cambios del navegador,
con su propio **Deshacer** o **Rehacer**. Puede revertir un cambio anterior sin
perder los posteriores que sean independientes. Guardar otro cambio conserva
las opciones de rehacer. Las eliminaciones recuperan también sus relaciones.
La barra global y las acciones de los registros conservan el acceso al último
cambio. Los encabezados de
los listados no duplican ese botón. Respeta los perfiles y detecta modificaciones de otras pestañas.
El historial se conserva al recargar o reabrir la página; ya no depende solo
de la sesión. Si el cambio no está disponible, el botón indica el motivo.
Las recepciones confirmadas conservan su historial.
Si existen ediciones posteriores del mismo campo o dependencias, la lista
explica qué debe deshacer primero para conservar la coherencia de los datos.

Al pulsar **Eliminar**, la página comprueba sus vínculos. Si está protegido,
muestra el motivo, las rutas u órdenes que lo utilizan y cómo proceder, sin
ofrecer una confirmación que no pueda realizarse. Esos registros permanecen
visibles. Cuando la eliminación está permitida, confirme dentro de la página:
el registro sale de la tabla y **Deshacer eliminación** queda en la lista de
cambios, también al salir y volver al apartado. Los productos usan la misma
confirmación que los demás listados, sin ventanas de confirmación del navegador.
Las ejecuciones de órdenes finalizadas requieren reabrir la orden antes de
eliminarlas para no contradecir su estado y avance.

En **Equipamiento y asignaciones**, la confirmación muestra los trabajadores
afectados. Al confirmar se eliminan juntos el equipamiento y sus asignaciones;
desaparecen de las tablas activas. Un aviso separado ofrece **Deshacer
eliminación**, que recupera ambos con sus identificadores originales.

En **Órdenes de producción**, **Nueva orden** abre un único formulario:
primero las fechas de inicio y término; después el peluche, el local y la
cantidad. Puede incluir varios pedidos del mismo modelo. **Crear orden**
guarda el lote, los pedidos nuevos y sus vínculos juntos. La cantidad a fabricar
se calcula con la suma de los pedidos incluidos; cancelar no guarda borradores.
También puede seleccionar pedidos pendientes ya registrados.

El mínimo es **64 peluches por lote del mismo modelo**, sumando uno o varios
pedidos. Un local puede pedir 30, otro 15 y otro 19, o un solo local puede pedir
64 o más. Cada pedido requiere una cantidad entera positiva. Las fechas de
inicio y término son comunes a todos los pedidos del lote. Los ejemplos
reconstruidos tienen lotes de 64. Los botones de peluches filtran las órdenes y
muestran debajo sus pedidos, códigos y locales.

**Asignar pedidos**, en una orden planificada existente, permite vincular pedidos
pendientes, añadir pedidos de locales o ampliar el lote sin crear otra orden.
La selección no puede superar la cantidad del lote ni mezclar modelos o pedidos
ya asignados a otra orden. El detalle muestra los locales y sus cantidades.
Los perfiles de Supervisor y Planificador de producción gestionan este flujo;
el Operario de producción conserva su vista de ejecuciones sin datos de locales.

El resumen distingue **órdenes en esta vista** de **órdenes con cupo para
pedidos**: solo las planificadas con unidades sin asignar
cuentan con cupo. Una orden 64/64 sigue en producción si corresponde, pero no
incrementa el contador de cupos. Antes de iniciar producción, todo el lote debe
estar asignado a locales. Al salir de planificación se bloquean los cambios
de cantidad, modelo y pedidos; las órdenes iniciadas, finalizadas o canceladas
no ofrecen nuevos cupos. La asignación a locales y el avance de fabricación
son indicadores distintos.

Cada aviso de Deshacer/Rehacer tiene una **×** para descartarlo sin modificar
registros. El aviso descartado permanece oculto al recargar y deja de ofrecerse
en Deshacer global. Las confirmaciones de operaciones también pueden cerrarse.

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
