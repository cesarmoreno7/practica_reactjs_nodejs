process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../../server');

class ApiWorld {
  constructor() {
    this.request = request(app);
    this.response = null;
    this.token = null;
    this.tipoUsuarioId = null;
    this.usuarioId = null;
  }
}

module.exports = { ApiWorld };
