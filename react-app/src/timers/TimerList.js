import React from 'react'
// import PropTypes from 'prop-types'
// import Todo from './Todo'

// <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />

const TimerList = ({ timers, onClick }) => (
  <ul>
    {
      timers.map(timer => (
        <li> {timer.message} {timer.interval} </li>
      ))
    }
  </ul>

)

export default TimerList
