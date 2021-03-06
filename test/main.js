require.config({
	shim: {
		'backbone': {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		'underscore': {
			exports: '_'
		}
	},
	paths: {
		jquery: 'lib/jquery',
		backbone: 'lib/Backbone',
		underscore: 'lib/underscore',
		backlash: '../backlash'
	}
});

require(['jquery', 'backbone', 'backlash'], function($, Backbone, Backlash){
	//Some dummy data to work with
	var _data = [
		{age: 29, firstName: 'Bryan', lastName: 'Hilmer', gender: 'M', status: 'Single', employed: 'Yes', label: 'Yahoo', url: 'http://www.yahoo.com', pets: ['cats', 'fish']},
		{age: 35, firstName: 'Vincet', lastName: 'Vega', gender: 'F', status: 'Dead', employed: 'No', toggle: false},
		{age: 38, firstName: 'Dom', lastName: 'Cobb', gender: 'M', status: 'Dreaming', employed: 'No', toggle: false}
	];

	//Person model
	var Person = Backbone.Model.extend({
		defaults: {
			age: 30,
			firstName: 'Jon',
			lastName: 'Doe',
			gender: 'M',
			status: 'Single',
			employed: 'Yes',
			fullName: 'Jon Doe',
			label: 'Google',
			url: 'http://www.google.com',
			toggle: true
		},

		initialize: function(options){
			if(!this.get('pets'))
				this.set({pets: new Array()}, {silent: true});

			this.on('change:firstName change:lastName', this.setFullName);
			this.setFullName();
		},

		setFullName: function(){
			this.set('fullName', this.get('firstName')+' '+this.get('lastName'));
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
		bindings: ['fullName'],
		template: _.template($('#person-template').text()),
		events: {
			'click #edit-buttons button': 'showDetails',
			'click #view-buttons button': 'showForm',
			'click .remove': 'clearBindings'
		},

		initialize: function(){
			this.form = new PersonFormView({model: this.model});
			this.info = new PersonDetailsView({model: this.model});
		},

		render: function(){
			this.$el.html(this.template({}));

			this.$el.find('.content').append(this.info.render().el);
			this.$el.find('.content').append(this.form.render().el);

			return this;
		},

		showForm: function(){
			this.$el.find('section').hide();
			this.$el.find('#view-buttons').hide();
			this.$el.find('form').show();
			this.$el.find('#edit-buttons').show();
		},

		showDetails: function(){
			this.$el.find('form').hide();
			this.$el.find('#edit-buttons').hide();
			this.$el.find('section').show();
			this.$el.find('#view-buttons').show();
		},

		clearBindings: function(){
			this.removeBindings();
			this.form.removeBindings();
			this.info.removeBindings();
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

	var PersonDetailsView = Backlash.extend({
		tagName: 'section',
		template: _.template($('#person-view').text()),

		initialize: function(){
			this.listenTo(this.model, 'change:pets', this.listPets);
		},

		render: function(){
			this.$el.html(this.template({}));
			this.listPets();
			return this;
		},

		listPets: function(){
			var pets = this.model.get('pets');

			if(pets.length)
				this.$('.pets').text(pets.toString().replace(/,/g, ', '));
			else
				this.$('.pets').text('none');
		}
	});

	//The main 'application' view
	var MainView = Backbone.View.extend({
		el: $('#vcards'),

		initialize: function(){
			var self = this;
			
			this.collection = new People();
			this.bootstrap();
			
			this.listenTo(this.collection, 'add', this.addPerson);
			$('header button').on('click', function(){
				self.collection.add({});
			});
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
		},

		addPerson: function(model){
			var view = new PersonView({model: model});

			this.$el.append(view.render().el);
			view.showForm();
		}
	});

	return new MainView();
});