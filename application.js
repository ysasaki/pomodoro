var App = window.App = Ember.Application.create();

App.PomodoroController = Ember.Controller.extend({
  start: function() {
    this.get('content').start();
  },

  stop: function() {
    this.get('content').stop();
  },

  reset: function() {
    this.get('content').reset();
  }
});

Ember.TEMPLATES['pomodoro'] = Ember.Handlebars.compile([
    'Time: {{view.timeLeftMin}} / {{view.maxMin}} (min)',
    '<button {{action start}}>Start</button>',
    '<button {{action stop}}>Stop</button>',
    '<button {{action reset}}>Reset</button>',
    '<br />',
    'Current second {{view.passedTimeSec}}'
  ].join(''))

App.PomodoroView = Ember.View.extend({
  tagName: 'div',

  timeLeftMin: Ember.computed(function() {
    return Math.floor(this.get('context.content.timeLeft') / 60 / 1000);
  }).property('context.content.timeLeft'),

  maxMin: Ember.computed(function() {
    return Math.floor(this.get('context.content.max') / 60 / 1000);
  }).property('context.content.max'),

  passedTimeSec: Ember.computed(function() {
    return Math.floor(this.get('context.content.passedTime') / 1000);
  }).property('context.content.passedTime'),

});

var view = App.PomodoroView.create({

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

    if (Ember.isNone(this.get('currentTime'))) {
      this.set('startTime',   now);
      this.set('currentTime', now);
    } else {
      var diff = now - this.get('currentTime');
      this.set('startTime',   this.get('startTime') + diff);
      this.set('currentTime', now);
    }

    var timerId = setInterval(function() {
      this.set('currentTime', Date.now());
    }.bind(this), 20);

    this.set('timerId', timerId);
  },

  stop: function() {
    var timerId = this.get('timerId');
    if (timerId) {
      clearInterval(timerId);
    }

    this.set('currentTime', Date.now());
  },

  reset: function() {
    this.stop();
    this.set('startTime',   null);
    this.set('currentTime', null);
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
    this.controllerFor('pomodoro').set('content', model);
  },

  renderTemplate: function() {
    this.render('pomodoro');
  }
});
