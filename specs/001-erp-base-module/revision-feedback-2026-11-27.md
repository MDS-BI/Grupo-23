# Revisión del feedback docente · 27 de noviembre de 2026

Fuente: [feedback.md](../../feedback.md), apartado **Avance 03 (16/11/26)**,
que corresponde a la captura entregada por el usuario. El texto original del
profesor se conserva sin modificar. El usuario pidió conservar la página
actual y avisar antes de cualquier cambio funcional o visual.

## Resultado

Los puntos técnicos de ese feedback están cubiertos por la implementación
actual. La revisión corrigió inconsistencias en la documentación. No modificó
`src/`, `index.html`, estilos, dependencias, datos del navegador ni configuración
de Git. Se trabajó en la rama existente sin commit, merge, push ni ramas nuevas.

| Observación del profesor | Estado y evidencia actual |
|---|---|
| T001–T114 sin marcar | Las tareas implementadas de ese intervalo están marcadas. Se corrigió su descripción para que apunte al componente que realmente realiza la operación. T114 acredita pruebas y compilación; los estudios que aún no tienen mediciones se separan en T212/T213. |
| Rutas que no corresponden al sitio | El punto de entrada es `index.html` → `src/main.jsx` → `src/App.jsx`. El almacenamiento está en `src/modules/manufactura/almacenamiento.js`; las páginas React usan `.jsx`. Las 37 rutas de código y pruebas mencionadas en tareas existen. `research.md` ya documenta React, en lugar de la decisión antigua de JavaScript vanilla. |
| FR-017 y FR-023 a FR-030 sin código verificable | `ordenes.js` calcula minutos a partir de inicio/fin. `recursos.js` y `RecursosPage.jsx` implementan máquinas, mantenimiento, repuestos, equipamiento y asignaciones. Los archivos están versionados. `historias.test.js` y `historias-flujo.test.jsx` verifican cálculos, validaciones, relaciones y consultas. |
| Alertas, filtros, materiales locales y demo fuera del spec y tasks | Están en FR-039 a FR-042 y T120–T127. Se verificaron `alertas.js`, `AlertasProduccion.jsx`, `BarraFiltros.jsx`, `NuevoMaterial.jsx` y `demo-peluches.js`, además de sus pruebas. |
| Pruebas antiguas que importan archivos inexistentes | No quedan referencias a `src/storage.js`, `src/app.js` ni `src/module-config.js` en las pruebas. La suite completa descubre veinte archivos y termina sin fallos; no se ocultaron pruebas mediante exclusiones nuevas. |
| Mejoras funcionales, navegación, estilo y datos simulados | Ya existen los formularios conectados, foco de acciones, filtros, roles, historial reversible, métricas, imágenes y datos relacionados de seis peluches. Esta revisión conserva esa página, tal como solicitó el usuario. |

## Correcciones documentales de esta revisión

- Se completó la matriz de trazabilidad de **42 a 68 requisitos funcionales**.
  Cada fila apunta a tareas existentes; no hay IDs de tarea duplicados ni
  referencias a tareas inexistentes. XR-001–XR-004 y SC-001–SC-010 siguen mapeados.
- Se corrigieron tareas que todavía prometían editar recepciones. La regla
  vigente es alta y consulta histórica, con edición, eliminación y cascadas
  rechazadas. La recepción dentro del detalle de orden ya está implementada.
- Se alinearon tareas, modelo y contrato con máquina/trabajador opcionales en
  ejecución, fin pendiente mientras está en curso y cálculo de minutos al cerrar.
- Se documentaron las dos entidades añadidas, LOCAL y PEDIDO_LOCAL, el mínimo
  agregado de 64 por lote, sus fechas comunes y la conservación de asignaciones
  al empezar producción. Se corrigieron las reglas antiguas de borrado.
- Se precisó cómo se guardan las muestras y los materiales propios de la demo,
  y la reconstrucción autorizada una sola vez con respaldo previo.
- Se alineó FR-049 con el historial individual de FR-060: Deshacer/Rehacer no
  exige perder los cambios posteriores independientes.
- Se corrigió la fecha antigua en el inicio rápido y se dejó el procedimiento
  para otra computadora con las cantidades iniciales esperadas, misma revisión
  publicada y mismo rol, diferenciando los datos locales de cada navegador.

## Verificación realizada

Entorno comprobado: **Node.js 24.19.0 y npm 11.17.0**, coincidentes con `.nvmrc`
y `package.json`. Se usó el `package-lock.json` versionado.

| Comprobación | Resultado |
|---|---|
| Suite del repositorio de trabajo | 133 pruebas correctas en veinte archivos |
| Compilación del repositorio de trabajo | Correcta |
| Copia limpia exportada de la revisión actual, sin `.git` ni `node_modules` | Creada fuera del repositorio, sin ramas ni checkout adicionales |
| `npm ci --offline --no-audit --no-fund` en la copia limpia | 85 paquetes instalados desde la caché; no reutiliza `node_modules` del proyecto |
| Suite desde la copia recién instalada | 133 pruebas correctas en veinte archivos |
| Compilación desde la copia limpia | Correcta |
| Comparación SHA-256 de los cuatro recursos de producción | JavaScript, CSS, imagen y fuente idénticos entre ambas compilaciones |
| `git diff --check` | Sin errores de espacios |

Las pruebas de `roles.test.jsx` comprueban los cinco perfiles, la vista
restringida del operario y el rechazo de escrituras fuera del perfil. También
verifican que las recepciones confirmadas no puedan editarse, eliminarse ni
retirarse mediante una escritura genérica. `ejemplo-coherente.test.js` verifica
relaciones, respaldo/recuperación, idempotencia e igualdad entre un perfil vacío
y otro con la demo anterior. No se ejecutó ninguna carga en el navegador real.

## Límites y seguimiento explícito

La evaluación de rendimiento con 500 registros por entidad en navegador
(SC-008/T212) y el estudio de tiempos y éxito con usuarios (SC-001–SC-006/T213)
no tenían resultados medidos que permitieran darlos por completos. Quedan
identificados como pendientes en lugar de atribuirles el resultado de la suite.
No son defectos funcionales observados en la página ni requisitos nuevos.

Las integraciones reales con otros módulos y la autenticación de cuentas en
servidor siguen fuera del alcance del MVP local documentado. Los comentarios
históricos de los avances 01/02 sobre organización y participación del equipo
se conservan como antecedentes; esta auditoría no inventa responsables ni
reconstruye acuerdos del grupo a partir de autores de commits.
