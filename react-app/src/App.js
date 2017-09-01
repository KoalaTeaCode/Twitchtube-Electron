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

const Home = () => (
  <div>
    <h2>Home</h2>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
)

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App container-fluid">
          <nav className="navbar navbar-light bg-faded">
            <a className="navbar-brand" href="#">
              Bootstrap
            </a>
          </nav>
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
