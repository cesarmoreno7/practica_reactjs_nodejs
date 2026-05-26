# Proceso CI/CD desde develop hasta main con Render

Esta guia documenta el flujo completo aplicado en este repositorio para pasar cambios desde `develop` hasta `main`, con pruebas automatizadas en CI, construccion de imagen Docker en GHCR y despliegue automatico en Render.

## 1. Objetivo del flujo

- Garantizar calidad tecnica antes de llegar a `main`.
- Separar validaciones por ambiente (`qa`, `preprod`, `main`).
- Evitar dependencias de Docker local usando GitHub Actions + GHCR.
- Automatizar despliegues en Render por rama.

## 2. Ramas y responsabilidad

- `develop`: integracion de cambios de desarrollo.
- `qa`: validacion funcional y E2E.
- `preprod`: validacion final antes de produccion.
- `main`: produccion.

Promocion recomendada:

1. `feature/*` -> `develop`
2. `develop` -> `qa`
3. `qa` -> `preprod`
4. `preprod` -> `main`

## 3. CI de pruebas (Playwright)

Archivo: `.github/workflows/playwright-e2e.yml`

Se ejecuta en `push` y `pull_request` para:

- `develop`
- `qa`
- `preprod`
- `main`

Pipeline CI:

1. Checkout del repo.
2. Setup Node 20.
3. `npm ci` (raiz).
4. `npm --prefix client ci` (frontend).
5. Instalacion de Chromium de Playwright.
6. Ejecucion `npm run test:e2e:full`.
7. Publicacion de artefactos:
   - `playwright-html-report`
   - `playwright-step-report`
   - `playwright-test-results`

## 4. CD de contenedor (GHCR + Render)

Archivo: `.github/workflows/cd-container.yml`

Se ejecuta en `push` para:

- `qa`
- `preprod`
- `main`

Comportamiento:

1. Construye imagen Docker multi-stage.
2. Publica en GHCR: `ghcr.io/cesarmoreno7/practica_reactjs_nodejs`.
3. Tags por rama:
   - `qa` -> `qa`
   - `preprod` -> `preprod`
   - `main` -> `latest`
   - adicional `sha-<commit>`
4. Dispara Deploy Hook de Render segun rama:
   - `RENDER_DEPLOY_HOOK_QA`
   - `RENDER_DEPLOY_HOOK_PREPROD`
   - `RENDER_DEPLOY_HOOK_MAIN`

## 5. Servicios Render creados

En este workspace se crearon 3 Web Services (Image deploy):

- `practica-reactjs-nodejs-qa` (tag `qa`)
- `practica-reactjs-nodejs-preprod` (tag `preprod`)
- `practica-reactjs-nodejs-main` (tag `latest`)

Cada servicio ya tiene Deploy Hook disponible en `Settings > Deploy`.

## 6. Estado actual del pipeline

- CI Playwright: activo para las 4 ramas.
- CD contenedor: activo para `qa`, `preprod`, `main`.
- Publicacion GHCR: validada.
- Render: servicios creados y conectados a imagen GHCR.

## 7. Pendientes para completar el flujo end-to-end

Aun faltan datos de runtime para que la app inicie correctamente en Render.

Variables pendientes por servicio (`Settings > Environment`):

- `MYSQL_HOST`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `JWT_SECRET`
- Opcional: `JWT_EXPIRES_IN=24h`

Variable ya configurada al crear servicios:

- `NODE_ENV=production`

Tambien debe verificarse en GitHub que existan los secretos:

- `RENDER_DEPLOY_HOOK_QA`
- `RENDER_DEPLOY_HOOK_PREPROD`
- `RENDER_DEPLOY_HOOK_MAIN`

Sin esas variables de base de datos y JWT, el deploy puede crear el servicio pero la app fallara al iniciar por error de conexion o configuracion.

## 8. Checklists operativos

Checklist para promover `develop` -> `qa`:

- CI Playwright en verde.
- Revisiones de PR completadas.
- Artefactos E2E revisados.

Checklist para promover `qa` -> `preprod`:

- Casos criticos validados.
- CD de `qa` correcto.
- Sin regresiones funcionales.

Checklist para promover `preprod` -> `main`:

- Smoke test en preprod aprobado.
- CD de `preprod` correcto.
- Aprobacion final de salida.

## 9. Riesgos conocidos

- Instancias free de Render hacen spin down por inactividad.
- GitHub Actions muestra advertencia de deprecacion de Node 20 para acciones JS; actualizar versiones de actions segun changelog oficial.

## 10. Resultado esperado al cerrar pendientes

Cuando se carguen variables de entorno y secretos faltantes:

- Push a `qa` -> imagen `qa` + deploy automatico QA.
- Push a `preprod` -> imagen `preprod` + deploy automatico preprod.
- Push a `main` -> imagen `latest` + deploy automatico produccion.

Con esto queda completado el flujo CI/CD de extremo a extremo desde `develop` hasta `main`.
