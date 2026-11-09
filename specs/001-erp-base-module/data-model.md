# Modelo Entidad–Relación — Módulo 7: Manufactura y Operaciones

Este documento define el modelo de datos del módulo de Manufactura y Operaciones. Las entidades se persisten en `localStorage`; las referencias externas son catálogos de solo lectura.

## Convenciones

- **PK**: Primary Key / Clave primaria.
- **FK**: Foreign Key / Clave foránea.
- Los identificadores (`*_id`) son **enteros** generados de forma incremental por entidad.
- Los campos marcados como obligatorios se validan antes de persistir (ver `contracts/manufactura-storage.md`).
- **Ext. Logística**: referencia al módulo 3, Logística e inventario.
- **Ext. RRHH**: referencia al módulo 2, RRHH y planillas.
- **Ext. Compras**: referencia al módulo 6, Adquisición y compras.

## Unidades y restricciones numéricas

| Campo | Unidad / Restricción |
|---|---|
| `cantidad_por_unidad` | Unidades de material por unidad de producto; decimal > 0 |
| `tiempo_estandar_min` | Minutos; entero > 0 |
| `secuencia` | Orden dentro de la ruta; entero > 0 y único por producto |
| `cantidad_plan` | Unidades planificadas; decimal > 0 |
| `tiempo_uso_min` | Minutos; entero calculado como `fin_real - inicio_real` |
| `cantidad_recibida` | Unidades recibidas; decimal > 0 |
| `capacidad_hora` | Unidades por hora; decimal > 0 |
| `cantidad` (repuesto) | Unidades de repuesto; entero > 0 |
| `costo_tecnico` | Costo monetario; decimal >= 0 |

---

## 1. PRODUCTO

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| producto_id | int | PK | Autoincremental |
| nombre | string | | Obligatorio, no vacío |
| tipo | string | | Obligatorio, no vacío |

## 2. PRODUCTO_MATERIAL

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| prod_mat_id | int | PK | Autoincremental |
| producto_id | int | FK | PRODUCTO; borrado en cascada |
| material_id | int | FK | Ext. Logística (catálogo de solo lectura) |
| cantidad_por_unidad | decimal | | Obligatorio, > 0 |

## 3. ETAPA_FABRICACION

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| etapa_id | int | PK | Autoincremental |
| nombre | string | | Obligatorio, no vacío |
| tipo | string | | Obligatorio, no vacío |
| tiempo_estandar_min | int | | Obligatorio, > 0 (minutos) |

## 4. RUTA_PRODUCTO

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| ruta_id | int | PK | Autoincremental |
| producto_id | int | FK | PRODUCTO; borrado en cascada |
| etapa_id | int | FK | ETAPA_FABRICACION |
| secuencia | int | | Obligatorio, > 0; único por `producto_id` |

## 5. ORDEN_PRODUCCION

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| orden_id | int | PK | Autoincremental |
| producto_id | int | FK | PRODUCTO |
| cantidad_plan | decimal | | Obligatorio, > 0 |
| estado | string | | Obligatorio |
| fecha_inicio | date | | Obligatorio |
| fecha_fin | date | | Obligatorio; >= `fecha_inicio` |

## 6. EJECUCION_ETAPA

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| ejecucion_id | int | PK | Autoincremental |
| orden_id | int | FK | ORDEN_PRODUCCION; borrado en cascada |
| etapa_id | int | FK | ETAPA_FABRICACION |
| maquina_id | int | FK | MAQUINA |
| trabajador_id | int | FK | Ext. RRHH (catálogo de solo lectura) |
| inicio_real | datetime | | Obligatorio |
| fin_real | datetime | | Obligatorio; >= `inicio_real` |
| tiempo_uso_min | int | | Calculado en minutos a partir de inicio/fin reales |

## 7. RECEPCION_MATERIAL

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| recepcion_id | int | PK | Autoincremental |
| orden_id | int | FK | ORDEN_PRODUCCION; borrado en cascada |
| material_id | int | FK | Ext. Logística (catálogo de solo lectura) |
| proveedor_id | int | FK | Ext. Compras (catálogo de solo lectura) |
| cantidad_recibida | decimal | | Obligatorio, > 0 |
| fecha_recepcion | date | | Obligatorio |

## 8. MAQUINA

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| maquina_id | int | PK | Autoincremental |
| codigo | string | | Obligatorio, no vacío |
| nombre | string | | Obligatorio, no vacío |
| estado | string | | Obligatorio |
| capacidad_hora | decimal | | Obligatorio, > 0 (unidades por hora) |

## 9. MANTENIMIENTO_MAQUINA

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| mantenimiento_id | int | PK | Autoincremental |
| maquina_id | int | FK | MAQUINA; borrado en cascada |
| tecnico_id | int | FK | Ext. RRHH (catálogo de solo lectura) |
| tipo | string | | Obligatorio |
| costo_tecnico | decimal | | Obligatorio, >= 0 |
| fecha | date | | Obligatorio |

## 10. MANTENIMIENTO_REPUESTO

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| mant_repuesto_id | int | PK | Autoincremental |
| mantenimiento_id | int | FK | MANTENIMIENTO_MAQUINA; borrado en cascada |
| repuesto_id | int | FK | Ext. Logística (catálogo de solo lectura) |
| cantidad | int | | Obligatorio, > 0 |

## 11. EQUIPAMIENTO

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| equipamiento_id | int | PK | Autoincremental |
| nombre | string | | Obligatorio, no vacío |
| tipo | string | | Obligatorio, no vacío |

## 12. ASIGNACION_EQUIPAMIENTO

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| asignacion_id | int | PK | Autoincremental |
| trabajador_id | int | FK | Ext. RRHH (catálogo de solo lectura) |
| equipamiento_id | int | FK | EQUIPAMIENTO |
| fecha_entrega | date | | Obligatorio |

## 13. MATERIAL (referencia externa)

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| material_id | int | PK | Catálogo de solo lectura (Ext. Logística) |
| nombre | string | | |

## 14. REPUESTO (referencia externa)

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| repuesto_id | int | PK | Catálogo de solo lectura (Ext. Logística) |
| nombre | string | | |

## 15. PROVEEDOR (referencia externa)

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| proveedor_id | int | PK | Catálogo de solo lectura (Ext. Compras) |
| razon_social | string | | |

## 16. TRABAJADOR (referencia externa)

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| trabajador_id | int | PK | Catálogo de solo lectura (Ext. RRHH) |
| nombre | string | | |

---

# Relaciones entre entidades

| Entidad A | Cardinalidad | Entidad B | Relación |
|---|---|---|---|
| PRODUCTO | 1 → 0..N | PRODUCTO_MATERIAL | se compone de |
| MATERIAL | 1 → 0..N | PRODUCTO_MATERIAL | es insumo |
| PRODUCTO | 1 → 0..N | RUTA_PRODUCTO | pasa por |
| ETAPA_FABRICACION | 1 → 0..N | RUTA_PRODUCTO | forma parte |
| PRODUCTO | 1 → 0..N | ORDEN_PRODUCCION | se fabrica en |
| ORDEN_PRODUCCION | 1 → 0..N | EJECUCION_ETAPA | registra |
| ETAPA_FABRICACION | 1 → 0..N | EJECUCION_ETAPA | se ejecuta |
| MAQUINA | 0..1 → 0..N | EJECUCION_ETAPA | usa |
| TRABAJADOR | 0..1 → 0..N | EJECUCION_ETAPA | opera |
| ORDEN_PRODUCCION | 1 → 0..N | RECEPCION_MATERIAL | recibe insumos |
| PROVEEDOR | 1 → 0..N | RECEPCION_MATERIAL | entrega |
| MATERIAL | 1 → 0..N | RECEPCION_MATERIAL | se recibe |
| MAQUINA | 1 → 0..N | MANTENIMIENTO_MAQUINA | requiere |
| TRABAJADOR | 0..1 → 0..N | MANTENIMIENTO_MAQUINA | ejecuta |
| MANTENIMIENTO_MAQUINA | 1 → 0..N | MANTENIMIENTO_REPUESTO | consume |
| REPUESTO | 1 → 0..N | MANTENIMIENTO_REPUESTO | se usa |
| TRABAJADOR | 1 → 0..N | ASIGNACION_EQUIPAMIENTO | recibe |
| EQUIPAMIENTO | 1 → 0..N | ASIGNACION_EQUIPAMIENTO | se asigna |

# Claves de almacenamiento

| Entidad | Clave de `localStorage` |
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
| MATERIAL, REPUESTO, PROVEEDOR, TRABAJADOR | Catálogos de solo lectura en `referencias.js` (no se persisten) |

# Reglas de integridad y borrado en cascada

- Eliminar un PRODUCTO elimina sus PRODUCTO_MATERIAL y RUTA_PRODUCTO asociadas.
- Eliminar una ORDEN_PRODUCCION elimina sus EJECUCION_ETAPA y RECEPCION_MATERIAL asociadas.
- Eliminar una MAQUINA elimina sus MANTENIMIENTO_MAQUINA asociados.
- Eliminar un MANTENIMIENTO_MAQUINA elimina sus MANTENIMIENTO_REPUESTO asociados.
- Toda FK debe referenciar un registro existente; las referencias externas deben existir en su catálogo de solo lectura.

# Trazabilidad entidad → requisitos

| Entidad | Requisitos funcionales |
|---|---|
| PRODUCTO | FR-001, FR-002, FR-003 |
| PRODUCTO_MATERIAL | FR-004, FR-005, FR-006 |
| ETAPA_FABRICACION | FR-008 |
| RUTA_PRODUCTO | FR-009, FR-010, FR-011 |
| ORDEN_PRODUCCION | FR-013, FR-014 |
| EJECUCION_ETAPA | FR-015, FR-016, FR-017, FR-018 |
| RECEPCION_MATERIAL | FR-020, FR-021 |
| MAQUINA | FR-023 |
| MANTENIMIENTO_MAQUINA | FR-024, FR-026 |
| MANTENIMIENTO_REPUESTO | FR-025 |
| EQUIPAMIENTO | FR-027 |
| ASIGNACION_EQUIPAMIENTO | FR-028, FR-029 |
| MATERIAL, REPUESTO, PROVEEDOR, TRABAJADOR | FR-033, XR-002, XR-004 |

## Módulos representados

| Módulo | Entidades / referencias |
|---|---|
| **7. Manufactura y operaciones** | PRODUCTO, PRODUCTO_MATERIAL, ETAPA_FABRICACION, RUTA_PRODUCTO, ORDEN_PRODUCCION, EJECUCION_ETAPA, RECEPCION_MATERIAL, MAQUINA, MANTENIMIENTO_MAQUINA, MANTENIMIENTO_REPUESTO, EQUIPAMIENTO, ASIGNACION_EQUIPAMIENTO |
| **3. Logística e inventario** | MATERIAL, REPUESTO |
| **2. RRHH y planillas** | TRABAJADOR |
| **6. Adquisición y compras** | PROVEEDOR |
