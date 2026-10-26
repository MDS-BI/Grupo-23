Sistema de Gestión de Manufactura

Descripción general

Nuestro modelo de base de datos relacional busca representar y organizar las principales actividades de una planta de manufactura. Considera los productos que se fabrican, los materiales y etapas necesarios para elaborarlos, las órdenes de producción, las máquinas y los trabajadores involucrados. Además, se conecta con otros módulos de la empresa para compartir información sin duplicarla.

Funcionamiento del modelo

Productos y materiales

La entidad PRODUCTO identifica cada artículo mediante producto_id y registra su nombre y tipo. Para conocer los insumos necesarios en su fabricación utilizamos PRODUCTO_MATERIAL, que relaciona cada producto con sus materiales e indica la cantidad requerida por unidad. La información general de los materiales corresponde al módulo externo de Logística e Inventario.

Etapas de fabricación

El proceso productivo se organiza mediante ETAPA_FABRICACION, que define las actividades, su tipo y su tiempo estándar. Por su parte, RUTA_PRODUCTO establece las etapas que debe seguir cada producto y la secuencia en que se realizan. Esta tabla permite resolver la relación de muchos a muchos, ya que un producto puede requerir varias etapas y una misma etapa puede utilizarse en diferentes productos.

Órdenes y ejecución de la producción

La entidad ORDEN_PRODUCCION registra qué producto se fabricará, la cantidad planificada, el estado de la orden y sus fechas de inicio y término. El avance real se documenta en EJECUCION_ETAPA, donde se guardan los tiempos de ejecución, la máquina utilizada y el trabajador responsable. La información administrativa del personal se mantiene en el módulo externo de Recursos Humanos y Planillas.

Además, RECEPCION_MATERIAL registra los insumos recibidos para cada orden, sus cantidades, fechas y proveedores. Los datos comerciales y administrativos de estos últimos se gestionan en el módulo de Adquisición y Compras.

Máquinas y mantenimiento

La entidad MAQUINA almacena la identificación de cada equipo, su nombre, estado y capacidad. Los trabajos de mantención o reparación se registran en MANTENIMIENTO_MAQUINA, incluyendo el tipo de intervención, la fecha, el técnico responsable y el costo asociado. Si se utilizan piezas durante la intervención, MANTENIMIENTO_REPUESTO relaciona el mantenimiento con los repuestos consumidos y sus cantidades.

Equipamiento del personal

Finalmente, EQUIPAMIENTO identifica las herramientas y elementos de trabajo, mientras que ASIGNACION_EQUIPAMIENTO registra a qué trabajador se entregó cada elemento y en qué fecha.

Objetivo del modelo

En conjunto, estas entidades permiten conectar la planificación con la ejecución de la fabricación y mantener un registro del uso de materiales, máquinas y recursos humanos. Así, el modelo ofrece una estructura para seguir las operaciones de la planta e integrar la información necesaria con las áreas de Logística e Inventario, Adquisición y Compras, y Recursos Humanos y Planillas.