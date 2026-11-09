# Investigación: Módulo 7 - Manufactura y Operaciones

## Decisión: Usar Vite con HTML, CSS y JavaScript vanilla

**Justificación**: La solicitud enfatiza un enfoque de mínimas librerías y una implementación ligera. Vite proporciona una experiencia de desarrollo rápida y un pipeline de construcción simple sin requerir un framework más pesado. JavaScript vanilla mantiene la aplicación fácil de entender, fácil de probar y fácil de mantener para un módulo ERP acotado, y deja a los módulos personalizados libres de adoptar cualquier enfoque de interfaz por encima de él.

## Alternativas consideradas

- React o Vue: Ecosistema de componentes más sólido, pero añade más abstracción y sobrecarga de dependencias de las necesarias para este alcance.
- HTML estático plano sin Vite: Más simple, pero Vite ofrece un mejor flujo de trabajo de desarrollo local y paso de construcción para crecimiento futuro.
- Persistencia en backend con base de datos: No es necesaria para un módulo de espacio único y añadiría complejidad innecesaria; el contrato de almacenamiento está aislado, por lo que un backend puede introducirse más tarde sin cambiar la lógica del módulo.

## Decisiones adicionales

- Se usará `localStorage` del navegador para la persistencia porque el módulo es de espacio único y no necesita almacenamiento del lado servidor.
- Todas las claves de almacenamiento usan el prefijo `manufactura:` para evitar colisiones con otros módulos del ERP.
- Los identificadores son numéricos y se generan de forma incremental por entidad, en línea con el modelo de datos y los repositorios.
- La capa de almacenamiento (`src/storage.js`) es genérica; cada entidad de Manufactura tiene su propio módulo con validadores y repositorio.
- Las referencias a módulos externos (MATERIAL, REPUESTO, TRABAJADOR, PROVEEDOR) se encapsulan en `src/modules/manufactura/referencias.js` como catálogos de solo lectura, de modo que puedan sustituirse por integraciones reales sin cambios estructurales.
- La integridad referencial y el borrado en cascada residen en los repositorios de Manufactura, no en los componentes de interfaz.
- La interfaz se presenta en español y favorece la mejora progresiva y los controles de formulario nativos accesibles sobre widgets personalizados complejos.
