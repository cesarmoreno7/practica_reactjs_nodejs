# Guia paso a paso: Gitflow colaborativo iniciando en QA

Esta guia define un proceso de trabajo para varios aprendices sobre el mismo proyecto, con control de calidad por etapas.

## 1) Modelo de ramas

- develop: integracion diaria de trabajo de equipos.
- qa: validacion funcional (inicio formal del proceso de promocion).
- preprod: validacion final previa a entrega.
- main: entrega aprobada.

Ramas de trabajo por equipo:

- feature/<equipo>-<tema>
- bugfix/<equipo>-<tema>
- chore/<equipo>-<tema>
- docs/<equipo>-<tema>

## 2) Regla principal de promocion

Flujo obligatorio:

1. feature/bugfix/chore/docs -> develop
2. develop -> qa
3. qa -> preprod
4. preprod -> main

No hacer merges directos saltando etapas.

## 3) Paso a paso para aprendices (trabajo diario)

1. Sincronizar develop:

```bash
git switch develop
git pull origin develop
```

2. Crear rama de trabajo:

```bash
git switch -c feature/equipo1-login
```

3. Implementar cambios y validar local:

```bash
npm run test:e2e
```

4. Commit y push:

```bash
git add .
git commit -m "feat: mejora login equipo 1"
git push -u origin feature/equipo1-login
```

5. Crear Pull Request hacia develop.

## 4) Proceso desde QA (inicio de validacion por etapas)

Cuando develop queda estable:

1. Crear PR: develop -> qa
2. Validar en QA (funcional + reportes Playwright + deploy automático en Render si está configurado)
3. Si aprueba QA, crear PR: qa -> preprod
4. Validar smoke final en preprod
5. Si aprueba preprod, crear PR: preprod -> main
6. Crear tag de version en main (ejemplo v1.0.0)

Nota: en la configuración actual, Render despliega automáticamente desde `qa` y `main`. La rama `preprod` se mantiene como etapa de control funcional previa a la entrega final.

## 5) Checklist de aprobacion por etapa

Checklist en PR hacia qa:

- Pruebas E2E en verde
- Sin conflictos de merge
- Cambios funcionales revisados por otro aprendiz

Checklist en PR hacia preprod:

- Casos criticos ejecutados
- Validacion de flujo completo de negocio
- Sin errores de UI bloqueantes

Checklist en PR hacia main:

- Aprobacion docente/lider
- Evidencia de pruebas en artefactos
- Version lista para despliegue

## 6) Hotfix (incidente en main)

1. Crear rama hotfix desde main:

```bash
git switch main
git pull origin main
git switch -c hotfix/error-critico-login
```

2. Corregir, validar y abrir PR a main.
3. Despues de merge en main, promover el mismo fix a:

- develop
- qa
- preprod

## 7) Configuracion recomendada en GitHub

Configurar Branch protection rules:

- develop, qa, preprod, main

Recomendado activar:

- Require a pull request before merging
- Require approvals (minimo 1)
- Require status checks to pass
- Require branches to be up to date before merging
- Restrict who can push directly (ideal: nadie)

Archivos de apoyo en el repositorio:

- `CONTRIBUTING.md`
- `.github/pull_request_template.md`
- `.github/CODEOWNERS`
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `docs/branch-protection-github.md`

## 8) Evidencia de calidad automatizada

Playwright E2E corre en CI para:

- develop
- qa
- preprod
- main

Artefactos esperados:

- playwright-html-report
- playwright-step-report
- playwright-test-results
