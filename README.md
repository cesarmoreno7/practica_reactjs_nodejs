# API REST - Práctica Node.js + React

API REST desarrollada con Node.js, Express y MongoDB para la gestión de usuarios y tipos de usuario. Incluye autenticación basada en JWT, rate limiting, logging y un interfaz completa en React + Material UI que se puede servir desde el mismo servidor Express en producción.

## Características principales

- CRUD completo para `usuario` y `tipo_usuario` con validaciones, conteos automáticos y relaciones manejadas por Mongoose.
- Autenticación con JWT (`/api/usuario/authenticate`), almacenamiento seguro del token en el cliente y middleware que protege todas las rutas sensibles.
- Rate limiting segmentado (`general`, `auth` y `write`) para evitar abusos de la API.
- Frontend SPA creado con React + Vite + Material UI; en producción se construye y se sirve desde `client/dist`, en desarrollo Vite proxya las llamadas a `/api`.
- Scripts para construir y desplegar todo el stack: servidor, cliente y pruebas con Jest + Supertest.

## Modelos y colecciones

### `tipo_usuario`

- `cod_tipo_usu` (Number, auto incremental, clave única)
- `descripcion` (String, requerida)

### `usuario`

- `codigo_usu` (Number, auto incremental, clave primaria)
- `cod_tipo_usu` (Number, referencia al tipo de usuario)
- `clave` (String, hash con bcrypt)
- `estado` (Number, 0 inactivo / 1 activo)
- `nombre`, `apellido` (String, obligatorios)
- `timestamps` automáticos (`createdAt`, `updatedAt`)

Los modelos son responsables de las operaciones de creación, búsqueda, actualización y eliminación; el controlador transforma los documentos a DTOs limpios antes de enviarlos al cliente.

## Tecnología

- Node.js + Express.js
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Seguridad: bcryptjs, express-rate-limit, CORS, Winston
- Frontend: React 19, React Router 7, Material UI, Vite
- Axios con interceptores para enviar el token y renovar la sesión del usuario

## Configuración y ejecución

### 1. Instalar dependencias

```bash
npm install
npm --prefix client install
```

### 2. Variables de entorno

Copiar `.env` y definir los valores mínimos:

```env
MONGODB_URI=mongodb://localhost:27017/practica_nodejs
PORT=3001
NODE_ENV=development
JWT_SECRET=tu_clave_secreta_muy_segura_para_jwt_2024
JWT_EXPIRES_IN=24h
VITE_API_BASE_URL=/api
```

- `VITE_API_BASE_URL` es opcional; sirve para cambiar la URL base desde el cliente en caso de desplegar la API y la UI en dominios diferentes. Por defecto apunta a `/api`, lo que permite servir la UI y la API desde el mismo host en producción.

### 3. Ejecutar el servidor en desarrollo

```bash
npm run dev
```

Usa `nodemon` para recargar automáticamente. Todas las rutas `/api/*` están protegidas por el middleware JWT y rate limiting.

### 4. Ejecutar el frontend en desarrollo

```bash
npm run dev --prefix client
```

Vite arranca el servidor de desarrollo en `http://localhost:5173` y proxya `/api` al backend configurado en el archivo `client/vite.config.js`.

### 5. Modo producción (una sola línea)

```bash
npm run start:prod
```

Este script construye el cliente (`npm run build --prefix client`), fija `NODE_ENV=production` mediante `cross-env` y arranca el servidor Express. El directorio `client/dist` se sirve como archivos estáticos y la SPA maneja las rutas desde el mismo dominio.

### 6. Pruebas

```bash
npm test
npm run test:watch
npm run test:coverage
npx playwright install chromium
npm run test:e2e
npm run test:e2e:report
npm run report:e2e:steps
```

- El reporte visual de Playwright se genera en `playwright-report/html`.
- El informe pedagógico paso a paso se genera en `playwright-report/paso-a-paso.md`.
- La guía para replicar la práctica con aprendices está en `docs/playwright-guia-practica.md`.

### 7. Integración continua (CI) para E2E

Se agregó el workflow de GitHub Actions en `.github/workflows/playwright-e2e.yml`.

Este flujo:

- Instala dependencias del proyecto raíz y del cliente.
- Instala Chromium de Playwright en el runner.
- Ejecuta `npm run test:e2e:full`.
- Se puede lanzar manualmente desde GitHub Actions (`workflow_dispatch`).
- Publica artefactos con el reporte HTML y el informe paso a paso.

Artefactos generados en cada ejecución:

- `playwright-html-report`
- `playwright-step-report`
- `playwright-test-results`

### 8. CD Docker sin entorno local

Se agregó un flujo de CD en `.github/workflows/cd-container.yml` que construye y publica la imagen Docker en GitHub Container Registry (GHCR) usando runners de GitHub (sin Docker Desktop local).

Ramas con despliegue de imagen:

- `preprod` publica tag `preprod`
- `main` publica tag `latest`
- ambas publican un tag por hash corto (`sha`)

Imagen resultante:

- `ghcr.io/cesarmoreno7/practica_reactjs_nodejs`

Variables de entorno necesarias para ejecutar el contenedor:

- `PORT` (ejemplo: `3000`)
- `MYSQL_HOST`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

## JWT y autenticación

- `POST /api/usuario/authenticate` recibe `{ codigo_usu, clave }` y retorna `{ user, token }`.
- El token se firma con `process.env.JWT_SECRET` y expira según `JWT_EXPIRES_IN`.
- El middleware `authenticateToken` valida el token en cada solicitud protegida.
- En el cliente, Axios guarda el token en `localStorage`, lo reinyecta en el encabezado `Authorization` y redirige al login si recibe `401`.

## Frontend React + Material UI

- SPA basada en `client/src/App.jsx`, con rutas públicas (`/login`) y protegidas (`/`, `/usuarios`, `/tipos-usuario`).
- El layout verifica `localStorage.user` y muestra menú lateral, barra superior y botones de logout.
- Los formularios (`UsuarioForm`, `TipoUsuarioForm`) interactúan con el `usuarioAPI` y `tipoUsuarioAPI` definidos en `client/src/services/api.js`. Axios usa interceptores para adjuntar el token y manejar errores.
- El login almacena `user` y `token`, así como el mensaje de error en caso de credenciales inválidas.
- En producción la carpeta `client/dist` se sirve mediante `express.static` y una fallback route (`app.get('*')`) carga `index.html` para cualquier ruta que no sea `/api/*`.

## API principal (/api)

### Tipos de usuario (`/api/tipo-usuario`)

- `GET /` – Lista paginada
- `GET /:cod_tipo_usu` – Obtener uno
- `GET /search/:term` – Búsqueda por descripción
- `POST /` – Crear nuevo (requiere JWT)
- `PUT /:cod_tipo_usu` – Actualizar (requiere JWT)
- `DELETE /:cod_tipo_usu` – Eliminar (requiere JWT y que no tenga usuarios asociados)

### Usuarios (`/api/usuario`)

- `GET /` – Lista paginada con relación a tipo de usuario
- `GET /:codigo_usu` – Obtener uno
- `GET /tipo/:cod_tipo_usu` – Filtrar por tipo
- `GET /estado/:estado` – Filtrar por estado
- `GET /search/:term` – Búsqueda por nombre/apellido
- `POST /authenticate` – Login y emisión de token
- `POST /` – Crear usuario (requiere JWT)
- `PUT /:codigo_usu` – Actualizar (requiere JWT)
- `DELETE /:codigo_usu` – Eliminar (requiere JWT)

Todas las rutas (excepto `/authenticate`) están protegidas y limitadas para evitar abusos. Las respuestas siguen la estructura `{ success, message, data?, error? }`.

## Próximos pasos sugeridos

1. Integrar estas pruebas E2E en CI para ejecutarlas en cada pull request.
2. Documentar la API con Swagger/OpenAPI y exponerla en producción.
3. Desplegar en un host que sirva MongoDB Atlas + backend + frontend (Vercel/Render) con variables de entorno seguras.
