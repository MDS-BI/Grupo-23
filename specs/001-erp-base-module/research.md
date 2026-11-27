# Investigación: Módulo 7 - Manufactura y Operaciones

## Decisión vigente: React con Vite y módulos de dominio JavaScript

**Actualizada**: 2026-11-27, al revisar el feedback docente del 16 de noviembre. La implementación existente utiliza `src/main.jsx`, `src/App.jsx` y componentes React `.jsx`. Vite conserva el entorno de desarrollo y construcción; los validadores, repositorios y cálculos se mantienen en módulos `.js` independientes de la interfaz. Esta decisión documenta el código real sin sustituir la página aprobada por el usuario.

## Alternativas consideradas

- JavaScript vanilla: fue la elección de la plantilla original. Se conserva como antecedente; la interfaz vigente ya es React y los documentos de instalación corresponden a esa implementación.
- Vue: no se utiliza; cambiar de framework no forma parte de esta revisión.
- HTML estático plano sin Vite: Más simple, pero Vite ofrece un mejor flujo de trabajo de desarrollo local y paso de construcción para crecimiento futuro.
- Persistencia en backend con base de datos: No es necesaria para un módulo de espacio único y añadiría complejidad innecesaria; el contrato de almacenamiento está aislado, por lo que un backend puede introducirse más tarde sin cambiar la lógica del módulo.

## Decisiones adicionales

- Se usará `localStorage` del navegador para la persistencia porque el módulo es de espacio único y no necesita almacenamiento del lado servidor.
- Todas las claves de almacenamiento usan el prefijo `manufactura:` para evitar colisiones con otros módulos del ERP.
- Los identificadores son numéricos y se generan de forma incremental por entidad, en línea con el modelo de datos y los repositorios.
- La capa de almacenamiento (`src/modules/manufactura/almacenamiento.js`) es genérica; cada entidad de Manufactura tiene su propio módulo con validadores y repositorio.
- Las referencias a módulos externos (MATERIAL, REPUESTO, TRABAJADOR, PROVEEDOR) se encapsulan en `src/modules/manufactura/referencias.js` como catálogos de solo lectura, de modo que puedan sustituirse por integraciones reales sin cambios estructurales.
- La integridad referencial y el borrado en cascada residen en los repositorios de Manufactura, no en los componentes de interfaz.
- La interfaz se presenta en español y favorece la mejora progresiva y los controles de formulario nativos accesibles sobre widgets personalizados complejos.
