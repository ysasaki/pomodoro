var App = window.App = Ember.Application.create();

App.ExampleController = Ember.Controller.extend({
  timeLeftMin: Ember.computed(function() {
    return Math.floor(this.get('content.timeLeft') / 60 / 1000);
  }).property('content.timeLeft'),

  maxMin: Ember.computed(function() {
    return Math.floor(this.get('content.max') / 60 / 1000);
  }).property('content.max'),

  passedTimeSec: Ember.computed(function() {
    return Math.floor(this.get('content.passedTime') / 1000);
  }).property('content.passedTime'),

  start: function() {
    this.get('content').start();
  },

  stop: function() {
    this.get('content').stop();
  }
});

Ember.TEMPLATES['example'] = Ember.Handlebars.compile([
    'Time: {{view view.textView contentBinding=view.context}} / {{view.context.maxMin}} (min)',
    '<button {{action start}}>Start</button>',
    '<button {{action stop}}>Stop</button>',
    '<br />',
    'Current second {{view.context.passedTimeSec}}'
  ].join(''))

App.ExampleView = Ember.View.extend({
  tagName: 'div',

  textView: Ember.TextField.extend({
    valueBinding: 'content.timeLeftMin'
  }),

});

var view = App.ExampleView.create({

});

// view.appendTo('body');

Ember.Router.reopen({
  location: 'history'
})

App.Timer = Ember.Object.extend({
  timerId: null,
  startTime: null,
  currentTime: null,
  passedTime: 0,
  max: 25 * 60 * 1000,

  init: function(max) {
    this._super();

    if (!Ember.isNone(max)) {
      this.set('max', max);
    }
  },

  start: function() {
    var now = Date.now();

    this.set('startTime', now);
    this.set('currentTime', now);

    var timerId = setInterval(function() {
      this.set('currentTime', Date.now());
    }.bind(this), 20);

    this.set('timerId', timerId);
  },

  stop: function() {
    var timerId = this.get('timerId');
    clearInterval(timerId);
  },

  passedTime: Ember.computed(function() {
    return this.get('currentTime') - this.get('startTime');
  }).property('startTime', 'currentTime'),

  timeLeft: Ember.computed(function() {
    return this.get('max') - (this.get('currentTime') - this.get('startTime'));
  }).property('max', 'currentTime', 'startTime')
});

App.currentTimer = App.Timer.create();

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return App.currentTimer;
  },

  setupController: function(controller, model) {
    this.controllerFor('example').set('content', model);
  },

  renderTemplate: function() {
    this.render('example');
  }
});
