const { test, expect } = require('@playwright/test');

const mockUser = {
  codigo_usu: 101,
  nombre: 'Ana',
  apellido: 'Rojas',
  cod_tipo_usu: 1,
  estado: 1,
};

const usuarios = [
  mockUser,
  {
    codigo_usu: 102,
    nombre: 'Carlos',
    apellido: 'Perez',
    cod_tipo_usu: 2,
    estado: 0,
  },
];

const tiposUsuario = [
  { cod_tipo_usu: 1, descripcion: 'Administrador' },
  { cod_tipo_usu: 2, descripcion: 'Aprendiz' },
];

async function mockApi(page, { allowLogin }) {
  await page.route('**/api/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const pathname = url.pathname;
    const method = req.method();

    if (pathname === '/api/usuario/authenticate' && method === 'POST') {
      if (!allowLogin) {
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Credenciales incorrectas',
          }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: mockUser,
            token: 'token-playwright-demo',
          },
        }),
      });
    }

    if (pathname === '/api/usuario' && method === 'GET') {
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

    if (pathname === '/api/tipo-usuario' && method === 'GET') {
      const pageParam = url.searchParams.get('page');
      const limitParam = url.searchParams.get('limit');

      if (pageParam || limitParam) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: tiposUsuario,
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalItems: tiposUsuario.length,
            },
          }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(tiposUsuario),
      });
    }

    return route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Mock no definido para esta ruta' }),
    });
  });
}

test.describe('Flujos E2E de autenticacion y navegacion', () => {
  test('redirecciona a login cuando no hay sesion', async ({ page }) => {
    await test.step('Abrir la raiz sin token', async () => {
      await page.goto('/');
    });

    await test.step('Verificar redireccion al formulario de inicio de sesion', async () => {
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole('heading', { name: /Iniciar Sesion|Iniciar Sesión/i })).toBeVisible();
    });
  });

  test('muestra error cuando el login falla', async ({ page }) => {
    await test.step('Configurar mock de API para responder error en autenticacion', async () => {
      await mockApi(page, { allowLogin: false });
    });

    await test.step('Enviar credenciales invalidas desde el formulario', async () => {
      await page.goto('/login');
      await page.locator('#codigo_usu').fill('999');
      await page.locator('#clave').fill('incorrecta');
      await page.getByRole('button', { name: /Iniciar Sesion|Iniciar Sesión/i }).click();
    });

    await test.step('Confirmar mensaje de error para el usuario', async () => {
      await expect(page.getByText('Credenciales incorrectas o usuario inactivo')).toBeVisible();
    });
  });

  test('permite iniciar sesion y navegar al modulo de usuarios', async ({ page }) => {
    await test.step('Configurar mocks para autenticacion y datos del dashboard', async () => {
      await mockApi(page, { allowLogin: true });
    });

    await test.step('Autenticar usuario desde la pantalla de login', async () => {
      await page.goto('/login');
      await page.locator('#codigo_usu').fill(String(mockUser.codigo_usu));
      await page.locator('#clave').fill('12345');
      await page.getByRole('button', { name: /Iniciar Sesion|Iniciar Sesión/i }).click();
    });

    await test.step('Validar que el dashboard muestra estadisticas basicas', async () => {
      await expect(page).toHaveURL('/');
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
      await expect(page.getByText('Total Usuarios')).toBeVisible();
      await expect(page.getByRole('heading', { name: '2' }).first()).toBeVisible();
    });

    await test.step('Navegar al modulo de usuarios y usar filtro de busqueda', async () => {
      await page.getByRole('button', { name: 'Usuarios' }).click();
      await expect(page.getByRole('heading', { name: 'Usuarios' })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'Ana', exact: true })).toBeVisible();
      await page.getByPlaceholder('Buscar por nombre o apellido...').fill('Ana');
      await expect(page.getByRole('cell', { name: 'Carlos', exact: true })).not.toBeVisible();
    });
  });
});
