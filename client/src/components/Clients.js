import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../style/Table.css';
import updateForm from '../utils/getInfo';

class Clients extends Component {
  state = {
    clients: [] 
  }

  componentDidMount = () => {
    updateForm(this, this.props.url, 'clients', {});
  }

  translateFieldsHelper = (obj, id) => {
    let regExpForId = /^id/;
    let arr = [];
    for(let key in obj) {
      if (!regExpForId.exec(key)){
        key == 'Retirement' && obj[key] == 'on' ? obj[key] = 'да' : key == 'Retirement' ? obj[key] = 'нет' : null;
        arr.push(<td key = {id + key}><Link to={'/clients/'+ obj.idClient}>{obj[key]}</Link></td>);
      }
    }
    return arr;
  }

	render() {
		return (
      <div className="table" id="clients">
        <table id="table">
        <tbody>
          <tr className="head">
            <th colSpan="4">Персональные данные</th>
            <th colSpan="7">Паспортные данные</th>
            <th colSpan="3">Контактная информация</th>
            <th colSpan="3">Информация с места работы</th>
            <th colSpan="3">Дополнительно</th>
          </tr>
          <tr className="fields head">
            <th>Фамилия</th>
            <th>Имя</th>
            <th>Отчество</th>
            <th>Дата рождения</th>
            <th>Серия</th>
            <th>№</th>
            <th>Идент. номер</th>
            <th>Выдан</th>
            <th>Дата выдачи</th>
            <th>Гражданство</th>
            <th>Адрес прописки</th>
            <th>Адрес</th>
            <th>Моб. номер</th>
            <th>Эл. почта</th>
            <th>Место работы</th>
            <th>Должность</th>
            <th>Доход(месяц)</th>
            <th>Семейное положение</th>
            <th>Пенсионер</th>
          </tr>
          { this.state.clients.map((client, id) => {
            return (<tr key={client.idClient}>{
              this.translateFieldsHelper(client, id)
            }</tr>)
          })}
          </tbody>
        </table>
      </div>
		);
	}
}

export default Clients;