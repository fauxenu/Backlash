/**
 * A simple library that attempts to bring Knockout style model-view
 * bindings to Backbone
 * 
 * @version 0.1.0
 */
(function (root, factory) {
	if(typeof exports === 'object') {
		var jquery = require('jquery'),
			underscore = require('underscore'),
			backbone = require('backbone');

		module.exports = factory(jquery, underscore, backbone);
	}
	else if(typeof define === 'function' && define.amd) {
		define(['jquery', 'underscore', 'backbone'], factory);
	}
}(this, function($, _, Backbone){
	var Backlash = (function(Backbone, _, $){		

		/**
		 * Adds 'binding' functions to bas Backbone.View. This makes
		 * them available to other Backbone frameworks that extend
		 * thhe base view object.
		 */
		_.extend(Backbone.View.prototype, {
		 	// Default bindings array; if overriden we limit the data-bindings to the
		 	// the names defined in this array
		 	bindings: [],

		 	/**
		 	 * Applies data binding to all elements in this view that have a
		 	 * 'bind' data attribute
		 	 */
		 	applyBindings: function() {
		 		var self = this;

		 		this.$el.find('*[data-bind]').each(function(){
		 			var binding =  $(this).attr('data-bind').split(':'),
		 				bindType = $.trim(binding[0]),
		 				attr = $.trim(binding[1]);	

		 			if(self.model.has(attr) && (!self.bindings.length 
		 					|| _.contains(self.bindings, attr))) {
		 				switch(bindType) {
		 					case 'text':
		 						var el = this;

		 						$(this).text(self.model.get(attr));
		 						self.listenTo(self.model, 'change:' + attr, function(model, value){
		 							self.renderFragment(el, value, bindType);
		 						});
		 						break;

		 					case 'checked':
		 						$(this).prop('checked', self.model.get(attr).toString() == this.value);
		 						$(this).off('click.BackLash').on('click.BackLash', function(){
		 							self.model.set(attr, this.value);
		 						});
		 						break;

		 					case 'value':
		 						$(this).val(self.model.get(attr));
		 						$(this).off('change.BackLash').on('change.BackLash', function(){
		 							self.model.set(attr, this.value);
		 						});
		 						break;
		 				}
		 			}
		 		});
		 	},

		 	/**
		 	 * Selectively renders a piece of a larger view
		 	 *
		 	 * @param {Object} el DOM element
		 	 * @param {String} value new element/attribute value
		 	 * @param {String} bindType the aspect of the passed el we are changing
		 	 */
			renderFragment: function(el, value, bindType) {
				if(bindType == 'text')
					$(el).text(value);
			}
		});
		
		/**
		 * Private object used to parse binding data attributes
		 * @private
		 *
		 * TODO: is this still needed?
		 */
		var BindingMapper = {
			/**
			 * Gets backlash bindings for a given view
			 * @private
			 * 
			 * @param {Backbone.View} view
			 * @returns {Array} an array of bindings
			 */
			getBindings: function(view){
				var bindings = [],
					self = this;

				view.$el.find('*[data-bind]').each(function(){
					bindings.push(self.parseBinding(this));
				});

				return bindings;
			},

			/**
			 * Parses binding values for a DOM element
			 * @private
			 *
			 * @param {Object} el DOM element
			 * @returns {Object} binding object
			 */
			parseBinding: function(el){
				var array = $(el).attr('data-bind').split(':'), 
					binding = {
						type: $.trim(array[0]),
						path: array[1],
						attr: array[1].split('.')[0],
						el: el
					};
			}
		};

		/**
		 * Creates a new View type that automatically applies BackLash
		 * bindings when rendered.
		 */
		var Backlash = Backbone.View.extend({
			/**
			 * Creates a reference to this view's original render function
			 */
			constructor: function(){
				Backbone.View.prototype.constructor.apply(this, arguments);
				this._srcRender = this.render;
				this.render = this._render;
			},

			/**
			 * Applies data bindings and calls original render function
			 */
			_render: function(){
				this._srcRender();
				this.applyBindings();
				return this;
			}
		});
		
		Backbone.BindingView = Backlash;
		return Backlash;
	})(Backbone, _, $ || window.jQuery || window.Zepto);

	return Backlash;
}));