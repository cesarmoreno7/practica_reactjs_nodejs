module.exports = {
  default: {
    paths: ['tests/cucumber/features/**/*.feature'],
    require: [
      'tests/cucumber/support/**/*.js',
      'tests/cucumber/step_definitions/**/*.js'
    ],
    format: ['progress']
  }
};
