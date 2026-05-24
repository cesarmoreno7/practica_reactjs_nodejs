Feature: Gestion de usuarios
  Como administrador
  Quiero gestionar usuarios
  Para mantener el sistema actualizado

  Scenario: CRUD de usuario
    Given I am authenticated as a valid user
    And a tipo de usuario exists with descripcion "Empleado"
    When I create a usuario with nombre "Ana" apellido "Perez" clave "clave123" estado 1
    Then the response status should be 201
    When I fetch that usuario
    Then the response status should be 200
    And the response should contain usuario nombre "Ana"
    When I update the usuario nombre to "Ana Maria"
    Then the response status should be 200
    And the response should contain usuario nombre "Ana Maria"
    When I delete the usuario
    Then the response status should be 200
    When I fetch that usuario
    Then the response status should be 404
