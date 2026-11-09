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
- `eliminarOrden(orden_id)`: elimina la ORDEN_PRODUCCION, sus EJECUCION_ETAPA y sus RECEPCION_MATERIAL.
- `eliminarMaquina(maquina_id)`: elimina la MAQUINA y sus MANTENIMIENTO_MAQUINA, junto con los MANTENIMIENTO_REPUESTO de cada mantenimiento.
- `eliminarMantenimiento(mantenimiento_id)`: elimina el mantenimiento y sus MANTENIMIENTO_REPUESTO.

## Expectativas de validación

- Un `nombre` o `tipo` faltante en PRODUCTO, ETAPA_FABRICACION, EQUIPAMIENTO o `codigo`/`nombre` en MAQUINA debe rechazarse antes de persistir.
- `cantidad_por_unidad`, `cantidad_plan`, `cantidad_recibida`, `capacidad_hora`, `tiempo_estandar_min` y `cantidad` deben ser mayores que cero.
- `secuencia` debe ser mayor que cero y única por producto.
- `fecha_fin` no puede ser anterior a `fecha_inicio`.
- `fin_real` no puede ser anterior a `inicio_real`.
- `costo_tecnico` no puede ser negativo.
- Toda FK debe referenciar un registro existente; las referencias externas deben existir en su catálogo de solo lectura.
- Las operaciones deben preservar el orden actual de las listas y devolver errores por campo cuando la validación falla.

## Expectativas de extensibilidad

- La capa de almacenamiento usa claves con prefijo `manufactura:` para permitir añadir nuevas entidades sin cambiar la base.
- Las referencias externas están encapsuladas en `src/modules/manufactura/referencias.js` y pueden sustituirse por integraciones reales sin modificar los repositorios de Manufactura.
- Los campos adicionales que se agreguen en el futuro deben persistirse junto a los campos base sin manejo especial en la capa de almacenamiento.
