# Plan de Implementación: Módulo 7 - Manufactura y Operaciones

**Rama**: `001-erp-base-module` | **Fecha**: 2026-07-08 | **Especificación**: [spec.md](spec.md)
**Entrada**: Especificación de la funcionalidad desde `/specs/001-erp-base-module/spec.md`

## Resumen

Construir el módulo **Manufactura y Operaciones** del ERP como una aplicación web ligera con Vite y JavaScript modular. El módulo cubre cinco historias de usuario: (1) productos y su composición de materiales, (2) etapas y rutas de fabricación ordenadas por secuencia, (3) órdenes de producción con ejecución real de etapas, (4) recepción de materiales por orden y proveedor, y (5) máquinas, mantenimientos con repuestos y equipamiento asignado a trabajadores. La persistencia se realiza en `localStorage` con claves prefijadas `manufactura:`. Los módulos externos —materiales y repuestos de Logística e Inventario, trabajadores de RRHH y Planillas, proveedores de Adquisición y Compras— se representan mediante catálogos locales de solo lectura que pueden sustituirse por integraciones reales sin cambiar la lógica de Manufactura.

## Contexto Técnico

**Lenguaje/Versión**: JavaScript (ES2022), HTML, CSS  
**Dependencias Principales**: Vite, sin framework de interfaz pesado  
**Almacenamiento**: `localStorage` del navegador con claves prefijadas `manufactura:`  
**Pruebas**: Vitest con jsdom para pruebas unitarias y de integración  
**Plataforma Objetivo**: Navegadores modernos de escritorio y móviles  
**Tipo de Proyecto**: Aplicación web  
**Objetivos de Rendimiento**: Listados y validaciones responsivos con al menos 500 registros por entidad; respuestas menores a 200 ms  
**Restricciones**: Sin backend; referencias externas simuladas con catálogos de solo lectura; estructura modular por entidad  
**Escala/Alcance**: 12 entidades de Manufactura y 4 catálogos externos de referencia

## Verificación de la Constitución

*COMPROBACIÓN: Debe pasar antes de la investigación de la Fase 0. Reverificar tras el diseño de la Fase 1.*

- **Calidad**: La implementación usará módulos pequeños por entidad (`src/modules/manufactura/*.js`) con validadores y repositorios separados, y componentes de interfaz por caso de uso (`src/components/manufactura/*.js`). Los límites entre almacenamiento, validación y presentación se mantienen explícitos.
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
├── main.js
├── styles.css
├── storage.js
├── app.js
├── modules/
│   └── manufactura/
│       ├── referencias.js
│       ├── productos.js
│       ├── etapas.js
│       ├── rutas.js
│       ├── ordenes.js
│       ├── ejecuciones.js
│       ├── recepciones.js
│       ├── maquinas.js
│       ├── mantenimientos.js
│       ├── mantenimiento-repuestos.js
│       └── equipamiento.js
└── components/
    └── manufactura/
        ├── producto-form.js
        ├── producto-list.js
        ├── etapa-form.js
        ├── ruta-editor.js
        ├── orden-form.js
        ├── ejecucion-form.js
        ├── orden-detalle.js
        ├── recepcion-form.js
        ├── recepcion-list.js
        ├── maquina-form.js
        ├── maquina-list.js
        ├── mantenimiento-form.js
        └── asignacion-form.js

tests/
├── unit/
│   └── manufactura/
├── integration/
│   └── manufactura/
├── fixtures/
│   └── manufactura.js
└── setup/
```

**Decisión de Estructura**: Una aplicación Vite simple con un único punto de entrada, `src/app.js` como coordinador de navegación y composición, y `src/storage.js` como capa genérica de persistencia con claves prefijadas. Cada entidad de Manufactura tiene su propio módulo con validadores y repositorio (`src/modules/manufactura/`), de modo que las historias puedan implementarse y probarse de forma independiente. Los componentes de interfaz se agrupan por caso de uso en `src/components/manufactura/` y consumen los repositorios, sin acceder directamente a `localStorage`. `src/modules/manufactura/referencias.js` encapsula los catálogos externos de solo lectura (MATERIAL, TRABAJADOR, PROVEEDOR, REPUESTO) para que puedan reemplazarse por integraciones reales sin tocar la lógica de Manufactura. Los estilos compartidos viven en `src/styles.css`.

## Seguimiento de Complejidad

Este plan no introdujo violaciones de la constitución.
