import React, { Component } from 'react';
import CommandList from './CommandList'

// Electron
const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer  = electron.ipcRenderer;

// <h2 onClick={this.handleClick}> Testing {this.props.value} </h2>
class Commands extends Component {
  constructor() {
    super()
    this.state = {
      trigger: '',
      response: '',
      commands: []
    }

    ipcRenderer.on('commands-loaded', (event, arg) => {
      let commands = Object.keys(arg);
      this.setState({commands});
    });

    setTimeout(() => {
      ipcRenderer.send('get-commands', '')
    }, 500);

    this.handleTriggerChange = this.handleTriggerChange.bind(this);
    this.handleResponseChange = this.handleResponseChange.bind(this);
    this.addCommand = this.addCommand.bind(this);
  }

  handleClick () {
    ipcRenderer.send('asynchronous-message', 'ping')
  }

  addCommand (e) {
    e.preventDefault()

    if (!this.state.trigger.trim() || !this.state.response.trim()) {
      return
    }

    // dispatch(addTodo(input.value))

    this.setState({commands: this.state.commands.concat(this.state.trigger)});
    this.setState({trigger: ''});

    ipcRenderer.send('command-created', {
      trigger: this.state.trigger,
      response: this.state.response,
    })
  }

  handleTriggerChange(event) {
    this.setState({trigger: event.target.value});
  }

  handleResponseChange(event) {
    this.setState({response: event.target.value});
  }

  render() {
    return (
      <div>
        <h1>Commands</h1>
        <hr />

        <h3>Add Command</h3>
        <form
          onSubmit={this.addCommand}
        >
          <div className='form-group'>
            <label> Trigger: </label>
            <input className='form-control' type='text' placeholder='trigger' value={this.state.trigger} onChange={this.handleTriggerChange} />
          </div>

          <div className='form-group'>
            <label> Response: </label>
            <input className='form-control' type='text' placeholder='response' value={this.state.response} onChange={this.handleResponseChange} />
          </div>

          <button className='btn btn-primary' type="submit">
            Add
          </button>
        </form>

        <br />
        <br />

        <h3>Current Commands</h3>
        <CommandList commands={this.state.commands} />
      </div>
    );
  }
}

export default Commands
