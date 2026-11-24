# Plan de Implementación: Módulo 7 - Manufactura y Operaciones

**Rama de trabajo**: `main` | **Actualizado**: 2026-11-23 | **Especificación**: [spec.md](spec.md)
**Entrada**: Especificación de la funcionalidad desde `/specs/001-erp-base-module/spec.md`

## Resumen

Construir el módulo **Manufactura y Operaciones** del ERP como una aplicación web ligera con Vite y JavaScript modular. El módulo cubre cinco historias de usuario: (1) productos y su composición de materiales, (2) etapas y rutas de fabricación ordenadas por secuencia, (3) órdenes de producción con ejecución real de etapas, (4) recepción de materiales por orden y proveedor, y (5) máquinas, mantenimientos con repuestos y equipamiento asignado a trabajadores. La persistencia se realiza en `localStorage` con claves prefijadas `manufactura:`. Los módulos externos —materiales y repuestos de Logística e Inventario, trabajadores de RRHH y Planillas, proveedores de Adquisición y Compras— se representan mediante catálogos locales de solo lectura que pueden sustituirse por integraciones reales sin cambiar la lógica de Manufactura.

## Contexto Técnico

**Lenguaje/Versión**: JavaScript (ES2022), HTML, CSS  
**Dependencias Principales**: React, React DOM y Vite; versiones resueltas en `package-lock.json`
**Almacenamiento**: `localStorage` del navegador con claves prefijadas `manufactura:`  
**Pruebas**: Vitest con jsdom para pruebas unitarias y de integración  
**Plataforma Objetivo**: Navegadores modernos de escritorio y móviles  
**Tipo de Proyecto**: Aplicación web  
**Objetivos de Rendimiento**: Listados y validaciones responsivos con al menos 500 registros por entidad; respuestas menores a 200 ms  
**Restricciones**: Sin backend; referencias externas simuladas con catálogos de solo lectura; estructura modular por entidad  
**Escala/Alcance**: 12 entidades de Manufactura y 4 catálogos externos de referencia

## Verificación de la Constitución

*COMPROBACIÓN: Debe pasar antes de la investigación de la Fase 0. Reverificar tras el diseño de la Fase 1.*

- **Calidad**: La implementación usa módulos por entidad (`src/modules/manufactura/*.js`) con validadores y repositorios, y componentes React por caso de uso (`src/components/manufactura/*.jsx`).
- **Pruebas**: Cada historia de usuario incluye pruebas unitarias de validación/persistencia y pruebas de integración antes de la implementación. La Fase 7 ejecuta la suite completa y la compilación de producción.
- **Experiencia de Usuario**: Los formularios y listados comparten patrones de validación por campo, estados vacíos y mensajes de error claros y accesibles.
- **Rendimiento**: El almacenamiento y los listados se validan con al menos 500 registros por entidad, con respuestas menores a 200 ms.

## Estructura del Proyecto

### Documentación (esta funcionalidad)

```text
specs/001-erp-base-module/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── manufactura-storage.md
└── tasks.md
```

### Código Fuente (raíz del repositorio)

```text
src/
├── main.jsx
├── styles.css
├── App.jsx
├── assets/manufactura/
├── hooks/
├── modules/
│   └── manufactura/
│       ├── almacenamiento.js
│       ├── referencias.js
│       ├── demo-peluches.js
│       ├── peluches-ejemplo.js
│       ├── alertas.js
│       ├── productos.js
│       ├── etapas.js
│       ├── rutas.js
│       ├── ordenes.js
│       ├── recepciones.js
│       ├── validacion.js
│       └── recursos.js
└── components/
    └── manufactura/
        ├── ProductosPage.jsx
        ├── ProductoForm.jsx
        ├── ProductoList.jsx
        ├── ProductoDetalle.jsx
        ├── NuevoMaterial.jsx
        ├── EtapasPage.jsx
        ├── OrdenesPage.jsx
        ├── RecepcionesPage.jsx
        ├── RecursosPage.jsx
        ├── ReferenciasPage.jsx
        ├── ResumenPage.jsx
        ├── Controles.jsx
        ├── BarraFiltros.jsx
        └── AlertasProduccion.jsx

tests/
├── unit/
│   └── manufactura/
├── integration/
│   └── manufactura/
```

El dataset de demostración está en `peluches-ejemplo.js` y su cargador en
`demo-peluches.js`. El arranque, en `src/main.jsx`, lo carga si no hay registros.

**Decisión de estructura**. `src/main.jsx` inicializa React y los datos de ejemplo.
`src/App.jsx` coordina la navegación. `src/modules/manufactura/almacenamiento.js`
persiste los registros relacionados y recupera sus valores anteriores si una
escritura falla. `referencias.js` encapsula los catálogos externos y los materiales
locales. Los componentes de `src/components/manufactura/` consumen los repositorios.
Las ejecuciones están en `ordenes.js` y los recursos en `recursos.js`.

## Reproducción técnica

- Entorno de referencia Node.js 24.19.0 y npm 11.17.0, indicado también en
  `.nvmrc` y `package.json`. `npm ci` instala las versiones de `package-lock.json`.
- Los cinco lotes usan como fecha de referencia el 16 de noviembre de 2026.
  El cargador acepta una fecha explícita para las pruebas. El reloj del equipo
  no altera el dataset inicial. Las alertas de vencimiento se evalúan con la
  fecha actual del navegador, por lo que pueden variar con el paso del tiempo.
- La imagen y la tipografía de la interfaz están versionadas en `src/assets/`.
- Un navegador nuevo carga la demo desde `src/main.jsx`. Una sesión con registros
  conserva sus datos. Para comparar estados iniciales se usa un perfil nuevo de
  navegador y la misma revisión del repositorio.
- La comprobación de entrega usa instalación limpia, `npm test -- --run` y
  `npm run build`. El procedimiento está en [quickstart.md](quickstart.md).

## Trabajo guiado por Spec Kit

La especificación describe reglas y escenarios. Este plan describe la arquitectura
y las tareas trazan requisitos a archivos y pruebas. Los comandos de OpenCode
están versionados en `.opencode/commands/`. `/speckit.plan` actualiza el diseño,
`/speckit.tasks` desglosa el trabajo y `/speckit.converge` compara la implementación
con los tres documentos y añade tareas pendientes.

La carpeta de funcionalidad se resuelve mediante `.specify/feature.json`.
Se trabaja en la rama existente. Los comandos de la extensión Git requieren
autorización independiente para publicar cambios.

## Perfiles y conservación de movimientos

`roles.js` define la matriz de perfiles. `App.jsx` consulta el perfil persistido
y ofrece solo páginas autorizadas. El contenido usa una clave por perfil y
página para desmontar formularios y detalles al cambiar la perspectiva.
`Controles.jsx` condiciona las acciones a la tabla y al perfil.

`guardarCambios` valida permisos antes de escribir cualquiera de las tablas
de una operación. El operario de producción solo puede modificar ejecuciones de etapas cuyo
tipo sea Ensamble o Ensamblaje en órdenes abiertas. Las páginas de órdenes
filtran esas etapas y omiten entregas y proveedores para ese perfil.

Las recepciones son altas históricas. La API y el almacenamiento genérico
rechazan cambios o bajas de registros anteriores. Una orden con recepciones
queda protegida frente al borrado. Las pruebas comprueban también estos
rechazos por debajo de los botones de la interfaz.

La validación de órdenes incorporada por el equipo exige una ruta completamente
ejecutada antes del cierre. La recepción comprueba que la orden esté abierta
para una entrega nueva. Los registros históricos pueden consultarse después
del cierre. El selector de órdenes para registrar entregas ofrece solo órdenes
activas y mantiene el código, el producto y el estado.

El selector permite evaluar perspectivas en el MVP local. La autenticación
de cuentas y los permisos aplicados en un servidor son una ampliación futura.

## Deshacer, navegación y demanda de locales

`almacenamiento.js` conserva en `sessionStorage` hasta veinte transacciones
reversibles con sus listas anteriores y posteriores. Una firma del estado de
las tablas permite detectar cambios externos antes de restaurar una transacción.
Deshacer usa la misma capa de permisos y de escritura con recuperación ante
fallos. Cada recepción confirmada y cada inicialización de demo empieza un
historial posterior. Los formularios disponen además de restauración del borrador.

`DeshacerCambios.jsx` ofrece la acción global y por registro. `useEnfoqueAccion.js`
desplaza y enfoca las secciones recién abiertas, compartido por formularios,
detalles, rutas y navegación. La interfaz usa los apartados existentes.

`pedidos-locales.js` gestiona locales y pedidos relacionados con productos y
órdenes. `PedidosLocales.jsx` muestra el menú por peluche y permite iniciar una
orden con los pedidos pendientes. La creación de la orden y su asignación de
pedidos se guardan en una sola transacción. Cancelar una orden vuelve a dejar
sus pedidos disponibles para otra planificación.

El mínimo de una orden nueva es 64. Los registros históricos pueden conservar
cantidades anteriores al editar otros campos. La demo nueva usa cinco lotes de
64 unidades, cinco locales ficticios y 25 pedidos, cinco por producto. Sus
cantidades 16, 12, 10, 14 y 12 suman 64 por modelo. `main.jsx` incorpora estos
pedidos una sola vez a la demo existente cuando aún no hay locales ni pedidos.

## Seguimiento de Complejidad

Este plan no introdujo violaciones de la constitución.
