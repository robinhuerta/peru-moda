# Perú & Moda — Brief de proyecto

## 1. Visión general

**Perú & Moda** es un marketplace exclusivo de gorras, diseñado para conectar múltiples vendedores con compradores que buscan productos premium, urbanos y de estilo streetwear. La web debe destacarse por ser visualmente atractiva, rápida, responsiva y con experiencia de usuario de nivel comparable a Farfetch, SSENSE, Zalando o Nike SNKRS.

Objetivo:
- Permitir a vendedores publicar y vender sus gorras en una plataforma unificada.
- Ofrecer a compradores una experiencia fluida, inmersiva y optimizada para mobile.


## 2. Identidad de marca

- Nombre: **Perú & Moda**
- Estilo visual: moderno, urbano, streetwear premium.
- Inspiración peruana: detalles sutiles en colores, texturas y elementos gráficos, sin folklore literal.
- Paleta de colores: fondo oscuro/minimalista (negro, blanco, gris grafito) + acento vibrante (rojo peruano, dorado o un color brillante selecto).
- Tipografía: título con carácter, bold y streetwear; cuerpo limpio y legible.
- Modo oscuro / modo claro: switch que permita alternar entre ambas presentaciones.


## 3. Estructura principal del sitio

### 1. Home / Landing
- Hero visual grande con imagen o video de gorras en movimiento.
- Efecto parallax o scroll inmersivo.
- Secciones clave:
  - "Lo más nuevo"
  - "Más vendidas"
  - "Ediciones limitadas"
  - "Vendedores destacados"
- Categorías visuales por tipo de gorra: snapback, trucker, dad hat, beisbolera, bucket hat, deportivas, cuero, bordadas, personalizadas, edición limitada.

### 2. Catálogo / Tienda
- Grid de productos tipo masonry o cuadrícula uniforme.
- Imágenes de alta calidad.
- Filtros avanzados:
  - Tipo de gorra
  - Marca / vendedor
  - Color
  - Talla
  - Material
  - Precio en soles (S/)
  - Popularidad
  - Nuevo ingreso
- Buscador inteligente con autocompletado.
- Microanimaciones hover: segunda foto o ángulo del producto (vista rápida).

### 3. Ficha de producto
- Zoom tipo lupa al pasar el cursor (zoom in-place) para ver bordados y detalles.
- Galería con miniaturas y múltiples ángulos.
- Selector de talla/color/modelo con vista previa instantánea.
- Info de vendedor: perfil, calificación, tiempo de entrega.
- Botones "Agregar al carrito" y "Comprar ahora" sticky durante scroll.
- Sección de reseñas con fotos reales de compradores.
- Productos relacionados / "Combina con".

### 4. Panel de vendedor
- Registro y verificación de vendedores.
- Panel para subir productos: fotos, precio, stock, tallas, descripción.
- Dashboard de ventas, pedidos y mensajes con compradores.
- Configuración de comisión de plataforma.

### 5. Carrito y checkout
- Checkout rápido en un solo paso.
- Métodos de pago locales para Perú: Yape, Plin, PagoEfectivo, además de tarjetas internacionales.
- Cálculo automático de envío según ubicación.
- Resumen de compra claro y minimalista.

### 6. Cuenta de usuario
- Historial de pedidos.
- Wishlist / favoritos.
- Direcciones guardadas.
- Seguimiento de envío en tiempo real.

### 7. Blog / editorial (recomendado)
- Contenidos de tendencias en gorras, cómo combinar, colecciones especiales y colaboraciones.
- Refuerza SEO y posicionamiento de marca.


## 4. Funcionalidades clave

- Velocidad extrema de carga: imágenes WebP/AVIF, lazy loading, CDN, código limpio.
- Zoom tipo lupa en cada producto, fluido y de alta resolución.
- 100% responsive / mobile-first.
- Marketplace multivendedor con panel propio para cada vendedor.
- Filtros y búsqueda flexible.
- Integración de pagos locales peruanos + pasarelas internacionales.
- Sistema de reseñas y calificaciones por producto y vendedor.
- Wishlist / favoritos.
- Notificaciones de stock, ofertas y nuevos lanzamientos.
- Modo oscuro / claro.
- SEO optimizado para keywords como "gorras Perú", "gorras de moda", "gorras urbanas".


## 5. Experiencia visual e interacciones

- Microanimaciones en tarjetas de producto.
- Hover con cambio de imagen y botones animados.
- Scroll con zoom/parallax sutil.
- Posible vista 3D o "gira el producto" para gorras top.
- Diseño modular por bloques para categorías y colecciones.
- Fotografía premium con estilo consistente: fondo limpio y lifestyle.


## 6. Stack técnico sugerido

### Frontend
- React / Next.js con Tailwind CSS.
- Performance y SEO.

### Backend
- Node.js o Django.
- PostgreSQL.

### Imágenes
- CDN como Cloudinary o similar.
- Compresión automática y soporte para zoom.

### Pagos
- Culqi o Niubiz.
- Yape / Plin.

### Hosting
- Frontend en Vercel / Netlify.
- Backend en servicio cloud escalable.


## 7. Tono de la marca

- Directo, moderno y cercano al streetwear urbano.
- Orgullo peruano sutil.
- Ejemplo de copy: "Tu estilo, tu gorra. Perú & Moda — todo el catálogo de gorras en un solo lugar."


## Nota final

Ajustar el alcance según el número inicial de vendedores, métodos de pago disponibles y el cronograma real. Priorizar una experiencia visual premium y un performance móvil sobresaliente.
