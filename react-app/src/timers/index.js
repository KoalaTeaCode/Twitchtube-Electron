import React, { Component } from 'react';
import TimerList from './TimerList'

// Electron
const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer  = electron.ipcRenderer;

class Timers extends Component {
  constructor() {
    super()
    this.state = {
      message: '',
      interval: 0,
      timers: []
    }

    ipcRenderer.on('timers-loaded', (event, arg) => {
      let timers = arg;
      this.setState({timers});
    });

    setTimeout(() => {
      ipcRenderer.send('get-timers', '')
    }, 500);

    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleIntervalChange = this.handleIntervalChange.bind(this);
    this.addTimer = this.addTimer.bind(this);
  }

  handleClick () {
    ipcRenderer.send('asynchronous-message', 'ping')
  }

  addTimer (e) {
    e.preventDefault()

    if (!this.state.message.trim() || !this.state.interval.trim()) {
      return
    }

    // dispatch(addTodo(input.value))

    this.setState({timers: this.state.timers.concat(this.state.message)});
    this.setState({message: ''});

    ipcRenderer.send('timer-created', {
      message: this.state.message,
      interval: this.state.interval,
    })
  }

  handleMessageChange(event) {
    this.setState({message: event.target.value});
  }

  handleIntervalChange(event) {
    this.setState({interval: event.target.value});
  }

  render() {
    return (
      <div>
        <h2>Timers</h2>

        <form
          onSubmit={this.addTimer}
        >
          <input type='text' placeholder='message' value={this.state.message} onChange={this.handleMessageChange} />
          <input type='number' placeholder='interval' value={this.state.interval} onChange={this.handleIntervalChange} />

          <button type="submit">
            Add
          </button>
        </form>

        <TimerList timers={this.state.timers} />
      </div>
    );
  }
}

export default Timers
