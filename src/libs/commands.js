import eventbus from './eventbus';
const { ipcMain } = require('electron');
const storage = require('electron-json-storage');
const fs = require('fs');

let commands = [];
let commandsHashed = {};

storage.get('twitchtube_commands', function(error, data) {
  if (error) throw error;

  if (Array.isArray(data) && data.length > 0) commands = data;
  startCommandsApp();
});

function startCommandsApp () {
  hashCommands();
  setListeners();
}

function hashCommands () {
  commandsHashed = {};
  commands.forEach(command => {
    commandsHashed[command.trigger] = command.response;
  });
}

function setListeners () {
  ipcMain.on('get-commands', (event, arg) => {
    ipcMain.emit('commands-loaded', commands);
    event.sender.send('commands-loaded', commands)
  });

  ipcMain.on('command-created', (event, arg) => {
    commands.push(arg);

    hashCommands();

   storage.set('twitchtube_commands', commands);
  });

  ipcMain.on('command-removed', (event, arg) => {
    let newTimers = commands.filter(timer => {
      return timer.id !== arg;
    });
    commands = newTimers;

    hashCommands();

    storage.set('twitchtube_commands', commands);
  });

  ipcMain.on('command-updated', (event, updatedTimer) => {
    let index = commands.findIndex(timer => {
      return timer.id = updatedTimer.id;
    });

    commands[index].trigger = updatedTimer.trigger;
    commands[index].response = updatedTimer.response;

    hashCommands(); // @TODO: Add function to check just this one

    storage.set('twitchtube_commands', commands);
  });

  eventbus.on('new-youtube-message', (message) => {
    if (commandsHashed[message]) eventbus.emit('outgoing-youtube-message', commandsHashed[message]);
  });

  eventbus.on('new-twitch-message', (message) => {
    if (commandsHashed[message.text]) eventbus.emit('outgoing-twitch-message', commandsHashed[message.text]);
  });
}
