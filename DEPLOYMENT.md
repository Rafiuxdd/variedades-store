# Despliegue de Variedades Store

## Opcion recomendada

- Frontend: hosting estatico como Netlify, Vercel o Render Static Site.
- Backend: servicio Node.js como Render, Railway, VPS o cPanel con Node.js.
- Base de datos: MySQL en el mismo proveedor o una instancia MySQL administrada.

## Variables de produccion del backend

Configurar en el panel del hosting:

```env
NODE_ENV=production
PORT=4000
DB_HOST=TU_HOST_MYSQL
DB_PORT=3306
DB_USER=TU_USUARIO_MYSQL
DB_PASSWORD=TU_PASSWORD_MYSQL
DB_NAME=tienda_variedades
JWT_SECRET=GENERA_UN_SECRETO_LARGO_Y_PRIVADO
JWT_EXPIRES_IN=2h
WHATSAPP_OWNER_NUMBER=503XXXXXXXX
FRONTEND_URL=https://TU_DOMINIO_FRONTEND
RESERVATION_MINUTES=30
```

Si se usara Wompi:

```env
WOMPI_CLIENT_ID=
WOMPI_CLIENT_SECRET=
WOMPI_API_SECRET=
WOMPI_TOKEN_URL=https://id.wompi.sv/connect/token
WOMPI_API_URL=https://api.wompi.sv
WOMPI_REDIRECT_URL=https://TU_DOMINIO_FRONTEND/cart
WOMPI_WEBHOOK_URL=https://TU_DOMINIO_BACKEND/api/wompi/webhook
```

## Variables de produccion del frontend

Antes de compilar o en el panel del hosting:

```env
REACT_APP_API_URL=https://TU_DOMINIO_BACKEND/api
```

## Comandos

Frontend:

```bash
npm install
npm run build
```

Backend:

```bash
cd backend
npm install
npm start
```

## Base de datos

1. Crear una base MySQL llamada `tienda_variedades`.
2. Importar `backend/database.sql`.
3. Si la base ya existia y queres actualizar el catalogo:

```bash
cd backend
node seed.js
```

## Seguridad antes de publicar

- Cambiar `WHATSAPP_OWNER_NUMBER`.
- Cambiar la clave del admin inicial `admin@tienda.com`.
- Usar `JWT_SECRET` largo y aleatorio.
- Usar HTTPS en frontend y backend.
- Configurar `FRONTEND_URL` exactamente igual al dominio publico del frontend.
- No subir archivos `.env` reales al repositorio.

## Prueba final

- Abrir frontend.
- Confirmar que cargan productos e imagenes.
- Crear un pedido y verificar que abre WhatsApp.
- Entrar al panel admin.
- Editar un producto.
- Confirmar/cancelar un pedido.
