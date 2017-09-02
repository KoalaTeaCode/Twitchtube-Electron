import eventbus from './eventbus';
const { ipcMain } = require('electron');
const fs = require('fs');

const commands_file_path = __dirname + '/../../local_data/commands.json';
if (!fs.existsSync(commands_file_path)) {
  let json = JSON.stringify([]);
  fs.writeFileSync(commands_file_path, json, 'utf8', (err, result) => {});
}

let commands_file = fs.readFileSync(commands_file_path, 'utf8');

let commands = JSON.parse(commands_file);
let commandsHashed = {};

hashCommands();

function hashCommands () {
  commandsHashed = {};
  commands.forEach(command => {
    commandsHashed[command.trigger] = command.response;
  });
}

ipcMain.on('get-commands', (event, arg) => {
  ipcMain.emit('commands-loaded', commands);
  event.sender.send('commands-loaded', commands)
});

ipcMain.on('command-created', (event, arg) => {
  commands.push(arg);

  hashCommands();

  let json = JSON.stringify(commands);
  fs.writeFileSync(commands_file_path, json, 'utf8', (err, result) => {});
});

ipcMain.on('command-removed', (event, arg) => {
  let newTimers = commands.filter(timer => {
    return timer.id !== arg;
  });
  commands = newTimers;

  hashCommands();

  let json = JSON.stringify(commands);
  fs.writeFileSync(commands_file_path, json, 'utf8', (err, result) => {});
});

ipcMain.on('command-updated', (event, updatedTimer) => {
  let index = commands.findIndex(timer => {
    return timer.id = updatedTimer.id;
  });

  commands[index].trigger = updatedTimer.trigger;
  commands[index].response = updatedTimer.response;

  hashCommands(); // @TODO: Add function to check just this one

  let json = JSON.stringify(commands);
  fs.writeFileSync(commands_file_path, json, 'utf8', (err, result) => {});
});

eventbus.on('new-youtube-message', (message) => {
  if (commandsHashed[message]) eventbus.emit('outgoing-youtube-message', commandsHashed[message.text]);
});

eventbus.on('new-twitch-message', (message) => {
  if (commandsHashed[message]) eventbus.emit('outgoing-twitch-message', commandsHashed[message.text]);
});
