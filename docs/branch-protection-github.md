# Configuracion recomendada de Branch Protection (GitHub)

Aplicar reglas a las ramas:

- develop
- qa
- preprod
- main

## 1) Ruta en GitHub

1. Entrar al repositorio en GitHub.
2. Ir a Settings.
3. Seleccionar Branches.
4. En Branch protection rules, crear una regla por cada rama.

## 2) Opciones recomendadas por regla

Marcar:

- Require a pull request before merging
- Require approvals (minimo 1)
- Dismiss stale pull request approvals when new commits are pushed
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Require conversation resolution before merging
- Do not allow bypassing the above settings
- Restrict who can push to matching branches (ideal: solo administradores o nadie)

## 3) Checks sugeridos a exigir

- Gitflow Guard / validate-flow
- Playwright E2E / e2e
- CD Container / build-and-push (solo para qa y main)

## 4) Politica de merges sugerida

- develop: permitir squash merge
- qa: squash o merge commit
- preprod: merge commit
- main: merge commit (historial de entregas claro)

## 5) Secuencia oficial

1. feature/* -> develop
2. develop -> qa
3. qa -> preprod
4. preprod -> main

No permitir PR directos a main desde feature/*.
