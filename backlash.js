/**
 * A simple library that attempts to bring Knockout style model-view
 * bindings to Backbone
 * 
 * @version 0.4.0
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
					self.parseBinding(this, view, bindings);
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
			 * @param {Array} bindings array to add parsed binding to
			 */
			parseBinding: function(el, view, bindings) {
				var binds = $(el).attr('data-bind').split(',');

				for(var x = 0; x < binds.length; x++) {
					var array = binds[x].split(':'),
						binding = {
							type: $.trim(array[0]),
							attr: $.trim(array[1]),
							el: el	
						};

					if(!view.bindings.length || _.contains(view.bindings, binding.attr)){
						this.activateBinding(binding, view);
						bindings.push(binding);
					}
				}
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

				if(model.has(binding.attr)) {
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
	 						this.toggleCheckedProperty(value, binding.el);
	 						this.assignHandler(binding, model, 'click');
	 						break;
	 					case 'disabled':
	 						$(binding.el).prop('disabled', (value) ? true : false);
	 						this.assignListener(binding, view);
	 						break;
	 					case 'enabled':
	 						$(binding.el).prop('disabled', (value) ? false : true);
	 						this.assignListener(binding, view);
	 						break;
	 					case 'visible':
	 						(value) ? $(binding.el).show() : $(binding.el).hide();
	 						this.assignListener(binding, view);
	 						break;
	 					case 'hidden':
	 						(value) ? $(binding.el).hide() : $(binding.el).show();
	 						this.assignListener(binding, view);
	 						break;
	 					case 'src':
	 						$(binding.el).attr('src', value);
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
				var self = this;

				$(binding.el).off(event+'.BackLash').on(event+'.BackLash', function(){
					var type = $(this).attr('type');

					if(type == 'checkbox' || type == 'radio')
						self.setCheckedValue(model, binding.attr, this);
					else
						model.set(binding.attr, this.value);
		 		});
			},

			/**
			 * Handles 'checked' property assignment for radio and checkbox inputs
			 *
			 * @param {Object} attr model attribute value
			 * @param {Object} el checkbox/radio element
			 */
			toggleCheckedProperty: function(attr, el) {
				if(_.isArray(attr))
	 				$(el).prop('checked', attr.indexOf(el.value) > -1);
				else if(_.isBoolean(attr))
					$(el).prop('checked', attr);
	 			else
	 				$(el).prop('checked', attr.toString() == el.value);
			},

			/**
			 * Upates model when radio/checkboxes are changed
			 *
			 * @param {Backbone.Model} the model we want to update
			 * @param {String} attr model attribute value
			 * @param {Object} el radio/checkbox input element 
			 */
			setCheckedValue: function(model, attr, el) {
				var checked = $(el).prop('checked');
				
				if(_.isArray(model.get(attr))) {
					var array = model.get(attr),
						index = array.indexOf(el.value);

					if(!checked && index > -1) {
						array.splice(index, 1);
						model.trigger('change:' + attr, model, array, {});
					}
					else if(checked && index == -1) {
						array.push(el.value);
						model.trigger('change:' + attr, model, array, {});
					}
						
				}
				else if(_.isBoolean(model.get(attr))) {
					model.set(attr, $(el).is(':checked'));
				}
				else
					model.set(attr, checked);
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
						$(el).prop('disabled', (value) ? true : false);
						break;
					case 'enabled':
						$(el).prop('disabled', (value) ? false : true);
						break;
					case 'visible':
						(value) ? $(el).show() : $(el).hide();
						break;
					case 'hidden':
						(value) ? $(el).hide() : $(el).show();
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