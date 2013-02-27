/**
 * A simple library that attempts to bring Knockout style model-view
 * bindings to Backbone
 * 
 * @version 0.2.0
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
	var Backlash = (function(Backbone, _, $) {		

		/**
		 * Private object used to parse and apply data bindings
		 * to a Backbone View
		 *
		 * @private
		 */
		var BindingManager = {
			/**
			 * Applies backlash bindings for a give view
			 * @private
			 * 
			 * @param {Backbone.View} view
			 * @returns {Array} an array of bindings
			 */
			applyBindings: function(view) {
				var bindings = [],
					self = this;

				// Parses and assigns data bindings
				view.$('*[data-bind]').each(function(){
					bindings = bindings.concat(self.parseBinding(this, view));
				});

				return bindings;
			},

			/**
			 * Removes all backlash event bindings
			 * @private
			 * 
			 * @param {Backbone.View} view
			 */
			removeBindings: function(view) {
				if(view._backlashBinds) {
					var bindings = view._backlashBinds;
					for(var x = 0; x < bindings.length; x++) {
						if(bindings[x].type == 'value')
							$(bindings[x].el).off('change.Backlash');
						else if(bindings[x].type == 'checked')
							$(bindings[x].el).off('click.Backlash');
						else
							view.stopListening(view.model, 'change:'+ bindings[x].attr);
					}
				}
			},

			/**
			 * Parses binding values for a DOM element
			 * @private
			 *
			 * @param {Object} el DOM element
			 * @param {Backbone.View} view
			 * @returns {Object} binding object
			 */
			parseBinding: function(el, view) {
				var binds = $(el).attr('data-bind').split(','),
					parsed = [];

				for(var x = 0; x < binds.length; x++) {
					var array = binds[x].split(':'),
						binding = {
							type: $.trim(array[0]),
							attr: $.trim(array[1]),
							el: el	
						};

					this.activateBinding(binding, view);
					parsed.push(binding);
				}

				return parsed;
			},

			/**
			 * Activates a data binding on a Backbone view
			 * @private
			 *
			 * @param {Object} binding
			 * @param {Backbone.View} view
			 */
			activateBinding: function(binding, view) {
				var model = view.model;

				if(model.has(binding.attr) && (!view.bindings.length 
	 					|| _.contains(view.bindings, binding.attr))) {

					var value = model.get(binding.attr);
	 				switch(binding.type) {
	 					case 'text':
	 						$(binding.el).text(value);
	 						this.assignListener(binding, view);
	 						break;
	 					case 'href':
	 						$(binding.el).attr('href', value);
	 						this.assignListener(binding, view);
	 						break;
	 					case 'value':
	 						$(binding.el).val(value);
	 						this.assignHandler(binding, model, 'change');
	 						break;
	 					case 'checked':
	 						$(binding.el).prop('checked', value.toString() == binding.el.value);
	 						this.assignHandler(binding, model, 'click');
	 						break;
	 					case 'disabled':
	 						$(binding.el).prop('disabled', (value) ? true : false);
	 						this.assignListener(binding, view);
	 						break;
	 					case 'visible':
	 						(value) ? $(binding.el).show() : $(binding.el).hide();
	 						this.assignListener(binding, view);
	 						break;
	 				}
	 			}
			},

			/**
			 * Assings an event listener on a view for a specific data binding
			 * @private
			 *
			 * @param {Object} binding
			 * @param {Backbone.View} view
			 */
			assignListener: function(binding, view) {
				view.listenTo(
					view.model, 
					'change:' + binding.attr, 
					function(model, value){
		 				view.renderFragment(binding.el, value, binding.type);	
		 			}
		 		);
			},

			/**
			 * Assigns an event handler to a specific element
			 * @private
			 *
			 * @param {Object} binding
			 * @param {Backbone.View} view
			 * @param {String} event the event type (click, change, etc)
			 */
			assignHandler: function(binding, model, event) {
				$(binding.el).off(event+'.BackLash').on(event+'.BackLash', function(){
					model.set(binding.attr, this.value);
		 		});
			}
		};

		/**
		 * Adds 'binding' functions to base Backbone.View. This makes
		 * them available to other Backbone frameworks that extend
		 * the base view object.
		 */
		_.extend(Backbone.View.prototype, {
		 	// Default bindings array; if overriden we limit the data-bindings to the
		 	// the names defined in this array
		 	bindings: [],

		 	/**
		 	 * Applies data binding to all elements in this view that have a
		 	 * 'bind' data attribute.
		 	 *
		 	 * Mostly just a facade for BindingManager.applyBindings
		 	 */
		 	applyBindings: function() {
		 		this._backlashBinds = BindingManager.applyBindings(this);
		 	},

		 	/**
		 	 * Removes all Backlash event listeners
		 	 */
		 	removeBindings: function() {
		 		BindingManager.removeBindings(this);
		 	},

		 	/**
		 	 * Selectively renders a piece of a larger view
		 	 *
		 	 * @param {Object} el DOM element
		 	 * @param {String} value new element/attribute value
		 	 * @param {String} bindType the aspect of the passed el we are changing
		 	 */
			renderFragment: function(el, value, bindType) {
				switch(bindType){
					case 'text':
						$(el).text(value);
						break;
					case 'disabled':
						$(binding.el).prop('disabled', (value) ? true : false);
						break;
					case 'visible':
						(value) ? $(binding.el).show() : $(binding.el).hide();
						break;
					default:
						$(el).attr(bindType, value);
						break;
				};					
			}
		});

		/**
		 * Creates a new View type that automatically applies BackLash
		 * bindings when rendered.
		 */
		var Backlash = Backbone.View.extend({
			/**
			 * Creates a reference to this view's original render function
			 */
			constructor: function() {
				Backbone.View.prototype.constructor.apply(this, arguments);
				this._srcRender = this.render;
				this.render = this._render;
			},

			/**
			 * Applies data bindings and calls original render function
			 */
			_render: function() {
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