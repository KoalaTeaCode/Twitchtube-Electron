import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'

import Nav from './nav/Nav';
import Footer from './components/Footer'
import AddTodo from './containers/AddTodo'
import VisibleTodoList from './containers/VisibleTodoList'
import Commands from './commands'
import Timers from './timers'
import Home from './Home'


// <AddTodo />
// <VisibleTodoList />
// <Footer />

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <div className='container-fluid'>
            <div className="row">
              <section className='col-3 sidebar'>
                <h4>TwitchTube</h4>
                <Nav value={'test'} />
              </section>

              <section className="col-9 App-intro">
                <Route exact path="/" component={Home} />
                <Route exact path="/commands" component={Commands} />
                <Route exact path="/timers" component={Timers} />
              </section>
            </div>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
