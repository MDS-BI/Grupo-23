# Implementación de las historias finales de Manufactura

Fecha: 2026-11-10. Fuente funcional: `Historias_de_Usuario_Modulo_Manufactura_FINAL.pdf` (8 páginas), entregado por el usuario. Se conservan `spec.md`, `tasks.md`, el MER y los contratos originales; este documento registra su implementación en la estructura React existente.

## Cobertura de aceptación

| Historia | Escenarios del PDF | Implementación visible | Pruebas |
|---|---|---|---|
| HU1 · P1 | 1–5 | Crear, consultar, editar y eliminar productos; seleccionar materiales; editar cantidades o quitar relaciones; detalle de composición y ruta; validación por campo. | `historias.test.js`: HU1. `historias-flujo.test.jsx`: creación, detalle, edición y persistencia. |
| HU2 · P1 | 1–5 | Crear/editar/consultar etapas; eliminar si no están en uso; editor de ruta por producto, secuencias únicas, reordenación y consulta ordenada. | `historias.test.js`: HU2. Flujo de interfaz con dos etapas y secuencias inicialmente desordenadas. |
| HU3 · P1 | 1–6 | Crear/editar/consultar/eliminar órdenes; producto, cantidad, fechas y estado; iniciar y finalizar ejecuciones, máquina/trabajador opcionales, tiempo calculado, detalle de etapas y avance real. | `historias.test.js`: HU3. Flujo de interfaz con ejecución en curso y finalización; fechas y referencias inválidas. |
| HU4 · P2 | 1–5 | Recepciones con orden, material, proveedor, cantidad y fecha; alta y consulta histórica con filtro por orden; edición y eliminación rechazadas desde la revisión docente del 2026-11-23. | `historias.test.js`: HU4. `roles.test.jsx`: conservación del historial y vista de Bodega. |
| HU5 · P2 | 1–6 | Máquinas con estado editable y capacidad; historial de mantenimiento con técnico, tipo, costo, fecha y repuestos; tipos de equipamiento, asignaciones y filtros por trabajador/equipo. | `historias.test.js`: HU5. Flujo de interfaz máquina → mantenimiento/repuesto → equipamiento/asignación. |

Las prioridades P2 de HU4 y HU5 corresponden al PDF final; no se reescribieron las prioridades de los documentos anteriores.

## Persistencia y compatibilidad

- Se mantienen las 12 claves y los nombres de campos del MER, con prefijo `manufactura:`. No hay migración destructiva ni reinicio de registros existentes.
- Las escrituras de varias listas guardan sus valores anteriores y los recuperan si una escritura falla. Si una clave contiene JSON dañado se muestra un error antes de sobrescribirla.
- Las muestras externas de `referencias.js` siguen siendo de solo lectura. `configurarReferencias(adaptador)` permite suministrar catálogos de Logística, Compras o RRHH sin reescribir los repositorios.
- Desde el formulario de Productos se puede registrar un material propio con nombre y unidad. Se guarda en `manufactura:materiales_locales` y queda disponible en Productos y Recepciones de ese navegador. Los materiales locales usan identificadores negativos para convivir con los identificadores positivos del catálogo externo.
- La aplicación es local y no incluye servidor, autenticación ni sincronización entre usuarios. No se afirmó una conexión con módulos externos que todavía no existe.

## Decisiones para el flujo del PDF

- Una ejecución puede iniciarse sin `fin_real`. Hasta que se finalice conserva `fin_real: null` y `tiempo_uso_min: null`; después valida el rango y calcula los minutos. Esto implementa el inicio y la posterior finalización pedidos en HU3, ampliando el contrato original que solo describía ejecuciones finalizadas.
- Máquina y trabajador son opcionales en la ejecución cuando no corresponde asignarlos, conforme al PDF. Si se seleccionan, deben existir. El técnico del mantenimiento sigue siendo obligatorio.
- El avance mide etapas distintas completadas sobre la ruta del producto; registrar varias ejecuciones de una etapa no duplica el porcentaje. El estado de la orden se gestiona explícitamente y el tiempo acumula las ejecuciones finalizadas.
- Para hacer inequívoco el avance se admite una sola aparición de cada etapa en una ruta. Las secuencias deben ser enteros positivos únicos y se ordenan al consultar.
- No se puede eliminar un producto con órdenes, una etapa en uso ni una máquina con ejecuciones. Una orden con recepciones también queda protegida. Productos sin órdenes eliminan composición/ruta; órdenes sin recepciones eliminan sus ejecuciones; máquinas sin ejecuciones eliminan mantenimientos/repuestos; mantenimientos eliminan sus repuestos.
- Un equipo asignado no se elimina hasta quitar la asignación. Se puede editar la orden, pero no cambiar su producto cuando ya tiene movimientos.
- Una referencia antigua que ya no esté en un catálogo se muestra con su identificador; al guardar una relación nueva o editada debe seleccionarse una referencia válida.

## Alertas de producción

El panel de producción identifica órdenes planificadas o en producción cuya fecha de término ya pasó, máquinas marcadas como fuera de servicio, ejecuciones terminadas que excedieron el tiempo estándar de su etapa e insumos cuyo stock no cubre lo requerido por las órdenes abiertas. Una orden que vence hoy se considera atrasada a partir del día siguiente según el calendario local del navegador. El panel usa los registros guardados, muestra los minutos reales y estándar de cada ejecución, compara lo recibido con lo requerido por material y ofrece accesos a órdenes, máquinas y recepciones.

La barra `BarraFiltros.jsx` se reutiliza en productos, órdenes y recursos para búsqueda por texto, estado, producto, rango de fechas y limpieza de filtros. `NuevoMaterial.jsx` permite crear insumos locales con validación de duplicados y dejarlos seleccionables en productos y recepciones. El dataset `demo-peluches.js` se carga desde `main.jsx` en el primer arranque sin registros, y mantiene los controles manuales de carga y reemplazo en `ProductosPage.jsx`.

## Verificación reproducible

```bash
npm run test:manufactura
npm run build
npm test -- --run
```

Las pruebas de Manufactura usan un navegador simulado aislado y limpian únicamente sus propios registros. Comprueban los flujos conectados y la recuperación de datos al volver a montar la aplicación. Las pruebas heredadas de la plantilla que importaban `src/storage.js`, `src/module-config.js` y `src/app.js` se retiraron para que la suite completa compile contra la estructura actual.

## Archivos principales

- `src/modules/manufactura/`: almacenamiento, validación y repositorios por dominio.
- `src/components/manufactura/`: páginas y formularios, reutilizando los componentes previos de Productos.
- `src/App.jsx`: navegación entre las cinco áreas, panel y referencias.
- `tests/unit/manufactura/historias.test.js`: reglas, relaciones, cascadas y errores de persistencia.
- `tests/integration/manufactura/historias-flujo.test.jsx`: recorrido completo del PDF y validación de formularios.
- `tests/integration/manufactura/productos-render.test.jsx`: regresión del arranque original de Productos, adaptada al selector de materiales.

Se trabaja en la rama existente `main`. Esta implementación no crea ramas ni hace commits, merges o push.
