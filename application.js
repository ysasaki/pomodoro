var App = window.App = Ember.Application.create();

var proxyToContent = function(method) {
  return function() {
    this.get('content')[method]();
  };
};

App.PomodoroController = Ember.Controller.extend({
  start: proxyToContent('start'),
  stop:  proxyToContent('stop'),
  reset: proxyToContent('reset'),

  timeLeftMin: Ember.computed(function() {
    return Math.floor(this.get('content.timeLeft') / 60 / 1000);
  }).property('content.timeLeft'),

  timeLeftSec: Ember.computed(function() {
    return Math.floor(this.get('content.timeLeft') / 1000) % 60
  }).property('content.timeLeft'),
});

Ember.TEMPLATES['application'] = Ember.Handlebars.compile([
    '<header>',
      '<div id="title">',
        '<h1>Pomodoro</h1>',
      '</div>',
    '</header>',
    '<div id="content">',
      '{{outlet}}',
    '</div>'
  ].join(''));

Ember.TEMPLATES['pomodoro'] = Ember.Handlebars.compile([
    '<div id="timer">',
      '<div id="time-left">{{timeLeftMin}}</div>',
      '<div id="time-left-sec">.{{timeLeftSec}}</div>',
    '</div>',
    '<span>',
      '<button {{action start}}>Start</button>',
      '<button {{action stop}}>Stop</button>',
      '<button {{action reset}}>Reset</button>',
    '</span>'
  ].join(''))

App.PomodoroView = Ember.View.extend({
  tagName: 'div',
});

App.Timer = Ember.Object.extend({
  timerId: null,
  startTime: null,
  currentTime: null,
  passedTime: 0,
  max: 25 * 60 * 1000,

  start: function() {
    if (this.get('timerId')) {
      return
    }

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
    if (!timerId) {
      return
    }

    clearInterval(timerId);
    this.set('timerId', null);

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
