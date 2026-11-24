# Inicio Rápido: Módulo 7 - Manufactura y Operaciones

## Configuración

1. Use Node.js 24.19.0 y npm 11.17.0. `.nvmrc` indica la versión de Node.
2. Instale las dependencias con `npm ci`, que respeta `package-lock.json`.
3. Inicie el servidor de desarrollo con `npm run dev`.
4. Abra la URL local de Vite en un perfil nuevo de navegador.

La misma revisión del código presenta el mismo catálogo de peluches, las rutas
y las relaciones. Los datos iniciales tienen fecha base 2026-11-16. Las alertas
de vencimiento se calculan respecto al día actual. Los datos de un perfil con
trabajo previo se conservan.

## Evaluación por perfil

En **Rol de demostración** seleccione cada perfil y compruebe lo siguiente.

| Perfil | Comprobación |
|---|---|
| Supervisor | Ofrece todas las áreas |
| Planificador de producción | Permite crear productos, rutas y órdenes; consulta ejecuciones |
| Operario de producción | Ofrece órdenes abiertas y ejecuciones de ensamblaje; omite recepciones y proveedores |
| Bodega | Permite registrar una recepción; el historial carece de edición y eliminación |
| Mantenimiento | Ofrece recursos, intervenciones y equipamiento |

Cambie de rol con un formulario abierto y verifique que se cierra. Recargue para
comprobar que el perfil elegido se conserva. Estos perfiles permiten evaluar
las perspectivas del prototipo local.

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
- Eliminar un producto, una orden sin recepciones, una máquina sin ejecuciones o
  un mantenimiento elimina sus dependientes cuando la operación es válida.
  Una orden con recepciones conserva su historial.
- Consulte [contracts/manufactura-storage.md](contracts/manufactura-storage.md) para la forma de los datos y las operaciones.

## Pruebas

- Ejecute la suite completa con `npm test -- --run` y luego `npm run build`.
- La cobertura incluye pruebas unitarias de validación/persistencia y pruebas de integración por historia de usuario.
- Consulte [tasks.md](tasks.md) para la trazabilidad entre requisitos y tareas.

## Evaluar deshacer y pedidos

1. Con Supervisor o Planificador de producción, abra **Etapas y rutas** y cree una etapa.
   El foco debe pasar al formulario.
2. Edite su nombre, guarde y pulse **Deshacer** en sus acciones. Compruebe que
   recupera el nombre anterior.
3. Elimine esa etapa de prueba y pulse **Deshacer** en la barra global.
   Debe recuperar el registro.
4. En **Órdenes de producción**, seleccione un peluche y compruebe los códigos,
   locales y cantidades de sus cinco pedidos de ejemplo.
5. Pulse **Planificar estos pedidos**, complete las fechas y guarde la orden de
   64 unidades. Los pedidos deben mostrar su código de orden.
6. Deshaga la creación. La orden desaparece y los pedidos vuelven a estar
   pendientes. Intente crear otra orden de 63 para comprobar el error.
7. En Recepción de materiales, compruebe la restauración del formulario sin
   guardar. Las entregas confirmadas conservan sus datos.

## Evaluar el oso con cascabel

1. Abra con Supervisor. Si aún no aparece, pulse **Agregar ejemplo de oso con
   cascabel** en Productos; no es necesario sustituir el ejemplo anterior.
2. Abra el detalle de **Oso Bruno con cascabel de 30 cm**. Compruebe sus nueve
   materiales y ocho etapas, incluidos montaje y prueba de sonido.
3. En Órdenes, seleccione ese modelo en **Pedidos por peluche**. Los cinco
   locales solicitan 16, 12, 10, 14 y 12 unidades, vinculadas a su orden de 64.
4. Abra la orden: debe mostrar cuatro de ocho etapas terminadas (50 %).
5. En Recepciones filtre por esa orden. Debe mostrar nueve entregas, incluidos
   64 cascabeles de Accesorios Ojito y 64 bolsillos de Textiles Nube Austral.
6. Recargue: el ejemplo no se duplica y los modelos anteriores se conservan.

## Revisar con Spec Kit

Los comandos de OpenCode están versionados en `.opencode/commands/`.
Use `/speckit.plan` para actualizar el diseño, `/speckit.tasks` para desglosar
los requisitos y `/speckit.converge` para auditar lo construido. Conserve el
historial de las tareas e inspeccione los cambios propuestos antes de aceptarlos.
Los comandos se trabajan sobre la carpeta indicada en `.specify/feature.json`.
El hook automático de creación de rama está desactivado.
