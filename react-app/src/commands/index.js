import React, { Component } from 'react';
import CommandList from './CommandList'
import uuid from 'uuid/v1'

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
      editingId: '',
      commands: []
    }

    ipcRenderer.on('commands-loaded', (event, arg) => {
      let commands = arg;
      this.setState({commands});
    });

    setTimeout(() => {
      ipcRenderer.send('get-commands', '')
    }, 500);

    this.handleTriggerChange = this.handleTriggerChange.bind(this);
    this.handleResponseChange = this.handleResponseChange.bind(this);
    this.handelDeleteClick = this.handelDeleteClick.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
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
    if (!this.state.editingId) {
      this.createCommand();
      return;
    }

    let index = this.state.commands.findIndex(command => {
      return command.id = this.state.editingId;
    });

    let updatedCommands = this.state.commands.slice();
    updatedCommands[index].trigger = this.state.trigger;
    updatedCommands[index].response = this.state.response;

    this.setState({commands: updatedCommands});
    this.setState({trigger: ''});
    this.setState({response: ''});
    this.setState({editingId: ''});

    ipcRenderer.send('command-updated', updatedCommands[index]);
  }

  createCommand () {
    let newCommand = {
      trigger: this.state.trigger,
      response: this.state.response,
      id: uuid(),
    };

    this.setState({commands: this.state.commands.concat(newCommand)});
    this.setState({trigger: ''});
    this.setState({response: ''});

    ipcRenderer.send('command-created', newCommand);
  }

  handleTriggerChange(event) {
    this.setState({trigger: event.target.value});
  }

  handleResponseChange(event) {
    this.setState({response: event.target.value});
  }

  handleEditClick (command) {
    this.setState({
      trigger: command.trigger,
      response: command.response,
      editingId: command.id,
    });
  }

  handelDeleteClick (commandId) {
    let newCommands = this.state.commands.filter(command => {
      return command.id !== commandId;
    });

    ipcRenderer.send('command-removed', commandId);

    this.setState({
      commands: newCommands,
    });
  }

  render() {
    return (
      <div>
        <h1>Commands</h1>
        <hr />

        <h3>{ this.state.editingId ? 'Edit Command' : 'Add Command' }</h3>
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
            { this.state.editingId ? 'Save' : 'Add' }
          </button>
        </form>

        <br />
        <br />

        <h3>Current Commands</h3>
        <CommandList commands={this.state.commands} deleteClick={this.handelDeleteClick} editClick={this.handleEditClick} />
      </div>
    );
  }
}

export default Commands
