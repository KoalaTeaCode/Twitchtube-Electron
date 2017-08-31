import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'

import Nav from './nav/Nav';

const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
)

const Commands = () => (
  <div>
    <h2>Commands</h2>
  </div>
)

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App container">
          <div className="row">
            <section className='col-2'>
              <Nav value={'test'} />
            </section>

            <section className="col-10 App-intro">
              <Route exact path="/" component={Home} />
              <Route exact path="/commands" component={Commands} />
            </section>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
