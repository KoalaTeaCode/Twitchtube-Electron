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
          <nav className="navbar navbar-light bg-faded">
            <a className="navbar-brand" href="#">
              Bootstrap
            </a>
          </nav>

          <div className='container-fluid'>
            <div className="row">
              <section className='col-2'>
                <Nav value={'test'} />
              </section>

              <section className="col-10 App-intro">
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
