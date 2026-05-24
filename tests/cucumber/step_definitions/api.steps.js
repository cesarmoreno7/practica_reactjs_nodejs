const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert/strict');
const Usuario = require('../../../models/Usuario');
const TipoUsuario = require('../../../models/TipoUsuario');

const sendRequest = async (world, method, path, body, useAuth = true) => {
  let request = world.request[method](path);
  if (useAuth && world.token) {
    request = request.set('Authorization', `Bearer ${world.token}`);
  }
  if (body) {
    request = request.send(body);
  }
  world.response = await request;
};

const seedAuthenticatedUser = async (world) => {
  const tipo = await TipoUsuario.create({ descripcion: 'Base' });
  const usuario = await Usuario.create({
    cod_tipo_usu: tipo.cod_tipo_usu,
    clave: 'test123',
    estado: 1,
    nombre: 'Test',
    apellido: 'User'
  });

  world.usuarioId = usuario.codigo_usu;
  world.tipoUsuarioId = tipo.cod_tipo_usu;

  await sendRequest(world, 'post', '/api/usuario/authenticate', {
    codigo_usu: world.usuarioId,
    clave: 'test123'
  }, false);

  assert.equal(world.response.status, 200);
  world.token = world.response.body.data.token;
};

Given('a valid user exists', async function() {
  const tipo = await TipoUsuario.create({ descripcion: 'Administrador' });
  const usuario = await Usuario.create({
    cod_tipo_usu: tipo.cod_tipo_usu,
    clave: 'test123',
    estado: 1,
    nombre: 'Test',
    apellido: 'User'
  });
  this.usuarioId = usuario.codigo_usu;
});

Given('I am authenticated as a valid user', async function() {
  await seedAuthenticatedUser(this);
});

Given('a tipo de usuario exists with descripcion {string}', async function(descripcion) {
  const tipo = await TipoUsuario.create({ descripcion });
  this.tipoUsuarioId = tipo.cod_tipo_usu;
});

When('I authenticate with valid credentials', async function() {
  await sendRequest(this, 'post', '/api/usuario/authenticate', {
    codigo_usu: this.usuarioId,
    clave: 'test123'
  }, false);
});

When('I create a tipo de usuario with descripcion {string}', async function(descripcion) {
  await sendRequest(this, 'post', '/api/tipo-usuario', { descripcion });
  if (this.response.body && this.response.body.data) {
    this.tipoUsuarioId = this.response.body.data.cod_tipo_usu;
  }
});

When('I list tipos de usuario', async function() {
  await sendRequest(this, 'get', '/api/tipo-usuario');
});

When('I update the tipo de usuario descripcion to {string}', async function(descripcion) {
  await sendRequest(this, 'put', `/api/tipo-usuario/${this.tipoUsuarioId}`, { descripcion });
});

When('I delete the tipo de usuario', async function() {
  await sendRequest(this, 'delete', `/api/tipo-usuario/${this.tipoUsuarioId}`);
});

When('I create a usuario with nombre {string} apellido {string} clave {string} estado {int}', async function(nombre, apellido, clave, estado) {
  assert.ok(this.tipoUsuarioId, 'tipoUsuarioId is required before creating usuario');
  await sendRequest(this, 'post', '/api/usuario', {
    cod_tipo_usu: this.tipoUsuarioId,
    clave,
    estado,
    nombre,
    apellido
  });

  if (this.response.body && this.response.body.data) {
    this.usuarioId = this.response.body.data.codigo_usu;
  }
});

When('I fetch that usuario', async function() {
  await sendRequest(this, 'get', `/api/usuario/${this.usuarioId}`);
});

When('I update the usuario nombre to {string}', async function(nombre) {
  await sendRequest(this, 'put', `/api/usuario/${this.usuarioId}`, { nombre });
});

When('I delete the usuario', async function() {
  await sendRequest(this, 'delete', `/api/usuario/${this.usuarioId}`);
});

Then('the response status should be {int}', function(status) {
  assert.equal(this.response.status, status);
});

Then('the response should include a token', function() {
  assert.ok(this.response.body.data);
  assert.ok(this.response.body.data.token);
});

Then('the response should contain tipo de usuario {string}', function(descripcion) {
  const data = this.response.body.data || [];
  const found = Array.isArray(data)
    ? data.some(item => item.descripcion === descripcion)
    : data.descripcion === descripcion;
  assert.ok(found);
});

Then('the response should contain usuario nombre {string}', function(nombre) {
  const data = this.response.body.data || {};
  assert.equal(data.nombre, nombre);
});
