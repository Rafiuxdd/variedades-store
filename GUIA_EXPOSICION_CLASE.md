# Guia breve de exposicion: Variedades Store

Este proyecto es una aplicacion FullStack para administrar una tienda de variedades.

## Que resuelve

Permite publicar productos por categoria, recibir pedidos desde el carrito y enviar el detalle directo al WhatsApp de la tienda.

## Que puede hacer el administrador

- Gestionar productos y categorias.
- Revisar, confirmar o cancelar pedidos.
- Administrar usuarios y permisos.
- Configurar puntos de entrega y tarifas de delivery.

## Seguridad destacada

- JWT en cookie `HttpOnly`.
- Cookies seguras en produccion.
- CORS restringido.
- `helmet` y rate limit en login.
- Passwords con bcrypt.
- Roles y permisos por modulo.
- Validaciones y transacciones para proteger stock y pedidos.
