# Tareas: Módulo 7 - Manufactura y Operaciones

**Entrada**: Documentos de diseño desde `/specs/001-erp-base-module/`
**Prerrequisitos**: spec.md (obligatorio para las historias de usuario), plan.md, data-model.md
**Historias cubiertas**: HU1 a HU5 (todas Prioridad P1)

## Formato: `[ID] [P?] [Historia] Descripción`

- **[P]**: puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Historia]**: historia de usuario a la que pertenece la tarea (`US1` a `US5`)
- Las tareas de prueba se escriben primero y deben fallar antes de implementar
- Rutas de archivo propuestas según la estructura `src/modules/manufactura/` y `src/components/manufactura/`

---

## Fase 1: Configuración y Prerrequisitos Compartidos

**Propósito**: Preparar la base común que todas las historias necesitan.

- [ ] T001 Crear la estructura de carpetas `src/modules/manufactura/`, `src/components/manufactura/`, `tests/unit/manufactura/`, `tests/integration/manufactura/` y registrar la navegación del módulo en `src/app.js`
- [ ] T002 [P] Extender `src/storage.js` con ayudantes genéricos de persistencia y claves con prefijo `manufactura:`
- [ ] T003 [P] Definir los contratos de referencias externas `MATERIAL`, `TRABAJADOR`, `PROVEEDOR` y `REPUESTO`, con catálogos locales de solo lectura para pruebas en `src/modules/manufactura/referencias.js`
- [ ] T004 [P] Crear fixtures compartidos de todos los catálogos y registros de ejemplo en `tests/fixtures/manufactura.js`

**Punto de control**: La base de almacenamiento, navegación y datos de referencia está lista para iniciar cualquier historia.

---

## Fase 2: Historia de Usuario 1 - Gestionar productos y sus materiales (Prioridad: P1) 🎯 MVP

**Objetivo**: Registrar productos y su composición de materiales, indicando la cantidad requerida por unidad.
**Prueba Independiente**: Un usuario crea un producto, le asocia al menos un material con su cantidad por unidad y, al consultar el producto, ve correctamente esa composición.

### Pruebas para la Historia de Usuario 1

- [ ] T010 [P] [US1] Pruebas unitarias de validación y persistencia de `PRODUCTO` y `PRODUCTO_MATERIAL` en `tests/unit/manufactura/productos.test.js`
- [ ] T011 [P] [US1] Pruebas de integración para crear producto, asociar material y consultar la composición en `tests/integration/manufactura/productos.test.js`

### Implementación de la Historia de Usuario 1

- [ ] T012 [P] [US1] Crear los validadores de `PRODUCTO` (nombre y tipo obligatorios) y `PRODUCTO_MATERIAL` (material obligatorio, `cantidad_por_unidad > 0`) en `src/modules/manufactura/productos.js`
- [ ] T013 [P] [US1] Agregar las claves `manufactura:productos` y `manufactura:producto_material` a `src/storage.js`
- [ ] T014 [US1] Implementar el repositorio CRUD de productos y de su composición en `src/modules/manufactura/productos.js` (depende de T012, T013)
- [ ] T015 [P] [US1] Crear el formulario de producto (nombre, tipo) con subformulario de materiales y cantidad por unidad en `src/components/manufactura/producto-form.js`
- [ ] T016 [P] [US1] Crear el listado y la vista de detalle del producto mostrando todos sus materiales y cantidades en `src/components/manufactura/producto-list.js`
- [ ] T017 [US1] Conectar alta, edición y asociación/eliminación de materiales al producto en `src/app.js` (depende de T014, T015)
- [ ] T018 [US1] Mostrar retroalimentación de validación por campo e impedir el guardado con datos faltantes en `src/components/manufactura/producto-form.js`
- [ ] T019 [US1] Recargar los datos y la composición del producto al reabrir su edición en `src/app.js`
- [ ] T020 [P] [US1] Estilos del formulario, subformulario de materiales y detalle de producto en `src/styles.css`

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

- [ ] T030 [P] [US2] Pruebas unitarias de validación de `ETAPA_FABRICACION` y `RUTA_PRODUCTO` en `tests/unit/manufactura/etapas.test.js`
- [ ] T031 [P] [US2] Pruebas de integración para crear etapas, armar una ruta y verificar el orden por secuencia en `tests/integration/manufactura/rutas.test.js`

### Implementación de la Historia de Usuario 2

- [ ] T032 [P] [US2] Crear los validadores de `ETAPA_FABRICACION` (nombre, tipo y tiempo estándar obligatorios; tiempo > 0) en `src/modules/manufactura/etapas.js`
- [ ] T033 [P] [US2] Crear los validadores de `RUTA_PRODUCTO` (producto, etapa y secuencia obligatorios; secuencia > 0) en `src/modules/manufactura/rutas.js`
- [ ] T034 [P] [US2] Agregar las claves `manufactura:etapas` y `manufactura:rutas` a `src/storage.js`
- [ ] T035 [US2] Implementar el repositorio CRUD de etapas en `src/modules/manufactura/etapas.js` (depende de T032, T034)
- [ ] T036 [US2] Implementar el repositorio de rutas con ordenamiento por `secuencia` en `src/modules/manufactura/rutas.js` (depende de T033, T034)
- [ ] T037 [P] [US2] Crear el formulario de etapas (nombre, tipo, tiempo estándar) en `src/components/manufactura/etapa-form.js`
- [ ] T038 [P] [US2] Crear el editor de ruta del producto con selección de etapas y asignación de secuencia en `src/components/manufactura/ruta-editor.js`
- [ ] T039 [US2] Conectar alta/edición de etapas y configuración de la ruta al producto en `src/app.js` (depende de T035, T036, T037, T038)
- [ ] T040 [US2] Mostrar la ruta resultante ordenada por secuencia en la vista de detalle del producto en `src/components/manufactura/producto-list.js`
- [ ] T041 [US2] Validar datos obligatorios de etapa y ruta con mensajes claros en `src/components/manufactura/etapa-form.js` y `src/components/manufactura/ruta-editor.js`
- [ ] T042 [P] [US2] Estilos del formulario de etapas y del editor de rutas en `src/styles.css`

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

- [ ] T050 [P] [US3] Pruebas unitarias de validación de `ORDEN_PRODUCCION` (incluida `fecha_fin >= fecha_inicio`) y del cálculo de `tiempo_uso_min` en `tests/unit/manufactura/ordenes.test.js`
- [ ] T051 [P] [US3] Pruebas de integración para crear orden, registrar ejecuciones y consultar el avance en `tests/integration/manufactura/ordenes.test.js`

### Implementación de la Historia de Usuario 3

- [ ] T052 [P] [US3] Crear los validadores de `ORDEN_PRODUCCION` (producto, cantidad planificada > 0, estado y fechas obligatorios; fin no anterior a inicio) en `src/modules/manufactura/ordenes.js`
- [ ] T053 [P] [US3] Crear los validadores de `EJECUCION_ETAPA` (orden, etapa, máquina, trabajador, inicio y fin reales obligatorios) en `src/modules/manufactura/ejecuciones.js`
- [ ] T054 [P] [US3] Agregar las claves `manufactura:ordenes` y `manufactura:ejecuciones` a `src/storage.js`
- [ ] T055 [US3] Implementar el repositorio CRUD de órdenes en `src/modules/manufactura/ordenes.js` (depende de T052, T054)
- [ ] T056 [US3] Implementar el repositorio de ejecuciones con cálculo de `tiempo_uso_min` a partir de inicio/fin real en `src/modules/manufactura/ejecuciones.js` (depende de T053, T054)
- [ ] T057 [P] [US3] Crear el formulario de orden (producto, cantidad planificada, estado, fechas) en `src/components/manufactura/orden-form.js`
- [ ] T058 [P] [US3] Crear el formulario de ejecución de etapa (etapa, máquina, trabajador, inicio/fin real) en `src/components/manufactura/ejecucion-form.js`
- [ ] T059 [P] [US3] Crear la vista de detalle de la orden con sus ejecuciones y avance por etapa en `src/components/manufactura/orden-detalle.js`
- [ ] T060 [US3] Conectar creación/edición de órdenes y registro de ejecuciones en `src/app.js` (depende de T055, T056, T057, T058)
- [ ] T061 [US3] Rechazar fechas inválidas (fin anterior a inicio) y mostrar la explicación en `src/components/manufactura/orden-form.js`
- [ ] T062 [US3] Listar las etapas ejecutadas con máquina, trabajador y tiempos en `src/components/manufactura/orden-detalle.js`
- [ ] T063 [P] [US3] Estilos del formulario de orden, ejecuciones y vista de avance en `src/styles.css`

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

- [ ] T070 [P] [US4] Pruebas unitarias de validación y persistencia de `RECEPCION_MATERIAL` en `tests/unit/manufactura/recepciones.test.js`
- [ ] T071 [P] [US4] Pruebas de integración para registrar recepciones y consultarlas desde la orden en `tests/integration/manufactura/recepciones.test.js`

### Implementación de la Historia de Usuario 4

- [ ] T072 [P] [US4] Crear los validadores de `RECEPCION_MATERIAL` (orden, material, proveedor, cantidad recibida > 0 y fecha obligatorios) en `src/modules/manufactura/recepciones.js`
- [ ] T073 [P] [US4] Agregar la clave `manufactura:recepciones` a `src/storage.js`
- [ ] T074 [US4] Implementar el repositorio CRUD de recepciones asociadas a una orden en `src/modules/manufactura/recepciones.js` (depende de T072, T073)
- [ ] T075 [P] [US4] Crear el formulario de recepción (material, proveedor, cantidad, fecha) en `src/components/manufactura/recepcion-form.js`
- [ ] T076 [P] [US4] Crear la lista de recepciones con material, proveedor, cantidad y fecha en `src/components/manufactura/recepcion-list.js`
- [ ] T077 [US4] Conectar el alta/edición de recepciones a una orden existente en `src/app.js` (depende de T074, T075)
- [ ] T078 [US4] Mostrar todas las recepciones asociadas a la orden en la vista de detalle de la orden en `src/components/manufactura/orden-detalle.js`
- [ ] T079 [US4] Impedir el guardado cuando falta material, proveedor, cantidad o fecha y señalar el campo faltante en `src/components/manufactura/recepcion-form.js`
- [ ] T080 [P] [US4] Estilos del formulario y la lista de recepciones en `src/styles.css`

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

- [ ] T090 [P] [US5] Pruebas unitarias de validación de `MAQUINA` y `MANTENIMIENTO_MAQUINA` en `tests/unit/manufactura/maquinas.test.js`
- [ ] T091 [P] [US5] Pruebas unitarias de `MANTENIMIENTO_REPUESTO` y `ASIGNACION_EQUIPAMIENTO` en `tests/unit/manufactura/equipamiento.test.js`
- [ ] T092 [P] [US5] Pruebas de integración para máquina + mantenimiento + repuestos y asignación de equipamiento en `tests/integration/manufactura/mantenimiento.test.js`

### Implementación de la Historia de Usuario 5

- [ ] T093 [P] [US5] Crear los validadores de `MAQUINA` (código, nombre, estado y capacidad por hora obligatorios; capacidad > 0) en `src/modules/manufactura/maquinas.js`
- [ ] T094 [P] [US5] Crear los validadores de `MANTENIMIENTO_MAQUINA` (máquina, técnico, tipo, costo y fecha obligatorios) en `src/modules/manufactura/mantenimientos.js`
- [ ] T095 [P] [US5] Crear los validadores de `MANTENIMIENTO_REPUESTO` (mantenimiento, repuesto y cantidad > 0) en `src/modules/manufactura/mantenimiento-repuestos.js`
- [ ] T096 [P] [US5] Crear los validadores de `EQUIPAMIENTO` y `ASIGNACION_EQUIPAMIENTO` (trabajador, equipamiento y fecha de entrega obligatorios) en `src/modules/manufactura/equipamiento.js`
- [ ] T097 [P] [US5] Agregar las claves `manufactura:maquinas`, `manufactura:mantenimientos`, `manufactura:mantenimiento_repuestos`, `manufactura:equipamiento` y `manufactura:asignaciones` a `src/storage.js`
- [ ] T098 [US5] Implementar el repositorio CRUD de máquinas en `src/modules/manufactura/maquinas.js` (depende de T093, T097)
- [ ] T099 [US5] Implementar el repositorio de mantenimientos y su consumo de repuestos en `src/modules/manufactura/mantenimientos.js` (depende de T094, T095, T097)
- [ ] T100 [US5] Implementar el repositorio de equipamiento y asignaciones a trabajadores en `src/modules/manufactura/equipamiento.js` (depende de T096, T097)
- [ ] T101 [P] [US5] Crear el formulario de máquina (código, nombre, estado, capacidad por hora) en `src/components/manufactura/maquina-form.js`
- [ ] T102 [P] [US5] Crear el formulario de mantenimiento con selección de técnico y carga de repuestos y cantidades en `src/components/manufactura/mantenimiento-form.js`
- [ ] T103 [P] [US5] Crear el formulario de asignación de equipamiento (trabajador, equipamiento, fecha de entrega) en `src/components/manufactura/asignacion-form.js`
- [ ] T104 [P] [US5] Crear la vista de máquinas con su historial de mantenimientos asociados en `src/components/manufactura/maquina-list.js`
- [ ] T105 [US5] Conectar alta/edición de máquinas, mantenimientos, repuestos y asignaciones en `src/app.js` (depende de T098, T099, T100)
- [ ] T106 [US5] Validar datos obligatorios de mantenimiento y asignación con mensajes claros en `src/components/manufactura/mantenimiento-form.js` y `src/components/manufactura/asignacion-form.js`
- [ ] T107 [P] [US5] Estilos de máquinas, mantenimientos y equipamiento en `src/styles.css`

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

- [ ] T110 [P] Añadir prueba de integración del flujo completo producto → ruta → orden → recepción en `tests/integration/manufactura/flujo-completo.test.js`
- [ ] T111 [P] Revisar accesibilidad (etiquetas, orden de foco, mensajes de error) en `src/components/manufactura/`
- [ ] T112 Verificar integridad referencial y borrado en cascada: producto→ruta, orden→ejecuciones/recepciones, máquina→mantenimientos, mantenimiento→repuestos en `src/modules/manufactura/`
- [ ] T113 Actualizar `README.md` con el módulo de manufactura y las claves de almacenamiento
- [ ] T114 Ejecutar la suite completa de pruebas (`npm test`), verificar el rendimiento con al menos 500 registros por entidad (< 200 ms) y la compilación de producción para confirmar que no hay regresiones

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

**Cobertura**: 38/38 requisitos funcionales (FR), 4/4 requisitos de extensibilidad (XR) y 10/10 criterios de éxito (SC) tienen al menos una tarea asociada. Las 76 tareas están cubiertas por al menos un requisito.

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
| FR-020 | Registrar/editar recepciones con material, proveedor, cantidad y fecha | T072, T074, T075, T077 |
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
