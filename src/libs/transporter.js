let eventbus = require('./eventbus');

//Create an event handler:
var myEventHandler = function () {
  // console.log('I hear a scream!');
}

//Assign the event handler to an event:
eventbus.on('scream', myEventHandler);
