var pkg = require('../package.json');

var interfaceName = 'Stargate';

module.exports = {
	banner: '/*!\n' +
	    ' * StargateJS Apps\n' +
	    ' * v' + pkg.version +'\n' +
	    ' * Copyright 2015 DMobileLab. http://buongiorno.com/\n' +
	    ' * See LICENSE in this repository for license information\n' +
	    ' */\n',


	closureStart: '\n\n// Universal Module Definition - https://github.com/umdjs/umd/blob/master/templates/returnExports.js\n' +
		'/*global define, module */\n\n' +
        '(function (root, factory) {\n' +
    	'    if (typeof define === "function" && define.amd) {\n' +
        '        // AMD. Register as an anonymous module.\n' +
        '        define([], factory);\n' +
    	'    } else if (typeof module === "object" && module.exports) {\n' +
		'        // Node. Does not work with strict CommonJS, but\n' +
		'        // only CommonJS-like environments that support module.exports,\n' +
		'        // like Node.\n' +
		'        module.exports = factory();\n' +
		'    } else {\n' +
		'        // Browser globals (root is window)\n' +
		'        root.'+interfaceName+' = factory();\n' +
		'    }\n' +
		'}(this, function () {\n' +
		'    // Public interface\n' +
        '    var stargatePackageVersion = "'+pkg.version+'";\n' +
        '    var stargatePublic = {};\n' +
		'    /* global cordova */\n\n\n',

	closureEnd: '\n' +
 		'    // Just return a value to define the module export\n' +
    	'    return stargatePublic;\n' +
        '}));\n\n\n',


	
	version: pkg.version,

	dist: 'dist/',
	distBower: 'dist/bower/',
	build: 'build/',
	
	bowerAllIncludes: 'includes.bower.js',
	bowerFileList: [
		'bower_components/urijs/src/URI.js',
		'bower_components/urijs/src/URITemplate.js',
		'bower_components/q/q.js',
		'bower_components/aja/src/aja.js',
		'bower_components/cookies-js/dist/cookies.js'
	],

	testHeader: 'config/test.header.js',

	distFile: 'stargate.js',
    interfaceName: interfaceName
};