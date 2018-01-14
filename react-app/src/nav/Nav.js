import React, { Component } from 'react';
import {
  Link,
} from 'react-router-dom'
import jsonp from 'jsonp'

const CURRENT_VERSION = '1.1';

// Electron
const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer  = electron.ipcRenderer;

// <h2 onClick={this.handleClick}> Testing {this.props.value} </h2>
class Nav extends Component {
  constructor () {
    super()
    this.state = {
      updateAvailable: false
    }

    jsonp('http://twitchtube.io/desktop-version', null, function (err, data) {
      if (err) {
        console.error(err.message);
      } else {
        if (data.version !== CURRENT_VERSION) {
          this.setState({ updateAvailable: true });
        }
      }
    });

  }

  handleClick () {
    ipcRenderer.send('asynchronous-message', 'ping')
  }

  handleUpdateClick () {
    ipcRenderer.send('open-update-window', 'ping')
  }

  render() {
    const updateLink = this.state.updateAvailable ?
      (<li className="nav-item" onClick={this.handleUpdateClick}>
        <i className="fa fa-home" aria-hidden="true"></i>
        Update Available
      </li>) : '';

    return (
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link to="/">
            <i className="fa fa-home" aria-hidden="true"></i>
            Home
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/commands">
            <i className="fa fa-terminal" aria-hidden="true"></i>
            Commands
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/timers">
            <i className="fa fa-clock-o" aria-hidden="true"></i>
            Timers
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/feedback">
            <i className="fa fa-comment" aria-hidden="true"></i>
            Feedback
          </Link>
        </li>
        {updateLink}
      </ul>
    );
  }
}

export default Nav;
