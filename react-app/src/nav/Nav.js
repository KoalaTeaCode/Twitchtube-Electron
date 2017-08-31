import React, { Component } from 'react';
import {
  Link,
} from 'react-router-dom'

// Electron
const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer  = electron.ipcRenderer;

// <h2 onClick={this.handleClick}> Testing {this.props.value} </h2>
class Nav extends Component {
  handleClick () {
    ipcRenderer.send('asynchronous-message', 'ping')
  }

  render() {
    return (
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/commands">Commands</Link></li>
      </ul>
    );
  }
}

export default Nav;
