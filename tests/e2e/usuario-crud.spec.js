const { test, expect } = require('@playwright/test');

const sessionUser = {
  codigo_usu: 900,
  nombre: 'Instructor',
  apellido: 'SENA',
  cod_tipo_usu: 1,
  estado: 1,
};

async function mockUsuarioCrudApi(page) {
  const tipos = [
    { cod_tipo_usu: 1, descripcion: 'Administrador' },
    { cod_tipo_usu: 2, descripcion: 'Aprendiz' },
  ];

  const usuarios = [
    {
      codigo_usu: 201,
      cod_tipo_usu: 1,
      clave: '***',
      estado: 1,
      nombre: 'Laura',
      apellido: 'Diaz',
    },
    {
      codigo_usu: 202,
      cod_tipo_usu: 2,
      clave: '***',
      estado: 1,
      nombre: 'Pedro',
      apellido: 'Suarez',
    },
  ];

  await page.route('**/api/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();

    if (path === '/api/tipo-usuario' && method === 'GET') {
      const pageParam = url.searchParams.get('page');
      const limitParam = url.searchParams.get('limit');

      if (pageParam || limitParam) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: tipos,
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalItems: tipos.length,
            },
          }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(tipos),
      });
    }

    if (path === '/api/usuario' && method === 'GET') {
      const pageParam = url.searchParams.get('page');
      const limitParam = url.searchParams.get('limit');

      if (pageParam || limitParam) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: usuarios,
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalItems: usuarios.length,
            },
          }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(usuarios),
      });
    }

    if (path === '/api/usuario' && method === 'POST') {
      const payload = req.postDataJSON();
      const nextId = Math.max(...usuarios.map((item) => item.codigo_usu)) + 1;
      const created = {
        codigo_usu: nextId,
        ...payload,
      };
      usuarios.push(created);

      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(created),
      });
    }

    if (path.startsWith('/api/usuario/') && method === 'GET') {
      const id = Number(path.split('/').pop());
      const found = usuarios.find((item) => item.codigo_usu === id);

      if (!found) {
        return route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Usuario no encontrado' }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(found),
      });
    }

    if (path.startsWith('/api/usuario/') && method === 'PUT') {
      const id = Number(path.split('/').pop());
      const payload = req.postDataJSON();
      const found = usuarios.find((item) => item.codigo_usu === id);

      if (!found) {
        return route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Usuario no encontrado' }),
        });
      }

      Object.assign(found, payload);

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(found),
      });
    }

    if (path.startsWith('/api/usuario/') && method === 'DELETE') {
      const id = Number(path.split('/').pop());
      const index = usuarios.findIndex((item) => item.codigo_usu === id);

      if (index === -1) {
        return route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Usuario no encontrado' }),
        });
      }

      usuarios.splice(index, 1);

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

test.describe('Flujo E2E CRUD de usuarios', () => {
  test.beforeEach(async ({ page }) => {
    await mockUsuarioCrudApi(page);

    await page.addInitScript((user) => {
      localStorage.setItem('token', 'token-playwright-demo');
      localStorage.setItem('user', JSON.stringify(user));
    }, sessionUser);
  });

  test('crea, edita y elimina un usuario', async ({ page }) => {
    await test.step('Abrir listado de usuarios con sesion activa', async () => {
      await page.goto('/usuarios');
      await expect(page.getByRole('heading', { name: 'Usuarios' })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'Laura', exact: true })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'Pedro', exact: true })).toBeVisible();
    });

    await test.step('Crear un nuevo usuario con tipo Aprendiz', async () => {
      await page.getByRole('button', { name: 'Nuevo Usuario' }).click();
      await expect(page.getByRole('heading', { name: 'Nuevo Usuario' })).toBeVisible();

      await page.locator('div.MuiSelect-select').first().click();
      await page.getByRole('option', { name: 'Aprendiz' }).click();
      await page.getByLabel('Nombre').fill('Nora');
      await page.getByLabel('Apellido').fill('Mendez');
      await page.getByLabel(/Contrasena|Contraseña/i).fill('12345');
      await page.getByRole('button', { name: 'Guardar' }).click();

      await expect(page.getByText('Usuario creado exitosamente')).toBeVisible();
      await expect(page).toHaveURL('/usuarios');
      await expect(page.getByRole('cell', { name: 'Nora', exact: true })).toBeVisible();
    });

    await test.step('Editar usuario Pedro y validar cambios', async () => {
      const pedroRow = page.getByRole('row', { name: /Pedro/ });
      await pedroRow.getByRole('button').first().click();
      await expect(page.getByRole('heading', { name: 'Editar Usuario' })).toBeVisible();

      await page.getByLabel('Apellido').fill('Suarez Actualizado');
      await page.getByRole('button', { name: 'Guardar' }).click();

      await expect(page.getByText('Usuario actualizado exitosamente')).toBeVisible();
      await expect(page).toHaveURL('/usuarios');
      await expect(page.getByRole('cell', { name: 'Suarez Actualizado', exact: true })).toBeVisible();
    });

    await test.step('Eliminar usuario Nora y confirmar que desaparece', async () => {
      const noraRow = page.getByRole('row', { name: /Nora/ });
      await noraRow.getByRole('button').nth(1).click();
      await page.getByRole('button', { name: 'Eliminar' }).click();
      await expect(page.getByRole('cell', { name: 'Nora', exact: true })).not.toBeVisible();
    });
  });
});
