# Documentacion del Proyecto: Variedades Store

Variedades Store es una tienda online profesional para vender productos de muchas categorias: accesorios para celulares, cargadores, articulos para mascotas, belleza, maquillaje, cabello, perfumes, tazas, hogar, tecnologia, juguetes, moda y limpieza.

El cliente puede buscar productos, filtrar por categoria, agregar al carrito y generar un pedido que se envia al numero de WhatsApp configurado. El administrador puede entrar al panel privado y gestionar productos, categorias, pedidos, usuarios, puntos de entrega y tarifas.

## Seguridad implementada

- Autenticacion con JWT guardado en cookie `HttpOnly`.
- Cookie con `SameSite=Lax` en desarrollo y `SameSite=None; Secure` en produccion.
- No se guarda token JWT en `localStorage`.
- CORS restringido a `FRONTEND_URL` y con `credentials: true`.
- `helmet` para cabeceras de seguridad.
- Rate limit en `/api/auth/login`.
- Passwords con bcrypt.
- Validacion de datos antes de crear pedidos, productos y usuarios.
- Permisos por usuario para productos, pedidos, puntos de entrega y usuarios.
- Transacciones MySQL para pedidos y control de stock.
- Webhook de Wompi validado con HMAC cuando se use pago por link.
- Usuario administrador inicial con clave temporal que debe cambiarse antes de publicar.

## Modulos principales

- Catalogo publico con filtros.
- Carrito y checkout.
- Pedido por WhatsApp.
- Delivery por municipio y puntos de entrega.
- CRUD de productos y categorias.
- CRUD de usuarios administradores con permisos.
- CRUD de pedidos con confirmacion/cancelacion.
- Configuracion de tarifas de delivery.

## Base de datos

El script `backend/database.sql` crea la base `tienda_variedades`, tablas principales y datos iniciales de categorias/productos.

Tablas:

- `categories`
- `products`
- `orders`
- `order_items`
- `delivery_points`
- `delivery_rates`
- `users`

El script SQL crea el usuario inicial `admin@tienda.com` con clave temporal `Admin123!`.
