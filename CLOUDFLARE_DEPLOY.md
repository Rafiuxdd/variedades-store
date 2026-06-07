# Deploy en Cloudflare Pages

## Frontend en Cloudflare Pages

1. Entra a Cloudflare Dashboard.
2. Ve a `Workers & Pages`.
3. Crea un proyecto de `Pages`.
4. Conecta el repositorio de GitHub `Rafiuxdd/variedades-store`.
5. Usa esta configuracion:

```text
Framework preset: Create React App
Build command: npm run build
Build output directory: build
Root directory: /
```

6. Agrega esta variable de entorno en Cloudflare Pages:

```text
REACT_APP_API_URL=https://TU-BACKEND-DE-RAILWAY.up.railway.app/api
```

Reemplaza `https://TU-BACKEND-DE-RAILWAY.up.railway.app` por la URL real del backend en Railway.

## Backend en Railway

En Railway, la variable `FRONTEND_URL` debe incluir el dominio de Cloudflare Pages:

```text
FRONTEND_URL=https://TU-PROYECTO.pages.dev
```

Si todavia quieres mantener Netlify mientras pruebas Cloudflare, puedes separar varios dominios con coma:

```text
FRONTEND_URL=https://TU-PROYECTO.pages.dev,https://variedades-store.netlify.app
```

## Verificacion

Prueba estas rutas:

```text
https://TU-BACKEND-DE-RAILWAY.up.railway.app/api/health
https://TU-PROYECTO.pages.dev
https://TU-PROYECTO.pages.dev/panel
```

El login del panel depende de que `REACT_APP_API_URL` apunte a Railway y que `FRONTEND_URL` en Railway incluya el dominio de Cloudflare.
