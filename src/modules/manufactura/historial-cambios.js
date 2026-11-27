// Aplica solo las diferencias de una operación sobre los datos actuales.
// No restaura tablas completas: los registros y campos posteriores se conservan.
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clave = (registro, campo) => Number(registro[campo]);
const conflicto = 'Este registro tiene cambios posteriores. Deshaz primero los cambios relacionados.';

export function diferencias(anteriores, posteriores, campo) {
  const antes = new Map(anteriores.map((r) => [clave(r, campo), r]));
  const despues = new Map(posteriores.map((r) => [clave(r, campo), r]));
  return [...new Set([...antes.keys(), ...despues.keys()])]
    .filter((id) => !igual(antes.get(id), despues.get(id)))
    .map((id) => ({ id, antes: antes.get(id), despues: despues.get(id) }));
}

function problemas(datos, campos) {
  const errores = new Set();
  const lista = (tabla) => datos[tabla] || [];
  const existe = (tabla, id) => lista(tabla).some((r) => clave(r, campos[tabla]) === Number(id));
  const enlaces = {
    producto_material: [['producto_id', 'productos']],
    rutas: [['producto_id', 'productos'], ['etapa_id', 'etapas']],
    ordenes: [['producto_id', 'productos']],
    ejecuciones: [['orden_id', 'ordenes'], ['etapa_id', 'etapas'], ['maquina_id', 'maquinas', true]],
    recepciones: [['orden_id', 'ordenes']],
    mantenimientos: [['maquina_id', 'maquinas']],
    mantenimiento_repuestos: [['mantenimiento_id', 'mantenimientos']],
    asignaciones: [['equipamiento_id', 'equipamiento']],
    pedidos: [['producto_id', 'productos'], ['local_id', 'locales'], ['orden_id', 'ordenes', true]],
  };
  for (const [tabla, relaciones] of Object.entries(enlaces)) {
    for (const r of lista(tabla)) {
      for (const [campo, destino, opcional] of relaciones) {
        if (opcional && !r[campo]) continue;
        if (!existe(destino, r[campo])) errores.add(`${tabla}:${r[campos[tabla]]}:${campo}:${r[campo]}`);
      }
    }
  }
  for (const tabla of ['producto_material', 'recepciones']) {
    for (const r of lista(tabla)) {
      if (Number(r.material_id) < 0 && !existe('materiales_locales', r.material_id))
        errores.add(`${tabla}:${r[campos[tabla]]}:material:${r.material_id}`);
    }
  }
  for (const ej of lista('ejecuciones')) {
    const orden = lista('ordenes').find((o) => Number(o.orden_id) === Number(ej.orden_id));
    if (orden && !lista('rutas').some((r) => Number(r.producto_id) === Number(orden.producto_id) && Number(r.etapa_id) === Number(ej.etapa_id)))
      errores.add(`ejecucion-ruta:${ej.ejecucion_id}`);
  }
  for (const orden of lista('ordenes')) {
    const pedidos = lista('pedidos').filter((p) => Number(p.orden_id) === Number(orden.orden_id));
    const total = pedidos.reduce((suma, p) => suma + Number(p.cantidad), 0);
    if (total > Number(orden.cantidad_plan)) errores.add(`orden-capacidad:${orden.orden_id}:${orden.cantidad_plan}:${total}`);
    for (const p of pedidos) if (Number(p.producto_id) !== Number(orden.producto_id)) errores.add(`pedido-modelo:${p.pedido_id}:${orden.producto_id}`);
  }
  for (const orden of lista('ordenes').filter((o) => o.estado === 'Finalizada')) {
    const ruta = lista('rutas').filter((r) => Number(r.producto_id) === Number(orden.producto_id));
    const ejecuciones = lista('ejecuciones').filter((e) => Number(e.orden_id) === Number(orden.orden_id));
    if (!ruta.length || ejecuciones.some((e) => !e.fin_real) || ruta.some((r) => !ejecuciones.some((e) => e.fin_real && Number(e.etapa_id) === Number(r.etapa_id))))
      errores.add(`orden-finalizada:${orden.orden_id}`);
  }
  const unicos = {
    rutas: (r) => [`producto-etapa:${r.producto_id}:${r.etapa_id}`, `secuencia:${r.producto_id}:${r.secuencia}`],
    producto_material: (r) => [`material:${r.producto_id}:${r.material_id}`],
    maquinas: (r) => [`codigo:${String(r.codigo).toLocaleLowerCase()}`],
    materiales_locales: (r) => [`nombre:${String(r.nombre).trim().toLocaleLowerCase()}`],
    pedidos: (r) => [`codigo:${String(r.codigo).trim().toLocaleLowerCase()}`],
  };
  for (const [tabla, obtenerClaves] of Object.entries(unicos)) {
    const vistos = new Set();
    for (const r of lista(tabla)) for (const valor of obtenerClaves(r)) {
      if (vistos.has(valor)) errores.add(`${tabla}:duplicado:${valor}`);
      vistos.add(valor);
    }
  }
  return errores;
}

export function prepararCambio(paso, actuales, campos, rehacer = false) {
  const origen = rehacer ? paso.anteriores : paso.posteriores;
  const destino = rehacer ? paso.posteriores : paso.anteriores;
  const cambios = {};
  for (const tabla of Object.keys(origen)) {
    const campo = campos[tabla];
    if (!campo) return { motivo: 'Este cambio pertenece a un historial protegido.' };
    let registros = [...(actuales[tabla] || [])];
    for (const { id, antes, despues } of diferencias(origen[tabla], destino[tabla], campo)) {
      const indice = registros.findIndex((r) => clave(r, campo) === id);
      const actual = registros[indice];
      if (!antes) {
        if (actual) return { motivo: conflicto };
        // Inserta junto a sus vecinos originales sin quitar registros nuevos.
        const posicion = destino[tabla].findIndex((r) => clave(r, campo) === id);
        const siguientes = destino[tabla].slice(posicion + 1).map((r) => clave(r, campo));
        const vecino = registros.findIndex((r) => siguientes.includes(clave(r, campo)));
        const previos = destino[tabla].slice(0, posicion).map((r) => clave(r, campo));
        const anterior = registros.findLastIndex((r) => previos.includes(clave(r, campo)));
        registros.splice(vecino >= 0 ? vecino : anterior + 1, 0, despues);
      } else if (!despues) {
        if (!igual(actual, antes)) return { motivo: conflicto };
        registros.splice(indice, 1);
      } else {
        if (!actual) return { motivo: conflicto };
        const camposCambiados = [...new Set([...Object.keys(antes), ...Object.keys(despues)])]
          .filter((c) => !igual(antes[c], despues[c]));
        if (camposCambiados.some((c) => !igual(actual[c], antes[c]))) return { motivo: conflicto };
        const nuevo = { ...actual };
        for (const c of camposCambiados) {
          if (Object.hasOwn(despues, c)) nuevo[c] = despues[c];
          else delete nuevo[c];
        }
        registros[indice] = nuevo;
      }
    }
    cambios[tabla] = registros;
  }
  const previos = problemas(actuales, campos);
  for (const orden of actuales.ordenes || []) {
    const posterior = (cambios.ordenes || actuales.ordenes).find((o) => Number(o.orden_id) === Number(orden.orden_id));
    if (orden.estado !== 'Planificada' && posterior?.estado === orden.estado) {
      const pedidosAntes = (actuales.pedidos || []).filter((p) => Number(p.orden_id) === Number(orden.orden_id));
      const pedidosDespues = (cambios.pedidos || actuales.pedidos || []).filter((p) => Number(p.orden_id) === Number(orden.orden_id));
      if ((!paso.ajusteLotes && Number(posterior.cantidad_plan) !== Number(orden.cantidad_plan)) || Number(posterior.producto_id) !== Number(orden.producto_id) || !igual(pedidosAntes, pedidosDespues))
        return { motivo: 'El lote ya salió de planificación. Sus pedidos, peluche y cantidad se conservan mientras siga en ese estado.' };
    }
  }
  if ([...problemas({ ...actuales, ...cambios }, campos)].some((error) => !previos.has(error)))
    return { motivo: 'Hay registros relacionados que dependen de este cambio. Deshaz primero esos cambios; las recepciones guardadas se conservan.' };
  return { cambios, motivo: '' };
}
