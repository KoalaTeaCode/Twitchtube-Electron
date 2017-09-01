import eventbus from './eventbus';
const { ipcMain } = require('electron');
const fs = require('fs');

const commands_file_path = __dirname + '/../../local_data/commands.json';
if (!fs.existsSync(commands_file_path)) {
  let json = JSON.stringify({});
  fs.writeFileSync(commands_file_path, json, 'utf8', (err, result) => {});
}

let commands_file = fs.readFileSync(commands_file_path, 'utf8');

let commands = JSON.parse(commands_file);

ipcMain.on('get-commands', (event, arg) => {
  ipcMain.emit('commands-loaded', commands);
  event.sender.send('commands-loaded', commands)
});

ipcMain.on('command-created', (event, arg) => {
  commands[arg.trigger] = arg.response;
  let json = JSON.stringify(commands);
  fs.writeFileSync(commands_file_path, json, 'utf8', (err, result) => {});
});

eventbus.on('new-youtube-message', (message) => {
});

eventbus.on('new-twitch-message', (message) => {
  if (commands[message]) eventbus.emit('outgoing-twitch-message', commands[message]);
});
