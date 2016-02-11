var buildConfig = require('./build.config.js');

module.exports = {
    files: [
        'spec/*.js',
        'node_modules/jasmine-ajax/lib/mock-ajax.js'
    ]
    .concat(buildConfig.bowerFileList)
    .concat(buildConfig.testHeader)
    .concat('src/**/*.js'),

    frameworks: ['jasmine'],
    reporters: ['mocha','coverage','coveralls'],

    preprocessors: {
      'src/**/*.js': ['coverage']
    },

    coverageReporter: {
        type : 'lcov',
        dir : 'coverage/'
    },

    port: 9876,
    colors: true,
    // possible values: 'OFF', 'ERROR', 'WARN', 'INFO', 'DEBUG'
    logLevel: 'INFO',
    autoWatch: true,
    captureTimeout: 60000,
    singleRun: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['Chrome']
};