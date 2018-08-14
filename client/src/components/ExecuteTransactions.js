import React, { Component } from 'react';
import Transactions from './Transactions';

class ExecuteTransactions extends Component {
  state = {
    message: ""
  }

  componentDidMount = () => {
    const _this = this;
    let url = this.props.location.pathname;
    let xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);
    xhr.send();

    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (xhr.status != 200) {
        alert( xhr.status + ': ' + xhr.statusText ); // пример вывода: 404: Not Found
      } else {
        _this.setState({'message' : xhr.responseText });
       
      }
    }

  }

	render() {
		return (
      <div style = {{'margin-top': '80px'}}>
        <span>{this.state.message}</span>
        {this.state.message && 
          <div>
            <span>Полный отчет о движении денежных средств:</span>
            <Transactions />
          </div>}
      </div>
		)
	}
}

export default ExecuteTransactions;