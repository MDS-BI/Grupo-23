// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from '../../../src/App.jsx';
import { cargarDemoPeluches } from '../../../src/modules/manufactura/demo-peluches.js';
import { listar } from '../../../src/modules/manufactura/almacenamiento.js';
import { inicializarPedidosDemo, obtenerPedidosPendientes } from '../../../src/modules/manufactura/pedidos-locales.js';
import { guardarEtapa } from '../../../src/modules/manufactura/etapas.js';
import { crearProducto } from '../../../src/modules/manufactura/productos.js';
import { guardarCambios } from '../../../src/modules/manufactura/almacenamiento.js';
import { obtenerReferencias } from '../../../src/modules/manufactura/referencias.js';
import { guardarEquipamiento } from '../../../src/modules/manufactura/recursos.js';

let container;
let root;
beforeEach(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  sessionStorage.clear();
  cargarDemoPeluches();
  inicializarPedidosDemo();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<App />));
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});

async function pulsar(texto, dentro = container) {
  const boton = [...dentro.querySelectorAll('button')].find(
    (b) => (b.getAttribute('aria-label') || b.textContent.trim()) === texto,
  );
  expect(boton).toBeTruthy();
  expect(boton.disabled).toBe(false);
  await act(async () => boton.click());
}
async function escribir(nombre, valor) {
  const campo = container.querySelector(`[name="${nombre}"]`);
  expect(campo).toBeTruthy();
  await act(async () => {
    const prototipo = campo.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototipo, 'value').set.call(campo, valor);
    campo.dispatchEvent(new Event(campo.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
}

it('enfoca el formulario de etapa y permite deshacer edición y eliminación', async () => {
  await pulsar('Etapas y rutas');
  await pulsar('Nueva etapa');
  expect(document.activeElement).toBe(container.querySelector('[name="nombre"]'));
  await escribir('nombre', 'Revisión de felpa');
  await escribir('tipo', 'Calidad');
  await escribir('tiempo_estandar_min', '5');
  await pulsar('Guardar');
  let fila = container.querySelector('tbody tr:last-child');
  await pulsar('Editar', fila);
  await escribir('nombre', 'Revisión temporal');
  await pulsar('Deshacer cambios', container.querySelector('form'));
  expect(container.querySelector('[name="nombre"]').value).toBe('Revisión de felpa');
  await escribir('nombre', 'Revisión modificada');
  await pulsar('Guardar');
  fila = container.querySelector('tbody tr:last-child');
  await pulsar('Deshacer', fila);
  expect(listar('etapas').at(-1).nombre).toBe('Revisión de felpa');
  await pulsar('Eliminar', container.querySelector('tbody tr:last-child'));
  await pulsar('Confirmar eliminación', container.querySelector('[role="alertdialog"]'));
  expect(listar('etapas')).toHaveLength(6);
  await pulsar('Deshacer', container.querySelector('.deshacer-global'));
  expect(listar('etapas')).toHaveLength(7);
  expect(container.textContent).toContain('Revisión de felpa');
  await pulsar('Deshacer', container.querySelector('.deshacer-global'));
  expect(listar('etapas')).toHaveLength(6);
  expect(container.querySelector('.management > [role="status"]').textContent).not.toContain('Puedes recuperarlo');
});

it('retira una etapa eliminada de la tabla y conserva su recuperación al volver a la página', async () => {
  let etapa;
  await act(async () => {
    etapa = guardarEtapa({ nombre: 'Inspección de prueba', tipo: 'Calidad', tiempo_estandar_min: 5 }).registro;
    sessionStorage.clear();
  });
  await pulsar('Etapas y rutas');
  let fila = [...container.querySelectorAll('tbody tr')].find((r) => r.textContent.includes(etapa.nombre));
  await pulsar('Eliminar', fila);
  expect(document.activeElement.textContent).toBe('Cancelar eliminación');
  await pulsar('Cancelar eliminación');
  expect(listar('etapas')).toContainEqual(etapa);
  await pulsar('Eliminar', fila);
  await pulsar('Confirmar eliminación');
  expect(listar('etapas')).not.toContainEqual(etapa);
  const aviso = container.querySelector('.historial-cambios li .notice');
  expect(aviso.textContent).toContain(etapa.nombre);
  await pulsar('Deshacer eliminación', aviso);
  expect(listar('etapas')).toContainEqual(etapa);
  expect(container.querySelector('.deleted-record')).toBeNull();
  expect(container.querySelector('.management > [role="status"]').textContent).toContain('Eliminación deshecha.');
  fila = [...container.querySelectorAll('tbody tr')].find((r) => r.textContent.includes(etapa.nombre));
  await pulsar('Eliminar', fila);
  await pulsar('Confirmar eliminación');
  await pulsar('Productos y materiales');
  await pulsar('Etapas y rutas');
  const eliminada = container.querySelector('.historial-cambios .recovery-notice');
  expect(eliminada.textContent).toContain(etapa.nombre);
  expect(container.querySelector('tbody').textContent).not.toContain(etapa.nombre);
  await pulsar('Deshacer eliminación', eliminada);
  expect(listar('etapas')).toContainEqual(etapa);
  expect(container.querySelector('.deleted-record')).toBeNull();
});

it('no anuncia una eliminación cuando una etapa está protegida por una ruta', async () => {
  await pulsar('Etapas y rutas');
  const anteriores = listar('etapas');
  await pulsar('Eliminar', container.querySelector('tbody tr'));
  const aviso = container.querySelector('[role="alertdialog"]');
  expect(aviso.textContent).toContain('No se puede eliminar');
  expect(aviso.textContent).toContain('La etapa está en uso');
  expect(aviso.textContent).toContain('Ruta de Oso Bruno');
  expect(aviso.textContent).toContain('OP-0001');
  expect([...aviso.querySelectorAll('button')].some((b) => b.textContent === 'Confirmar eliminación')).toBe(false);
  expect(listar('etapas')).toEqual(anteriores);
  expect(container.querySelector('.deleted-record')).toBeNull();
  expect(container.textContent).not.toContain('Deshacer eliminación');
  await pulsar('Cerrar aviso', aviso);
  expect(container.querySelector('[role="alertdialog"]')).toBeNull();
});

it('confirma un producto dentro de la página y recupera su composición con Deshacer', async () => {
  await act(async () => crearProducto({ nombre: 'Oso para prueba de borrado', tipo: 'Peluche', materiales: [{ material_id: obtenerReferencias('materiales')[0].material_id, cantidad_por_unidad: 0.3 }] }));
  const producto = listar('productos').at(-1);
  const materiales = listar('producto_material');
  const fila = [...container.querySelectorAll('tbody tr')].find((r) => r.textContent.includes(producto.nombre));
  await pulsar('Eliminar', fila);
  await pulsar('Cancelar eliminación');
  expect(listar('productos')).toContainEqual(producto);
  await pulsar('Eliminar', fila);
  await pulsar('Confirmar eliminación');
  expect(container.querySelector('tbody').textContent).not.toContain(producto.nombre);
  await pulsar('Deshacer eliminación', container.querySelector('.recovery-notice'));
  expect(listar('productos')).toContainEqual(producto);
  expect(listar('producto_material')).toEqual(materiales);
});

it.each([
  ['productos', 'productos', 'Oso Bruno de 30 cm', 'órdenes o pedidos'],
  ['maquinas', 'recursos', 'Cortadora circular textil', 'ejecuciones registradas'],
  ['ordenes', 'ordenes', 'OP-0001', 'recepciones registradas'],
])('explica las dependencias de %s antes de ofrecer confirmar', async (tabla, pagina, nombre, motivo) => {
  if (pagina === 'recursos') await pulsar('Máquinas y equipamiento');
  if (pagina === 'ordenes') await pulsar('Órdenes de producción');
  const originales = listar(tabla);
  const fila = [...container.querySelectorAll('tbody tr')].find((r) => r.textContent.includes(nombre));
  await pulsar('Eliminar', fila);
  const aviso = container.querySelector('[role="alertdialog"]');
  expect(aviso.textContent).toContain(motivo);
  expect(aviso.querySelectorAll('button')).toHaveLength(1);
  expect(listar(tabla)).toEqual(originales);
});

it.each([
  ['asignaciones', 'Equipamiento y asignaciones', 1],
  ['mantenimientos', 'Mantenimiento', 0],
])('elimina y recupera %s sin filas de recuperación en las tablas activas', async (tabla, pestaña, indice) => {
  await pulsar('Máquinas y equipamiento');
  await pulsar(pestaña);
  const gestion = container.querySelectorAll('.management')[indice];
  const originales = listar(tabla);
  const repuestos = listar('mantenimiento_repuestos');
  await pulsar('Eliminar', gestion.querySelector('tbody tr'));
  await pulsar('Confirmar eliminación');
  expect(listar(tabla)).toHaveLength(originales.length - 1);
  expect(gestion.querySelectorAll('tbody tr')).toHaveLength(originales.length - 1);
  await pulsar('Deshacer eliminación', gestion.querySelector('.recovery-notice'));
  expect(listar(tabla)).toEqual(originales);
  expect(listar('mantenimiento_repuestos')).toEqual(repuestos);
});

it('elimina y restaura una orden sin recepciones con sus ejecuciones y pedidos', async () => {
  const orden = { ...listar('ordenes')[0], orden_id: 99, estado: 'Planificada', cantidad_plan: 64 };
  const ejecucion = { ...listar('ejecuciones')[0], ejecucion_id: 99, orden_id: 99 };
  const pedido = { ...listar('pedidos')[0], pedido_id: 99, codigo: 'PED-PRUEBA', orden_id: 99 };
  await act(async () => guardarCambios({ ordenes: [...listar('ordenes'), orden], ejecuciones: [...listar('ejecuciones'), ejecucion], pedidos: [...listar('pedidos'), pedido] }));
  await pulsar('Órdenes de producción');
  const gestion = [...container.querySelectorAll('.management')].find((g) => g.querySelector('h2').textContent === 'Órdenes');
  const fila = [...gestion.querySelectorAll('tbody tr')].find((r) => r.textContent.includes('OP-0099'));
  await pulsar('Eliminar', fila);
  expect(container.querySelector('[role="alertdialog"]').textContent).toContain('pedidos volverán');
  await pulsar('Confirmar eliminación');
  expect(listar('ordenes')).not.toContainEqual(orden);
  expect(listar('ejecuciones')).not.toContainEqual(ejecucion);
  expect(listar('pedidos').find((p) => p.pedido_id === 99).orden_id).toBeNull();
  await pulsar('Deshacer eliminación', gestion.querySelector('.recovery-notice'));
  expect(listar('ordenes')).toContainEqual(orden);
  expect(listar('ejecuciones')).toContainEqual(ejecucion);
  expect(listar('pedidos')).toContainEqual(pedido);
});

it('elimina un pedido pendiente y explica el bloqueo cuando ya tiene orden', async () => {
  await pulsar('Órdenes de producción');
  await pulsar('Oso Bruno de 30 cm', container.querySelector('.pedidos-productos'));
  const gestion = container.querySelector('#pedidos-del-peluche .management');
  const originales = listar('pedidos');
  await pulsar('Eliminar', gestion.querySelector('tbody tr'));
  await pulsar('Confirmar eliminación');
  expect(gestion.querySelectorAll('tbody tr')).toHaveLength(4);
  await pulsar('Deshacer eliminación', gestion.querySelector('.recovery-notice'));
  expect(listar('pedidos')).toEqual(originales);
  await act(async () => guardarCambios({ pedidos: listar('pedidos').map((p, i) => i === 0 ? { ...p, orden_id: 1 } : p) }));
  await pulsar('Eliminar', gestion.querySelector('tbody tr'));
  expect(container.querySelector('[role="alertdialog"]').textContent).toContain('OP-0001');
  expect(container.querySelector('[role="alertdialog"] .danger')).toBeNull();
});

it('elimina una ejecución de orden abierta y protege las de órdenes finalizadas', async () => {
  await pulsar('Órdenes de producción');
  const ordenes = [...container.querySelectorAll('.management')].find((g) => g.querySelector('h2').textContent === 'Órdenes');
  await pulsar('Ver detalle', [...ordenes.querySelectorAll('tbody tr')].find((r) => r.textContent.includes('OP-0003')));
  let ejecuciones = [...container.querySelectorAll('.management')].find((g) => g.querySelector('h2').textContent === 'Ejecuciones de etapas');
  const originales = listar('ejecuciones');
  const filas = ejecuciones.querySelectorAll('tbody tr').length;
  await pulsar('Eliminar', ejecuciones.querySelector('tbody tr'));
  await pulsar('Confirmar eliminación');
  expect(ejecuciones.querySelectorAll('tbody tr')).toHaveLength(filas - 1);
  await pulsar('Deshacer eliminación', ejecuciones.querySelector('.recovery-notice'));
  expect(listar('ejecuciones')).toEqual(originales);
  await pulsar('Cerrar detalle');
  await pulsar('Ver detalle', [...ordenes.querySelectorAll('tbody tr')].find((r) => r.textContent.includes('OP-0001')));
  ejecuciones = [...container.querySelectorAll('.management')].find((g) => g.querySelector('h2').textContent === 'Ejecuciones de etapas');
  await pulsar('Eliminar', ejecuciones.querySelector('tbody tr'));
  expect(container.querySelector('[role="alertdialog"]').textContent).toContain('orden finalizada');
  expect(container.querySelector('[role="alertdialog"] .danger')).toBeNull();
  expect(listar('ejecuciones')).toEqual(originales);
});

it('muestra un fallo de almacenamiento aunque haya una eliminación anterior recuperable', async () => {
  await act(async () => {
    guardarEquipamiento({ nombre: 'Pinza de prueba A', tipo: 'Herramienta textil' });
    guardarEquipamiento({ nombre: 'Pinza de prueba B', tipo: 'Herramienta textil' });
  });
  await pulsar('Máquinas y equipamiento');
  await pulsar('Equipamiento y asignaciones');
  const gestion = container.querySelector('.management');
  const fila = (nombre) => [...gestion.querySelectorAll('tbody tr')].find((r) => r.textContent.includes(nombre));
  await pulsar('Eliminar', fila('Pinza de prueba A'));
  await pulsar('Confirmar eliminación');
  const previos = listar('equipamiento');
  const escritura = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (clave, valor) {
    if (this === localStorage && clave === 'manufactura:equipamiento' && JSON.parse(valor).length < previos.length) throw new Error('Sin espacio');
    return escritura.call(this, clave, valor);
  });
  await pulsar('Eliminar', fila('Pinza de prueba B'));
  await pulsar('Confirmar eliminación');
  expect(gestion.querySelector('[role="alert"]').textContent).toContain('No se pudo guardar');
  expect(listar('equipamiento')).toEqual(previos);
  expect(gestion.querySelector('[role="status"]')).toBeNull();
});

it('deshace equipamiento desde la barra global después de perder la sesión y reabrir la página', async () => {
  await pulsar('Máquinas y equipamiento');
  await pulsar('Equipamiento y asignaciones');
  await pulsar('Nuevo equipamiento');
  await escribir('nombre', 'Pinza para montar cascabeles');
  await escribir('tipo', 'Herramienta textil');
  await pulsar('Guardar');
  const equipo = listar('equipamiento').at(-1);
  const fila = [...container.querySelectorAll('tbody tr')].find((r) => r.textContent.includes(equipo.nombre));
  await pulsar('Eliminar', fila);
  await pulsar('Confirmar eliminación');
  expect(listar('equipamiento')).not.toContainEqual(equipo);
  sessionStorage.clear();
  await act(async () => root.unmount());
  root = createRoot(container);
  await act(async () => root.render(<App />));
  await pulsar('Máquinas y equipamiento');
  await pulsar('Equipamiento y asignaciones');
  expect(container.querySelector('.recovery-notice').textContent).toContain(equipo.nombre);
  await pulsar('Deshacer', container.querySelector('.deshacer-global'));
  expect(listar('equipamiento')).toContainEqual(equipo);
  expect(container.querySelector('.deleted-record')).toBeNull();
});

it('confirma las asignaciones afectadas, elimina el equipamiento del listado y recupera ambos juntos', async () => {
  const originales = listar('equipamiento');
  const asignacionesOriginales = listar('asignaciones');
  await pulsar('Máquinas y equipamiento');
  await pulsar('Equipamiento y asignaciones');
  const gestiones = container.querySelectorAll('.management');
  let fila = [...gestiones[0].querySelectorAll('tbody tr')].find((r) => r.textContent.includes('Guante térmico'));
  await pulsar('Eliminar', fila);
  expect(gestiones[0].querySelector('[role="alertdialog"]').textContent).toContain('Fernanda Leal');
  await pulsar('Cancelar eliminación');
  expect(listar('equipamiento')).toEqual(originales);
  expect(listar('asignaciones')).toEqual(asignacionesOriginales);
  await pulsar('Eliminar', fila);
  await pulsar('Confirmar eliminación');
  expect(gestiones[0].querySelector('tbody').textContent).not.toContain('Guante térmico');
  expect(gestiones[1].querySelector('tbody').textContent).not.toContain('Guante térmico');
  expect(listar('equipamiento')).toHaveLength(4);
  expect(listar('asignaciones')).toHaveLength(4);
  await pulsar('Deshacer eliminación', gestiones[0].querySelector('.recovery-notice'));
  expect(listar('equipamiento')).toEqual(originales);
  expect(listar('asignaciones')).toEqual(asignacionesOriginales);
});

it('muestra códigos, locales y cantidades y planifica sus pedidos en una orden de 64', async () => {
  await pulsar('Órdenes de producción');
  await pulsar('Oso Bruno de 30 cm', container.querySelector('.pedidos-productos'));
  const menu = container.querySelector('#pedidos-del-peluche');
  expect(menu.textContent).toContain('PED-0001');
  expect(menu.textContent).toContain('LOC-001');
  expect(menu.textContent).toContain('Juguetería Nube');
  expect(menu.querySelectorAll('tbody tr')).toHaveLength(5);
  expect(menu.textContent).toContain('64 unidades pendientes');
  await pulsar('Planificar estos pedidos', menu);
  expect(document.activeElement).toBe(container.querySelector('[name="producto_id"]'));
  expect(container.querySelector('[name="cantidad_plan"]').value).toBe('64');
  await escribir('fecha_inicio', '2026-11-23');
  await escribir('fecha_fin', '2026-11-25');
  await pulsar('Guardar');
  expect(listar('ordenes')).toHaveLength(6);
  expect(obtenerPedidosPendientes(1)).toHaveLength(0);
  await pulsar('Deshacer', container.querySelector('.deshacer-global'));
  expect(listar('ordenes')).toHaveLength(5);
  expect(obtenerPedidosPendientes(1)).toHaveLength(5);
});

it('omite Deshacer del encabezado y lo conserva junto a creación, edición y eliminación', async () => {
  await pulsar('Máquinas y equipamiento');
  await pulsar('Equipamiento y asignaciones');
  const gestion = container.querySelector('.management');
  expect(gestion.querySelector('.section-heading .deshacer-control')).toBeNull();
  await pulsar('Nuevo equipamiento');
  await escribir('nombre', 'Pinza de confección');
  await escribir('tipo', 'Herramienta textil');
  await pulsar('Guardar');
  expect(gestion.querySelector('.historial-cambio button').disabled).toBe(false);
  let fila = [...gestion.querySelectorAll('tbody tr')].find((r) => r.textContent.includes('Pinza de confección'));
  await pulsar('Editar', fila);
  await escribir('nombre', 'Pinza modificada');
  await pulsar('Guardar');
  await pulsar('Deshacer', gestion.querySelector('.historial-cambio'));
  expect(listar('equipamiento').at(-1).nombre).toBe('Pinza de confección');
  expect(gestion.querySelector('.historial-cambio button').textContent).toBe('Rehacer');
  fila = [...gestion.querySelectorAll('tbody tr')].find((r) => r.textContent.includes('Pinza de confección'));
  await pulsar('Eliminar', fila);
  await pulsar('Confirmar eliminación');
  expect(gestion.querySelectorAll('.historial-cambios li')).toHaveLength(3);
  await pulsar('Deshacer eliminación', gestion.querySelector('.recovery-notice'));
  expect(listar('equipamiento').at(-1).nombre).toBe('Pinza de confección');
  expect(gestion.querySelector('.section-heading .deshacer-control')).toBeNull();
});

it('conserva una lista con deshacer individual y rehacer después de guardar otro cambio', async () => {
  await pulsar('Máquinas y equipamiento');
  await pulsar('Equipamiento y asignaciones');
  const gestion = container.querySelector('.management');
  for (const nombre of ['Pinza A', 'Pinza B']) {
    await pulsar('Nuevo equipamiento');
    await escribir('nombre', nombre);
    await escribir('tipo', 'Herramienta textil');
    await pulsar('Guardar');
  }
  const cambioA = [...gestion.querySelectorAll('.historial-cambios li')].find((li) => li.textContent.includes('Pinza A'));
  const idCambioA = cambioA.dataset.cambioId;
  await pulsar('Deshacer', cambioA);
  expect(listar('equipamiento').some((r) => r.nombre === 'Pinza A')).toBe(false);
  expect(listar('equipamiento').some((r) => r.nombre === 'Pinza B')).toBe(true);
  await pulsar('Nuevo equipamiento');
  await escribir('nombre', 'Pinza C');
  await escribir('tipo', 'Herramienta textil');
  await pulsar('Guardar');
  expect(gestion.querySelectorAll('.historial-cambios li')).toHaveLength(3);
  await pulsar('Rehacer', gestion.querySelector(`[data-cambio-id="${idCambioA}"]`));
  expect(listar('equipamiento').slice(-3).map((r) => r.nombre)).toEqual(['Pinza A', 'Pinza B', 'Pinza C']);
  await pulsar('Productos y materiales');
  await pulsar('Máquinas y equipamiento');
  await pulsar('Equipamiento y asignaciones');
  expect(container.querySelector('.management').querySelectorAll('.historial-cambios li')).toHaveLength(3);
});
