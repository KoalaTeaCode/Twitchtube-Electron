import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Nav from './nav/Nav';

class App extends Component {
  render() {
    return (
      <div className="App container">
        <div className="row">
          <section className='col-4'>
            <Nav value={'test'} />
          </section>

          <section className="col-8 App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.
          </section>
        </div>
      </div>
    );
  }
}

export default App;
