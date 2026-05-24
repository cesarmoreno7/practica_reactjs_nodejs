## Resumen

Describe brevemente que cambia este PR.

## Tipo de cambio

- [ ] feature
- [ ] bugfix
- [ ] chore
- [ ] docs
- [ ] hotfix
- [ ] release

## Flujo Gitflow

- Rama origen: <!-- ejemplo: feature/equipo1-login, develop, qa, preprod -->
- Rama destino: <!-- ejemplo: develop, qa, preprod, main -->

Reglas esperadas:

- feature/bugfix/chore/docs/refactor/hotfix -> develop
- develop -> qa
- qa o release/* -> preprod
- preprod o hotfix/* -> main

## Checklist general

- [ ] Código compilando y sin errores
- [ ] Convenciones del proyecto respetadas
- [ ] Documentación actualizada (si aplica)

## Checklist QA (obligatorio en promociones)

- [ ] `npm run test:e2e` en verde local o en CI
- [ ] Artefactos Playwright revisados en Actions
- [ ] Flujo funcional validado por otro aprendiz

## Evidencia

Incluye capturas, enlaces a runs de Actions o notas de validación.
