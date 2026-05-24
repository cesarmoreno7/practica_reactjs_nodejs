Feature: Autenticacion de usuarios
  Como consumidor de la API
  Quiero autenticarme
  Para acceder a endpoints protegidos

  Scenario: Login exitoso con credenciales validas
    Given a valid user exists
    When I authenticate with valid credentials
    Then the response status should be 200
    And the response should include a token
