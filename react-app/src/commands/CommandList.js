import React from 'react'
// import PropTypes from 'prop-types'
// import Todo from './Todo'

// <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />

const CommandList = ({ commands, onClick, deleteClick }) => (
  <ul className='list-group'>
    {
      commands.map(command => (
        <li className="list-group-item" key={command.id}>
          <div style={{width: '100%'}}>
            {command.trigger} {command.response}
            <div className='float-right'>
              <i className="fa fa-trash" aria-hidden="true" onClick={() => deleteClick(command.id)}></i>
            </div>
          </div>
        </li>
      ))
    }
  </ul>

)

export default CommandList
