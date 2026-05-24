const fs = require('fs');
const path = require('path');

const reportJsonPath = path.resolve(__dirname, '..', 'playwright-report', 'results.json');
const outputPath = path.resolve(__dirname, '..', 'playwright-report', 'paso-a-paso.md');

function collectTestsFromSuite(suite, acc) {
  if (suite.specs) {
    for (const spec of suite.specs) {
      for (const test of spec.tests || []) {
        acc.push({
          title: `${spec.title}`,
          location: spec.location,
          results: test.results || [],
        });
      }
    }
  }

  for (const child of suite.suites || []) {
    collectTestsFromSuite(child, acc);
  }
}

function flattenSteps(steps, depth = 0, acc = []) {
  for (const step of steps || []) {
    if (step.category === 'pw:api') {
      continue;
    }

    acc.push({
      title: step.title,
      duration: step.duration,
      error: step.error,
      depth,
    });

    if (step.steps && step.steps.length > 0) {
      flattenSteps(step.steps, depth + 1, acc);
    }
  }

  return acc;
}

function ms(value) {
  const n = typeof value === 'number' ? value : 0;
  return `${n} ms`;
}

function main() {
  if (!fs.existsSync(reportJsonPath)) {
    console.error('No se encontro el archivo de resultados de Playwright en:', reportJsonPath);
    console.error('Ejecuta primero: npm run test:e2e');
    process.exit(1);
  }

  const raw = fs.readFileSync(reportJsonPath, 'utf8');
  const json = JSON.parse(raw);

  const tests = [];
  for (const suite of json.suites || []) {
    collectTestsFromSuite(suite, tests);
  }

  const lines = [];
  lines.push('# Informe Paso a Paso de Playwright');
  lines.push('');
  lines.push(`Fecha de generacion: ${new Date().toISOString()}`);
  lines.push('');

  if (tests.length === 0) {
    lines.push('No se encontraron pruebas en el reporte JSON.');
  }

  tests.forEach((t, index) => {
    const latest = t.results[t.results.length - 1] || {};
    const status = latest.status || 'unknown';
    const duration = ms(latest.duration);
    const stepList = flattenSteps(latest.steps || []);

    lines.push(`## ${index + 1}. ${t.title}`);
    lines.push('');
    lines.push(`- Estado: ${status}`);
    lines.push(`- Duracion: ${duration}`);

    if (t.location && t.location.file) {
      lines.push(`- Archivo: ${t.location.file}:${t.location.line}`);
    }

    lines.push('');
    lines.push('### Pasos ejecutados');
    lines.push('');

    if (stepList.length === 0) {
      lines.push('1. (Sin pasos declarados con test.step)');
    } else {
      stepList.forEach((step, stepIndex) => {
        const indent = '  '.repeat(step.depth);
        const hasError = step.error ? ' - ERROR' : '';
        lines.push(`${stepIndex + 1}. ${indent}${step.title} (${ms(step.duration)})${hasError}`);
      });
    }

    if (latest.error) {
      lines.push('');
      lines.push('### Error');
      lines.push('');
      lines.push('```');
      lines.push(String(latest.error.message || latest.error));
      lines.push('```');
    }

    lines.push('');
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, lines.join('\n'));

  console.log('Informe generado en:', outputPath);
}

main();
