import React from 'react'
// import PropTypes from 'prop-types'
// import Todo from './Todo'

// <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />

const TimerList = ({ timers, onClick, deleteClick }) => (
  <ul className='list-group' >
    {
      timers.map(timer => (
        <li className="list-group-item" key={timer.id}>
          <div style={{width: '100%'}}>
            {timer.message} {timer.interval}
            <div className='float-right'>
              <i className="fa fa-trash" aria-hidden="true" onClick={() => deleteClick(timer.id)}></i>
            </div>
          </div>
        </li>
      ))
    }
  </ul>

)

export default TimerList
