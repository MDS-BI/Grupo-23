# Especificación de la Funcionalidad: Módulo Base de Software de Planificación de Recursos Empresariales (ERP)

**Rama de la funcionalidad**: 001-erp-base-module  
**Creada**: 2026-07-08  
**Estado**: Borrador  
**Entrada**: Descripción del usuario: "Construir un módulo base de software de planificación de recursos empresariales (ERP) que pueda extenderse en módulos ERP personalizados. Debe proporcionar gestión de datos maestros (entidades) y documentos transaccionales vinculados con capacidades de crear/editar/eliminar/buscar."

## Propósito

Este proyecto sirve como módulo base reutilizable para construir módulos ERP personalizados. Establece los patrones comunes que todo módulo ERP necesita: gestionar registros de datos maestros (**Entidades**) y sus **Documentos** transaccionales asociados, con navegación, validación, persistencia y búsqueda ya implementadas, de modo que los módulos personalizados solo necesiten definir sus campos y reglas específicos del dominio.

## Escenarios de Usuario y Pruebas *(obligatorio)*

### Historia de Usuario 1 - Gestionar productos y sus materiales (Prioridad: P1)
Como encargado de producción, quiero registrar y gestionar los productos junto con los materiales necesarios para fabricarlos, para conocer qué insumos y cantidades requiere cada producto.

**Por qué esta prioridad**: Es una funcionalidad base del módulo: antes de planificar o ejecutar una producción, el sistema debe conocer el producto y los materiales que lo componen. Las órdenes y rutas posteriores dependen de que estos datos existan.

**Prueba Independiente**: Un usuario puede crear un producto, asociarle al menos un material indicando la cantidad requerida por unidad y, al consultar el producto, ver correctamente esa composición.

**Escenarios de Aceptación**:

1. **Dado** que el usuario se encuentra en la gestión de productos, **cuando** registra un producto con nombre y tipo, **entonces** el producto queda almacenado y disponible para su consulta.
2. **Dado** que existe un producto registrado, **cuando** el usuario selecciona un material e indica la cantidad requerida por unidad, **entonces** la relación producto-material queda guardada.
3. **Dado** que un producto tiene varios materiales asociados,**cuando** el usuario consulta sus detalles, **entonces** puede visualizar todos los materiales y sus respectivas cantidades por unidad.
4. **Dado** que existe un producto registrado,**cuando** el usuario modifica sus datos, **entonces**  la información actualizada se guarda y se muestra al volver a consultarlo.
5. **Dado** que falta información obligatoria al crear o editar un producto, **cuando** el usuario intenta guardar,**entonces** el sistema impide la operación y muestra qué dato falta.


---

### Historia de Usuario 2 - Definir el proceso y las etapas de fabricación (Prioridad: P1)
Como encargado de producción, quiero definir las etapas y el orden que debe seguir cada producto durante su fabricación, para establecer claramente su proceso productivo.
<<<<<<< HEAD
**Por qué esta prioridad**: La ruta de fabricación determina cómo se transforma un producto. Sin etapas y una secuencia definida, una orden de producción no puede saber qué pasos debe ejecutar ni en qué orden.

=======

**Por qué esta prioridad**: La ruta de fabricación determina cómo se transforma un producto. Sin etapas y una secuencia definida, una orden de producción no puede saber qué pasos debe ejecutar ni en qué orden.

>>>>>>> 53383bb89e50d180d475b010de2843c6007805bc
**Prueba Independiente**: Un usuario puede crear varias etapas, asociarlas a un producto mediante una ruta y comprobar que aparecen ordenadas según la secuencia definida.

**Escenarios de Aceptación**:

<<<<<<< HEAD
1. **Dado** que el usuario necesita definir una nueva etapa, **cuando** registra nombre, tipo y tiempo estándar, **entonces** la etapa queda disponible para ser utilizada en rutas de productos.
2. **Dado** que existen un producto y etapas de fabricación, **cuando** el usuario configura una ruta, **entonces** puede seleccionar las etapas que forman parte del proceso del producto.
3. **Dado** que una ruta contiene varias etapas, **cuando** el usuario asigna una secuencia a cada una, **entonces** el sistema conserva ese orden.
4. **Dado** que un producto posee una ruta definida, **cuando** el usuario consulta el proceso de fabricación, **entonces** las etapas aparecen ordenadas por su secuencia.
5. **Dado** que falta un dato obligatorio de una etapa o ruta, **cuando** el usuario intenta guardar, **entonces** el sistema rechaza el registro y explica qué información falta.
=======
1. **Dada** que el usuario necesita definir una nueva etapa,  **cuando** registra nombre, tipo y tiempo estándar, **entonces** la etapa queda disponible para ser utilizada en rutas de productos.
2. **Dada** que existen un producto y etapas de fabricación, **cuando** el usuario configura una ruta,  **entonces** puede seleccionar las etapas que forman parte del proceso del producto.
3. **Dadas** que una ruta contiene varias etapas, **cuando** el usuario asigna una secuencia a cada una, **entonces** el sistema conserva ese orden.
4. **Dada** que un producto posee una ruta definida, **cuando** el usuario consulta el proceso de fabricación, **entonces**  las etapas aparecen ordenadas por su secuencia.
5. **Dada** que falta un dato obligatorio de una etapa o ruta,  **cuando** el usuario intenta guardar, **entonces** el sistema rechaza el registro y explica qué información falta.
>>>>>>> 53383bb89e50d180d475b010de2843c6007805bc

---

### Historia de Usuario 3 - Crear y controlar órdenes de producción (Prioridad: P1)

Como encargado de producción, quiero crear órdenes de producción y registrar la ejecución real de sus etapas, para controlar qué se está fabricando y conocer el avance real de la producción.

**Por qué esta prioridad**: La orden de producción es el núcleo operativo del módulo: transforma la información del producto y su proceso en una fabricación concreta. Además, permite registrar quién ejecutó una etapa, qué máquina se usó y cuánto tiempo tomó.

**Prueba Independiente**:  Un usuario puede crear una orden para un producto, registrar al menos una ejecución de etapa con trabajador, máquina, inicio y fin reales, y luego consultar esa información asociada a la orden.

**Escenarios de Aceptación**:

1. **Dado** que existe un producto registrado, **cuando** el encargado crea una orden indicando producto, cantidad planificada, fechas y estado, **entonces** la orden queda almacenada.
2. **Dado** que existe una orden de producción, **cuando** comienza una etapa, **entonces** el usuario puede registrar una nueva ejecución asociada a esa orden y etapa.
3. **Dado** que se registra una ejecución, **cuando** el usuario selecciona una máquina y un trabajador, **entonces** ambos quedan asociados a la ejecución de la etapa.
4. **Dado** que una etapa fue iniciada, **cuando** el usuario registra su finalizacion, **entonces** quedan almacenados el inicio real, fin real y tiempo de uso correspondiente.
5. **Dado** que una orden posee ejecuciones registradas, **cuando** el encargado consulta la orden, **entonces** puede identificar las etapas ejecutadas y la información registrada para cada una.
6. **Dado** que una fecha de término es anterior a la fecha de inicio, **cuando** el usuario intenta guardar la orden, **entonces** el sistema rechaza los datos y muestra una explicación clara.

---

<<<<<<< HEAD
### Historia de Usuario 4 - Registrar la recepción de materiales para producción (Prioridad: P1)

Como encargado de producción, quiero registrar los materiales recibidos para una orden y el proveedor que los entrega, para mantener trazabilidad de los insumos asociados a la fabricación.

**Por qué esta prioridad**: La producción puede funcionar inicialmente con productos, rutas y órdenes, pero registrar la recepción de insumos agrega trazabilidad y conecta Manufactura con Logística/Inventario y Adquisición/Compras. Por eso se considera importante, aunque posterior al flujo productivo básico.

=======
### Historia de Usuario 4 - Registrar la recepción de materiales para producción
 (Prioridad: P2)

Como encargado de producción, quiero registrar los materiales recibidos para una orden y el
proveedor que los entrega, para mantener trazabilidad de los insumos asociados a la fabricación


**Por qué esta prioridad**: La producción puede funcionar inicialmente con productos, rutas y órdenes, pero registrar la recepción de insumos agrega trazabilidad y conecta Manufactura con Logística/Inventario y Adquisición/Compras.
Por eso se considera importante, aunque posterior al flujo productivo básico.


>>>>>>> 53383bb89e50d180d475b010de2843c6007805bc
**Prueba Independiente**: Un usuario puede seleccionar una orden existente, registrar la recepción de un material indicando proveedor, cantidad y fecha, y luego encontrar esa recepción al consultar la orden.

**Escenarios de Aceptación**:

<<<<<<< HEAD
1.  **Dado** que existe una orden de producción, **cuando** llegan materiales para dicha orden, **entonces** el usuario puede crear un registro de recepción asociado a ella.
2. **Dado** que el usuario registra una recepción, **cuando** selecciona material y proveedor e ingresa cantidad y fecha, **entonces** la recepción queda almacenada con esos datos.
3. **Dado** que una orden ha recibido materiales en diferentes fechas, **cuando** el usuario consulta la orden, **entonces** puede visualizar todas las recepciones asociadas.
4. **Dado** que existe una recepción registrada, **cuando** el usuario consulta sus detalles, **entonces** puede identificar el material, proveedor, cantidad y fecha de recepción.
5. **Dado** que falta material, proveedor, cantidad o fecha, **cuando** el usuario intenta guardar una recepción, **entonces** el sistema impide el guardado y muestra el dato faltante.
=======
1. **Dado** que existe una orden de producción, **cuando** llegan materiales para dicha orden, **entonces** el usuario puede crear un registro de recepción asociado a ella.
2. **Dada** que el usuario registra una recepción, **cuando** selecciona material y proveedor e ingresa cantidad y fecha, **entonces** la recepción queda almacenada con esos datos.
3. **Dada** que una orden ha recibido materiales en diferentes fechas, **cuando** el usuario consulta la orden, **entonces** puede visualizar todas las recepciones asociadas.
4. **Dado**  que existe una recepción registrada, **cuando** el usuario consulta sus detalles, **entonces** puede identificar el material, proveedor, cantidad y fecha de recepción.
5. **Dado** que falta material, proveedor, cantidad o fecha, **cuando**  el usuario intenta guardar una recepción, **entonces** el sistema impide el guardado y muestra el dato faltante.
>>>>>>> 53383bb89e50d180d475b010de2843c6007805bc

---

### Historia de Usuario 5 - Gestionar máquinas, mantenimiento y equipamiento (Prioridad: P1)

Como encargado de planta, quiero gestionar las máquinas, sus mantenimientos y el equipamiento asignado a los trabajadores, para mantener disponibles y trazables los recursos necesarios para realizar la producción.

**Por qué esta prioridad**: Estas funciones apoyan la continuidad operativa de la planta y permiten saber el estado de las máquinas, las intervenciones realizadas y el equipamiento entregado. Son relevantes para un módulo completo, pero el flujo básico de producto-ruta-orden puede demostrarse antes de ellas.
**Prueba Independiente**:  Un usuario puede registrar una máquina, agregarle un mantenimiento con técnico y repuestos, y registrar una asignación de equipamiento a un trabajador; cada registro permanece asociado a la entidad correspondiente.

**Escenarios de Aceptación**:

1. **Dado** que se incorpora una máquina a la planta, **cuando** el encargado registra código, nombre, estado y capacidad por hora, **entonces** la máquina queda disponible para ser utilizada en el módulo.
2. **Dado** que una máquina requiere una intervención, **cuando** el usuario registra un mantenimiento, **entonces** quedan asociados la máquina, el técnico, el tipo, el costo y la fecha.
3. **Dado** que un mantenimiento utiliza repuestos, **cuando** el usuario agrega uno o más repuestos con sus cantidades, **entonces** cada consumo queda asociado al mantenimiento correspondiente.
4. **Dado** que un trabajador recibe equipamiento, **cuando** el usuario selecciona trabajador y equipamiento e indica la fecha de entrega, **entonces** la asignación queda registrada.
5. **Dado** que una máquina posee mantenimientos anteriores, **cuando** el usuario consulta sus registros asociados, **entonces** puede identificar las intervenciones registradas para esa máquina.
6. **Dado** que falta información obligatoria en un mantenimiento o asignación, **cuando** el usuario intenta guardar, **entonces** el sistema impide la operación y explica qué información falta.

---

### Casos Límite

- ¿Qué ocurre cuando un usuario intenta guardar una entidad sin nombre o código obligatorio?
- ¿Cómo gestiona el sistema una búsqueda que no devuelve coincidencias?
- ¿Qué ocurre si un usuario intenta editar o eliminar una entidad que ya no existe?
- ¿Qué ocurre cuando un usuario introduce una fecha objetivo que no es una fecha de calendario válida?
- ¿Qué ocurre con los documentos de una entidad cuando esta se elimina?
- ¿Qué ocurre cuando un usuario introduce una fecha final anterior a la fecha inicial en un documento?
- ¿Qué ocurre cuando la configuración declara un campo personalizado cuya clave choca con un nombre de campo base?
- ¿Qué ocurre cuando la configuración referencia un tipo de campo desconocido o una definición de transición de ciclo de vida inválida?
- ¿Qué ocurre cuando los registros almacenados contienen valores de campos personalizados que ya no están declarados en la configuración?
- ¿Qué ocurre cuando un usuario abre la aplicación directamente en la pantalla de gestión o búsqueda (p. ej., vía enlace profundo o recarga del navegador) sin pasar por el panel de inicio?
- ¿Qué ocurre cuando un usuario pulsa el botón atrás del navegador estando en la pantalla de gestión o búsqueda?
- ¿Qué ocurre si un usuario navega fuera de la pantalla de gestión mientras un formulario aún tiene cambios sin guardar?
- ¿Permanecen intactas las entidades y los documentos al navegar entre el panel, la gestión y la búsqueda?
- ¿Qué ocurre cuando el panel se abre con cero entidades o cero documentos (valores estadísticos)?
- ¿Qué ocurre cuando el color de acento configurado no es un valor de color válido?
- ¿Cómo mantiene la barra lateral contraída las etiquetas de módulo accesibles en ventanas gráficas estrechas?

## Requisitos *(obligatorio)*

### Requisitos Funcionales

- **FR-001**: El sistema DEBE permitir a los usuarios crear un registro de entidad con al menos un nombre y un código.
- **FR-002**: El sistema DEBE permitir a los usuarios editar los detalles de un registro de entidad existente.
- **FR-003**: El sistema DEBE permitir a los usuarios eliminar un registro de entidad existente.
- **FR-004**: El sistema DEBE permitir a los usuarios buscar registros de entidad por nombre, código, categoría u otras palabras clave descriptivas.
- **FR-005**: El sistema DEBE mostrar una lista clara de entidades e indicar cuándo ningún resultado coincide con una búsqueda.
- **FR-006**: El sistema DEBE presentar retroalimentación clara cuando falta información obligatoria o no se puede completar una acción.
- **FR-007**: El sistema DEBE mantener los datos de entidad consistentes tras operaciones de creación, edición y eliminación.
- **FR-008**: El sistema DEBE permitir a los usuarios añadir, editar y eliminar detalles de documentos de una entidad.
- **FR-009**: El sistema DEBE asociar cada documento exactamente a una entidad y eliminar los documentos asociados cuando la entidad se elimina.
- **FR-010**: El sistema DEBE mostrar un panel de inicio como vista inicial, con botones de acción rápida claramente etiquetados para las tareas ERP clave.
- **FR-011**: El sistema DEBE envolver cada pantalla en un marco de espacio de trabajo persistente compuesto por una barra superior con marca y una barra lateral de navegación de módulos.
- **FR-012**: La barra lateral DEBE proporcionar botones de módulo para Panel, Entidades, Documentos y Buscar, etiquetados desde la configuración del módulo.
- **FR-013**: El botón de módulo Entidades DEBE mostrar el contenido de gestión de entidades.
- **FR-014**: El botón de módulo Documentos DEBE mostrar el contenido de gestión de documentos en la pantalla de gestión.
- **FR-015**: El botón de módulo Panel DEBE devolver al usuario al panel de inicio.
- **FR-016**: La pantalla de gestión NO DEBE mostrar la lista de entidades.
- **FR-017**: La pantalla de gestión DEBE proporcionar la funcionalidad de crear, editar y eliminar entidades.
- **FR-018**: La pantalla de gestión DEBE proporcionar la funcionalidad de crear, editar y eliminar documentos.
- **FR-019**: El sistema DEBE navegar a una pantalla de búsqueda dedicada cuando se selecciona el botón Buscar en la barra lateral.
- **FR-020**: La pantalla de búsqueda DEBE permitir buscar entidades por nombre, código, categoría, descripción o fecha objetivo.
- **FR-021**: La pantalla de búsqueda DEBE ser accesible tanto desde la barra lateral como desde la acción rápida de buscar registros del panel.
- **FR-022**: El sistema DEBE mantener los datos de entidades y documentos intactos y consistentes durante la navegación entre pantallas.
- **FR-023**: El sistema DEBE cargar la configuración del módulo al arrancar y aplicarla en todas las pantallas.
- **FR-024**: El sistema DEBE retroceder a los valores predeterminados integrados (terminología Entidad/Documento, sin campos personalizados, sin ciclo de vida) cuando no se proporciona configuración.
- **FR-025**: El sistema DEBE informar claramente de una configuración inválida o conflictiva en lugar de fallar silenciosamente.
- **FR-026**: El sistema DEBE mostrar los campos personalizados declarados en los formularios de creación/edición con tipos de entrada que coincidan con sus tipos declarados.
- **FR-027**: El sistema DEBE validar los valores de campos personalizados, incluidos los obligatorios, antes de guardar, usando la misma experiencia de retroalimentación que la validación base.
- **FR-028**: El sistema DEBE incluir los valores de campos personalizados en los resultados de búsqueda y mostrarlos en listas y vistas de detalle.
- **FR-029**: El sistema DEBE derivar todas las etiquetas visibles para el usuario de la configuración del módulo en lugar de texto fijo en el código.
- **FR-030**: El sistema DEBE aplicar las transiciones de estado configuradas en los documentos independientemente de cómo se envíe un cambio.
- **FR-031**: El sistema DEBE mantener el estado del documento como texto libre cuando no hay ciclo de vida configurado.
- **FR-032**: El sistema DEBE mantener el renderizado de listas y la búsqueda ágiles y correctos para conjuntos de datos de al menos 500 registros de entidad.
- **FR-033**: El panel DEBE ofrecer al menos cuatro botones de acción rápida: nueva entidad, nuevo documento, abrir gestión de entidades y buscar registros.
- **FR-034**: Activar la acción rápida de nueva entidad o nuevo documento DEBE abrir el área de gestión correspondiente con un formulario vacío listo para introducir datos.
- **FR-035**: El panel DEBE mostrar tarjetas de estadísticas con el número de entidades y documentos almacenados, actualizadas cada vez que se muestra el panel.
- **FR-036**: La barra superior DEBE mostrar un logotipo derivado del nombre del módulo junto con el nombre del módulo configurado en cada pantalla.
- **FR-037**: La barra lateral DEBE resaltar visualmente el módulo activo en cada pantalla.
- **FR-038**: La configuración PUEDE definir un color de acento; el sistema DEBE aplicarlo consistentemente en todo el marco y retroceder de forma segura a los valores integrados cuando esté ausente o sea inválido.
- **FR-039**: En ventanas gráficas estrechas, la barra lateral DEBE contraerse a una columna de iconos manteniéndose operable.

### Requisitos de Extensibilidad *(obligaciones del módulo base)*

Los módulos personalizados construidos sobre esta base DEBEN poder:

- **XR-001**: Extender los registros de entidad y documento con campos adicionales específicos del dominio sin cambiar la estructura de almacenamiento base.
- **XR-002**: Reetiquetar pantallas, pestañas, formularios y listas con terminología específica del módulo sin alterar el comportamiento de navegación.
- **XR-003**: Añadir reglas de validación específicas del módulo junto a las reglas de validación base.
- **XR-004**: Apoyarse en el módulo base para generación de identidad, marcas de tiempo, integridad referencial entre entidades y documentos, y eliminación en cascada.
- **XR-005**: Remarcar el espacio de trabajo —nombre del módulo, logotipo derivado y color de acento— únicamente mediante configuración.

### Entidades Clave *(incluir si la funcionalidad implica datos)*

- **Entidad**: Un registro de datos maestros gestionado por el módulo, que incluye su nombre, código de negocio, detalles descriptivos, categoría de clasificación, una fecha objetivo opcional y un entity_id autogenerado. Los módulos personalizados definen qué representa una Entidad en el mundo real (p. ej., cliente, producto, activo).
- **Documento**: Detalles transaccionales adjuntos a una entidad, vinculados a ella por el entity_id de la entidad. Los módulos personalizados definen qué representa un Documento (p. ej., pedido, factura, contrato).
- **ModuleConfig**: El objeto de adaptación cargado al arrancar que define el nombre del módulo, las etiquetas de terminología, las definiciones de campos personalizados y el ciclo de vida de estados de documentos. Consulte data-model.md para su forma completa.

## Criterios de Éxito *(obligatorio)*

### Resultados Medibles

- **SC-001**: Los usuarios pueden crear una nueva entidad y verla en la lista en menos de 2 minutos.
- **SC-002**: Los usuarios pueden encontrar una entidad existente mediante la búsqueda en menos de 10 segundos tras introducir un término relevante.
- **SC-003**: Al menos el 90% de los usuarios de prueba pueden completar tareas de crear, editar, eliminar y buscar sin ayuda.
- **SC-004**: El sistema sigue siendo utilizable para un conjunto de datos de al menos 500 registros de entidad sin pérdida de funcionalidad central.
- **SC-005**: Un usuario puede alcanzar las pantallas de gestión y búsqueda desde el panel o la barra lateral en menos de 10 segundos en el primer uso.
- **SC-006**: Toda la funcionalidad existente de gestión de entidades y documentos sigue operativa tras el rediseño del marco ERP y el panel (sin regresiones).
- **SC-007**: Los usuarios pueden navegar entre las pantallas de panel, gestión y búsqueda sin perder ninguna entidad ni documento almacenado.
- **SC-008**: Un desarrollador puede producir un módulo adaptado usando solo el archivo de configuración, con cero modificaciones en archivos fuente centrales.
- **SC-009**: Cada pantalla presenta el mismo marco con marca, y los usuarios pueden identificar en qué módulo están de un vistazo.
- **SC-010**: Las estadísticas de registros mostradas en el panel siempre coinciden con el número de entidades y documentos almacenados.

## Suposiciones

- El módulo base gestiona datos para un único espacio de trabajo en lugar de una base de datos multiinquilino compartida.
- La adaptación a un módulo específico se realiza mediante un archivo de configuración del módulo en lugar de editando archivos fuente centrales.
- Cada entidad incluye información básica suficiente para identificación y seguimiento; los módulos personalizados aportan los campos específicos del dominio.
- La versión inicial se centra en la gestión central de datos maestros y documentos en lugar de capacidades ERP avanzadas como flujos de aprobación, períodos de contabilización o informes.
- La búsqueda se realiza sobre los registros de entidad almacenados.
- La pantalla de gestión consolida los formularios de añadir/editar entidad y añadir/editar documento en una sola pantalla de gestión.
- La navegación entre áreas ocurre mediante una barra lateral persistente; la pantalla de gestión aloja ambos paneles de gestión y no muestra la lista de entidades.
- El logotipo se genera como un monograma SVG en línea derivado del nombre del módulo; no se requieren recursos de imagen externos.
- Se puede configurar un color de acento opcional para la marca; el resto de la paleta base permanece fija.
- Solo se muestra una pantalla a la vez; no hay diseño lado a lado del contenido de gestión y búsqueda.
- La navegación entre pantallas se maneja dentro de la aplicación (p. ej., cambio de vistas), y el botón atrás del navegador debe comportarse de forma predecible.
- Los datos siguen persistiéndose en el localStorage del navegador y no se ven afectados por la navegación entre pantallas.
- La pantalla de búsqueda se centra en encontrar y ver entidades; la edición permanece en la pantalla de gestión.
- El contenido del usuario introducido por el usuario (nombres, descripciones, notas de documentos) DEBE sanitizarse antes de renderizarse en el DOM para prevenir ataques de inyección de scripts (XSS). El módulo base DEBE escapar HTML y atributos de eventos al mostrar datos de localStorage.

