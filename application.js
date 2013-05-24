$(function () {
    var $timeLeftMin = $('#time-left-min'),
        $timeLeftSec = $('#time-left-sec'),
        MAX = 25 * 60 * 1000,
        FPS = 1000 / 20;

    function timeLeftMin(t) {
        return Math.floor( t / 1000 / 60 );
    };

    function timeLeftSec(t) {
        return Math.floor( t / 1000 ) % 60;
    };

    function tick() {
        return setInterval(pasta_signal('tick'), FPS);
    };

    var Model = _.module(
        {},

        function init(st) {
            return { timeLeftMin: timeLeftMin(MAX), timeLeftSec: timeLeftSec(MAX) };
        },

        function start(st) {
            var now = Date.now();
            if ( _.isNull(st.startTime) ) {
                return {
                    startTime: now,
                    timerId: tick()
                };
            }
            else {
                var diff = now - st.currentTime;
                return {
                    startTime: st.startTime + diff,
                    timerId: tick()
                };
            }
        },

        function stop(st) {
            clearInterval(st.timerId);
            return { timerId: null };
        },

        function reset(st) {
            pasta_signal('stop')();
            return {
                timeLeftMin: timeLeftMin(MAX),
                timeLeftSec: timeLeftSec(MAX),
                startTime: null,
                currentTime: null
            };
        },

        function tick(st) {
            var currentTime = Date.now();
            if ( currentTime - st.startTime > MAX ) {
                pasta_signal('stop')();
                return { startTime: null, currentTime: null };
            }
            else {
                var left = MAX - (currentTime - st.startTime);
                return {
                    currentTime: currentTime,
                    timeLeftMin: timeLeftMin(left),
                    timeLeftSec: timeLeftSec(left)
                };
            }
        }
    );

    var UI = _.module(
        {},
        function updateTimeLeftMin(n) {
            $timeLeftMin.text(n);
        },
        function updateTimeLeftSec(n) {
            $timeLeftSec.text("." + n);
        }
    );

    var View = _.module(
        {},
        function timeLeftMin(UI,st) {
            UI.updateTimeLeftMin(st.timeLeftMin);
        },
        function timeLeftSec(UI,st) {
            UI.updateTimeLeftSec(st.timeLeftSec);
        }
    );

    var initial_state = {
        // for view
        timeLeftMin: null,
        timeLeftSec: null,

        // for model
        startTime: null,
        currentTime: null,
        timerId: null,
    };

    var pasta_signal = Pasta(Model, UI, View, initial_state);
    pasta_signal('init')();

    $('#start').on('click', pasta_signal('start'));
    $('#stop').on('click', pasta_signal('stop'));
    $('#reset').on('click', pasta_signal('reset'));
});
