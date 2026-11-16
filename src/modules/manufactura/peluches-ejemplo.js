export const proveedores = {
  textiles: 'Textiles Nube Austral',
  rellenos: 'Fibras del Valle',
  hilos: 'Hilandería Puntada Sur',
  accesorios: 'Accesorios Ojito',
  embalajes: 'Empaques Bosque Azul',
};

// Cada insumo declara su unidad de compra y el proveedor de las recepciones.
export const insumos = {
  felpaOso: ['Felpa marrón de pelo corto', 'metro', 'textiles'],
  felpaDino: ['Felpa verde de pelo corto', 'metro', 'textiles'],
  felpaDuende: ['Felpa beige de pelo largo', 'metro', 'textiles'],
  felpaConejo: ['Felpa blanca de pelo corto', 'metro', 'textiles'],
  felpaAjolote: ['Felpa rosa coral', 'metro', 'textiles'],
  tela: ['Tela de algodón para detalles', 'metro', 'textiles'],
  fieltro: ['Fieltro para apliques', 'metro', 'textiles'],
  relleno: ['Fibra de poliéster siliconada', 'kilogramo', 'rellenos'],
  hilo: ['Hilo de poliéster para costura', 'metro', 'hilos'],
  bordado: ['Hilo para bordado de caras', 'metro', 'hilos'],
  ojos: ['Ojos plásticos de 12 mm con arandela', 'unidad', 'accesorios'],
  bolsa: ['Bolsa kraft termosellable para peluche', 'unidad', 'embalajes'],
};

export const estaciones = {
  corte: {
    etapa: 'Tizado y corte de tela', tipo: 'Preparación', minutos: 55,
    maquina: ['PEL-M01', 'Cortadora circular textil', 65],
    trabajador: 'Camila Soto · Corte',
    equipo: ['Guante anticorte', 'Protección personal'],
    mantenimiento: ['Cambio de cuchilla y calibración', 'Cuchilla circular de 100 mm', 28000],
  },
  bordado: {
    etapa: 'Bordado de cara y detalles', tipo: 'Decoración', minutos: 75,
    maquina: ['PEL-M02', 'Bordadora industrial de un cabezal', 45],
    trabajador: 'Ignacio Reyes · Bordado',
    equipo: ['Bastidor de bordado', 'Herramienta de bordado'],
    mantenimiento: ['Limpieza del cabezal y cambio de aguja', 'Aguja de bordado 75/11', 24000],
  },
  costura: {
    etapa: 'Montaje de apliques y costura', tipo: 'Ensamblaje', minutos: 105,
    maquina: ['PEL-M03', 'Máquina recta de arrastre doble', 35],
    trabajador: 'Valentina Pino · Costura',
    equipo: ['Tijera de precisión', 'Herramienta de costura'],
    mantenimiento: ['Ajuste de tensión y cambio de bobina', 'Bobina metálica industrial', 32000],
  },
  relleno: {
    etapa: 'Relleno y cierre', tipo: 'Ensamblaje', minutos: 85,
    maquina: ['PEL-M04', 'Rellenadora neumática de fibra', 40],
    trabajador: 'Tomás Vera · Relleno',
    equipo: ['Lentes contra partículas', 'Protección personal'],
    mantenimiento: ['Limpieza y revisión de presión', 'Filtro de aire neumático', 36000],
  },
  control: {
    etapa: 'Revisión de costuras y peso', tipo: 'Control de calidad', minutos: 40,
    trabajador: 'Fernanda Leal · Calidad y empaque',
  },
  empaque: {
    etapa: 'Sellado de empaque', tipo: 'Despacho', minutos: 45,
    maquina: ['PEL-M05', 'Selladora térmica de pedal', 75],
    trabajador: 'Fernanda Leal · Calidad y empaque',
    equipo: ['Guante térmico', 'Protección personal'],
    mantenimiento: ['Cambio de resistencia y prueba de sellado', 'Resistencia de sellado de 300 mm', 26500],
  },
};

// Las fechas son días relativos al momento de cargar el ejemplo.
export const lotes = [
  {
    nombre: 'Oso Bruno de 30 cm', tipo: 'Peluche clásico', cantidad: 40,
    periodo: [-12, -10], estado: 'Finalizada',
    materiales: { felpaOso: 0.32, tela: 0.06, relleno: 0.19, hilo: 12, bordado: 2, ojos: 2, bolsa: 1 },
    tiempos: [48, 62, 92, 70, 31, 35],
  },
  {
    nombre: 'Dinosaurio Dino de 35 cm', tipo: 'Peluche prehistórico', cantidad: 36,
    periodo: [-8, -6], estado: 'Finalizada',
    materiales: { felpaDino: 0.38, fieltro: 0.12, relleno: 0.23, hilo: 15, bordado: 3, bolsa: 1 },
    tiempos: [59, 67, 114, 74, 34, 34],
  },
  {
    nombre: 'Duende orejón estilo Labubu de 25 cm', tipo: 'Peluche coleccionable', cantidad: 30,
    periodo: [-4, -1], estado: 'En producción',
    materiales: { felpaDuende: 0.27, tela: 0.08, relleno: 0.15, hilo: 10, bordado: 5, ojos: 2, bolsa: 1 },
    pendientes: ['bolsa'],
    tiempos: [40, 58, 82],
  },
  {
    nombre: 'Conejo Nube de 28 cm', tipo: 'Peluche clásico', cantidad: 48,
    periodo: [-2, 2], estado: 'En producción',
    materiales: { felpaConejo: 0.31, tela: 0.1, relleno: 0.17, hilo: 11, bordado: 3, bolsa: 1 },
    tiempos: [51, 69],
  },
  {
    nombre: 'Ajolote Lila de 32 cm', tipo: 'Peluche de fauna', cantidad: 42,
    periodo: [2, 4], estado: 'Planificada',
    materiales: { felpaAjolote: 0.3, fieltro: 0.09, relleno: 0.18, hilo: 13, bordado: 4, bolsa: 1 },
    pendientes: ['hilo', 'bordado', 'bolsa'],
    tiempos: [],
  },
];
