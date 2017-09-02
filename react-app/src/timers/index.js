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
      editingId: '',
      timers: []
    }

    window.amplitude.getInstance().logEvent('VIEW_TIMER_PAGE');

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
    this.handleEditClick = this.handleEditClick.bind(this);
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

    if (!this.state.editingId) {
      window.amplitude.getInstance().logEvent('CREATE_TIMER');
      this.createTimer();
      return;
    }

    window.amplitude.getInstance().logEvent('UPDATE_TIMER');

    let index = this.state.timers.findIndex(timer => {
      return timer.id = this.state.editingId;
    });

    let updatedTimers = this.state.timers.slice();
    updatedTimers[index].message = this.state.message;
    updatedTimers[index].interval = this.state.interval;

    this.setState({timers: updatedTimers});
    this.setState({message: ''});
    this.setState({interval: ''});
    this.setState({editingId: ''});

    ipcRenderer.send('timer-updated', updatedTimers[index]);
  }

  createTimer () {
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

  handleEditClick (timer) {
    this.setState({
      message: timer.message,
      interval: timer.interval,
      editingId: timer.id,
    });
  }

  render() {
    return (
      <div>
        <h1>Timers</h1>
        <hr />

        <h3>{ this.state.editingId ? 'Edit Timer' : 'Add Timer' }</h3>
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
            { this.state.editingId ? 'Save' : 'Add' }
          </button>
        </form>

        <br />
        <br />

        <h3>Current Timers</h3>
        <TimerList timers={this.state.timers} deleteClick={this.handelDeleteClick} editClick={this.handleEditClick} />
      </div>
    );
  }
}

export default Timers
