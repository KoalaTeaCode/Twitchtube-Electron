import React, { Component } from 'react';

const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer  = electron.ipcRenderer;

class Nav extends Component {
  handleClick () {
    ipcRenderer.send('asynchronous-message', 'ping')
  }

  render() {
    return (
      <h2 onClick={this.handleClick}> Testing {this.props.value} </h2>
    );
  }
}

export default Nav;
