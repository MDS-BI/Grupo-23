// @vitest-environment jsdom
import { beforeEach, expect, it } from 'vitest';
import { analizarEliminacion } from '../../../src/modules/manufactura/eliminacion.js';
import { cargarDemoPeluches } from '../../../src/modules/manufactura/demo-peluches.js';
import { eliminarEjecucion } from '../../../src/modules/manufactura/ordenes.js';
import { eliminarRegistro, guardarCambios, listar } from '../../../src/modules/manufactura/almacenamiento.js';
import { eliminarEtapa } from '../../../src/modules/manufactura/etapas.js';

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); cargarDemoPeluches(); });

it('identifica las rutas y órdenes que conservan una etapa y no cambia sus datos', () => {
  const etapas = listar('etapas');
  const estado = analizarEliminacion('etapas', etapas[0].etapa_id);
  expect(estado.permitida).toBe(false);
  expect(estado.detalles.join(' ')).toContain('Ruta de Oso Bruno');
  expect(estado.detalles.join(' ')).toContain('OP-0001');
  expect(eliminarEtapa(etapas[0].etapa_id).errores.general).toBe(estado.motivo);
  expect(listar('etapas')).toEqual(etapas);
});

it('no anuncia una eliminación si el registro ya no existe', () => {
  expect(eliminarRegistro('equipamiento', 999).errores.general).toContain('ya no existe');
});

it('protege la coherencia de ejecuciones de órdenes finalizadas también desde la API', () => {
  const originales = listar('ejecuciones');
  const ejecucion = originales.find((e) => listar('ordenes').find((o) => o.orden_id === e.orden_id).estado === 'Finalizada');
  expect(eliminarEjecucion(ejecucion.ejecucion_id).errores.general).toContain('orden finalizada');
  expect(listar('ejecuciones')).toEqual(originales);
});

it('revalida las dependencias si aparece una ruta después de abrir la confirmación', () => {
  guardarCambios({ etapas: [...listar('etapas'), { etapa_id: 99, nombre: 'Revisión de prueba', tipo: 'Calidad', tiempo_estandar_min: 5 }] });
  expect(analizarEliminacion('etapas', 99).permitida).toBe(true);
  guardarCambios({ rutas: [...listar('rutas'), { ruta_id: 99, producto_id: 1, etapa_id: 99, secuencia: 99 }] });
  expect(eliminarEtapa(99).errores.general).toContain('en uso');
  expect(listar('etapas').some((e) => e.etapa_id === 99)).toBe(true);
});
