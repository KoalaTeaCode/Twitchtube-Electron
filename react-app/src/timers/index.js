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
        <h1>Timers</h1>
        <hr />

        <h3>Add Timer</h3>
        <form
          onSubmit={this.addTimer}
        >
          <div className='form-group'>
            <label> Message: </label>
            <input className='form-control' type='text' placeholder='message' value={this.state.message} onChange={this.handleMessageChange} />
          </div>

          <div className='form-group'>
            <label> Interval: </label>
            <input className='form-control' type='number' placeholder='interval' value={this.state.interval} onChange={this.handleIntervalChange} />
          </div>

          <button className='btn btn-primary' type="submit">
            Add
          </button>
        </form>

        <br />
        <br />

        <h3>Current Timers</h3>
        <TimerList timers={this.state.timers} />
      </div>
    );
  }
}

export default Timers
