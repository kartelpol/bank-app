import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../style/Control.css';

class Control extends Component {
  render() {
    return (
      <div className = "control-panel">
        <div className="control-panel-buttons">
          <Link style = {{color: 'black'}} to = '/clients/all'>
            <button id="show-button">Посмотреть клиентов</button>
          </Link>
          <Link style = {{color: 'black'}} to = '/clients/add'>
            <button id="add-button">Добавить клиента</button>
          </Link>
          <Link to = '/execute_transactions'>
            <button id="transactions-button">Закрыть банковский день</button>
          </Link>
          <Link to = '/transactions'>
            <button id="show-transactions-button">Вывести отчет</button>
          </Link>
        </div>
        {/*<div className="search">
          <input type="text" name="searchByClient" placeholder="Search client" />
          <button className = "red-button">clear</button>
          <button className = "green-button">send</button>
        </div>*/}
      </div>
    );
  }
}


export default Control;