# Contrato de Almacenamiento de Entidades — Módulo 7 Manufactura

## Propósito

La aplicación persiste los registros del módulo de Manufactura y Operaciones en el `localStorage` del navegador. Este contrato define las claves, la forma de los datos, las operaciones y las validaciones que los repositorios deben respetar.

## Convenciones

- Cada entidad se guarda como una lista JSON bajo una clave con el prefijo `manufactura:`.
- Los identificadores (`*_id`) son enteros únicos por entidad y se generan de forma incremental.
- Los repositorios validan los datos antes de persistir y devuelven errores por campo.
- Los catálogos externos (MATERIAL, REPUESTO, PROVEEDOR, TRABAJADOR) son de solo lectura y no se persisten en `localStorage`.

## Claves de almacenamiento

| Entidad | Clave |
|---|---|
| PRODUCTO | `manufactura:productos` |
| PRODUCTO_MATERIAL | `manufactura:producto_material` |
| ETAPA_FABRICACION | `manufactura:etapas` |
| RUTA_PRODUCTO | `manufactura:rutas` |
| ORDEN_PRODUCCION | `manufactura:ordenes` |
| EJECUCION_ETAPA | `manufactura:ejecuciones` |
| RECEPCION_MATERIAL | `manufactura:recepciones` |
| MAQUINA | `manufactura:maquinas` |
| MANTENIMIENTO_MAQUINA | `manufactura:mantenimientos` |
| MANTENIMIENTO_REPUESTO | `manufactura:mantenimiento_repuestos` |
| EQUIPAMIENTO | `manufactura:equipamiento` |
| ASIGNACION_EQUIPAMIENTO | `manufactura:asignaciones` |
| LOCAL | `manufactura:locales` |
| PEDIDO_LOCAL | `manufactura:pedidos` |

LOCAL contiene `local_id`, `codigo` y `nombre`. PEDIDO_LOCAL contiene
`pedido_id`, `codigo` único, `producto_id`, `local_id`, `cantidad` entera
positiva y `orden_id` opcional. El enlace a una orden se guarda conjuntamente
con su creación. No se elimina un producto con pedidos ni un pedido planificado
en una orden activa. Eliminar una orden permitida deja sus pedidos pendientes.

## Forma de los datos

### PRODUCTO

- `producto_id`: entero único, autogenerado
- `nombre`: cadena no vacía (obligatorio)
- `tipo`: cadena no vacía (obligatorio)

### PRODUCTO_MATERIAL

- `prod_mat_id`: entero único, autogenerado
- `producto_id`: entero que referencia un PRODUCTO existente
- `material_id`: entero que referencia un MATERIAL del catálogo externo
- `cantidad_por_unidad`: número mayor que cero

### ETAPA_FABRICACION

- `etapa_id`: entero único, autogenerado
- `nombre`: cadena no vacía (obligatorio)
- `tipo`: cadena no vacía (obligatorio)
- `tiempo_estandar_min`: entero mayor que cero (minutos)

### RUTA_PRODUCTO

- `ruta_id`: entero único, autogenerado
- `producto_id`: entero que referencia un PRODUCTO existente
- `etapa_id`: entero que referencia una ETAPA_FABRICACION existente
- `secuencia`: entero mayor que cero, único por `producto_id`

### ORDEN_PRODUCCION

- `orden_id`: entero único, autogenerado
- `producto_id`: entero que referencia un PRODUCTO existente
- `cantidad_plan`: número mayor que cero
- `estado`: cadena no vacía (obligatorio)
- `fecha_inicio`: fecha de calendario válida
- `fecha_fin`: fecha de calendario válida, igual o posterior a `fecha_inicio`

### EJECUCION_ETAPA

- `ejecucion_id`: entero único, autogenerado
- `orden_id`: entero que referencia una ORDEN_PRODUCCION existente
- `etapa_id`: entero que referencia una ETAPA_FABRICACION existente
- `maquina_id`: entero que referencia una MAQUINA existente
- `trabajador_id`: entero que referencia un TRABAJADOR del catálogo externo
- `inicio_real`: fecha y hora válidas
- `fin_real`: fecha y hora válidas, iguales o posteriores a `inicio_real`
- `tiempo_uso_min`: entero calculado en minutos a partir de `inicio_real` y `fin_real`

### RECEPCION_MATERIAL

- `recepcion_id`: entero único, autogenerado
- `orden_id`: entero que referencia una ORDEN_PRODUCCION existente
- `material_id`: entero que referencia un MATERIAL del catálogo externo
- `proveedor_id`: entero que referencia un PROVEEDOR del catálogo externo
- `cantidad_recibida`: número mayor que cero
- `fecha_recepcion`: fecha de calendario válida

### MAQUINA

- `maquina_id`: entero único, autogenerado
- `codigo`: cadena no vacía (obligatorio)
- `nombre`: cadena no vacía (obligatorio)
- `estado`: cadena no vacía (obligatorio)
- `capacidad_hora`: número mayor que cero (unidades por hora)

### MANTENIMIENTO_MAQUINA

- `mantenimiento_id`: entero único, autogenerado
- `maquina_id`: entero que referencia una MAQUINA existente
- `tecnico_id`: entero que referencia un TRABAJADOR del catálogo externo
- `tipo`: cadena no vacía (obligatorio)
- `costo_tecnico`: número mayor o igual que cero
- `fecha`: fecha de calendario válida

### MANTENIMIENTO_REPUESTO

- `mant_repuesto_id`: entero único, autogenerado
- `mantenimiento_id`: entero que referencia un MANTENIMIENTO_MAQUINA existente
- `repuesto_id`: entero que referencia un REPUESTO del catálogo externo
- `cantidad`: entero mayor que cero

### EQUIPAMIENTO

- `equipamiento_id`: entero único, autogenerado
- `nombre`: cadena no vacía (obligatorio)
- `tipo`: cadena no vacía (obligatorio)

### ASIGNACION_EQUIPAMIENTO

- `asignacion_id`: entero único, autogenerado
- `trabajador_id`: entero que referencia un TRABAJADOR del catálogo externo
- `equipamiento_id`: entero que referencia un EQUIPAMIENTO existente
- `fecha_entrega`: fecha de calendario válida

## Operaciones

Cada repositorio expone, como mínimo:

- `listar()`: devuelve todos los registros almacenados.
- `guardar(registros)`: persiste la lista completa.
- `crear(datos)`: valida y añade un registro con id autogenerado.
- `actualizar(id, cambios)`: valida y actualiza un registro existente.
- `eliminar(id)`: elimina un registro por id.

Operaciones de cascada:

- `eliminarProducto(producto_id)`: elimina el PRODUCTO, sus PRODUCTO_MATERIAL y sus RUTA_PRODUCTO.
- `eliminarOrden(orden_id)`: rechaza la operación si la orden tiene recepciones. Para una orden sin recepciones elimina la orden y sus ejecuciones.
- `eliminarMaquina(maquina_id)`: elimina la MAQUINA y sus MANTENIMIENTO_MAQUINA, junto con los MANTENIMIENTO_REPUESTO de cada mantenimiento.
- `eliminarMantenimiento(mantenimiento_id)`: elimina el mantenimiento y sus MANTENIMIENTO_REPUESTO.
- `eliminarEquipamiento(id, { retirarAsignaciones: true })`: tras la confirmación con trabajadores afectados, elimina conjuntamente EQUIPAMIENTO y sus ASIGNACION_EQUIPAMIENTO. Sin la opción explícita, mantiene el bloqueo si hay asignaciones. La reversión restaura ambas tablas conjuntamente; un fallo de escritura conserva los dos conjuntos anteriores.

## Expectativas de validación

- Un `nombre` o `tipo` faltante en PRODUCTO, ETAPA_FABRICACION, EQUIPAMIENTO o `codigo`/`nombre` en MAQUINA debe rechazarse antes de persistir.
- `cantidad_por_unidad`, `cantidad_plan`, `cantidad_recibida`, `capacidad_hora`, `tiempo_estandar_min` y `cantidad` deben ser mayores que cero.
- `secuencia` debe ser mayor que cero y única por producto.
- `fecha_fin` no puede ser anterior a `fecha_inicio`.
- `fin_real` no puede ser anterior a `inicio_real`.
- `costo_tecnico` no puede ser negativo.
- Toda FK debe referenciar un registro existente; las referencias externas deben existir en su catálogo de solo lectura.
- Las referencias de respaldo son textiles. Con `demo_peluches` cargada se muestran sus catálogos y los materiales locales; los respaldos solo se agregan si su identificador ya está usado en composición, recepciones, ejecuciones, mantenimiento o asignaciones. La lectura no escribe ni elimina datos. Un adaptador externo conserva su propio catálogo.
- Las operaciones deben preservar el orden actual de las listas y devolver errores por campo cuando la validación falla.

## Recepciones y perfiles

`guardarRecepcion(datos)` crea una entrega. Si se pasa un identificador de
edición, la operación se rechaza. `eliminarRecepcion` devuelve un error. La capa
genérica también comprueba que cada recepción existente permanezca íntegra en
cualquier escritura posterior.

Las entregas nuevas requieren una orden abierta. Las recepciones previas de
órdenes finalizadas o canceladas siguen siendo registros históricos válidos.
Finalizar una orden requiere ruta completa y todas sus ejecuciones cerradas.

`manufactura:rol` contiene el identificador del perfil seleccionado. Los
perfiles válidos y sus tablas modificables están en `roles.js`. La capa de
persistencia devuelve un error para tablas fuera de su alcance. El operario de producción puede
modificar ejecuciones de sus etapas en órdenes abiertas. El cargador de la demo
puede inicializar un almacén vacío, y Supervisor puede cargar el ejemplo sobre
datos previos mediante la opción explícita de Productos.

El selector representa roles de demostración en el cliente. La protección
multiusuario en servidor requiere una integración de autenticación posterior.

## Ampliación del oso con cascabel

`demo_peluches[0].ejemplos.oso_cascabel` conserva `version`, `producto_id` y
`orden_id` de la ampliación. `agregarEjemploOsoCascabel()` solo la añade una vez
con Supervisor; no se vuelve a crear si el usuario modifica después el ejemplo.
Añade producto, nueve relaciones de materiales, dos insumos, dos etapas,
ocho pasos de ruta, una orden de 64, cuatro ejecuciones terminadas, nueve
recepciones y cinco pedidos asignados, reutilizando proveedores, locales,
personal y máquinas. Si ya existe un insumo compatible, reutiliza su identidad.
La escritura conjunta conserva los registros anteriores y revierte todas las
tablas afectadas si una escritura falla. El marcador y las recepciones fijan
el mismo límite de deshacer que la carga inicial de la fábrica.

## Reversión de transacciones

`manufactura:deshacer` se guarda en `localStorage`, con una copia en
`sessionStorage`, y conserva veinte operaciones del navegador. Incluye una
revisión incremental para elegir la copia más reciente, el rol, las tablas
afectadas y sus valores
anteriores y posteriores. La firma del estado global se compara antes de
restaurar para evitar sobrescribir cambios de otras pestañas. La reversión
debe pasar los mismos permisos y protecciones que las escrituras normales.
Cada paso tiene un `id`, `fecha` y estado `deshecho`. Deshacer marca el paso;
rehacer vuelve a aplicarlo. Guardar cambios nuevos conserva los pasos deshechos
dentro del límite de veinte. La interfaz presenta una lista por apartado con
un botón por operación. Se revierten diferencias por registro y campo sobre
los datos actuales, no tablas completas. Las dependencias y los conflictos
con ediciones posteriores bloquean la operación con una explicación. Los
identificadores del historial se reservan para evitar colisiones al recuperar.
Guardar una recepción añade un paso protegido y conserva los cambios
independientes anteriores. Cargar o ampliar la demo inicia un historial nuevo.
Se aceptan historiales de sesión anteriores sin revisión. Si ambas escrituras
del historial fallan, se mantiene una copia en memoria mientras dure la página.
La pérdida de la sesión no elimina el respaldo persistente. Al deshacer, el
listado actualiza su confirmación para no conservar un aviso de guardado viejo.

## Expectativas de extensibilidad

`guardarOrdenConPedidos(datos, ids, ordenId, nuevos)` valida roles, cantidades,
modelo, disponibilidad y capacidad antes de guardar conjuntamente las tablas
`ordenes` y `pedidos`. Crear exige pedidos por al menos 64 unidades. Los pedidos
nuevos requieren cantidades enteras positivas; el mínimo de 64 corresponde a
la suma del lote del mismo modelo, no a cada tienda. Las fechas se guardan en
la orden y se comparten por todos sus pedidos. Modificar asignaciones requiere
una orden planificada. Antes de pasar a producción, los pedidos deben cubrir
todo el lote; fuera de planificación se congelan cantidad, modelo y asignaciones.
Los IDs y las
fechas de una orden existente se conservan salvo edición explícita. La
recuperación sigue siendo atómica, y Deshacer no puede dejar pedidos sin
capacidad ni asociados a un modelo diferente.

Cada paso del historial puede incluir `oculto: true`. Descartar un aviso solo
actualiza esa propiedad y la revisión de los respaldos, preservando la firma de
los datos y todos los registros. La interfaz y el acceso global excluyen los
pasos ocultos; se reservan sus IDs dentro del límite histórico para evitar
colisiones.

`reconstruirEjemploCoherente()` aplica la reconstrucción de demo autorizada,
solo con Supervisor y una vez por navegador. Antes de escribir guarda las
claves originales del prefijo `manufactura:` en
`manufactura:respaldo_antes_ejemplo_coherente_v2`, con versión, fecha y valores
sin transformar; excluye respaldos previos para evitar copias recursivas.
Si falla el respaldo no cambia los datos. Ante una carga parcial restaura las
claves originales y el historial de sesión. Tras completar los seis productos,
seis órdenes y treinta pedidos fija `manufactura:ejemplo_coherente_v2` a `1`.
La demo usa fechas fijas del 27 de noviembre de 2026, asigna completamente los
lotes iniciados/finalizados y completa sus materiales. El lote planificado
conserva pedidos y materiales pendientes como ejemplo de planificación.
La acción Descargar respaldo anterior entrega el JSON localmente.
Esta sustitución explícita de ejemplos no modifica la protección habitual de
las recepciones confirmadas ni afecta datos de otros módulos.

`analizarEliminacion()` comprueba existencia, rol y vínculos antes de confirmar.
Productos con órdenes o pedidos, etapas usadas en rutas o ejecuciones, máquinas
con ejecuciones, órdenes con recepciones y ejecuciones de órdenes finalizadas
conservan sus restricciones también en las funciones de dominio. Los registros
protegidos permanecen visibles con el motivo y sus referencias. Los registros
eliminados salen de las tablas activas; su recuperación está en el historial.

- La capa de almacenamiento usa claves con prefijo `manufactura:` para permitir añadir nuevas entidades sin cambiar la base.
- Las referencias externas están encapsuladas en `src/modules/manufactura/referencias.js` y pueden sustituirse por integraciones reales sin modificar los repositorios de Manufactura.
- Los campos adicionales que se agreguen en el futuro deben persistirse junto a los campos base sin manejo especial en la capa de almacenamiento.
