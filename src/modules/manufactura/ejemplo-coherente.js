import { cargarDemoPeluches } from './demo-peluches.js';
import { guardarCambios, listar } from './almacenamiento.js';
import { inicializarPedidosDemo } from './pedidos-locales.js';
import { agregarEjemploOsoCascabel } from './oso-cascabel.js';
import { rolActual } from './roles.js';

export const CLAVE_RESPALDO_EJEMPLO = 'manufactura:respaldo_antes_ejemplo_coherente_v2';
const CLAVE_VERSION = 'manufactura:ejemplo_coherente_v2';
const CLAVE_HISTORIAL = 'manufactura:deshacer';

function datosActuales() {
  return Object.fromEntries(Object.keys(window.localStorage)
    .filter((clave) => clave.startsWith('manufactura:') && !clave.startsWith('manufactura:respaldo_'))
    .map((clave) => [clave, window.localStorage.getItem(clave)]));
}

// Reconstrucción de los ejemplos autorizada por el usuario. Los datos previos
// se respaldan antes de escribir; una avería restaura tablas e historial.
export function reconstruirEjemploCoherente() {
  if (rolActual() !== 'supervisor') return { errores: null, reconstruido: false };
  let anteriores;
  let historialSesion;
  try {
    if (window.localStorage.getItem(CLAVE_VERSION) === '1') return { errores: null, reconstruido: false };
    anteriores = datosActuales();
    historialSesion = window.sessionStorage.getItem(CLAVE_HISTORIAL);
    if (!window.localStorage.getItem(CLAVE_RESPALDO_EJEMPLO)) window.localStorage.setItem(CLAVE_RESPALDO_EJEMPLO,
      JSON.stringify({ version: 1, fecha: new Date().toISOString(), datos: anteriores }));
  } catch { return { errores: { general: 'No se pudo crear el respaldo. No se reemplazó ningún registro.' }, reconstruido: false }; }
  try {
    const revisar = (resultado) => { if (resultado?.errores) throw new Error(resultado.errores.general || 'No se pudo reconstruir el ejemplo.'); };
    revisar(cargarDemoPeluches({ reemplazar: true, hoy: new Date('2026-11-27T12:00:00'), completarMaterialesIniciados: true }));
    // Un ejemplo iniciado puede estar en curso sin estar fuera de plazo.
    revisar(guardarCambios({ ordenes: listar('ordenes').map((o) => o.estado === 'En producción' && o.fecha_fin < '2026-11-27' ? { ...o, fecha_fin: '2026-11-29' } : o) }));
    revisar(inicializarPedidosDemo({ asignarLotesIniciados: true }));
    revisar(agregarEjemploOsoCascabel({ fechaBase: '2026-11-25' }));
    if (listar('ordenes').length !== 6 || listar('pedidos').length !== 30) throw new Error('El ejemplo no quedó completo.');
    window.localStorage.setItem(CLAVE_VERSION, '1');
    return { errores: null, reconstruido: true };
  } catch {
    try {
      for (const clave of Object.keys(datosActuales())) if (!Object.hasOwn(anteriores, clave)) window.localStorage.removeItem(clave);
      for (const [clave, valor] of Object.entries(anteriores)) window.localStorage.setItem(clave, valor);
      if (historialSesion === null) window.sessionStorage.removeItem(CLAVE_HISTORIAL);
      else window.sessionStorage.setItem(CLAVE_HISTORIAL, historialSesion);
    } catch { return { errores: { general: 'La reconstrucción falló. El respaldo previo sigue disponible para descargar.' }, reconstruido: false }; }
    return { errores: { general: 'No se pudo completar el ejemplo. Se recuperaron los registros anteriores y se conservó su respaldo.' }, reconstruido: false };
  }
}

export function hayRespaldoEjemplo() {
  try { return !!window.localStorage.getItem(CLAVE_RESPALDO_EJEMPLO); } catch { return false; }
}

export function descargarRespaldoEjemplo() {
  const contenido = window.localStorage.getItem(CLAVE_RESPALDO_EJEMPLO);
  if (!contenido) return;
  const url = URL.createObjectURL(new Blob([contenido], { type: 'application/json' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = 'manufactura-respaldo-antes-reconstruccion.json';
  enlace.click();
  URL.revokeObjectURL(url);
}
