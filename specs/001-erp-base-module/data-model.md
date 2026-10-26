# Modelo Entidad–Relación — Módulo 7: Manufactura y Operaciones

Este documento convierte el diagrama MER a formato tabular Markdown.

## Leyenda

- **PK**: Primary Key / Clave primaria
- **FK**: Foreign Key / Clave foránea
- **Ext. Logística**: referencia al módulo 3, Logística e inventario
- **Ext. RRHH**: referencia al módulo 2, RRHH y planillas
- **Ext. Compras**: referencia al módulo 6, Adquisición y compras

---

## 1. PRODUCTO

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| producto_id | int | PK | |
| nombre | string | | |
| tipo | string | | |

## 2. PRODUCTO_MATERIAL

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| prod_mat_id | int | PK | |
| producto_id | int | FK | PRODUCTO |
| material_id | int | FK | Ext. Logística |
| cantidad_por_unidad | decimal | | |

## 3. ETAPA_FABRICACION

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| etapa_id | int | PK | |
| nombre | string | | |
| tipo | string | | |
| tiempo_estandar_min | int | | |

## 4. RUTA_PRODUCTO

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| ruta_id | int | PK | |
| producto_id | int | FK | PRODUCTO |
| etapa_id | int | FK | ETAPA_FABRICACION |
| secuencia | int | | |

## 5. ORDEN_PRODUCCION

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| orden_id | int | PK | |
| producto_id | int | FK | PRODUCTO |
| cantidad_plan | decimal | | |
| estado | string | | |
| fecha_inicio | date | | |
| fecha_fin | date | | |

## 6. EJECUCION_ETAPA

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| ejecucion_id | int | PK | |
| orden_id | int | FK | ORDEN_PRODUCCION |
| etapa_id | int | FK | ETAPA_FABRICACION |
| maquina_id | int | FK | MAQUINA |
| trabajador_id | int | FK | Ext. RRHH |
| inicio_real | datetime | | |
| fin_real | datetime | | |
| tiempo_uso_min | int | | |

## 7. RECEPCION_MATERIAL

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| recepcion_id | int | PK | |
| orden_id | int | FK | ORDEN_PRODUCCION |
| material_id | int | FK | Ext. Logística |
| proveedor_id | int | FK | Ext. Compras |
| cantidad_recibida | decimal | | |
| fecha_recepcion | date | | |

## 8. MAQUINA

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| maquina_id | int | PK | |
| codigo | string | | |
| nombre | string | | |
| estado | string | | |
| capacidad_hora | decimal | | |

## 9. MANTENIMIENTO_MAQUINA

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| mantenimiento_id | int | PK | |
| maquina_id | int | FK | MAQUINA |
| tecnico_id | int | FK | Ext. RRHH |
| tipo | string | | |
| costo_tecnico | decimal | | |
| fecha | date | | |

## 10. MANTENIMIENTO_REPUESTO

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| mant_repuesto_id | int | PK | |
| mantenimiento_id | int | FK | MANTENIMIENTO_MAQUINA |
| repuesto_id | int | FK | Ext. Logística |
| cantidad | int | | |

## 11. EQUIPAMIENTO

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| equipamiento_id | int | PK | |
| nombre | string | | |
| tipo | string | | |

## 12. ASIGNACION_EQUIPAMIENTO

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| asignacion_id | int | PK | |
| trabajador_id | int | FK | Ext. RRHH |
| equipamiento_id | int | FK | EQUIPAMIENTO |
| fecha_entrega | date | | |

## 13. MATERIAL

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| material_id | int | PK | |
| nombre | string | | |

## 14. REPUESTO

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| repuesto_id | int | PK | |
| nombre | string | | |

## 15. PROVEEDOR

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| proveedor_id | int | PK | |
| razon_social | string | | |

## 16. TRABAJADOR

| Campo | Tipo de dato | Clave | Referencia / Nota |
|---|---|---|---|
| trabajador_id | int | PK | |
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

---

## Módulos representados

| Módulo | Entidades / referencias |
|---|---|
| **7. Manufactura y operaciones** | PRODUCTO, PRODUCTO_MATERIAL, ETAPA_FABRICACION, RUTA_PRODUCTO, ORDEN_PRODUCCION, EJECUCION_ETAPA, RECEPCION_MATERIAL, MAQUINA, MANTENIMIENTO_MAQUINA, MANTENIMIENTO_REPUESTO, EQUIPAMIENTO, ASIGNACION_EQUIPAMIENTO |
| **3. Logística e inventario** | MATERIAL, REPUESTO |
| **2. RRHH y planillas** | TRABAJADOR |
| **6. Adquisición y compras** | PROVEEDOR |
