import React from 'react'
// import PropTypes from 'prop-types'
// import Todo from './Todo'

// <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />

const CommandList = ({ commands, onClick }) => (
  <ul>
    {
      commands.map(command => (
        <li> {command} </li>
      ))
    }
  </ul>

)

export default CommandList
