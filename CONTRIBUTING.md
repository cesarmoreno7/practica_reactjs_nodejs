# Contributing Guide

Este proyecto usa un flujo colaborativo con Gitflow iniciado en QA.

## Branching model

- develop: integración diaria.
- qa: validación funcional.
- preprod: validación final.
- main: entrega aprobada.

## Ramas de trabajo permitidas

- feature/<equipo>-<tema>
- bugfix/<equipo>-<tema>
- chore/<equipo>-<tema>
- docs/<equipo>-<tema>
- refactor/<equipo>-<tema>
- hotfix/<equipo>-<tema>

## Flujo obligatorio de PR

1. feature/bugfix/chore/docs/refactor/hotfix -> develop
2. develop -> qa
3. qa o release/* -> preprod
4. preprod o hotfix/* -> main

El workflow de validación en PR (`Gitflow Guard`) bloqueará combinaciones fuera de estas reglas.

## Pasos para contribuir

1. Actualiza `develop`:

```bash
git switch develop
git pull origin develop
```

2. Crea tu rama de trabajo:

```bash
git switch -c feature/equipo1-mejora-login
```

3. Implementa cambios y valida pruebas:

```bash
npm run test:e2e
```

4. Haz commit con mensaje claro:

```bash
git add .
git commit -m "feat: mejora login"
```

5. Publica la rama y crea PR hacia `develop`:

```bash
git push -u origin feature/equipo1-mejora-login
```

## Checklist mínimo de PR

- Código sin errores de ejecución.
- Pruebas E2E en verde (local o CI).
- Plantilla de PR diligenciada.
- Revisión de al menos un compañero o líder.

## Referencias

- docs/gitflow-colaborativo-desde-qa.md
- docs/branch-protection-github.md
- .github/pull_request_template.md
- .github/CODEOWNERS
