# Inicio Rápido: Módulo 7 - Manufactura y Operaciones

## Configuración

1. Instale las dependencias con `npm install`.
2. Inicie el servidor de desarrollo con `npm run dev`.
3. Abra la URL local de Vite en un navegador.

## Flujo de Usuario Principal

1. **Productos y materiales**: cree un producto con nombre y tipo; asóciele uno o más materiales indicando la cantidad por unidad; consulte su composición.
2. **Etapas y rutas**: registre etapas con nombre, tipo y tiempo estándar; configure la ruta de un producto seleccionando etapas y asignando una secuencia; verifique que la ruta aparece ordenada.
3. **Órdenes y ejecuciones**: cree una orden con producto, cantidad planificada, estado y fechas; registre la ejecución de una etapa con máquina, trabajador, inicio y fin reales; consulte el avance de la orden.
4. **Recepción de materiales**: registre una recepción para una orden con material, proveedor, cantidad y fecha; verifique que aparece en el detalle de la orden.
5. **Máquinas y equipamiento**: registre una máquina, agréguele mantenimientos con técnico, costo y repuestos, y registre la asignación de equipamiento a un trabajador.
6. Actualice la página para confirmar que los registros persisten en `localStorage` con las claves `manufactura:`.

## Validación

- Verifique que los campos obligatorios muestran errores por campo.
- Verifique que las cantidades, capacidades y tiempos deben ser mayores que cero.
- Verifique que una orden con fecha de fin anterior a la fecha de inicio se rechaza.
- Verifique que una ejecución con fin real anterior al inicio real se rechaza.
- Verifique que una recepción sin material, proveedor, cantidad o fecha no se guarda.
- Verifique que una ruta conserva el orden definido por secuencia.
- Verifique que los listados sin registros muestran un estado vacío.

## Referencias externas

Los materiales, repuestos, trabajadores y proveedores provienen de otros módulos del ERP. En esta iteración se representan con catálogos locales de solo lectura en `src/modules/manufactura/referencias.js`. Para integrarlos con los módulos reales, sustituya ese módulo sin cambiar la lógica de Manufactura.

## Datos y persistencia

- Los registros se guardan en `localStorage` bajo claves con prefijo `manufactura:` (ver [data-model.md](data-model.md)).
- Eliminar un producto, una orden, una máquina o un mantenimiento elimina en cascada sus registros dependientes.
- Consulte [contracts/manufactura-storage.md](contracts/manufactura-storage.md) para la forma de los datos y las operaciones.

## Pruebas

- Ejecute la suite completa con `npm test`.
- La cobertura incluye pruebas unitarias de validación/persistencia y pruebas de integración por historia de usuario.
- Consulte [tasks.md](tasks.md) para la trazabilidad entre requisitos y tareas.
