const { test, expect } = require('@playwright/test');

const sessionUser = {
  codigo_usu: 900,
  nombre: 'Instructor',
  apellido: 'SENA',
  cod_tipo_usu: 1,
  estado: 1,
};

async function mockTipoUsuarioCrudApi(page) {
  const store = [
    { cod_tipo_usu: 1, descripcion: 'Administrador' },
    { cod_tipo_usu: 2, descripcion: 'Aprendiz' },
  ];

  await page.route('**/api/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();

    if (path === '/api/usuario' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([sessionUser]),
      });
    }

    if (path === '/api/tipo-usuario' && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(store),
      });
    }

    if (path === '/api/tipo-usuario' && method === 'POST') {
      const payload = req.postDataJSON();
      const nextId = Math.max(...store.map((item) => item.cod_tipo_usu)) + 1;
      const created = { cod_tipo_usu: nextId, descripcion: payload.descripcion };
      store.push(created);

      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(created),
      });
    }

    if (path.startsWith('/api/tipo-usuario/') && method === 'GET') {
      const id = Number(path.split('/').pop());
      const found = store.find((item) => item.cod_tipo_usu === id);

      if (!found) {
        return route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Tipo no encontrado' }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(found),
      });
    }

    if (path.startsWith('/api/tipo-usuario/') && method === 'PUT') {
      const id = Number(path.split('/').pop());
      const payload = req.postDataJSON();
      const found = store.find((item) => item.cod_tipo_usu === id);

      if (!found) {
        return route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Tipo no encontrado' }),
        });
      }

      found.descripcion = payload.descripcion;

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(found),
      });
    }

    if (path.startsWith('/api/tipo-usuario/') && method === 'DELETE') {
      const id = Number(path.split('/').pop());
      const index = store.findIndex((item) => item.cod_tipo_usu === id);

      if (index === -1) {
        return route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Tipo no encontrado' }),
        });
      }

      store.splice(index, 1);

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    }

    return route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Mock no definido para esta ruta' }),
    });
  });
}

test.describe('Flujo E2E CRUD de tipos de usuario', () => {
  test.beforeEach(async ({ page }) => {
    await mockTipoUsuarioCrudApi(page);

    await page.addInitScript((user) => {
      localStorage.setItem('token', 'token-playwright-demo');
      localStorage.setItem('user', JSON.stringify(user));
    }, sessionUser);
  });

  test('crea, edita y elimina un tipo de usuario', async ({ page }) => {
    await test.step('Abrir listado de tipos de usuario con sesion activa', async () => {
      await page.goto('/tipos-usuario');
      await expect(page.getByRole('heading', { name: 'Tipos de Usuario' })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'Administrador' })).toBeVisible();
    });

    await test.step('Crear un nuevo tipo de usuario desde el formulario', async () => {
      await page.getByRole('button', { name: 'Nuevo Tipo' }).click();
      await expect(page.getByRole('heading', { name: 'Nuevo Tipo de Usuario' })).toBeVisible();
      await page.getByLabel(/Descripcion|Descripción/i).fill('Coordinador');
      await page.getByRole('button', { name: 'Guardar' }).click();
      await expect(page.getByText('Tipo de usuario creado exitosamente')).toBeVisible();
      await expect(page).toHaveURL('/tipos-usuario');
      await expect(page.getByRole('cell', { name: 'Coordinador' })).toBeVisible();
    });

    await test.step('Editar el tipo Aprendiz y confirmar cambios en tabla', async () => {
      const aprendizRow = page.getByRole('row', { name: /Aprendiz/ });
      await aprendizRow.getByRole('button').first().click();
      await expect(page.getByRole('heading', { name: 'Editar Tipo de Usuario' })).toBeVisible();
      await page.getByLabel(/Descripcion|Descripción/i).fill('Aprendiz Etapa Productiva');
      await page.getByRole('button', { name: 'Guardar' }).click();
      await expect(page.getByText('Tipo de usuario actualizado exitosamente')).toBeVisible();
      await expect(page).toHaveURL('/tipos-usuario');
      await expect(page.getByRole('cell', { name: 'Aprendiz Etapa Productiva' })).toBeVisible();
    });

    await test.step('Eliminar el tipo Coordinador y validar que desaparece', async () => {
      const coordinadorRow = page.getByRole('row', { name: /Coordinador/ });
      await coordinadorRow.getByRole('button').nth(1).click();
      await page.getByRole('button', { name: 'Eliminar' }).click();
      await expect(page.getByRole('cell', { name: 'Coordinador' })).not.toBeVisible();
    });
  });
});
