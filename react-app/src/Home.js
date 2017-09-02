import React, { Component } from 'react';

// Electron
const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer  = electron.ipcRenderer;

function stopYoutube(props) {
  return (
    <button onClick={props.onClick}>
      Stop Youtube
    </button>
  );
}

class Home extends Component {
  constructor () {
    super()
    this.state = {
      youtubeStatus: 'stopped',
      twitchStatus: 'stopped',
    }

    ipcRenderer.on('youtube-started', (event, arg) => {
      this.setState({youtubeStatus: 'started'});
    });

    ipcRenderer.on('youtube-stopped', (event, arg) => {
      this.setState({youtubeStatus: 'stopped'});
    });

    ipcRenderer.on('twitch-started', (event, arg) => {
      this.setState({twitchStatus: 'started'});
    });

    ipcRenderer.on('twitch-stopped', (event, arg) => {
      this.setState({twitchStatus: 'stopped'});
    });

    this.startTwitch = this.startTwitch.bind(this);
    this.startYoutube = this.startYoutube.bind(this);
  }

  startTwitch () {
    if (this.state.twitchStatus !== 'started') {
      ipcRenderer.send('twitch-sign-in', 'ping');
      return;
    }
    ipcRenderer.send('twitch-stop', 'ping');
  }

  startYoutube () {
    if (this.state.youtubeStatus !== 'started') {
      ipcRenderer.send('google-sign-in', 'ping');
      return;
    }
    ipcRenderer.send('google-stop', 'ping');
  }

  render() {
    return (
      <div>
        <h2>Home</h2>

        <button onClick={this.startTwitch}>
          {this.state.twitchStatus === 'started' ? 'Stop' : 'Start'} Twitch
        </button>

        <button onClick={this.startYoutube}>
          {this.state.youtubeStatus === 'started' ? 'Stop' : 'Start'} Youtube
        </button>
      </div>
    );
  }
}

export default Home
