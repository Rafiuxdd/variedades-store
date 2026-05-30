# Variedades Store

Tienda online FullStack para una tienda de variedades. Incluye catalogo por categorias, carrito, pedidos por WhatsApp, delivery/puntos de entrega, panel administrativo y CRUD de productos, categorias, pedidos, usuarios, puntos de entrega y tarifas.

## Stack

- Frontend: React, React Router, Framer Motion.
- Backend: Node.js, Express y MySQL.
- Seguridad: JWT en cookie `HttpOnly`, `SameSite`, `Secure` en produccion, CORS con credenciales y origen permitido, `helmet`, rate limit en login, contrasenas con bcrypt, permisos por usuario y validaciones de entrada.
- Pagos opcionales: link de pago Wompi.

## Categorias base

- Accesorios para celulares
- Tecnologia
- Mascotas
- Belleza y unas
- Maquillaje
- Perfumeria
- Cabello
- Hogar y regalos
- Moda y accesorios
- Ninos y juguetes
- Limpieza

## Ejecutar

1. Instalar dependencias del frontend:

```bash
npm install
```

2. Instalar dependencias del backend:

```bash
cd backend
npm install
```

3. Crear la base de datos en MySQL usando `backend/database.sql`.

4. Copiar `backend/.env.example` a `backend/.env` y configurar:

```env
DB_NAME=tienda_variedades
JWT_SECRET=un_valor_largo_aleatorio_y_privado
WHATSAPP_OWNER_NUMBER=50300000000
FRONTEND_URL=http://localhost:3000
```

5. Usuario inicial del panel:

```text
Correo: admin@tienda.com
Clave: Admin123!
```

Cambia esa clave al entrar al panel o desde la base de datos antes de publicar.

6. Iniciar backend:

```bash
cd backend
npm run dev
```

7. Iniciar frontend:

```bash
npm start
```

El frontend abre en `http://localhost:3001` y el backend en `http://localhost:4000`.

Tambien puedes servir la version compilada con:

```bash
node scripts/serve-build.js
```
