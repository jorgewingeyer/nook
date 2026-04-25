# Nook eCommerce - Historias de Usuario PRO

**Versión:** 1.0  
**Proyecto:** Nook - Ecommerce de Decoración para el Hogar  
**Última Actualización:** 2026-04-24  

---

## 📑 Índice

1. [Clientes - Navegación y Búsqueda](#clientes---navegación-y-búsqueda)
2. [Clientes - Compra y Pago](#clientes---compra-y-pago)
3. [Clientes - Información General](#clientes---información-general)
4. [Administración - Panel Principal](#administración---panel-principal)
5. [Administración - Gestión de Productos](#administración---gestión-de-productos)
6. [Administración - Inventario](#administración---inventario)
7. [Administración - Finanzas y Movimientos](#administración---finanzas-y-movimientos)
8. [Administración - Análisis y Reportes](#administración---análisis-y-reportes)
9. [Administración - Órdenes](#administración---órdenes)

---

## 👥 CLIENTES - NAVEGACIÓN Y BÚSQUEDA

### US-001: Buscar productos por categoría
**Prioridad:** ALTA  
**Story Points:** 5

- *Como* cliente
- *Quiero* navegar por categorías de decoración (Muebles, Iluminación, Textiles, Accesorios, Plantas, etc.)
- *Para que* encuentre rápidamente artículos del tipo que busco

**Criterios de Aceptación:**
- [ ] Las categorías se muestran en un menú principal/sidebar
- [ ] Al hacer clic en una categoría, se cargan todos los productos de esa categoría
- [ ] Se muestra el número de productos por categoría
- [ ] Las categorías pueden tener subcategorías (si aplica)
- [ ] La página se carga en menos de 2 segundos
- [ ] La vista es responsive en mobile

**Notas Técnicas:**
- Implementar en `src/app/(secure)/shop/[category]`
- Usar filtrado en servidor para mejor performance

---

### US-002: Filtrar productos por precio, color, material
**Prioridad:** ALTA  
**Story Points:** 8

- *Como* cliente
- *Quiero* aplicar múltiples filtros (rango de precio, color, material, disponibilidad)
- *Para que* reduzca opciones y encuentre exactamente lo que necesito

**Criterios de Aceptación:**
- [ ] Panel de filtros visible en el lado izquierdo o arriba
- [ ] Rango de precio con selector (min/max o slider)
- [ ] Filtro por color mostrando opciones disponibles
- [ ] Filtro por material (madera, metal, vidrio, tela, etc.)
- [ ] Filtro por disponibilidad (En stock, Agotado, Pre-orden)
- [ ] Los filtros se aplican en tiempo real (debounce de 500ms)
- [ ] Se muestra cantidad de resultados
- [ ] Opción para limpiar todos los filtros
- [ ] URL refleja filtros aplicados (compartible)
- [ ] Los filtros funcionan en combinación

**Notas Técnicas:**
- Usar query parameters en URL para persistencia
- Implementar debouncing para no sobrecargar servidor
- Cache de resultados en cliente

---

### US-003: Buscar productos por nombre o palabra clave
**Prioridad:** ALTA  
**Story Points:** 5

- *Como* cliente
- *Quiero* buscar productos escribiendo palabras clave (ej: "lámpara roja", "sofá gris")
- *Para que* encuentre productos específicos sin navegar por categorías

**Criterios de Aceptación:**
- [ ] Barra de búsqueda visible en header
- [ ] Búsqueda es case-insensitive
- [ ] Se busca en nombre, descripción y etiquetas del producto
- [ ] Los resultados aparecen mientras escribo (autocomplete)
- [ ] Se muestra el número de resultados encontrados
- [ ] Si no hay resultados, se sugieren productos relacionados
- [ ] Búsqueda es rápida (menos de 200ms)

**Notas Técnicas:**
- Usar full-text search en D1
- Implementar debounce de 300ms
- Cachear búsquedas populares

---

### US-004: Ordenar productos por relevancia, precio, nuevo
**Prioridad:** MEDIA  
**Story Points:** 3

- *Como* cliente
- *Quiero* ordenar los resultados por relevancia, precio (ascendente/descendente), fecha de agregación
- *Para que* encuentre los productos que más me interesan primero

**Criterios de Aceptación:**
- [ ] Selector de ordenamiento en la página de resultados
- [ ] Opciones: Relevancia, Precio (menor a mayor), Precio (mayor a menor), Más Nuevos, Más Vendidos
- [ ] El ordenamiento persiste si cambio página
- [ ] Se actualiza al cambiar filtros
- [ ] Indicador visual del ordenamiento activo

---

### US-005: Ver detalles completos del producto
**Prioridad:** ALTA  
**Story Points:** 5

- *Como* cliente
- *Quiero* ver descripción completa, múltiples imágenes, precio, disponibilidad y reseñas
- *Para que* tome una decisión informada antes de comprar

**Criterios de Aceptación:**
- [ ] Galería de imágenes con zoom
- [ ] Nombre, descripción detallada, especificaciones técnicas
- [ ] Precio actual y precio original (si hay descuento)
- [ ] Stock disponible y estado (En stock, Pocas unidades, Agotado)
- [ ] Calificación promedio y número de reseñas
- [ ] Botón "Añadir al carrito"
- [ ] Datos de envío estimado
- [ ] Reseñas de clientes con fotos
- [ ] Productos relacionados sugeridos
- [ ] Información de garantía/devolución

---

### US-006: Guardar productos en lista de deseos
**Prioridad:** MEDIA  
**Story Points:** 4

- *Como* cliente registrado
- *Quiero* guardar productos en una lista de deseos para comprar después
- *Para que* no olvide los artículos que me interesan

**Criterios de Aceptación:**
- [ ] Icono de corazón en cada producto (lleno si está en deseos)
- [ ] Lista de deseos accesible desde mi cuenta
- [ ] Puedo compartir mi lista de deseos
- [ ] Notificación si el producto baja de precio
- [ ] Opción para agregar desde lista de deseos al carrito
- [ ] Contador de deseos en la navegación

---

## 🛒 CLIENTES - COMPRA Y PAGO

### US-007: Carrito de compras persistente
**Prioridad:** ALTA  
**Story Points:** 4

- *Como* cliente
- *Quiero* que mi carrito persista aunque cierre el navegador
- *Para que* pueda continuar comprando después

**Criterios de Aceptación:**
- [ ] El carrito se guarda en base de datos (si estoy registrado) o localStorage
- [ ] El carrito persiste por 30 días
- [ ] Se sincronizan cambios si inicio sesión
- [ ] Puedo ver cantidad de items en el icono del carrito

---

### US-008: Gestionar carrito de compras
**Prioridad:** ALTA  
**Story Points:** 5

- *Como* cliente
- *Quiero* modificar cantidades, eliminar productos y ver el total actualizado
- *Para que* tenga control total sobre mi compra antes de pagar

**Criterios de Aceptación:**
- [ ] Vista de carrito con tabla de productos
- [ ] Selector de cantidad por producto (+/-)
- [ ] Botón de eliminar producto
- [ ] Resumen con subtotal, impuestos (si aplica), envío estimado
- [ ] Total a pagar actualizado en tiempo real
- [ ] Opción para aplicar código de descuento
- [ ] Estimación de envío por región
- [ ] Mensaje si hay productos sin stock

---

### US-009: Proceder a checkout seguro
**Prioridad:** CRÍTICA  
**Story Points:** 8

- *Como* cliente
- *Quiero* un flujo de compra claro en pasos: Revisión → Datos de Envío → Método de Pago → Confirmación
- *Para que* completar mi compra sin confusión

**Criterios de Aceptación:**
- [ ] Paso 1 - Revisión del carrito con opción de volver atrás
- [ ] Paso 2 - Formulario de dirección de envío (calle, número, ciudad, código postal)
- [ ] Paso 3 - Selección de método de envío (estándar, express)
- [ ] Paso 4 - Selección de método de pago
- [ ] Resumen visual en cada paso
- [ ] Indicador de progreso
- [ ] Validación de campos antes de avanzar
- [ ] Opción de guardar dirección para próximas compras
- [ ] Botón "Volver" entre pasos

---

### US-010: Pagar con Mercado Pago
**Prioridad:** CRÍTICA  
**Story Points:** 10

- *Como* cliente
- *Quiero* pagar mi compra con Mercado Pago (tarjeta, transferencia, efectivo)
- *Para que* finalice mi pedido de forma segura

**Criterios de Aceptación:**
- [ ] Integración completa con API de Mercado Pago
- [ ] Opción para pagar con tarjeta de crédito/débito
- [ ] Opción para transferencia bancaria
- [ ] Opción para efectivo (si aplica en región)
- [ ] Validación de datos de pago en lado del cliente
- [ ] Pantalla de Mercado Pago cargada en iframe o redirect seguro
- [ ] Manejo de errores de pago (tarjeta rechazada, etc.)
- [ ] Reintentos automáticos si falla la conexión
- [ ] Token de seguridad se maneja en backend (nunca en frontend)
- [ ] Webhook para confirmar pago completado
- [ ] Estado de pago en tiempo real en la página
- [ ] La orden se crea solo si el pago es exitoso
- [ ] Soporte para Mercado Crédito (cuotas sin interés)
- [ ] Rechazo seguro si intenta manipular el monto

**Notas Técnicas:**
- Usar SDK oficial de Mercado Pago (Bricks)
- Implementar webhook para confirmación de pago
- Guardar transaction_id de MP en la orden
- Nunca procesar monto en frontend

---

### US-011: Confirmación de orden y recepción de email
**Prioridad:** CRÍTICA  
**Story Points:** 5

- *Como* cliente
- *Quiero* recibir confirmación inmediata y email con detalles de mi orden
- *Para que* tenga constancia de mi compra

**Criterios de Aceptación:**
- [ ] Página de confirmación con número de orden (ID único)
- [ ] Resumen completo: productos, cantidad, precio, total, método de pago
- [ ] Datos de envío confirmados
- [ ] Email de confirmación enviado al registrarse
- [ ] Email contiene enlace para rastrear orden
- [ ] Email contiene información de contacto de soporte
- [ ] Opción para imprimir comprobante
- [ ] Reintento de email si falla
- [ ] Número de seguimiento (si aplica) en el email

---

### US-012: Rastrear estado de mi orden
**Prioridad:** ALTA  
**Story Points:** 6

- *Como* cliente
- *Quiero* ver el estado de mi orden (Confirmada, Procesando, Enviada, Entregada) en tiempo real
- *Para que* sepa cuándo llegará mi pedido

**Criterios de Aceptación:**
- [ ] Estado visible en "Mi Cuenta" → "Órdenes"
- [ ] Cronología de estados con fechas
- [ ] Número de seguimiento del transportista (si aplica)
- [ ] Enlace directo a rastreo del courier
- [ ] Notificación por email al cambiar estado
- [ ] Mapa de progreso visual (1. Confirmada → 2. Procesando → 3. Enviada → 4. Entregada)
- [ ] Estimación de fecha de entrega
- [ ] Opción para contactar soporte si hay problemas

---

### US-013: Devoluciones y cambios
**Prioridad:** MEDIA  
**Story Points:** 8

- *Como* cliente
- *Quiero* poder solicitar devolución o cambio dentro de 30 días después de la compra
- *Para que* pueda obtener reembolso o cambiar por otro producto

**Criterios de Aceptación:**
- [ ] Botón "Solicitar devolución" en detalle de orden (dentro de 30 días)
- [ ] Formulario con motivo de devolución (defectuoso, no como se esperaba, cambio de tamaño, etc.)
- [ ] Opción para fotografía del artículo (si es necesario)
- [ ] Generación de etiqueta de envío automática
- [ ] Estado de devolución: Pendiente → Recibido → Procesando → Completado
- [ ] Reembolso automático a la cuenta original una vez recibido
- [ ] Email de confirmación de devolución
- [ ] Opción de cambio por otro producto del mismo valor
- [ ] Política de devolución clara

---

## ℹ️ CLIENTES - INFORMACIÓN GENERAL

### US-014: Sección "Nosotros" / About Us
**Prioridad:** MEDIA  
**Story Points:** 3

- *Como* cliente
- *Quiero* conocer la historia, misión y valores de Nook
- *Para que* pueda confiar en la marca y decidir si quiero comprar

**Criterios de Aceptación:**
- [ ] Página dedicada `/nosotros` accesible desde footer o menú
- [ ] Sección con historia de la empresa (misión, visión)
- [ ] Equipo: fotos y breve descripción de miembros clave
- [ ] Valores y compromiso con clientes
- [ ] Certificaciones o reconocimientos (si los hay)
- [ ] Datos de contacto (email, teléfono, redes sociales)
- [ ] Formulario de contacto funcional
- [ ] Mapa con ubicación física (si aplica)
- [ ] Galería de imágenes de la tienda/equipo
- [ ] Testimonios de clientes

---

### US-015: Politicas y Legal
**Prioridad:** MEDIA  
**Story Points:** 2

- *Como* cliente
- *Quiero* ver política de privacidad, términos de servicio, y política de devoluciones
- *Para que* sepa mis derechos y responsabilidades

**Criterios de Aceptación:**
- [ ] Página `/politicas` con enlaces a:
  - Política de Privacidad
  - Términos de Servicio
  - Política de Devoluciones
  - Política de Envíos
  - Cookies
- [ ] Textos claros y actualizados
- [ ] Opción de descargar en PDF

---

---

## 🔧 ADMINISTRACIÓN - PANEL PRINCIPAL

### US-016: Dashboard ejecutivo / KPIs principales
**Prioridad:** CRÍTICA  
**Story Points:** 8

- *Como* administrador
- *Quiero* ver un dashboard con KPIs principales al abrir el panel
- *Para que* tenga visibilidad rápida del estado del negocio

**Criterios de Aceptación:**
- [ ] Ventas del día/semana/mes (con comparativa anterior)
- [ ] Número de órdenes (total y nuevas)
- [ ] Clientes activos (últimos 30 días)
- [ ] Ingresos totales por período (seleccionable)
- [ ] Producto más vendido
- [ ] Categoría más popular
- [ ] Tasa de conversión (visitas → compras)
- [ ] Ticket promedio
- [ ] Tasa de devoluciones
- [ ] Inventario bajo (productos con stock < 10)
- [ ] Gráficos: Ventas por día, Órdenes por estado, Top 5 productos
- [ ] Período seleccionable (hoy, última semana, mes, año)
- [ ] Botones de acción rápida (Nueva orden, Ver órdenes, Gestionar inventario)

---

### US-017: Navegación y autenticación del admin
**Prioridad:** CRÍTICA  
**Story Points:** 4

- *Como* administrador
- *Quiero* acceder al panel con rol admin y tener navegación clara
- *Para que* pueda gestionar todas las funciones del ecommerce

**Criterios de Aceptación:**
- [ ] Login separado para admins (o rol en login existente)
- [ ] Validación de rol admin antes de acceder
- [ ] Menú lateral con secciones principales:
  - Dashboard
  - Productos
  - Órdenes
  - Clientes
  - Inventario
  - Finanzas
  - Reportes
  - Configuración
- [ ] Menú colapsable en mobile
- [ ] Breadcrumbs para navegación
- [ ] Avatar/usuario en header con opción de logout
- [ ] Indicador de notificaciones pendientes

---

---

## 📦 ADMINISTRACIÓN - GESTIÓN DE PRODUCTOS

### US-018: Crear producto nuevo
**Prioridad:** ALTA  
**Story Points:** 6

- *Como* administrador
- *Quiero* crear nuevo producto con todos los detalles necesarios
- *Para que* esté disponible para compra en la tienda

**Criterios de Aceptación:**
- [ ] Formulario con campos:
  - Nombre del producto
  - Descripción (editor de texto rico)
  - Categoría (selector)
  - Subcategoría (si aplica)
  - Precio de venta
  - Precio de costo (privado, solo admin)
  - Código SKU (único)
  - Stock inicial
  - Atributos (color, tamaño, material, etc.)
  - Múltiples imágenes (al menos 3)
  - Peso y dimensiones
  - Etiquetas/Tags
  - Activo/Inactivo
  - Destacado (mostrar en inicio)
- [ ] Validación de campos obligatorios
- [ ] Carga de imágenes con validación (formato, tamaño max 5MB)
- [ ] Preview del producto antes de guardar
- [ ] Generación automática de slug URL-friendly
- [ ] Opción para duplicar un producto
- [ ] Guardar como borrador o publicar

**Notas Técnicas:**
- Usar R2 para almacenar imágenes
- Crear índices para búsqueda full-text

---

### US-019: Editar producto existente
**Prioridad:** ALTA  
**Story Points:** 5

- *Como* administrador
- *Quiero* modificar detalles de un producto existente
- *Para que* pueda mantener el catálogo actualizado

**Criterios de Aceptación:**
- [ ] Los mismos campos que US-018
- [ ] Mostrar valores actuales
- [ ] Agregar/remover imágenes
- [ ] Cambiar orden de imágenes (drag & drop)
- [ ] Historial de cambios (ver quién modificó y cuándo)
- [ ] Botón para deshabilitar producto temporalmente
- [ ] Confirmación antes de cambios críticos
- [ ] Auditoría de cambios en base de datos

---

### US-020: Eliminar o archivar producto
**Prioridad:** MEDIA  
**Story Points:** 3

- *Como* administrador
- *Quiero* eliminar o archivar productos descontinuados
- *Para que* mantenga el catálogo limpio

**Criterios de Aceptación:**
- [ ] Opción "Archivar" (prefecto a eliminar)
- [ ] Opción "Eliminar" (con confirmación de 2 pasos)
- [ ] Los productos archivados no aparecen en la tienda
- [ ] Los archivados siguen siendo visibles en reportes históricos
- [ ] Opción para des-archivar
- [ ] Log de eliminaciones

---

### US-021: Búsqueda y filtrado de productos (admin)
**Prioridad:** MEDIA  
**Story Points:** 4

- *Como* administrador
- *Quiero* encontrar productos rápidamente en el panel
- *Para que* pueda editarlos o revisarlos

**Criterios de Aceptación:**
- [ ] Barra de búsqueda por nombre, SKU, categoría
- [ ] Filtros: Activo/Inactivo, Con stock/Sin stock, Precio rango, Categoría
- [ ] Resultados en tabla con paginación
- [ ] Columnas: Nombre, SKU, Categoría, Precio, Stock, Estado
- [ ] Acciones: Editar, Ver, Archivar (por fila)

---

---

## 📊 ADMINISTRACIÓN - INVENTARIO

### US-022: Gestión de stock / inventario
**Prioridad:** CRÍTICA  
**Story Points:** 7

- *Como* administrador
- *Quiero* ver nivel de stock y actualizar cantidades
- *Para que* evite sobreventa y controle disponibilidad

**Criterios de Aceptación:**
- [ ] Vista de todos los productos con stock actual
- [ ] Editar stock: Aumentar/Disminuir/Establecer cantidad
- [ ] Registro de cada movimiento (entrada/salida con motivo)
- [ ] Alertas si stock cae por debajo de mínimo configurado
- [ ] Historial completo de movimientos
- [ ] Productos sin stock destacados en rojo
- [ ] Opción para establecer stock mínimo por producto
- [ ] Exportar inventario a CSV/Excel
- [ ] Entrada de stock por lote (adjuntar factura de proveedor)
- [ ] Auditoría de quién cambió el stock

**Notas Técnicas:**
- Crear tabla `inventory_movements` con timestamp, usuario, cantidad, motivo
- Garantizar integridad de stock (transacciones ACID)

---

### US-023: Alertas de stock bajo
**Prioridad:** MEDIA  
**Story Points:** 3

- *Como* administrador
- *Quiero* recibir alertas cuando un producto está bajo de stock
- *Para que* pueda reordenar a tiempo

**Criterios de Aceptación:**
- [ ] Notificación en el dashboard cuando stock < mínimo
- [ ] Email de alerta configurable
- [ ] Umbral de alerta configurable por producto
- [ ] Productos con bajo stock en color rojo
- [ ] Opción para crear orden de compra a proveedor desde la alerta

---

### US-024: Historial de precios
**Prioridad:** ALTA  
**Story Points:** 5

- *Como* administrador
- *Quiero* ver historial completo de cambios de precios por producto
- *Para que* pueda analizar evolución de precios y hacer reportes

**Criterios de Aceptación:**
- [ ] Vista de historial en cada producto
- [ ] Columnas: Fecha, Usuario, Precio Anterior, Precio Nuevo, Motivo
- [ ] Filtrar por rango de fechas
- [ ] Exportar historial
- [ ] Análisis: Promedio de precio, Margen de ganancia
- [ ] Alertas si hay cambios sospechosos de precio
- [ ] Comparar precio con competencia (si aplica)

**Notas Técnicas:**
- Crear tabla `price_history` con timestamp, usuario, precio_anterior, precio_nuevo
- Crear automáticamente al cambiar precio

---

---

## 💰 ADMINISTRACIÓN - FINANZAS Y MOVIMIENTOS

### US-025: Registro de transacciones financieras
**Prioridad:** CRÍTICA  
**Story Points:** 8

- *Como* administrador
- *Quiero* ver todas las transacciones (ingresos por ventas, egresos, reembolsos, etc.)
- *Para que* tenga control total del flujo de dinero

**Criterios de Aceptación:**
- [ ] Tabla de transacciones con columnas:
  - Fecha/Hora
  - Tipo (Ingreso venta, Reembolso, Devolución, Comisión MP, etc.)
  - Monto
  - Método (Mercado Pago, Transferencia, etc.)
  - Estado (Pendiente, Completada, Fallida)
  - Orden asociada (si aplica)
  - Descripción/Motivo
- [ ] Filtrar por: Tipo, Rango de fechas, Monto, Estado
- [ ] Búsqueda por ID de orden o cliente
- [ ] Exportar a CSV/Excel
- [ ] Resumen: Total ingresos, Total egresos, Balance neto

---

### US-026: Reembolsos y devoluciones
**Prioridad:** ALTA  
**Story Points:** 6

- *Como* administrador
- *Quiero* procesar reembolsos automáticos cuando cliente devuelve producto
- *Para que* el dinero vuelva a la cuenta del cliente

**Criterios de Aceptación:**
- [ ] Ver solicitudes de devolución pendientes
- [ ] Botón "Procesar reembolso" después de recibir producto
- [ ] Reembolso automático a Mercado Pago (o método original)
- [ ] Transacción registrada en historial de finanzas
- [ ] Email automático al cliente
- [ ] Opción de reembolso parcial (con justificación)
- [ ] Estado de reembolso: Pendiente → Procesando → Completado
- [ ] Auditoría de quién procesó el reembolso

**Notas Técnicas:**
- Usar API de MP para refunds (Refund API)
- Webhook para confirmación
- Limitar reembolsos solo a pagos completados

---

### US-027: Comisiones y costos
**Prioridad:** MEDIA  
**Story Points:** 5

- *Como* administrador
- *Quiero* descontar comisiones de Mercado Pago y otros costos de transacción
- *Para que* vea ganancia real

**Criterios de Aceptación:**
- [ ] Mostrar comisión de MP por cada transacción
- [ ] Campo configurable: % de comisión (default 2.99% + fijo)
- [ ] En reportes, mostrar: Venta Bruta - Comisión = Venta Neta
- [ ] Historial de comisiones cobradas
- [ ] Análisis: Comisiones totales por período
- [ ] Opción para agregar otros costos (paquetería, impuestos, etc.)

---

### US-028: Reportes de flujo de caja
**Prioridad:** ALTA  
**Story Points:** 7

- *Como* administrador / contador
- *Quiero* generar reportes de flujo de caja (cash flow) por período
- *Para que* pueda hacer proyecciones financieras

**Criterios de Aceptación:**
- [ ] Reporte con:
  - Ingresos por ventas
  - Costos de bienes vendidos (COGS)
  - Gastos operativos
  - Comisiones de pago
  - Devoluciones/reembolsos
  - Beneficio neto
- [ ] Gráficos de flujo por día, semana, mes
- [ ] Comparativa con período anterior
- [ ] Exportar a PDF, CSV, Excel
- [ ] Proyecto: Ingresos esperados para fin de mes
- [ ] Análisis de tendencias

---

---

## 📈 ADMINISTRACIÓN - ANÁLISIS Y REPORTES

### US-029: Análisis de ventas por producto
**Prioridad:** ALTA  
**Story Points:** 6

- *Como* administrador
- *Quiero* ver qué productos se venden más, cuáles son los menos populares
- *Para que* pueda tomar decisiones de inventario y marketing

**Criterios de Aceptación:**
- [ ] Tabla con:
  - Nombre del producto
  - Cantidad vendida (período seleccionable)
  - Ingresos generados
  - Margen de ganancia ($)
  - Margen de ganancia (%)
  - Número de reviews/calificación
- [ ] Gráfico: Top 10 productos más vendidos
- [ ] Gráfico: Productos menos vendidos
- [ ] Filtrar por categoría, rango de fechas
- [ ] Exportar reporte

---

### US-030: Análisis de clientes
**Prioridad:** MEDIA  
**Story Points:** 5

- *Como* administrador
- *Quiero* analizar comportamiento de clientes (frecuencia, gasto promedio, etc.)
- *Para que* pueda identificar clientes VIP y estrategias de retención

**Criterios de Aceptación:**
- [ ] Total de clientes registrados
- [ ] Clientes activos (compraron en últimos 30/90/180 días)
- [ ] Gasto promedio por cliente
- [ ] Cliente con mayor gasto
- [ ] Frecuencia de compra (promedio de días entre compras)
- [ ] Tasa de retención (% que vuelve a comprar)
- [ ] Análisis por región/ciudad
- [ ] Segmentación: VIP (alto gasto), Regular, Inactivos
- [ ] Gráfico: Clientes nuevos vs. Clientes que regresan
- [ ] Opción para enviar campaña a segmento específico

---

### US-031: Reportes de ventas diarias/semanales/mensuales
**Prioridad:** ALTA  
**Story Points:** 5

- *Como* administrador
- *Quiero* generar reportes de ventas para períodos específicos
- *Para que* pueda analizarlos y compartirlos con accionistas

**Criterios de Aceptación:**
- [ ] Reporte con:
  - Total de órdenes
  - Ingresos totales
  - Ticket promedio
  - Productos vendidos
  - Método de pago más usado
  - Tasa de conversión (si tengo datos de visitas)
- [ ] Período seleccionable (día, semana, mes, año, custom)
- [ ] Comparativa con período anterior (% de cambio)
- [ ] Exportar a PDF, CSV, Excel
- [ ] Gráficos de tendencias
- [ ] Email automático con reporte (diario/semanal/mensual)

---

### US-032: Análisis de tasa de conversión y abandono
**Prioridad:** MEDIA  
**Story Points:** 6

- *Como* administrador
- *Quiero* ver cuál es la tasa de conversión (visitas → compras) y dónde abandona la gente
- *Para que* pueda optimizar el funnel de ventas

**Criterios de Aceptación:**
- [ ] Visitantes únicos (requiere analytics integrado)
- [ ] Usuarios que ven catálogo
- [ ] Usuarios que agregan al carrito
- [ ] Usuarios que completan checkout
- [ ] Tasa de conversión: (Compras / Visitantes) * 100
- [ ] Embudo visual mostrando caída en cada paso
- [ ] Productos abandonados en carrito (más de 2 horas)
- [ ] Promedio de tiempo en página
- [ ] Top páginas visitadas

**Notas Técnicas:**
- Puede usar Google Analytics 4 integrado o propio sistema
- Recolectar eventos de vista, añadir carrito, checkout

---

### US-033: Auditoría y logs administrativos
**Prioridad:** MEDIA  
**Story Points:** 4

- *Como* administrador
- *Quiero* ver un registro de todas las acciones realizadas en el panel
- *Para que* pueda auditar cambios y responsabilidades

**Criterios de Aceptación:**
- [ ] Log de: Quién, Qué, Cuándo (fecha/hora)
- [ ] Acciones: Crear/editar/eliminar producto, cambiar precio, procesar reembolso, etc.
- [ ] Filtrar por usuario, tipo de acción, rango de fechas
- [ ] Diferencias antes/después de cambios importantes
- [ ] Exportar logs
- [ ] Retención: Mínimo 1 año de logs

---

---

## 📦 ADMINISTRACIÓN - ÓRDENES

### US-034: Gestión de órdenes
**Prioridad:** CRÍTICA  
**Story Points:** 7

- *Como* administrador
- *Quiero* ver todas las órdenes y cambiar su estado
- *Para que* pueda procesarlas y hacer seguimiento

**Criterios de Aceptación:**
- [ ] Vista de órdenes con columnas:
  - ID de orden
  - Cliente
  - Fecha
  - Total
  - Estado (Pendiente, Procesando, Enviada, Entregada, Cancelada)
  - Acción (Ver detalles, editar, imprimir)
- [ ] Filtros: Estado, Rango de fechas, Cliente, Monto
- [ ] Cambiar estado con opción de nota
- [ ] Imprimir etiqueta de envío
- [ ] Enviar email a cliente al cambiar estado
- [ ] Ver detalles: Productos, cantidades, precios, datos de cliente
- [ ] Búsqueda por ID de orden
- [ ] Paginación o scrolling infinito

---

### US-035: Nota de pedido / Packing List
**Prioridad:** MEDIA  
**Story Points:** 3

- *Como* administrador
- *Quiero* generar nota de pedido/packing list para el almacén
- *Para que* sepan qué items empacar

**Criterios de Aceptación:**
- [ ] PDF con:
  - ID de orden
  - Cliente
  - Productos con cantidades exactas
  - Especificaciones especiales (color, tamaño, etc.)
  - Dirección de envío
  - Instrucciones especiales
  - Código QR o barras si aplica
- [ ] Imprimible
- [ ] Generar lotes de órdenes para imprimir de una vez

---

---

## 🎯 NOTAS FINALES

### Prioridades Sugeridas
**Fase 1 (MVP - Semanas 1-4):**
- US-001 a US-006 (Navegación y búsqueda)
- US-007 a US-011 (Carrito y compra básica)
- US-010 (Mercado Pago)
- US-016, US-017 (Dashboard admin básico)
- US-018 a US-020 (CRUD productos)
- US-022 (Inventario básico)

**Fase 2 (Semanas 5-8):**
- US-012, US-013 (Órdenes y devoluciones)
- US-014, US-015 (Información general)
- US-025 a US-028 (Finanzas)
- US-034, US-035 (Gestión de órdenes admin)
- US-029 a US-032 (Análisis y reportes)

**Fase 3 (Mejoras y mantenimiento):**
- US-024 (Historial de precios)
- US-033 (Auditoría)
- Optimizaciones de performance
- Integraciones adicionales

### Estimación Total
- **Story Points:** ~160
- **Duración estimada:** 10-12 semanas (1 developer)
- **Recomendación:** Team de 2-3 developers para 4-6 semanas

---

**Documento generado:** 2026-04-24  
**Versión:** 1.0
