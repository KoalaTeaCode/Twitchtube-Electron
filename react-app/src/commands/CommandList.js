import React from 'react'
// import PropTypes from 'prop-types'
// import Todo from './Todo'

// <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />

const CommandList = ({ commands, onClick }) => (
  <ul className='list-group'>
    {
      commands.map(command => (
        <li className="list-group-item"> {command} </li>
      ))
    }
  </ul>

)

export default CommandList
