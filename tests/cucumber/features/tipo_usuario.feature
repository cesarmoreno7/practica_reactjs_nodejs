Feature: Gestion de tipos de usuario
  Como administrador
  Quiero gestionar tipos de usuario
  Para organizar permisos

  Scenario: CRUD de tipo de usuario
    Given I am authenticated as a valid user
    When I create a tipo de usuario with descripcion "Administrador"
    Then the response status should be 201
    When I list tipos de usuario
    Then the response status should be 200
    And the response should contain tipo de usuario "Administrador"
    When I update the tipo de usuario descripcion to "Supervisor"
    Then the response status should be 200
    And the response should contain tipo de usuario "Supervisor"
    When I delete the tipo de usuario
    Then the response status should be 200
