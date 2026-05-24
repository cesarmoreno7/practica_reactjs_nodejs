# Guia practica: automatizacion con Playwright

Este documento explica como ejecutar y replicar las pruebas E2E creadas para el proyecto.

## 1) Que se automatizo

Se automatizaron cinco procesos del frontend:

1. Redireccion al login cuando no existe sesion.
2. Login fallido con mensaje de error.
3. Login exitoso, carga de dashboard y navegacion al modulo de usuarios con filtro.
4. CRUD completo de tipos de usuario (crear, editar y eliminar).
5. CRUD completo de usuarios (crear, editar y eliminar).

## 2) Archivos principales

- playwright.config.js
- tests/e2e/auth-and-navigation.spec.js
- tests/e2e/tipo-usuario-crud.spec.js
- tests/e2e/usuario-crud.spec.js
- scripts/generate-playwright-step-report.js

## 3) Instalacion inicial

Desde la raiz del proyecto:

```bash
npm install
npx playwright install chromium
```

## 4) Ejecucion de pruebas

```bash
npm run test:e2e
```

Resultado esperado:

- Se genera reporte HTML en playwright-report/html
- Se genera reporte JSON en playwright-report/results.json

## 5) Generar informe paso a paso

```bash
npm run report:e2e:steps
```

Resultado esperado:

- Se genera archivo Markdown en playwright-report/paso-a-paso.md

## 6) Flujo completo en un solo comando

```bash
npm run test:e2e:full
```

Este comando ejecuta pruebas y luego crea el informe paso a paso.

## 7) Como explicar la practica a aprendices

1. Mostrar el archivo tests/e2e/auth-and-navigation.spec.js.
2. Mostrar el archivo tests/e2e/tipo-usuario-crud.spec.js.
3. Mostrar el archivo tests/e2e/usuario-crud.spec.js.
4. Identificar cada bloque test.step(...).
5. Ejecutar npm run test:e2e:full.
6. Abrir reporte visual con npm run test:e2e:report.
7. Revisar playwright-report/paso-a-paso.md y relacionar cada paso con acciones reales en UI.

## 8) Nota tecnica importante

Las pruebas usan mocks de API para el aprendizaje:

- No dependen de base de datos.
- No dependen de datos reales del backend.
- Se enfocan en validar flujo de interfaz y navegacion.

Si luego deseas pruebas integradas reales, puedes quitar los mocks y levantar backend + base de datos en paralelo.

## 9) Ejecucion automatica en GitHub Actions

Se creó el workflow:

- .github/workflows/playwright-e2e.yml

Disparadores configurados:

- push a ramas main, preprod, develop o qa
- pull request hacia ramas main, preprod, develop o qa
- ejecucion manual desde la pestaña Actions (`workflow_dispatch`)

El pipeline realiza:

1. Instalacion de dependencias del proyecto y del cliente.
2. Instalacion de navegador Chromium de Playwright.
3. Ejecucion de npm run test:e2e:full.
4. Publicacion de artefactos de reporte.

Artefactos esperados:

- playwright-html-report
- playwright-step-report
- playwright-test-results

## 10) Flujo recomendado de promociones

Secuencia de ramas para cambios funcionales:

1. develop (desarrollo y ajuste)
2. qa (validacion funcional)
3. preprod (validacion final previa)
4. main (entrega)

Comandos base del flujo:

1. `git switch develop`
2. realizar cambios + commit + `git push origin develop`
3. `git switch qa && git merge --ff-only develop && git push origin qa`
4. `git switch preprod && git merge --ff-only qa && git push origin preprod`
5. `git switch main && git merge --ff-only preprod && git push origin main`

Para trabajo colaborativo de varios aprendices sobre el mismo artefacto, usar la guía específica:

- `docs/gitflow-colaborativo-desde-qa.md`

## 11) CD cloud sin Docker local

Para construir contenedor sin Docker Desktop local:

1. Hacer push a `preprod` o `main`.
2. GitHub Actions ejecuta `.github/workflows/cd-container.yml`.
3. La imagen se publica en GHCR con tags por rama y por commit.

Tags de publicación:

- rama `preprod` -> tag `preprod`
- rama `main` -> tag `latest`
- ambas ramas -> tag `sha-<commit>`

Referencia de imagen:

- `ghcr.io/cesarmoreno7/practica_reactjs_nodejs`

Opciones de despliegue web/cloud recomendadas:

- Render (Docker Image)
- Railway (Deploy from image)
- Fly.io (deploy desde GHCR)
- Azure Container Apps / AWS App Runner

Variables mínimas para ejecutar la app en contenedor:

- `PORT=3000`
- `MYSQL_HOST`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN=24h`

## 12) Activacion de deploy automatico en Render (gratis)

1. Crear cuenta en Render (plan free).
2. Crear servicio `preprod` desde imagen GHCR:
	- `ghcr.io/cesarmoreno7/practica_reactjs_nodejs:preprod`
3. Crear servicio `main` desde imagen GHCR:
	- `ghcr.io/cesarmoreno7/practica_reactjs_nodejs:latest`
4. Configurar variables de entorno en ambos servicios.
5. Copiar Deploy Hook URL de cada servicio (Settings -> Deploy Hook).
6. En GitHub -> Settings -> Secrets and variables -> Actions, crear:
	- `RENDER_DEPLOY_HOOK_PREPROD`
	- `RENDER_DEPLOY_HOOK_MAIN`
7. Hacer push a `preprod` y validar despliegue automático en servicio de preproducción.
8. Promover a `main` y validar despliegue automático en servicio productivo.

Nota: el workflow `.github/workflows/cd-container.yml` ya incluye el disparo automático por Deploy Hook para ambos ambientes.
