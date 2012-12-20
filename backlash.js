/**
 *
 */
define('backlash', ['underscore', 'backbone', 'jquery'], function(_, Backbone, $){
	var BindingMapper = {
		parseBindings: function(){

		}
	};

	return Backbone.View.extend({
		constructor: function(){
			Backbone.View.prototype.constructor.apply(this, arguments);
			this._srcRender = this.render;
			this.render = this._render;
		},

		_render: function(){
			this._srcRender();
			this.setBindings();
			return this;
		},

		setBindings: function(){
			var bindings = BindingMapper.parseBindings();

			//Removes existing bindings
			//TODO: make this only remove backlash events
			this.stopListening(this.model);

			for(var binding in bindings){
				this.listenTo(model, 'change:'+binding.attr, this.renderFragment);
			}
		},

		renderFragment: function(){

		}
	});
});