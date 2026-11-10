# Implementación de las historias finales de Manufactura

Fecha: 2026-11-10. Fuente funcional: `Historias_de_Usuario_Modulo_Manufactura_FINAL.pdf` (8 páginas), entregado por el usuario. Se conservan `spec.md`, `tasks.md`, el MER y los contratos originales; este documento registra su implementación en la estructura React existente.

## Cobertura de aceptación

| Historia | Escenarios del PDF | Implementación visible | Pruebas |
|---|---|---|---|
| HU1 · P1 | 1–5 | Crear, consultar, editar y eliminar productos; seleccionar materiales; editar cantidades o quitar relaciones; detalle de composición y ruta; validación por campo. | `historias.test.js`: HU1. `historias-flujo.test.jsx`: creación, detalle, edición y persistencia. |
| HU2 · P1 | 1–5 | Crear/editar/consultar etapas; eliminar si no están en uso; editor de ruta por producto, secuencias únicas, reordenación y consulta ordenada. | `historias.test.js`: HU2. Flujo de interfaz con dos etapas y secuencias inicialmente desordenadas. |
| HU3 · P1 | 1–6 | Crear/editar/consultar/eliminar órdenes; producto, cantidad, fechas y estado; iniciar y finalizar ejecuciones, máquina/trabajador opcionales, tiempo calculado, detalle de etapas y avance real. | `historias.test.js`: HU3. Flujo de interfaz con ejecución en curso y finalización; fechas y referencias inválidas. |
| HU4 · P2 | 1–5 | Recepciones con orden, material, proveedor, cantidad y fecha; edición/eliminación, listado y filtro por orden; recepciones dentro del detalle de la orden. | `historias.test.js`: HU4. Flujo de interfaz orden → recepción → consulta por orden. |
| HU5 · P2 | 1–6 | Máquinas con estado editable y capacidad; historial de mantenimiento con técnico, tipo, costo, fecha y repuestos; tipos de equipamiento, asignaciones y filtros por trabajador/equipo. | `historias.test.js`: HU5. Flujo de interfaz máquina → mantenimiento/repuesto → equipamiento/asignación. |

Las prioridades P2 de HU4 y HU5 corresponden al PDF final; no se reescribieron las prioridades de los documentos anteriores.

## Persistencia y compatibilidad

- Se mantienen las 12 claves y los nombres de campos del MER, con prefijo `manufactura:`. No hay migración destructiva ni reinicio de registros existentes.
- Las escrituras de varias listas guardan sus valores anteriores y los recuperan si una escritura falla. Si una clave contiene JSON dañado se muestra un error antes de sobrescribirla.
- Las referencias externas se encuentran en `referencias.js`; sus muestras no se guardan en `localStorage` ni tienen formularios de alta. `configurarReferencias(adaptador)` permite suministrar catálogos de Logística, Compras o RRHH sin reescribir los repositorios.
- La aplicación es local y no incluye servidor, autenticación ni sincronización entre usuarios. No se afirmó una conexión con módulos externos que todavía no existe.

## Decisiones para el flujo del PDF

- Una ejecución puede iniciarse sin `fin_real`. Hasta que se finalice conserva `fin_real: null` y `tiempo_uso_min: null`; después valida el rango y calcula los minutos. Esto implementa el inicio y la posterior finalización pedidos en HU3, ampliando el contrato original que solo describía ejecuciones finalizadas.
- Máquina y trabajador son opcionales en la ejecución cuando no corresponde asignarlos, conforme al PDF. Si se seleccionan, deben existir. El técnico del mantenimiento sigue siendo obligatorio.
- El avance mide etapas distintas completadas sobre la ruta del producto; registrar varias ejecuciones de una etapa no duplica el porcentaje. El estado de la orden se gestiona explícitamente y el tiempo acumula las ejecuciones finalizadas.
- Para hacer inequívoco el avance se admite una sola aparición de cada etapa en una ruta. Las secuencias deben ser enteros positivos únicos y se ordenan al consultar.
- No se puede eliminar un producto con órdenes, una etapa en uso ni una máquina con ejecuciones. Se conserva su historial. Productos sin órdenes eliminan composición/ruta; órdenes eliminan ejecuciones/recepciones; máquinas sin ejecuciones eliminan mantenimientos/repuestos; mantenimientos eliminan sus repuestos.
- Un equipo asignado no se elimina hasta quitar la asignación. Se puede editar la orden, pero no cambiar su producto cuando ya tiene movimientos.
- Una referencia antigua que ya no esté en un catálogo se muestra con su identificador; al guardar una relación nueva o editada debe seleccionarse una referencia válida.

## Verificación reproducible

```bash
npm run test:manufactura
npm run build
npm test -- --run
```

Las pruebas de Manufactura usan un navegador simulado aislado y limpian únicamente sus propios registros. Comprueban los flujos conectados y la recuperación de datos al volver a montar la aplicación. La prueba global mantiene visibles los fallos heredados por archivos de la plantilla que ya no existen.

## Archivos principales

- `src/modules/manufactura/`: almacenamiento, validación y repositorios por dominio.
- `src/components/manufactura/`: páginas y formularios, reutilizando los componentes previos de Productos.
- `src/App.jsx`: navegación entre las cinco áreas, panel y referencias.
- `tests/unit/manufactura/historias.test.js`: reglas, relaciones, cascadas y errores de persistencia.
- `tests/integration/manufactura/historias-flujo.test.jsx`: recorrido completo del PDF y validación de formularios.
- `tests/integration/manufactura/productos-render.test.jsx`: regresión del arranque original de Productos, adaptada al selector de materiales.

Se trabaja en la rama existente `main`. Esta implementación no crea ramas ni hace commits, merges o push.
