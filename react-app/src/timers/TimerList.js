import React from 'react'
// import PropTypes from 'prop-types'
// import Todo from './Todo'

// <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />

const TimerList = ({ timers, onClick }) => (
  <ul className='list-group' >
    {
      timers.map(timer => (
        <li className="list-group-item"> {timer.message} {timer.interval} </li>
      ))
    }
  </ul>

)

export default TimerList
