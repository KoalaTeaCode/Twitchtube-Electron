import eventbus from './eventbus';
const { ipcMain } = require('electron');
const fs = require('fs');
import moment from 'moment';

const timers_file_path = __dirname + '/../../local_data/timers.json';
if (!fs.existsSync(timers_file_path)) {
  let json = JSON.stringify([]);
  fs.writeFileSync(timers_file_path, json, 'utf8', (err, result) => {});
}

let timers_file = fs.readFileSync(timers_file_path, 'utf8');

let timers = JSON.parse(timers_file);

let timerIntervals = {};
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

ipcMain.on('get-timers', (event, arg) => {
  ipcMain.emit('timers-loaded', timers);
  event.sender.send('timers-loaded', timers)
});

ipcMain.on('timer-created', (event, arg) => {
  timers.push(arg);
  generateIntervals(); // @TODO: Add function to check just this one

  let json = JSON.stringify(timers);
  fs.writeFileSync(timers_file_path, json, 'utf8', (err, result) => {});
});
