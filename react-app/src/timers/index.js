import React, { Component } from 'react';
import TimerList from './TimerList'
import uuid from 'uuid/v1'

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
    this.handelDeleteClick = this.handelDeleteClick.bind(this);
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

    let newTimer = {
      message: this.state.message,
      interval: this.state.interval,
      id: uuid(),
    };

    this.setState({timers: this.state.timers.concat(newTimer)});
    this.setState({message: ''});
    this.setState({interval: ''});

    ipcRenderer.send('timer-created', newTimer);
  }

  handleMessageChange(event) {
    this.setState({message: event.target.value});
  }

  handleIntervalChange(event) {
    this.setState({interval: event.target.value});
  }

  handelDeleteClick (timerId) {
    let newTimers = this.state.timers.filter(timer => {
      return timer.id !== timerId;
    });

    ipcRenderer.send('timer-removed', timerId);

    this.setState({
      timers: newTimers,
    });
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
        <TimerList timers={this.state.timers} deleteClick={this.handelDeleteClick} />
      </div>
    );
  }
}

export default Timers
