# Tareas: Módulo 7 - Manufactura y Operaciones

**Entrada**: Documentos de diseño desde `/specs/001-erp-base-module/`
**Prerrequisitos**: spec.md (obligatorio para las historias de usuario), plan.md, data-model.md
**Historias cubiertas**: HU1 a HU5 (todas Prioridad P1)

## Formato: `[ID] [P?] [Historia] Descripción`

- **[P]**: puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Historia]**: historia de usuario a la que pertenece la tarea (`US1` a `US5`)
- Las tareas de prueba se escriben primero y deben fallar antes de implementar
- Rutas de archivo corregidas según la estructura real: `src/modules/manufactura/`, `src/components/manufactura/`, almacenamiento en `src/modules/manufactura/almacenamiento.js` y aplicación principal en `src/App.jsx`
- Los componentes de interfaz usan extensión `.jsx`; los módulos de dominio y pruebas de lógica conservan `.js`, y las pruebas con JSX usan `.test.jsx`

---

## Fase 1: Configuración y Prerrequisitos Compartidos

**Propósito**: Preparar la base común que todas las historias necesitan.

- [x] T001 Crear la estructura de carpetas `src/modules/manufactura/`, `src/components/manufactura/`, `tests/unit/manufactura/`, `tests/integration/manufactura/` y registrar la navegación del módulo en `src/App.jsx`
- [x] T002 [P] Extender `src/modules/manufactura/almacenamiento.js` con ayudantes genéricos de persistencia y claves con prefijo `manufactura:`
- [x] T003 [P] Definir los contratos de referencias externas `MATERIAL`, `TRABAJADOR`, `PROVEEDOR` y `REPUESTO`, con catálogos locales de solo lectura para pruebas en `src/modules/manufactura/referencias.js`
- [x] T004 [P] Crear fixtures compartidos de todos los catálogos y registros de ejemplo en `src/modules/manufactura/demo-peluches.js` (cargados al iniciar desde `src/main.jsx`)

**Punto de control**: La base de almacenamiento, navegación y datos de referencia está lista para iniciar cualquier historia.

---

## Fase 2: Historia de Usuario 1 - Gestionar productos y sus materiales (Prioridad: P1) 🎯 MVP

**Objetivo**: Registrar productos y su composición de materiales, indicando la cantidad requerida por unidad.
**Prueba Independiente**: Un usuario crea un producto, le asocia al menos un material con su cantidad por unidad y, al consultar el producto, ve correctamente esa composición.

### Pruebas para la Historia de Usuario 1

- [x] T010 [P] [US1] Pruebas unitarias de validación y persistencia de `PRODUCTO` y `PRODUCTO_MATERIAL` en `tests/unit/manufactura/historias.test.js`
- [x] T011 [P] [US1] Pruebas de integración para crear producto, asociar material y consultar la composición en `tests/integration/manufactura/productos-render.test.jsx`

### Implementación de la Historia de Usuario 1

- [x] T012 [P] [US1] Crear los validadores de `PRODUCTO` (nombre y tipo obligatorios) y `PRODUCTO_MATERIAL` (material obligatorio, `cantidad_por_unidad > 0`) en `src/modules/manufactura/productos.js`
- [x] T013 [P] [US1] Agregar las claves `manufactura:productos` y `manufactura:producto_material` a `src/modules/manufactura/almacenamiento.js`
- [x] T014 [US1] Implementar el repositorio CRUD de productos y de su composición en `src/modules/manufactura/productos.js` (depende de T012, T013)
- [x] T015 [P] [US1] Crear el formulario de producto (nombre, tipo) con subformulario de materiales y cantidad por unidad en `src/components/manufactura/ProductoForm.jsx`
- [x] T016 [P] [US1] Crear el listado y la vista de detalle del producto mostrando todos sus materiales y cantidades en `src/components/manufactura/ProductoList.jsx`
- [x] T017 [US1] Conectar alta, edición y asociación/eliminación de materiales al producto en `src/App.jsx` (depende de T014, T015)
- [x] T018 [US1] Mostrar retroalimentación de validación por campo e impedir el guardado con datos faltantes en `src/components/manufactura/ProductoForm.jsx`
- [x] T019 [US1] Recargar los datos y la composición del producto al reabrir su edición en `src/App.jsx`
- [x] T020 [P] [US1] Estilos del formulario, subformulario de materiales y detalle de producto en `src/styles.css`

**Punto de control**: La Historia de Usuario 1 debe estar completamente funcional y ser comprobable de forma independiente.

**Criterios de aceptación cubiertos**:

| Escenario | Tareas |
|---|---|
| 1. Registrar producto con nombre y tipo | T012, T014, T015, T017 |
| 2. Asociar material con cantidad por unidad | T012, T014, T015, T017 |
| 3. Consultar todos los materiales y cantidades | T016, T019 |
| 4. Modificar producto y persistir cambios | T014, T017, T019 |
| 5. Impedir guardado si falta información obligatoria | T012, T018 |

---

## Fase 3: Historia de Usuario 2 - Definir el proceso y las etapas de fabricación (Prioridad: P1)

**Objetivo**: Definir etapas de fabricación y la ruta de cada producto, conservando el orden por secuencia.
**Prueba Independiente**: Un usuario crea varias etapas, las asocia a un producto mediante una ruta y comprueba que aparecen ordenadas según la secuencia definida.

### Pruebas para la Historia de Usuario 2

- [x] T030 [P] [US2] Pruebas unitarias de validación de `ETAPA_FABRICACION` y `RUTA_PRODUCTO` en `tests/unit/manufactura/historias.test.js`
- [x] T031 [P] [US2] Pruebas de integración para crear etapas, armar una ruta y verificar el orden por secuencia en `tests/integration/manufactura/historias-flujo.test.jsx`

### Implementación de la Historia de Usuario 2

- [x] T032 [P] [US2] Crear los validadores de `ETAPA_FABRICACION` (nombre, tipo y tiempo estándar obligatorios; tiempo > 0) en `src/modules/manufactura/etapas.js`
- [x] T033 [P] [US2] Crear los validadores de `RUTA_PRODUCTO` (producto, etapa y secuencia obligatorios; secuencia > 0) en `src/modules/manufactura/rutas.js`
- [x] T034 [P] [US2] Agregar las claves `manufactura:etapas` y `manufactura:rutas` a `src/modules/manufactura/almacenamiento.js`
- [x] T035 [US2] Implementar el repositorio CRUD de etapas en `src/modules/manufactura/etapas.js` (depende de T032, T034)
- [x] T036 [US2] Implementar el repositorio de rutas con ordenamiento por `secuencia` en `src/modules/manufactura/rutas.js` (depende de T033, T034)
- [x] T037 [P] [US2] Crear el formulario de etapas (nombre, tipo, tiempo estándar) en `src/components/manufactura/EtapasPage.jsx`
- [x] T038 [P] [US2] Crear el editor de ruta del producto con selección de etapas y asignación de secuencia en `src/components/manufactura/EtapasPage.jsx`
- [x] T039 [US2] Conectar alta/edición de etapas y configuración de la ruta al producto en `src/App.jsx` (depende de T035, T036, T037, T038)
- [x] T040 [US2] Mostrar la ruta resultante ordenada por secuencia en la vista de detalle del producto en `src/components/manufactura/ProductoList.jsx`
- [x] T041 [US2] Validar datos obligatorios de etapa y ruta con mensajes claros en `src/components/manufactura/EtapasPage.jsx` y `src/components/manufactura/EtapasPage.jsx`
- [x] T042 [P] [US2] Estilos del formulario de etapas y del editor de rutas en `src/styles.css`

**Punto de control**: La Historia de Usuario 2 debe estar completamente funcional y ser comprobable de forma independiente.

**Criterios de aceptación cubiertos**:

| Escenario | Tareas |
|---|---|
| 1. Registrar etapa con nombre, tipo y tiempo estándar | T032, T035, T037, T039 |
| 2. Seleccionar etapas que forman la ruta del producto | T036, T038, T039 |
| 3. Asignar y conservar la secuencia de etapas | T033, T036, T038 |
| 4. Consultar el proceso ordenado por secuencia | T036, T040 |
| 5. Rechazar registros con datos obligatorios faltantes | T032, T033, T041 |

---

## Fase 4: Historia de Usuario 3 - Crear y controlar órdenes de producción (Prioridad: P1)

**Objetivo**: Crear órdenes de producción y registrar la ejecución real de sus etapas con máquina, trabajador y tiempos.
**Prueba Independiente**: Un usuario crea una orden para un producto, registra al menos una ejecución de etapa con trabajador, máquina, inicio y fin reales, y consulta esa información asociada a la orden.

### Pruebas para la Historia de Usuario 3

- [x] T050 [P] [US3] Pruebas unitarias de validación de `ORDEN_PRODUCCION` (incluida `fecha_fin >= fecha_inicio`) y del cálculo de `tiempo_uso_min` en `tests/unit/manufactura/historias.test.js`
- [x] T051 [P] [US3] Pruebas de integración para crear orden, registrar ejecuciones y consultar el avance en `tests/integration/manufactura/historias-flujo.test.jsx`

### Implementación de la Historia de Usuario 3

- [x] T052 [P] [US3] Crear los validadores de `ORDEN_PRODUCCION` (producto, cantidad planificada > 0, estado y fechas obligatorios; fin no anterior a inicio) en `src/modules/manufactura/ordenes.js`
- [x] T053 [P] [US3] Crear los validadores de `EJECUCION_ETAPA` (orden, etapa, máquina, trabajador, inicio y fin reales obligatorios) en `src/modules/manufactura/ordenes.js`
- [x] T054 [P] [US3] Agregar las claves `manufactura:ordenes` y `manufactura:ejecuciones` a `src/modules/manufactura/almacenamiento.js`
- [x] T055 [US3] Implementar el repositorio CRUD de órdenes en `src/modules/manufactura/ordenes.js` (depende de T052, T054)
- [x] T056 [US3] Implementar el repositorio de ejecuciones con cálculo de `tiempo_uso_min` a partir de inicio/fin real en `src/modules/manufactura/ordenes.js` (depende de T053, T054)
- [x] T057 [P] [US3] Crear el formulario de orden (producto, cantidad planificada, estado, fechas) en `src/components/manufactura/OrdenesPage.jsx`
- [x] T058 [P] [US3] Crear el formulario de ejecución de etapa (etapa, máquina, trabajador, inicio/fin real) en `src/components/manufactura/OrdenesPage.jsx`
- [x] T059 [P] [US3] Crear la vista de detalle de la orden con sus ejecuciones y avance por etapa en `src/components/manufactura/OrdenesPage.jsx`
- [x] T060 [US3] Conectar creación/edición de órdenes y registro de ejecuciones en `src/App.jsx` (depende de T055, T056, T057, T058)
- [x] T061 [US3] Rechazar fechas inválidas (fin anterior a inicio) y mostrar la explicación en `src/components/manufactura/OrdenesPage.jsx`
- [x] T062 [US3] Listar las etapas ejecutadas con máquina, trabajador y tiempos en `src/components/manufactura/OrdenesPage.jsx`
- [x] T063 [P] [US3] Estilos del formulario de orden, ejecuciones y vista de avance en `src/styles.css`

**Punto de control**: Las Historias de Usuario 1, 2 y 3 deben funcionar de forma independiente.

**Criterios de aceptación cubiertos**:

| Escenario | Tareas |
|---|---|
| 1. Crear orden con producto, cantidad, fechas y estado | T052, T055, T057, T060 |
| 2. Registrar nueva ejecución de etapa asociada a la orden | T053, T056, T058, T060 |
| 3. Asociar máquina y trabajador a la ejecución | T053, T056, T058 |
| 4. Guardar inicio real, fin real y tiempo de uso | T053, T056, T058, T062 |
| 5. Consultar etapas ejecutadas e información registrada | T059, T062 |
| 6. Rechazar fecha de término anterior a la de inicio | T052, T061 |

---

## Fase 5: Historia de Usuario 4 - Registrar la recepción de materiales para producción (Prioridad: P1)

**Objetivo**: Registrar los materiales recibidos para una orden con su proveedor, cantidad y fecha, manteniendo trazabilidad.
**Prueba Independiente**: Un usuario selecciona una orden existente, registra la recepción de un material indicando proveedor, cantidad y fecha, y luego encuentra esa recepción al consultar la orden.

### Pruebas para la Historia de Usuario 4

- [x] T070 [P] [US4] Pruebas unitarias de validación y persistencia de `RECEPCION_MATERIAL` en `tests/unit/manufactura/historias.test.js`
- [x] T071 [P] [US4] Pruebas de integración para registrar recepciones y consultarlas desde la orden en `tests/integration/manufactura/historias-flujo.test.jsx`

### Implementación de la Historia de Usuario 4

- [x] T072 [P] [US4] Crear los validadores de `RECEPCION_MATERIAL` (orden, material, proveedor, cantidad recibida > 0 y fecha obligatorios) en `src/modules/manufactura/recepciones.js`
- [x] T073 [P] [US4] Agregar la clave `manufactura:recepciones` a `src/modules/manufactura/almacenamiento.js`
- [x] T074 [US4] Implementar el repositorio CRUD de recepciones asociadas a una orden en `src/modules/manufactura/recepciones.js` (depende de T072, T073)
- [x] T075 [P] [US4] Crear el formulario de recepción (material, proveedor, cantidad, fecha) en `src/components/manufactura/RecepcionesPage.jsx`
- [x] T076 [P] [US4] Crear la lista de recepciones con material, proveedor, cantidad y fecha en `src/components/manufactura/RecepcionesPage.jsx`
- [x] T077 [US4] Conectar el alta/edición de recepciones a una orden existente en `src/App.jsx` (depende de T074, T075)
- [x] T078 [US4] Mostrar todas las recepciones asociadas a la orden en la vista de detalle de la orden en `src/components/manufactura/OrdenesPage.jsx`
- [x] T079 [US4] Impedir el guardado cuando falta material, proveedor, cantidad o fecha y señalar el campo faltante en `src/components/manufactura/RecepcionesPage.jsx`
- [x] T080 [P] [US4] Estilos del formulario y la lista de recepciones en `src/styles.css`

**Punto de control**: La Historia de Usuario 4 debe funcionar de forma independiente y quedar asociada a la orden.

**Criterios de aceptación cubiertos**:

| Escenario | Tareas |
|---|---|
| 1. Crear recepción asociada a una orden | T072, T074, T075, T077 |
| 2. Guardar material, proveedor, cantidad y fecha | T072, T074, T075, T077 |
| 3. Visualizar todas las recepciones de la orden | T076, T078 |
| 4. Consultar detalle de cada recepción | T076, T078 |
| 5. Impedir guardado si falta algún dato obligatorio | T072, T079 |

---

## Fase 6: Historia de Usuario 5 - Gestionar máquinas, mantenimiento y equipamiento (Prioridad: P1)

**Objetivo**: Gestionar máquinas, sus mantenimientos con repuestos y el equipamiento asignado a trabajadores.
**Prueba Independiente**: Un usuario registra una máquina, le agrega un mantenimiento con técnico y repuestos, y registra una asignación de equipamiento a un trabajador; cada registro permanece asociado a su entidad correspondiente.

### Pruebas para la Historia de Usuario 5

- [x] T090 [P] [US5] Pruebas unitarias de validación de `MAQUINA` y `MANTENIMIENTO_MAQUINA` en `tests/unit/manufactura/historias.test.js`
- [x] T091 [P] [US5] Pruebas unitarias de `MANTENIMIENTO_REPUESTO` y `ASIGNACION_EQUIPAMIENTO` en `tests/unit/manufactura/historias.test.js`
- [x] T092 [P] [US5] Pruebas de integración para máquina + mantenimiento + repuestos y asignación de equipamiento en `tests/integration/manufactura/historias-flujo.test.jsx`

### Implementación de la Historia de Usuario 5

- [x] T093 [P] [US5] Crear los validadores de `MAQUINA` (código, nombre, estado y capacidad por hora obligatorios; capacidad > 0) en `src/modules/manufactura/recursos.js`
- [x] T094 [P] [US5] Crear los validadores de `MANTENIMIENTO_MAQUINA` (máquina, técnico, tipo, costo y fecha obligatorios) en `src/modules/manufactura/recursos.js`
- [x] T095 [P] [US5] Crear los validadores de `MANTENIMIENTO_REPUESTO` (mantenimiento, repuesto y cantidad > 0) en `src/modules/manufactura/recursos.js`
- [x] T096 [P] [US5] Crear los validadores de `EQUIPAMIENTO` y `ASIGNACION_EQUIPAMIENTO` (trabajador, equipamiento y fecha de entrega obligatorios) en `src/modules/manufactura/recursos.js`
- [x] T097 [P] [US5] Agregar las claves `manufactura:maquinas`, `manufactura:mantenimientos`, `manufactura:mantenimiento_repuestos`, `manufactura:equipamiento` y `manufactura:asignaciones` a `src/modules/manufactura/almacenamiento.js`
- [x] T098 [US5] Implementar el repositorio CRUD de máquinas en `src/modules/manufactura/recursos.js` (depende de T093, T097)
- [x] T099 [US5] Implementar el repositorio de mantenimientos y su consumo de repuestos en `src/modules/manufactura/recursos.js` (depende de T094, T095, T097)
- [x] T100 [US5] Implementar el repositorio de equipamiento y asignaciones a trabajadores en `src/modules/manufactura/recursos.js` (depende de T096, T097)
- [x] T101 [P] [US5] Crear el formulario de máquina (código, nombre, estado, capacidad por hora) en `src/components/manufactura/RecursosPage.jsx`
- [x] T102 [P] [US5] Crear el formulario de mantenimiento con selección de técnico y carga de repuestos y cantidades en `src/components/manufactura/RecursosPage.jsx`
- [x] T103 [P] [US5] Crear el formulario de asignación de equipamiento (trabajador, equipamiento, fecha de entrega) en `src/components/manufactura/RecursosPage.jsx`
- [x] T104 [P] [US5] Crear la vista de máquinas con su historial de mantenimientos asociados en `src/components/manufactura/RecursosPage.jsx`
- [x] T105 [US5] Conectar alta/edición de máquinas, mantenimientos, repuestos y asignaciones en `src/App.jsx` (depende de T098, T099, T100)
- [x] T106 [US5] Validar datos obligatorios de mantenimiento y asignación con mensajes claros en `src/components/manufactura/RecursosPage.jsx` y `src/components/manufactura/RecursosPage.jsx`
- [x] T107 [P] [US5] Estilos de máquinas, mantenimientos y equipamiento en `src/styles.css`

**Punto de control**: Las Historias de Usuario 1-5 deben estar completamente funcionales y ser comprobables de forma independiente.

**Criterios de aceptación cubiertos**:

| Escenario | Tareas |
|---|---|
| 1. Registrar máquina con código, nombre, estado y capacidad | T093, T098, T101, T105 |
| 2. Registrar mantenimiento con máquina, técnico, tipo, costo y fecha | T094, T099, T102, T105 |
| 3. Asociar uno o más repuestos con cantidades al mantenimiento | T095, T099, T102 |
| 4. Registrar asignación de equipamiento a un trabajador con fecha | T096, T100, T103, T105 |
| 5. Consultar mantenimientos anteriores de una máquina | T104 |
| 6. Impedir guardado si falta información obligatoria | T094, T096, T106 |

---

## Fase 7: Pulido y Preocupaciones Transversales

**Propósito**: Validar la integración de las cinco historias y la calidad global del módulo.

- [x] T110 [P] Añadir prueba de integración del flujo completo producto → ruta → orden → recepción en `tests/integration/manufactura/historias-flujo.test.jsx`
- [x] T111 [P] Revisar accesibilidad (etiquetas, orden de foco, mensajes de error) en `src/components/manufactura/`
- [x] T112 Verificar integridad referencial y borrado en cascada: producto→ruta, orden→ejecuciones/recepciones, máquina→mantenimientos, mantenimiento→repuestos en `src/modules/manufactura/`
- [x] T113 Actualizar `README.md` con el módulo de manufactura y las claves de almacenamiento
- [x] T114 Ejecutar la suite completa de pruebas (`npm test`), verificar el rendimiento con al menos 500 registros por entidad (< 200 ms) y la compilación de producción para confirmar que no hay regresiones

---

## Fase 8: Ampliaciones formalizadas tras el feedback (HU1-HU5)

**Propósito**: Incorporar a la especificación los componentes ya implementados que estaban fuera del plan original y dejar verificable su comportamiento.

- [x] T120 [P] [HU1-HU5] Probar el cálculo de alertas de retrasos, estados de máquina, exceso de tiempo y stock crítico en `tests/unit/manufactura/alertas.test.js`
- [x] T121 [HU1-HU5] Implementar `calcularAlertasProduccion` en `src/modules/manufactura/alertas.js` y el panel visual en `src/components/manufactura/AlertasProduccion.jsx`, conectado desde `src/components/manufactura/ResumenPage.jsx`
- [x] T122 [P] [HU1-HU5] Verificar los filtros por texto, estado, fecha y producto en `src/utils/filtrosManufactura.js` y su uso desde `tests/integration/manufactura/historias-flujo.test.jsx`
- [x] T123 [HU1-HU5] Implementar la barra de filtros reutilizable en `src/components/manufactura/BarraFiltros.jsx` y conectarla en `ProductosPage.jsx`, `OrdenesPage.jsx` y `RecursosPage.jsx`
- [x] T124 [P] [HU1] Probar el alta local de materiales, la validación de duplicados y la persistencia en `tests/unit/manufactura/materiales-locales.test.js`
- [x] T125 [HU1] Implementar `src/components/manufactura/NuevoMaterial.jsx`, registrar los insumos en `src/modules/manufactura/referencias.js` bajo `manufactura:materiales_locales` y seleccionarlos desde `ProductoForm.jsx`
- [x] T126 [P] [HU1-HU5] Probar el dataset de peluches con cinco productos, órdenes, rutas, recepciones, mantenimientos y asignaciones en `tests/unit/manufactura/demo-peluches.test.js`
- [x] T127 [HU1-HU5] Cargar `src/modules/manufactura/demo-peluches.js` desde `src/main.jsx` cuando no existan registros, conservando los controles manuales de carga y reemplazo en `src/components/manufactura/ProductosPage.jsx`

**Punto de control**: El panel de producción, los filtros, el alta local de materiales y los datos de demostración están especificados, implementados y cubiertos por pruebas.

---

## Dependencias y Orden de Ejecución

### Dependencias entre Fases

- Configuración y Prerrequisitos (Fase 1): sin dependencias
- Historia de Usuario 1 (Fase 2): depende de la Fase 1
- Historia de Usuario 2 (Fase 3): depende de la Fase 1 y de los productos de la HU1
- Historia de Usuario 3 (Fase 4): depende de las HU1 (productos), HU2 (etapas) y de las máquinas/trabajadores de referencia
- Historia de Usuario 4 (Fase 5): depende de la HU3 (órdenes) y de los catálogos externos de materiales y proveedores
- Historia de Usuario 5 (Fase 6): depende de la Fase 1 y de los catálogos externos de trabajadores y repuestos
- Pulido (Fase 7): depende de que las HU1-HU5 estén completas
- Ampliaciones (Fase 8): depende de la Fase 7 y del panel, filtros, materiales locales y demo implementados en las fases anteriores

### Dependencias Internas Relevantes

- T014 depende de T012 y T013
- T017 depende de T014 y T015
- T035 depende de T032 y T034; T036 depende de T033 y T034
- T039 depende de T035, T036, T037 y T038
- T055 depende de T052 y T054; T056 depende de T053 y T054
- T060 depende de T055, T056, T057 y T058
- T074 depende de T072 y T073; T077 depende de T074 y T075
- T098 depende de T093 y T097; T099 depende de T094, T095 y T097; T100 depende de T096 y T097
- T105 depende de T098, T099 y T100

### Oportunidades Paralelas

- T002, T003 y T004 pueden ejecutarse en paralelo dentro de la Fase 1
- Las pruebas de cada historia pueden escribirse en paralelo con las validaciones de la misma historia
- T015, T016 y T020 (HU1) pueden ejecutarse en paralelo
- T037, T038 y T042 (HU2) pueden ejecutarse en paralelo
- T057, T058, T059 y T063 (HU3) pueden ejecutarse en paralelo
- T075, T076 y T080 (HU4) pueden ejecutarse en paralelo
- T101, T102, T103, T104 y T107 (HU5) pueden ejecutarse en paralelo
- Una vez completa la Fase 1, la HU5 puede avanzar en paralelo con HU1-HU4 (solo depende de catálogos externos)

---

## Estrategia de Implementación

### MVP Primero (Historia de Usuario 1)

1. Completar la Fase 1 (Configuración y Prerrequisitos)
2. Completar la Fase 2 (HU1)
3. **DETENERSE y VALIDAR**: probar la HU1 de forma independiente
4. Desplegar/demostrar si está listo

### Entrega Incremental

1. Fase 1 → base lista
2. HU1 → validar → demo (MVP)
3. HU2 → validar → demo
4. HU3 → validar → demo
5. HU4 → validar → demo
6. HU5 → validar → demo
7. Cada historia agrega valor sin romper las anteriores

### Estrategia de Equipo en Paralelo

Con varios desarrolladores:

1. El equipo completa la Fase 1 en conjunto
2. Luego se reparte: Desarrollador A → HU1, Desarrollador B → HU2, Desarrollador C → HU3/HU4, Desarrollador D → HU5
3. Integrar al cerrar cada historia

---

## Trazabilidad Requisitos → Tareas

**Cobertura**: 42/42 requisitos funcionales (FR), 4/4 requisitos de extensibilidad (XR) y 10/10 criterios de éxito (SC) tienen al menos una tarea asociada. Las 84 tareas están cubiertas por al menos un requisito.

### Requisitos Funcionales

| Requisito | Descripción breve | Tareas |
|---|---|---|
| FR-001 | Crear producto con nombre y tipo | T012, T014, T015, T017 |
| FR-002 | Editar producto y persistir cambios | T014, T017, T019 |
| FR-003 | Eliminar producto y sus materiales en cascada | T014, T112 |
| FR-004 | Asociar material con cantidad por unidad > 0 | T012, T014, T015, T017 |
| FR-005 | Editar y eliminar relaciones producto-material | T014, T017 |
| FR-006 | Consultar composición del producto | T014, T016, T019 |
| FR-007 | Validar producto y material con retroalimentación por campo | T010, T012, T015, T018 |
| FR-008 | Crear/editar/eliminar etapas con tiempo estándar > 0 | T032, T035, T037, T039 |
| FR-009 | Configurar ruta seleccionando etapas | T033, T036, T038, T039 |
| FR-010 | Asignar secuencia > 0 a cada etapa | T033, T036, T038 |
| FR-011 | Consultar ruta ordenada por secuencia | T036, T040 |
| FR-012 | Validar etapa y ruta con mensajes claros | T030, T032, T033, T041 |
| FR-013 | Crear/editar/eliminar órdenes con cantidad y fechas | T052, T055, T057, T060 |
| FR-014 | Rechazar orden con fecha fin anterior al inicio | T052, T055, T057, T061 |
| FR-015 | Registrar ejecuciones asociadas a orden y etapa | T053, T056, T058, T060 |
| FR-016 | Asociar máquina y trabajador a la ejecución | T053, T056, T058 |
| FR-017 | Calcular tiempo de uso desde inicio/fin reales | T053, T056, T058 |
| FR-018 | Consultar etapas ejecutadas y avance de la orden | T059, T062 |
| FR-019 | Validar obligatorios y fechas de ejecución | T050, T053, T058 |
| FR-020 | Registrar y conservar recepciones con material, proveedor, cantidad y fecha | T072, T074, T075, T077, T131 |
| FR-021 | Consultar recepciones de una orden | T076, T078 |
| FR-022 | Validar recepción y señalar campo faltante | T070, T072, T075, T079 |
| FR-023 | Crear/editar/eliminar máquinas con capacidad > 0 | T090, T093, T098, T101, T105 |
| FR-024 | Registrar mantenimientos con técnico, costo y fecha | T094, T099, T102, T105 |
| FR-025 | Asociar repuestos con cantidad > 0 | T091, T095, T099, T102 |
| FR-026 | Consultar historial de mantenimientos de una máquina | T099, T104 |
| FR-027 | Registrar equipamiento con nombre y tipo | T091, T096, T100 |
| FR-028 | Registrar asignación de equipamiento a trabajador | T091, T096, T100, T103, T105 |
| FR-029 | Consultar asignaciones por trabajador o equipamiento | T100, T105 |
| FR-030 | Validar mantenimiento y asignación | T094, T096, T106 |
| FR-031 | Persistir con claves `manufactura:` | T002, T013, T034, T054, T073, T097, T113 |
| FR-032 | Integridad referencial y borrado en cascada | T112 |
| FR-033 | Catálogos de referencia de solo lectura | T003, T004 |
| FR-034 | Registrar navegación del módulo | T001, T113 |
| FR-035 | Estados vacíos y mensajes accesibles | T018, T020, T041, T042, T063, T080, T106, T107, T111 |
| FR-036 | Recargar datos al reabrir edición | T019 |
| FR-037 | Flujo completo producto → ruta → orden → recepción | T110 |
| FR-038 | Pruebas y compilación sin regresiones | T114 |
| FR-039 | Alertas visuales de stock crítico, retrasos y estados de máquina | T120, T121 |
| FR-040 | Filtros reutilizables por texto, estado, fecha y categoría | T122, T123 |
| FR-041 | Alta local de materiales y asociación a productos | T124, T125 |
| FR-042 | Dataset de demostración cargado al iniciar y verificable | T004, T126, T127 |

### Requisitos de Extensibilidad

| Requisito | Descripción breve | Tareas |
|---|---|---|
| XR-001 | Almacenamiento genérico con prefijo `manufactura:` | T002 |
| XR-002 | Referencias externas desacopladas y sustituibles | T003 |
| XR-003 | Validadores reutilizables y componibles | T012, T032, T033, T052, T053, T072, T093, T094, T095, T096 |
| XR-004 | Catálogos locales reemplazables | T003, T004 |

### Criterios de Éxito

| Criterio | Descripción breve | Tareas |
|---|---|---|
| SC-001 | Crear producto con material y verlo en < 2 min | T011, T016, T114 |
| SC-002 | Configurar ruta ordenada en < 5 min | T031, T040, T114 |
| SC-003 | Crear orden y ejecución en < 5 min | T051, T062, T114 |
| SC-004 | Registrar recepción y verla en la orden en < 2 min | T071, T078, T114 |
| SC-005 | Máquina + mantenimiento + asignación en < 5 min | T092, T104, T114 |
| SC-006 | 90% de usuarios completan tareas sin ayuda | T114 |
| SC-007 | Validaciones impiden guardar datos faltantes | T010, T030, T050, T070, T090, T114 |
| SC-008 | 500 registros por entidad con respuesta < 200 ms | T114 |
| SC-009 | Flujo completo sin regresiones | T110, T114 |
| SC-010 | Pruebas y compilación exitosas | T114 |

---

## Notas

- `[P]` indica tareas sobre archivos distintos y sin dependencias entre sí
- Cada historia es completable y comprobable de forma independiente
- Verificar que las pruebas fallen antes de implementar
- Confirmar después de cada tarea o grupo lógico
- Evitar tareas vagas y conflictos sobre el mismo archivo

## Implementación React del PDF final (2026-11-10)

Se conserva íntegro el plan anterior. La implementación actual y las decisiones de integración se detallan en [implementacion-historias.md](implementacion-historias.md), con cobertura de los 27 escenarios del PDF final.

- [x] HU1: extender los componentes existentes con edición, composición consultable, selector externo, validación y borrado protegido.
- [x] HU2: implementar etapas y editor ordenado de rutas con validación de secuencias.
- [x] HU3: implementar órdenes, inicio/finalización de ejecuciones, cálculo de tiempo y avance.
- [x] HU4: implementar recepciones, edición, consulta y filtro por orden, integradas en su detalle.
- [x] HU5: implementar máquinas, historial de mantenimiento/repuestos, equipamiento y asignaciones.
- [x] Crear navegación, panel, estados vacíos y formularios con mensajes accesibles.
- [x] Añadir pruebas unitarias y de interfaz conectadas para las cinco historias; retirar las pruebas heredadas incompatibles de la plantilla antigua.
- [x] Formalizar en la Fase 8 el panel de alertas, la barra de filtros, el alta local de materiales y el dataset de demostración.
- [ ] Sustituir las referencias de muestra por las integraciones reales cuando los módulos externos estén disponibles.

## Fase 9: Roles, reproducción y conservación del historial

Revisión solicitada el 2026-11-23 a partir del feedback docente y del documento
de consulta sobre Spec Kit. Los criterios de referencia son FR-020 y FR-043 a
FR-047. Esta fase amplía el MVP sobre la rama existente.

- [x] T128 Hacer deterministas las fechas del dataset en `demo-peluches.js` y
  comprobar la igualdad del estado inicial con relojes diferentes, según FR-043.
- [x] T129 Documentar Node y npm, mantener el lockfile y alinear `plan.md` y
  `quickstart.md` con los puntos de entrada React y las rutas reales, según FR-044.
- [x] T130 Implementar el selector y la matriz de cinco perfiles en `roles.js`
  y `App.jsx`, con perspectivas y operaciones en la interfaz, según FR-045/FR-046.
- [x] T131 Proteger recepciones contra edición, eliminación y cascadas desde
  órdenes; actualizar el contrato y los escenarios de HU4, según FR-020.
- [x] T132 Verificar permisos antes de persistir y desmontar formularios al
  cambiar de perfil; probar acciones permitidas y rechazadas, según FR-047.
- [x] T133 Comprobar una instalación limpia con `npm ci`, ejecutar toda la suite
  y compilar la copia sin usar dependencias del directorio de desarrollo, según FR-044.
- [x] T134 Revisar las perspectivas de roles en el navegador y registrar el
  resultado y los límites de la revisión, según FR-045/FR-046.

Las integraciones externas y la autenticación multiusuario quedan como
ampliaciones explícitas. Los objetivos de rendimiento con 500 registros y
las métricas de usabilidad requieren su propia evaluación.

Verificación del 2026-11-23. La copia de trabajo y una copia nueva instalada
con `npm ci` pasaron 43 pruebas en ocho archivos y la compilación de producción.
Se revisaron las cinco perspectivas en el navegador, el detalle de Ensamble,
la consulta histórica de Bodega y el regreso a Supervisor.

La auditoría de la instalación limpia informó cinco avisos de dependencias
(dos moderados y tres altos) en Vite, Vitest y dependencias indirectas.
La actualización de dependencias queda pendiente de la decisión del equipo.

## Integración con las correcciones del equipo

- [x] T135 Integrar las validaciones de cierre de órdenes y de recepción en
  órdenes abiertas, conservando los perfiles y el historial, según FR-048.

El 2026-11-23 se integraron los commits `55ad22a` y `50395f7` de la rama
existente `main`. Se resolvieron las coincidencias en controles, página de
recepciones y repositorio de recepciones. La suite integrada pasó 44 pruebas
en ocho archivos y la compilación de producción.

La corrección posterior `ce54d39` impide asignaciones nuevas de máquinas
fuera de servicio o en mantenimiento. Se conserva la posibilidad de finalizar
una ejecución previa con su máquina original usando el identificador recibido
por la API. Una prueba de regresión cubre ambas operaciones.
La versión integrada final pasó 45 pruebas y la compilación de producción.

## Fase 10: Deshacer, foco de acciones y pedidos por peluche

- [x] T136 Implementar historial transaccional de veinte operaciones por pestaña,
  con roles, detección de cambios externos y reversión de relaciones (FR-049).
- [x] T137 Añadir restauración de borradores y deshacer en acciones de etapas,
  rutas y registros; conservar recepciones confirmadas (FR-049).
- [x] T138 Enfocar y desplazar la vista hacia formularios, detalles y páginas
  mediante un hook compartido, respetando movimiento reducido (FR-050).
- [x] T139 Validar el lote entero mínimo de 64 y conservar cantidades históricas
  al editar otros campos; actualizar la demo nueva (FR-051).
- [x] T140 Relacionar locales y pedidos con productos, mostrar códigos y cantidades
  y crear órdenes con sus vínculos en una transacción (FR-052/FR-053).
- [x] T141 Completar las pruebas de interfaz y dominio, revisar el navegador
  y compilar la versión final.

La versión del 2026-11-23 pasó 57 pruebas en diez archivos y compiló para
producción. Se verificaron en navegador el menú de locales con códigos y
cantidades, y el salto con foco al formulario de una orden de 64.
La revisión de eliminación añade confirmación dentro de la página y
**Deshacer eliminación** tanto en el aviso como en la fila eliminada. Las
pruebas cubren cancelación, recuperación al volver al apartado y etapas en uso.

## Fase 11: Métricas y gráficos del panel de producción

- [x] T142 Calcular volumen planificado/finalizado, cumplimiento y tiempos sin
  duplicar unidades por etapa ni incluir órdenes canceladas (FR-054).
- [x] T143 Añadir gráficos accesibles de estados, volumen por peluche y tiempos
  por etapa, con filtro por producto y estados vacíos (FR-055).
- [x] T144 Verificar cálculos, actualización al guardar/deshacer, permisos,
  compilación y presentación adaptable en navegador.

Validación del 2026-11-23: 63 pruebas en doce archivos y compilación de
producción correctas. En navegador se verificaron el filtro por peluche,
los gráficos sin errores de consola y la presentación en pantalla pequeña
sin desbordamiento horizontal. No se modificaron los registros existentes.

## Fase 12: Catálogos exclusivos de la fábrica de peluches

- [x] T145 Sustituir respaldos de carpintería por insumos y repuestos textiles
  y evitar mezclar respaldos sin uso con la fábrica de ejemplo (FR-056).
- [x] T146 Adaptar las instrucciones de nuevos materiales a un ejemplo de
  peluche con cascabel y conservar referencias ya relacionadas (FR-056).
- [x] T147 Validar catálogos, selectores, historial y relaciones, ejecutar
  las pruebas y compilar la versión final.

Validación del 2026-11-23: 66 pruebas en trece archivos y compilación correctas.
En navegador se comprobaron los doce materiales de la fábrica tanto en el
catálogo como en el selector del producto, los cinco repuestos textiles y las
instrucciones de un peluche con cascabel. No se borraron datos persistidos.

## Fase 13: Oso con cascabel relacionado

- [x] T148 Añadir una ampliación idempotente y transaccional del ejemplo,
  con producto independiente, nueve materiales y ruta de ocho etapas (FR-057).
- [x] T149 Asociar orden de 64 unidades, cuatro ejecuciones, nueve recepciones
  y pedidos de cinco locales; reutilizar recursos de la fábrica (FR-057).
- [x] T150 Incorporar el ejemplo al arranque de Supervisor y ofrecer su carga
  en Productos, conservando datos y modificaciones anteriores (FR-057).
- [x] T151 Verificar relaciones, rechazo de unidades incompatibles, permisos,
  recuperación ante fallos, reproducibilidad, interfaz y compilación.

Validación del 2026-11-23: 73 pruebas en quince archivos y compilación
correctas. En navegador se verificaron composición y ruta, OP-0006 al 50 %,
pedidos PED-0026 a PED-0030 vinculados a cinco locales y las nueve recepciones.
Tras recargar se mantienen seis productos sin duplicar la ampliación.

## Fase 14: Recuperación persistente de equipamiento

- [x] T152 Reproducir con una prueba la pérdida de deshacer al vaciar la sesión
  y recargar la aplicación después de eliminar equipamiento (FR-049).
- [x] T153 Persistir veinte operaciones con respaldo de sesión, selección de la
  revisión más reciente y compatibilidad con el historial anterior (FR-049).
- [x] T154 Explicar la indisponibilidad de Deshacer y actualizar el aviso del
  listado cuando la barra global revierte un cambio (FR-049).
- [x] T155 Verificar recuperación de equipamiento y asignaciones, rechazos
  por rol o cambios externos, recarga, compilación y navegador.

Validación del 2026-11-23: la prueba de pérdida de sesión falló con el historial
anterior y pasó después de la corrección. Pasaron 78 pruebas en dieciséis
archivos y la compilación de producción. En navegador se eliminó equipamiento,
se recargó y se restauró desde Deshacer global; se retiró el registro temporal
al terminar. Se conservan las protecciones de recepciones y los permisos.

## Fase 15: Eliminación confirmada de equipamiento asignado

- [x] T156 Corregir la contradicción entre la confirmación de eliminación y el
  bloqueo por asignación; mostrar los trabajadores afectados (FR-058).
- [x] T157 Guardar eliminación y retiro de asignaciones en una transacción
  reversible, conservando el bloqueo de la API sin opción explícita (FR-058).
- [x] T158 Retirar los registros de las tablas activas y ofrecer recuperación
  en un aviso separado para evitar confundirlos con registros vigentes (FR-058).
- [x] T159 Validar cancelación, eliminación, reversión y recuperación ante
  fallos; revisar navegador y compilación.

Validación del 2026-11-23: 81 pruebas en dieciséis archivos y compilación
correctas. En navegador se reprodujo el bloqueo del Guante térmico asignado
a Fernanda, se comprobó su eliminación de ambas tablas, se recuperaron ambos
con Deshacer y se dejó nuevamente eliminado por solicitud del usuario.

## Fase 16: Deshacer junto a los avisos de cambios

- [x] T160 Retirar el botón Deshacer de los encabezados compartidos de listados
  y conservarlo en los avisos de sus operaciones reversibles (FR-059).
- [x] T161 Unificar el aviso de eliminación de equipamiento y asignaciones,
  conservando su recuperación al volver a la sección (FR-059).
- [x] T162 Colocar Deshacer junto a avisos de rutas y materiales locales;
  limpiar las referencias del borrador al deshacer un material nuevo (FR-059).
- [x] T163 Verificar creación, edición, eliminación, avisos y compilación;
  revisar en navegador el encabezado y el aviso seleccionados.

Validación del 2026-11-23: 83 pruebas en dieciséis archivos y compilación
correctas. En navegador se comprobaron cero botones Deshacer en encabezados de
listados y su permanencia junto a los avisos. No se modificaron registros.

## Fase 17: Historial con reversión individual

- [x] T170 Mostrar una lista vertical por apartado con Deshacer o Rehacer
  junto a cada operación, sin botones en los encabezados (FR-060).
- [x] T171 Conservar pasos deshechos al guardar otros cambios y al recargar;
  aplicar diferencias por registro y campo sin sobrescribir datos posteriores.
- [x] T172 Verificar dependencias, conflictos, permisos y recepciones protegidas;
  reservar identificadores para restaurar registros sin colisiones.
- [x] T173 Validar 92 pruebas en diecisiete archivos, compilación de producción
  y el flujo en navegador: crear A y B, deshacer A, crear C y rehacer A.

Validación del 2026-11-23: pruebas y compilación correctas. Se deshicieron los
tres registros temporales de navegador, conservando los cinco equipamientos
y cinco asignaciones originales. La lista conserva Rehacer para las pruebas.

## Fase 18: Eliminación coherente y bloqueos explicados

- [x] T180 Compartir el análisis de eliminación entre las confirmaciones y las
  funciones de dominio; identificar rutas, órdenes y entregas que bloquean (FR-061).
- [x] T181 Mantener visibles los registros protegidos, por decisión del usuario
  del 2026-11-23, mostrando el motivo sin una confirmación imposible.
- [x] T182 Usar confirmación interna también para productos; retirar de las
  tablas activas los registros eliminados y conservar Deshacer en el historial.
- [x] T183 Mostrar errores de escritura sin avisos falsos de éxito y bloquear
  la eliminación de ejecuciones de órdenes finalizadas hasta reabrir la orden.
- [x] T184 Validar 106 pruebas en dieciocho archivos, compilación y en navegador
  el bloqueo de Tizado y corte de tela y la eliminación/recuperación de una etapa libre.

Validación del 2026-11-23: pruebas y compilación correctas. Se deshizo la creación
de la etapa temporal tras probar eliminación y recuperación. Las ocho etapas
originales y su historial de producción se conservaron. Trabajo local en main.

## Fase 19: Flujo unificado de órdenes y avisos descartables

- [x] T190 Unificar Nueva orden: fechas primero, después peluche, local y
  cantidad; calcular el lote desde sus pedidos y guardar todo conjuntamente (FR-062).
- [x] T191 Exigir 64 unidades enteras o más para cada pedido nuevo y cada lote;
  conservar e identificar las cantidades históricas sin cambios (FR-063).
- [x] T192 Permitir asignar pedidos a una orden existente, ampliar su lote y
  consultar locales y cantidades sin crear otra orden (FR-064).
- [x] T193 Mantener los botones de peluches para filtrar órdenes y consultar
  pedidos, sin saltos inesperados de pantalla; respetar las vistas por rol.
- [x] T194 Rechazar duplicados, pedidos de otro modelo, asignados a otro lote,
  excesos de capacidad y escrituras parciales; conservar Deshacer/Rehacer atómico.
- [x] T195 Añadir equis accesibles a avisos y confirmaciones de operaciones;
  descartar avisos de recuperación sin modificar datos y conservarlo al recargar (FR-065).
- [x] T196 Validar 124 pruebas en diecinueve archivos, compilación de producción
  y revisión visual: rechazar 63, crear lote/pedido de 64, liberar y reasignar
  el pedido en la misma orden, deshacer los datos temporales y cerrar sus avisos.

Decisiones del usuario del 2026-11-26: formulario con fechas antes de peluche,
cantidad y local; conservar botones por peluche; mínimo de 64 por pedido nuevo;
equis para avisos que ya no se quieran deshacer. Se preservaron los registros
históricos. La prueba de navegador conservó los seis lotes iniciales, retiró
su lote temporal y confirmó el arranque limpio después de recargar. Las capturas
del formulario y del listado quedan como evidencia local. No se crearon ramas.

## Fase 20: Lotes agregados y fábrica de ejemplo coherente

Las aclaraciones del usuario del 27 de noviembre de 2026 sustituyen la regla
anterior de 64 por pedido: el mínimo corresponde al lote de un modelo y puede
reunir varios locales (por ejemplo, 30 + 15 + 19) con fechas comunes. Solo una
orden planificada admite cambios de cantidad y pedidos. El usuario autorizó
sustituir todos los registros de prueba de Manufactura para alinear el ejemplo.

- [x] T200 Aplicar el mínimo agregado de 64 y cantidades enteras positivas por
  local, conservando el formulario unificado y sus fechas comunes (FR-062/063).
- [x] T201 Contar cupos solo de órdenes planificadas con unidades libres y
  congelar cantidad, modelo y pedidos fuera de planificación (FR-064/066/067).
- [x] T202 Exigir pedidos por el lote completo antes de iniciar producción y
  bloquear reversiones antiguas que alterarían el lote ya iniciado.
- [x] T203 Respaldar las claves anteriores antes de reconstruir una sola vez;
  ofrecer descarga y recuperar los datos ante fallos de carga (FR-068).
- [x] T204 Generar seis productos, seis lotes de 64 y treinta pedidos; los cinco
  lotes iniciados/finalizados quedan totalmente asignados y abastecidos. Los
  finalizados completan su ruta; el planificado conserva pendientes coherentes.
- [x] T205 Calcular faltantes por orden para que entregas históricas o excedentes
  ajenos no oculten los materiales pendientes de otros lotes (FR-039).
- [x] T206 Completar pruebas, compilación y revisión en navegador; comprobar
  descarga del respaldo, asignación/deshacer, bloqueo de producción y recarga.

Validación: 133 pruebas en veinte archivos y compilación de producción
correctas. En navegador se descargó el respaldo previo, se comprobaron seis
órdenes y 38 recepciones, el bloqueo de cantidad/modelo en producción y los tres
materiales pendientes del Ajolote. Se creó una orden de Conejo Nube con pedidos
de 30, 15 y 19; permaneció al recargar. Se deshizo la prueba y se descartó su
aviso, conservando los seis lotes y treinta pedidos iniciales. Sin errores de
consola desde la recarga. Capturas locales del formulario y estado final.
Los cambios siguen locales en main, sin crear ramas, commit ni push.

- [x] T207 Retirar de la página el botón Descargar respaldo anterior, por
  solicitud posterior del usuario; conservar el respaldo previo y actualizar
  la documentación para reproducir la interfaz vigente.
