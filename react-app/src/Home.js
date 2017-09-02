import React, { Component } from 'react';

// Electron
const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer  = electron.ipcRenderer;

class Home extends Component {
  constructor () {
    super()
    this.state = {
      youtubeStatus: 'stopped',
      twitchStatus: 'stopped',
    }

    ipcRenderer.send('twitch-check', 'ping');
    ipcRenderer.on('twitch-check-response', (event, arg) => {
      if (arg) this.setState({twitchStatus: 'started'});
    });

    ipcRenderer.send('google-check', 'ping');
    ipcRenderer.on('google-check-response', (event, arg) => {
      if (arg) this.setState({youtubeStatus: 'started'});
    });

    ipcRenderer.on('youtube-started', (event, arg) => {
      window.amplitude.getInstance().logEvent('YOUTUBE_START');
      this.setState({youtubeStatus: 'started'});
    });

    ipcRenderer.on('youtube-stopped', (event, arg) => {
      window.amplitude.getInstance().logEvent('YOUTUBE_STOP');
      this.setState({youtubeStatus: 'stopped'});
    });

    ipcRenderer.on('twitch-started', (event, arg) => {
      window.amplitude.getInstance().logEvent('TWITCH_START');
      this.setState({twitchStatus: 'started'});
    });

    ipcRenderer.on('twitch-stopped', (event, arg) => {
      window.amplitude.getInstance().logEvent('TWITCH_STOP');
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
      <div className='row'>
        <div className='col-12'>
          <h1>Home</h1>
          <hr />
        </div>

        <div className='col-12 row bot-row'>
          <div className='col-2'>
            <img src='https://www.twitch.tv/p/assets/uploads/combologo_474x356.png' width='100' />
          </div>

          <div className='col-4'>
            <button className='btn btn-primary' onClick={this.startTwitch}>
              {this.state.twitchStatus === 'started' ? 'Stop' : 'Start'} Twitch
            </button>
          </div>
        </div>

        <div className='col-12 row bot-row'>
          <div className='col-2'>
            <img src='https://newswatchtv.com/wp-content/uploads/2015/08/Youtube-Gaming-logo.jpg' width='100'  />
          </div>

          <div className='col-4'>
            <button className='btn btn-primary' onClick={this.startYoutube}>
              {this.state.youtubeStatus === 'started' ? 'Stop' : 'Start'} Youtube
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Home
