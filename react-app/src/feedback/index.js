import React, { Component } from 'react';

class Feedback extends Component {
  constructor() {
    super()
  }

  render() {
    return (
      <div>
        <h1>Feedback</h1>
        <hr />
        <p>
          Feel free to send bug reports or features requests to <a href='mailto:keithrholliday@gmail.com'>keithrholliday@gmail.com</a>!
          <br />
          Thanks You :D
        </p>
      </div>
    );
  }
}

export default Feedback
