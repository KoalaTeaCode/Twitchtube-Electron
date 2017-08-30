// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const {ipcRenderer} = require('electron')

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg) // prints "pong"
})

window.addEventListener('load', () => {
  document.querySelector('#googleSignIn').addEventListener('click', () => {
    ipcRenderer.send('asynchronous-message', 'ping')
  })
})
