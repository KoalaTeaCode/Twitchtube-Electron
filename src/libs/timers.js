import eventbus from './eventbus';
const { ipcMain } = require('electron');
const fs = require('fs');
const storage = require('electron-json-storage');
import moment from 'moment';

let timers = [];
let timerIntervals = {};

storage.get('twitchtube_timers', function(error, data) {
  if (error) throw error;

  if (Array.isArray(data) && data.length > 0) timers = data;
  startTimerCommands();
});

function startTimerCommands() {
  generateIntervals();

  // @TODO: Just set minute interval?
  let lastMinuteChecked = moment().minute();
  setInterval(() => {
    let currentMinute = moment().minute();

    if (currentMinute === lastMinuteChecked) return;

    lastMinuteChecked = currentMinute;

    if (!timerIntervals[currentMinute]) return;

    timerIntervals[currentMinute].timers.forEach(timer => {
      // @TODO: Check for platform?
      eventbus.emit('outgoing-twitch-message', timer.message);
    });
  }, 1000);

  setListeners();
}

function generateIntervals() {
  timers.forEach(timer => {
    let minuteIndex = parseInt(timer.interval, 10);

    while (minuteIndex <= 60) {
      if (!timerIntervals[minuteIndex]) {
        timerIntervals[minuteIndex] = {
          timers: [],
        } ;
      }

      timerIntervals[minuteIndex].timers.push(timer);
      minuteIndex += parseInt(timer.interval, 10);
    }

    if (timerIntervals[0] && timerIntervals[60]) {
      timerIntervals[0] =  timerIntervals[0].concat(timerIntervals[60]);
    }
  });
}

function setListeners () {
  ipcMain.on('get-timers', (event, arg) => {
    ipcMain.emit('timers-loaded', timers);
    event.sender.send('timers-loaded', timers)
  });

  ipcMain.on('timer-created', (event, arg) => {
    timers.push(arg);
    generateIntervals(); // @TODO: Add function to check just this one

    storage.set('twitchtube_timers', timers);
  });

  ipcMain.on('timer-removed', (event, arg) => {
    let newTimers = timers.filter(timer => {
      return timer.id !== arg;
    });
    timers = newTimers;

    generateIntervals(); // @TODO: Add function to check just this one

    storage.set('twitchtube_timers', timers);
  });

  ipcMain.on('timer-updated', (event, updatedTimer) => {
    let index = timers.findIndex(timer => {
      return timer.id = updatedTimer.id;
    });

    timers[index].message = updatedTimer.message;
    timers[index].interval = updatedTimer.interval;

    generateIntervals(); // @TODO: Add function to check just this one

    storage.set('twitchtube_timers', timers);
  });
}
