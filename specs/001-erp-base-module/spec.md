# Especificación de la Funcionalidad: Módulo 7 - Manufactura y Operaciones

**Rama de trabajo**: main; carpeta de especificación 001-erp-base-module
**Creada**: 2026-07-08  
**Estado**: MVP en revisión; actualización de roles y reproducibilidad del 2026-11-23
**Entrada**: Descripción del usuario: "Construir el módulo de Manufactura y Operaciones de un ERP: gestión de productos y sus materiales, definición de etapas y rutas de fabricación, creación y control de órdenes de producción con ejecución real de etapas, registro de recepción de materiales y gestión de máquinas, mantenimientos y equipamiento, con capacidades de crear/editar/eliminar/consultar."

## Propósito

Este módulo implementa el dominio de **Manufactura y Operaciones** dentro del ERP. Permite registrar los productos que se fabrican y los materiales que consumen, definir el proceso productivo mediante etapas y rutas ordenadas, crear órdenes de producción y registrar la ejecución real de sus etapas con máquina, trabajador y tiempos, registrar la recepción de insumos por proveedor y gestionar los recursos de planta (máquinas, mantenimientos, repuestos y equipamiento asignado a trabajadores).

El módulo se apoya en catálogos de referencia de otros módulos del ERP —materiales y repuestos de Logística e Inventario, trabajadores de RRHH y Planillas, proveedores de Adquisición y Compras— que en esta iteración se representan mediante catálogos locales de solo lectura y se pueden sustituir por integraciones reales sin cambiar la lógica de Manufactura.

## Escenarios de Usuario y Pruebas *(obligatorio)*

### Historia de Usuario 1 - Gestionar productos y sus materiales (Prioridad: P1)

Como encargado de producción, quiero registrar y gestionar los productos junto con los materiales necesarios para fabricarlos, para conocer qué insumos y cantidades requiere cada producto.

**Por qué esta prioridad**: Es una funcionalidad base del módulo: antes de planificar o ejecutar una producción, el sistema debe conocer el producto y los materiales que lo componen. Las órdenes y rutas posteriores dependen de que estos datos existan.

**Prueba Independiente**: Un usuario puede crear un producto, asociarle al menos un material indicando la cantidad requerida por unidad y, al consultar el producto, ver correctamente esa composición.

**Escenarios de Aceptación**:

1. **Dado** que el usuario se encuentra en la gestión de productos, **cuando** registra un producto con nombre y tipo, **entonces** el producto queda almacenado y disponible para su consulta.
2. **Dado** que existe un producto registrado, **cuando** el usuario selecciona un material e indica la cantidad requerida por unidad, **entonces** la relación producto-material queda guardada.
3. **Dado** que un producto tiene varios materiales asociados, **cuando** el usuario consulta sus detalles, **entonces** puede visualizar todos los materiales y sus respectivas cantidades por unidad.
4. **Dado** que existe un producto registrado, **cuando** el usuario modifica sus datos, **entonces** la información actualizada se guarda y se muestra al volver a consultarlo.
5. **Dado** que falta información obligatoria al crear o editar un producto, **cuando** el usuario intenta guardar, **entonces** el sistema impide la operación y muestra qué dato falta.

---

### Historia de Usuario 2 - Definir el proceso y las etapas de fabricación (Prioridad: P1)

Como encargado de producción, quiero definir las etapas y el orden que debe seguir cada producto durante su fabricación, para establecer claramente su proceso productivo.

**Por qué esta prioridad**: La ruta de fabricación determina cómo se transforma un producto. Sin etapas y una secuencia definida, una orden de producción no puede saber qué pasos debe ejecutar ni en qué orden.

**Prueba Independiente**: Un usuario puede crear varias etapas, asociarlas a un producto mediante una ruta y comprobar que aparecen ordenadas según la secuencia definida.

**Escenarios de Aceptación**:

1. **Dado** que el usuario necesita definir una nueva etapa, **cuando** registra nombre, tipo y tiempo estándar, **entonces** la etapa queda disponible para ser utilizada en rutas de productos.
2. **Dado** que existen un producto y etapas de fabricación, **cuando** el usuario configura una ruta, **entonces** puede seleccionar las etapas que forman parte del proceso del producto.
3. **Dado** que una ruta contiene varias etapas, **cuando** el usuario asigna una secuencia a cada una, **entonces** el sistema conserva ese orden.
4. **Dado** que un producto posee una ruta definida, **cuando** el usuario consulta el proceso de fabricación, **entonces** las etapas aparecen ordenadas por su secuencia.
5. **Dado** que falta un dato obligatorio de una etapa o ruta, **cuando** el usuario intenta guardar, **entonces** el sistema rechaza el registro y explica qué información falta.

---

### Historia de Usuario 3 - Crear y controlar órdenes de producción (Prioridad: P1)

Como encargado de producción, quiero crear órdenes de producción y registrar la ejecución real de sus etapas, para controlar qué se está fabricando y conocer el avance real de la producción.

**Por qué esta prioridad**: La orden de producción es el núcleo operativo del módulo: transforma la información del producto y su proceso en una fabricación concreta. Además, permite registrar quién ejecutó una etapa, qué máquina se usó y cuánto tiempo tomó.

**Prueba Independiente**: Un usuario puede crear una orden para un producto, registrar al menos una ejecución de etapa con trabajador, máquina, inicio y fin reales, y luego consultar esa información asociada a la orden.

**Escenarios de Aceptación**:

1. **Dado** que existe un producto registrado, **cuando** el encargado crea una orden indicando producto, cantidad planificada, fechas y estado, **entonces** la orden queda almacenada.
2. **Dado** que existe una orden de producción, **cuando** comienza una etapa, **entonces** el usuario puede registrar una nueva ejecución asociada a esa orden y etapa.
3. **Dado** que se registra una ejecución, **cuando** el usuario selecciona una máquina y un trabajador, **entonces** ambos quedan asociados a la ejecución de la etapa.
4. **Dado** que una etapa fue iniciada, **cuando** el usuario registra su finalización, **entonces** quedan almacenados el inicio real, fin real y tiempo de uso correspondiente.
5. **Dado** que una orden posee ejecuciones registradas, **cuando** el encargado consulta la orden, **entonces** puede identificar las etapas ejecutadas y la información registrada para cada una.
6. **Dado** que una fecha de término es anterior a la fecha de inicio, **cuando** el usuario intenta guardar la orden, **entonces** el sistema rechaza los datos y muestra una explicación clara.

---

### Historia de Usuario 4 - Registrar la recepción de materiales para producción (Prioridad: P1)

Como encargado de producción, quiero registrar los materiales recibidos para una orden y el proveedor que los entrega, para mantener trazabilidad de los insumos asociados a la fabricación.

**Por qué esta prioridad**: La producción puede funcionar inicialmente con productos, rutas y órdenes, pero registrar la recepción de insumos agrega trazabilidad y conecta Manufactura con Logística/Inventario y Adquisición/Compras. Por eso se considera importante, aunque posterior al flujo productivo básico.

**Prueba Independiente**: Un usuario puede seleccionar una orden existente, registrar la recepción de un material indicando proveedor, cantidad y fecha, y luego encontrar esa recepción al consultar la orden.

**Escenarios de Aceptación**:

1. **Dado** que existe una orden de producción, **cuando** llegan materiales para dicha orden, **entonces** el usuario puede crear un registro de recepción asociado a ella.
2. **Dado** que el usuario registra una recepción, **cuando** selecciona material y proveedor e ingresa cantidad y fecha, **entonces** la recepción queda almacenada con esos datos.
3. **Dado** que una orden ha recibido materiales en diferentes fechas, **cuando** el usuario consulta la orden, **entonces** puede visualizar todas las recepciones asociadas.
4. **Dado** que existe una recepción registrada, **cuando** el usuario consulta sus detalles, **entonces** puede identificar el material, proveedor, cantidad y fecha de recepción.
5. **Dado** que falta material, proveedor, cantidad o fecha, **cuando** el usuario intenta guardar una recepción, **entonces** el sistema impide el guardado y muestra el dato faltante.

---

### Historia de Usuario 5 - Gestionar máquinas, mantenimiento y equipamiento (Prioridad: P1)

Como encargado de planta, quiero gestionar las máquinas, sus mantenimientos y el equipamiento asignado a los trabajadores, para mantener disponibles y trazables los recursos necesarios para realizar la producción.

**Por qué esta prioridad**: Estas funciones apoyan la continuidad operativa de la planta y permiten saber el estado de las máquinas, las intervenciones realizadas y el equipamiento entregado. Son relevantes para un módulo completo, pero el flujo básico de producto-ruta-orden puede demostrarse antes de ellas.

**Prueba Independiente**: Un usuario puede registrar una máquina, agregarle un mantenimiento con técnico y repuestos, y registrar una asignación de equipamiento a un trabajador; cada registro permanece asociado a la entidad correspondiente.

**Escenarios de Aceptación**:

1. **Dado** que se incorpora una máquina a la planta, **cuando** el encargado registra código, nombre, estado y capacidad por hora, **entonces** la máquina queda disponible para ser utilizada en el módulo.
2. **Dado** que una máquina requiere una intervención, **cuando** el usuario registra un mantenimiento, **entonces** quedan asociados la máquina, el técnico, el tipo, el costo y la fecha.
3. **Dado** que un mantenimiento utiliza repuestos, **cuando** el usuario agrega uno o más repuestos con sus cantidades, **entonces** cada consumo queda asociado al mantenimiento correspondiente.
4. **Dado** que un trabajador recibe equipamiento, **cuando** el usuario selecciona trabajador y equipamiento e indica la fecha de entrega, **entonces** la asignación queda registrada.
5. **Dado** que una máquina posee mantenimientos anteriores, **cuando** el usuario consulta sus registros asociados, **entonces** puede identificar las intervenciones registradas para esa máquina.
6. **Dado** que falta información obligatoria en un mantenimiento o asignación, **cuando** el usuario intenta guardar, **entonces** el sistema impide la operación y explica qué información falta.

---

### Ampliaciones transversales de interfaz y datos (HU1-HU5)

Como encargado de producción, quiero supervisar alertas, filtrar registros, registrar insumos nuevos y contar con datos de ejemplo, para demostrar y probar el módulo completo sin depender de otros sistemas.

**Escenarios de Aceptación**:

1. **Dado** que existen órdenes abiertas vencidas, máquinas fuera de servicio, ejecuciones que superan el tiempo estándar o insumos con faltantes, **cuando** el usuario abre el panel de producción, **entonces** ve avisos visuales agrupados y puede navegar al área correspondiente.
2. **Dado** que un material no cubre la cantidad requerida por las órdenes abiertas, **cuando** se calculan las alertas, **entonces** se muestra el faltante comparando lo recibido con lo requerido.
3. **Dado** que un listado tiene muchos registros, **cuando** el usuario aplica búsqueda o filtros por estado, fecha o categoría, **entonces** la barra reutilizable deja los filtros activos visibles y permite limpiarlos.
4. **Dado** que un insumo no está en el catálogo, **cuando** el usuario lo registra desde el formulario de productos indicando nombre y unidad, **entonces** queda disponible para la composición del producto y para las recepciones.
5. **Dado** que el usuario abre la aplicación por primera vez sin registros, **cuando** carga el módulo, **entonces** el dataset de demostración con productos, rutas, órdenes, recepciones y recursos de HU1 a HU5 queda disponible sin borrar datos posteriores.

---

### Vistas por rol

El MVP permite seleccionar Supervisor, Planificación, Ensamble, Bodega o
Mantenimiento. Se trata de perfiles de demostración locales. La autenticación
de cuentas y la autorización en servidor corresponden a una ampliación del alcance.

| Rol | Perspectiva y acciones |
|---|---|
| Supervisor | Acceso a todas las áreas y gestión de la demo |
| Planificación | Alta, edición y baja de productos, composición, etapas, rutas y órdenes; consulta de ejecuciones |
| Ensamble | Órdenes abiertas, ruta de ensamblaje e inicio/finalización de sus ejecuciones |
| Bodega | Alta y consulta de recepciones por orden |
| Mantenimiento | Gestión de máquinas, mantenimiento, repuestos, equipamiento y asignaciones |

Escenarios de aceptación adicionales.

1. Al seleccionar Ensamble, solo se ofrece la navegación a órdenes. Sus detalles
   muestran etapas de tipo Ensamble o Ensamblaje y permiten registrar sus
   ejecuciones. Se omiten proveedores, recepciones y fechas de entrega.
2. Al seleccionar Planificación se pueden gestionar órdenes y consultar su
   ejecución. Al seleccionar Bodega se puede registrar una entrega y consultar
   las anteriores.
3. Una operación fuera del perfil se rechaza en la capa de persistencia. Cambiar
   de perfil cierra el formulario anterior y carga una página permitida.
4. Una recepción guardada conserva todos sus campos. Intentar editarla,
   eliminarla o borrar su orden asociada produce un error y conserva el historial.
5. Dos instalaciones de la misma revisión con el entorno documentado y
   navegadores sin registros generan el mismo dataset inicial.

### Casos Límite

- ¿Qué ocurre cuando un usuario intenta guardar un producto sin nombre o tipo?
- ¿Qué ocurre cuando se asocia un material con cantidad por unidad igual o menor que cero?
- ¿Qué ocurre cuando se asigna la misma secuencia a dos etapas de la misma ruta?
- ¿Qué ocurre cuando se intenta eliminar un producto que tiene materiales, ruta u órdenes asociadas?
- ¿Qué ocurre cuando se intenta guardar una orden con fecha de término anterior a la fecha de inicio?
- ¿Qué ocurre cuando se registra una ejecución con fin real anterior al inicio real?
- ¿Qué ocurre cuando se registra una recepción con cantidad recibida igual o menor que cero?
- ¿Qué ocurre cuando se referencia un material, trabajador, proveedor o repuesto que no existe en el catálogo de solo lectura?
- ¿Qué ocurre cuando se intenta registrar un mantenimiento sin técnico, tipo, costo o fecha?
- ¿Qué ocurre cuando se registra una máquina con capacidad por hora igual o menor que cero?
- ¿Qué ocurre cuando los datos almacenados en `localStorage` están corruptos o no son una lista válida?
- ¿Qué ocurre cuando un listado no tiene registros (estado vacío)?

## Requisitos *(obligatorio)*

### Requisitos Funcionales

**Gestión de productos y materiales (HU1)**

- **FR-001**: El sistema DEBE permitir crear un producto con nombre y tipo obligatorios.
- **FR-002**: El sistema DEBE permitir editar los datos de un producto y persistir los cambios.
- **FR-003**: El sistema DEBE permitir eliminar un producto y, en cascada, sus relaciones producto-material.
- **FR-004**: El sistema DEBE permitir asociar uno o más materiales a un producto indicando la cantidad por unidad, que DEBE ser mayor que cero.
- **FR-005**: El sistema DEBE permitir editar y eliminar las relaciones producto-material de un producto.
- **FR-006**: El sistema DEBE mostrar la composición de un producto con todos sus materiales y sus cantidades por unidad.
- **FR-007**: El sistema DEBE validar los campos obligatorios y numéricos de producto y material, mostrando retroalimentación por campo antes de guardar.

**Etapas y rutas de fabricación (HU2)**

- **FR-008**: El sistema DEBE permitir crear, editar y eliminar etapas con nombre, tipo y tiempo estándar en minutos mayor que cero.
- **FR-009**: El sistema DEBE permitir configurar la ruta de un producto seleccionando etapas existentes.
- **FR-010**: El sistema DEBE permitir asignar una secuencia mayor que cero a cada etapa de la ruta.
- **FR-011**: El sistema DEBE mostrar la ruta de un producto ordenada por secuencia.
- **FR-012**: El sistema DEBE validar los campos obligatorios y numéricos de etapa y ruta, explicando qué información falta.

**Órdenes de producción y ejecuciones (HU3)**

- **FR-013**: El sistema DEBE permitir crear, editar y eliminar órdenes con producto, cantidad planificada mayor que cero, estado y fechas.
- **FR-014**: El sistema DEBE rechazar una orden cuya fecha de fin sea anterior a su fecha de inicio.
- **FR-015**: El sistema DEBE permitir registrar ejecuciones de etapa asociadas a una orden y a una etapa.
- **FR-016**: El sistema DEBE permitir asociar una máquina y un trabajador a cada ejecución.
- **FR-017**: El sistema DEBE almacenar el inicio real y el fin real de una ejecución y calcular su tiempo de uso en minutos.
- **FR-018**: El sistema DEBE mostrar las etapas ejecutadas y el avance de una orden.
- **FR-019**: El sistema DEBE validar los campos obligatorios y las fechas de una ejecución antes de guardar.

**Recepción de materiales (HU4)**

- **FR-020**: El sistema DEBE permitir registrar recepciones de material asociadas a una orden con material, proveedor, cantidad recibida mayor que cero y fecha. Cada registro guardado DEBE conservarse como historial de solo consulta. Su edición y eliminación, incluida la eliminación por cascada desde la orden, DEBEN rechazarse.
- **FR-021**: El sistema DEBE mostrar todas las recepciones de una orden con material, proveedor, cantidad y fecha.
- **FR-022**: El sistema DEBE validar los campos obligatorios de una recepción y señalar el campo faltante.

**Máquinas, mantenimiento y equipamiento (HU5)**

- **FR-023**: El sistema DEBE permitir crear, editar y eliminar máquinas con código, nombre, estado y capacidad por hora mayor que cero.
- **FR-024**: El sistema DEBE permitir registrar mantenimientos con máquina, técnico, tipo, costo y fecha.
- **FR-025**: El sistema DEBE permitir asociar uno o más repuestos con cantidad mayor que cero a un mantenimiento.
- **FR-026**: El sistema DEBE mostrar el historial de mantenimientos de una máquina.
- **FR-027**: El sistema DEBE permitir registrar equipamiento con nombre y tipo.
- **FR-028**: El sistema DEBE permitir registrar asignaciones de equipamiento a un trabajador con fecha de entrega.
- **FR-029**: El sistema DEBE mostrar las asignaciones de equipamiento por trabajador o por equipamiento.
- **FR-030**: El sistema DEBE validar los campos obligatorios de mantenimiento y asignación, explicando qué información falta.

**Requisitos transversales**

- **FR-031**: El sistema DEBE persistir todos los registros en `localStorage` usando claves con el prefijo `manufactura:`.
- **FR-032**: El sistema DEBE mantener la integridad referencial y el borrado en cascada entre las entidades relacionadas.
- **FR-033**: El sistema DEBE proveer catálogos de referencia de solo lectura para MATERIAL, TRABAJADOR, PROVEEDOR y REPUESTO.
- **FR-034**: El sistema DEBE registrar la navegación del módulo Manufactura en la aplicación.
- **FR-035**: El sistema DEBE mostrar estados vacíos y mensajes de error accesibles en formularios y listados.
- **FR-036**: El sistema DEBE recargar los datos persistidos al reabrir un formulario de edición.
- **FR-037**: El sistema DEBE mantener verificable el flujo completo producto → ruta → orden → recepción.
- **FR-038**: El sistema DEBE ejecutar pruebas automatizadas y la compilación de producción sin regresiones.

**Ampliaciones transversales (HU1-HU5)**

- **FR-039**: El sistema DEBE mostrar un panel de alertas de producción con avisos visuales de stock crítico, órdenes retrasadas y máquinas fuera de servicio, con accesos a las áreas relacionadas.
- **FR-040**: El sistema DEBE ofrecer una barra de filtros global reutilizable para filtrar registros por texto, estado, fecha o categoría y permitir limpiar los filtros activos.
- **FR-041**: El sistema DEBE permitir el alta local de materiales desde el formulario de productos, persistirlos en `manufactura:materiales_locales` y reutilizarlos en composiciones y recepciones.
- **FR-042**: El sistema DEBE cargar al iniciar, cuando no existan registros, un dataset de demostración que deje operativas las HU1 a HU5 y conservar la carga o el reemplazo manual.
- **FR-043**: Al instalar la misma revisión con el entorno documentado y abrir un perfil de navegador sin registros, el sistema DEBE presentar los mismos productos, composiciones, rutas, órdenes, recepciones y recursos iniciales. Las fechas de esos registros DEBEN ser deterministas.
- **FR-044**: El repositorio DEBE contener los pasos de instalación, versiones del entorno, dependencias resueltas, recursos visuales y trazabilidad entre especificación, plan, tareas y pruebas. La reproducción DEBE poder verificarse con una instalación limpia, la suite automatizada y la compilación.
- **FR-045**: El sistema DEBE ofrecer los cinco perfiles de demostración de la matriz de roles, conservar el perfil válido al recargar y limitar la navegación y las operaciones a su función.
- **FR-046**: Ensamble DEBE consultar órdenes abiertas y registrar ejecuciones de etapas de tipo Ensamble o Ensamblaje. Las recepciones, los proveedores y las fechas de entrega DEBEN omitirse de esa perspectiva.
- **FR-047**: El sistema DEBE rechazar modificaciones fuera del perfil antes de escribir registros, y cerrar formularios previos al cambiar el perfil.
- **FR-048**: El sistema DEBE impedir finalizar órdenes sin ruta, con etapas pendientes o con ejecuciones abiertas. Las órdenes finalizadas o canceladas DEBEN rechazar recepciones nuevas, conservando la consulta de entregas históricas.
- **FR-049**: El sistema DEBE ofrecer deshacer cambios sin guardar en formularios y rutas, y revertir en orden los últimos veinte cambios guardados de la pestaña, incluidas eliminaciones válidas y sus relaciones. La operación DEBE respetar el rol y rechazarse si otra pestaña cambió los datos. Las recepciones confirmadas conservan su historial y solo ofrecen deshacer en el formulario sin guardar.
- **FR-050**: Al abrir un formulario, detalle o menú de pedidos, el sistema DEBE llevar la vista a ese apartado y enfocar un control apropiado. La navegación entre páginas DEBE llevar al inicio del contenido y respetar la preferencia de movimiento reducido.
- **FR-051**: Una orden nueva o un cambio de producto o cantidad DEBE requerir un número entero de al menos 64 peluches. Las órdenes históricas con cantidades inferiores pueden conservar su cantidad al editar otros campos.
- **FR-052**: Órdenes de producción DEBE ofrecer un menú por modelo de peluche con código de pedido, código y nombre del local, cantidad solicitada y orden asociada. Supervisor y Planificación pueden registrar pedidos y planificar conjuntamente pedidos pendientes del mismo producto cuando sumen al menos 64 unidades.
- **FR-053**: La creación de una orden desde pedidos DEBE guardar la orden y sus vínculos conjuntamente. Los pedidos ya planificados DEBEN rechazarse si se intenta planificarlos otra vez. Deshacer esa creación DEBE restablecer los pedidos pendientes.

### Requisitos de Extensibilidad *(obligaciones del módulo)*

- **XR-001**: La capa de almacenamiento DEBE ser genérica y usar claves con prefijo `manufactura:` para permitir añadir nuevas entidades sin cambiar la base.
- **XR-002**: Las referencias a módulos externos DEBEN estar desacopladas y ser sustituibles por integraciones reales sin cambiar la lógica de Manufactura.
- **XR-003**: Los validadores por entidad DEBEN ser reutilizables y componibles.
- **XR-004**: Los catálogos locales de solo lectura DEBEN poder reemplazarse por los módulos externos correspondientes.

### Entidades Clave *(incluir si la funcionalidad implica datos)*

Las entidades y sus campos se definen en detalle en [data-model.md](data-model.md).

- **PRODUCTO**: Producto fabricable, identificado por `producto_id`, con nombre y tipo.
- **PRODUCTO_MATERIAL**: Composición de un producto; vincula `producto_id` con `material_id` y la `cantidad_por_unidad`.
- **ETAPA_FABRICACION**: Etapa del proceso productivo con nombre, tipo y `tiempo_estandar_min`.
- **RUTA_PRODUCTO**: Etapa asignada a un producto con una `secuencia` que define el orden.
- **ORDEN_PRODUCCION**: Orden de fabricación de un producto con `cantidad_plan`, estado y fechas.
- **EJECUCION_ETAPA**: Ejecución real de una etapa de una orden, con máquina, trabajador, inicio/fin reales y `tiempo_uso_min`.
- **RECEPCION_MATERIAL**: Recepción de material para una orden, con proveedor, cantidad y fecha.
- **MAQUINA**: Recurso de planta con código, nombre, estado y `capacidad_hora`.
- **MANTENIMIENTO_MAQUINA**: Intervención sobre una máquina con técnico, tipo, costo y fecha.
- **MANTENIMIENTO_REPUESTO**: Repuesto consumido por un mantenimiento con su cantidad.
- **EQUIPAMIENTO**: Recurso entregable a trabajadores, con nombre y tipo.
- **ASIGNACION_EQUIPAMIENTO**: Entrega de equipamiento a un trabajador con fecha.
- **Referencias externas**: MATERIAL y REPUESTO (Logística e Inventario), TRABAJADOR (RRHH y Planillas), PROVEEDOR (Adquisición y Compras). En esta iteración son catálogos locales de solo lectura.

## Criterios de Éxito *(obligatorio)*

### Resultados Medibles

- **SC-001**: Un usuario puede crear un producto con al menos un material y verlo en el listado en menos de 2 minutos.
- **SC-002**: Un usuario puede configurar la ruta de un producto y verla ordenada por secuencia en menos de 5 minutos.
- **SC-003**: Un usuario puede crear una orden y registrar una ejecución completa en menos de 5 minutos.
- **SC-004**: Un usuario puede registrar una recepción y verla asociada a la orden en menos de 2 minutos.
- **SC-005**: Un usuario puede registrar una máquina, un mantenimiento con repuestos y una asignación de equipamiento en menos de 5 minutos.
- **SC-006**: Al menos el 90% de los usuarios de prueba completan las tareas principales sin ayuda.
- **SC-007**: Las validaciones impiden guardar registros con datos obligatorios faltantes en todos los formularios.
- **SC-008**: El sistema mantiene la funcionalidad y responde en menos de 200 ms con al menos 500 registros por entidad.
- **SC-009**: El flujo completo producto → ruta → orden → recepción funciona sin regresiones.
- **SC-010**: Las pruebas unitarias y de integración pasan y la compilación de producción es exitosa.

## Suposiciones

- El módulo gestiona datos para un único espacio de trabajo y persiste en el `localStorage` del navegador.
- Los identificadores son numéricos y se generan de forma incremental por entidad.
- Los módulos externos (Logística, RRHH, Compras) se representan con catálogos locales de solo lectura; su integración real queda fuera del alcance de esta iteración.
- La interfaz se presenta en español y usa mensajes de validación claros y consistentes.
- No se implementan flujos de aprobación, contabilidad ni informes avanzados en esta iteración.
- La versión inicial prioriza el flujo producto → ruta → orden → recepción; las funciones de máquinas, mantenimiento y equipamiento se entregan de forma incremental.
- Los datos de usuario introducidos (nombres, descripciones y notas) DEBEN sanitizarse antes de renderizarse en el DOM para prevenir ataques de inyección de scripts (XSS).
