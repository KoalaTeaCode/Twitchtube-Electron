import dotenv from 'dotenv'
dotenv.config()

const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const { ipcMain } = require('electron');

const path = require('path')
const url = require('url')

// Local libs
const { twitchSignIn } = require('./libs/twitch.js');
const transporter = require('./libs/transporter.js');
import { googleSignIn } from './libs/google.js';
import commands from './libs/commands.js';
import timers from './libs/timers.js';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '/build/index.html'),
    protocol: 'file:',
    slashes: true
  });
  mainWindow.loadURL(startUrl);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  ipcMain.on('open-update-window', (event, arg) => {
    console.log("Sd")
    let win = new BrowserWindow({
      width: 500,
      height: 600,
      show: true,
    })
    win.on('closed', () => {
      win = null
    })

    // Load a remote URL
    win.loadURL('http://twitchtube.io')
  });


  ipcMain.on('google-sign-in', (event, arg) => {
    googleSignIn()
      .then(() => {
        event.sender.send('youtube-started', 'pong')
      })
      .catch(() => {

      })
  });

  ipcMain.on('twitch-sign-in', (event, arg) => {
    twitchSignIn()
      .then(() => {
        event.sender.send('twitch-started', 'pong')
      })
      .catch(() => {

      })
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
