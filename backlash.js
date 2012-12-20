/**
 *
 */
define('backlash', ['underscore', 'backbone', 'jquery'], function(_, Backbone, $){
	var BindingView = Backbone.View.extend({
		constructor: function(){
			Backbone.View.prototype.constructor.apply(this, arguments);
		}
	});

	return BindingView;
});