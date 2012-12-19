require.config({
	shim: {
		'backbone': {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		}
	},
	paths: {
		jquery: 'lib/jquery-1.8.3',
		backbone: 'lib/Backbone',
		underscore: 'lib/underscore',
		backlash: '../backlash'
	}
});

require(['jquery', 'backbone', 'backlash'], function($, Backbone, Backlash){
	console.log(arguments);
});