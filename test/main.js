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
	//Some dummy data to work with
	var _data = [
		{age: 29, firstName: 'Bryan', lastName: 'Hilmer', gender: 'M', status: 'Single'},
		{age: 35, firstName: 'Vincet', lastName: 'Vega', gender: 'F', status: 'Dead'},
		{age: 38, firstName: 'Dom', lastName: 'Cobb', gender: 'M', status: 'Dreaming'}
	];

	//Person model
	var Person = Backbone.Model.extend({
		defaults: {
			age: 30,
			firstName: 'Jon',
			lastName: 'Doe',
			gender: 'M',
			status: 'Single'
		},

		asString: function(){
			return this.get('firstName')+' '+this.get('lastName');
		}
	});

	//Person collectiom
	var People = Backbone.Collection.extend({
		model: Person
	});

	//Main person view
	var PersonView = Backlash.extend({
		tagName: 'div',
		className: 'person',
		template: _.template($('#person-template').text()),

		initialize: function(){
			this.form = new PersonFormView({model: this.model});
		},

		render: function(){
			this.$el.html(this.template({}));
			this.$el.find('.content').append(this.form.render().el);

			return this;
		}
	});

	//Person form view
	var PersonFormView = Backlash.extend({
		tagName: 'form',
		template: _.template($('#person-form').text()),

		render: function(){
			this.$el.html(this.template({}));
			return this;
		}
	});

	//var PersonDataView = Backlash.extend({});

	//The main 'application' view
	var MainView = Backbone.View.extend({
		el: $('#vcards'),

		initialize: function(){
			this.collection = new People();
			this.bootstrap();
			
			console.log(this.collection);
		},

		/**
		 * Bootstraps People collection with some dummy data
		 */
		bootstrap: function(){
			var views = [];
			this.collection.reset(_data);

			//Creates views
			for(var x = 0; x < this.collection.length; x++){
				var view = new PersonView({model: this.collection.at(x)});
				views.push(view.render().el);
			}

			this.$el.empty().append(views);
		}
	});

	return new MainView();
});