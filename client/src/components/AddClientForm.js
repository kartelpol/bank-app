import React, { Component } from 'react';
import { Route  } from 'react-router-dom';
import { Redirect, Switch } from 'react-router';

import '../style/Form.css';
import updateForm from '../utils/getInfo';

class AddClientForm extends Component {
  state = {
    clients: []
  }

  componentDidMount() {
    if(this.props.match.params.id) {
      updateForm(this, '/clients/' + this.props.match.params.id, 'clients');
    }
  }

  sendEditRequest = (event) => {
    event.preventDefault();
    let data = {};
    let formData = new FormData(event.target);
    for (var [key, value] of formData.entries()) { 
      data[key] = value || '';
    }
    console.log(data);
    console.log(this.props.location.pathname);
    updateForm(this, this.props.location.pathname, "", data);
  }

  onChange = (val, property) => {
    this.setState( {clients: {
      0: {
        ...this.state.clients[0],
        [property]: val
      }
    }
  });
  }

  render() {
    { (!this.props.match.params.id && this.state.clients.length) && this.setState({clients: []}); console.log(this)}
    return(
      <Switch>
       <Route exact path = '/clients/add/successfuly'>
          {!this.state.responseMessage ? <Redirect to='/clients/all' /> : 
            <div style = {{'marginTop': '60px'}}>{this.state.responseMessage}</div>
          }
        </Route>

        <Route path = '/clients'>
          <form style={{"marginTop": "40px"}} onSubmit={this.sendEditRequest} className="add-client-form" id="addClientForm">
            { this.state.responseMessage && <Redirect to = "/clients/add/successfuly" />}
            <div className="input">
              <label htmlFor="lastName">Фамилия<span className="required">*</span></label>
              <input type="text" name="LastName" id="lastName" onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))} value={this.state.clients[0]? this.state.clients[0].LastName : ""} required /> 
            </div>
            <div className="input">
              <label htmlFor="firstName">Имя<span className="required">*</span></label>
              <input type="text" name="FirstName" id="firstName"  onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))} value={this.state.clients[0] ? this.state.clients[0].FirstName : ""} required /> 
            </div>
            <div className="input">
              <label htmlFor="fatherName">Отчество<span className="required">*</span></label>
              <input type="text" name="FatherName" id="fatherName"  onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))} value={this.state.clients[0] ? this.state.clients[0].FatherName : ""} required /> 
            </div>
            <div className="input">
              <label htmlFor="birthday">Дата рождения<span className="required">*</span></label>
              <input type="date" required defaultValue={this.state.clients[0] ? this.state.clients[0].Birthday : ""} onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))}name="Birthday" id="birthday" />  
            </div>
            <div className="input">
              <label htmlFor="passportSeries">Серия паспорта</label>
              <input type="text" name="PassportSeries" id="passportSeries" onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))} value={this.state.clients[0] ? this.state.clients[0].PassportSeries : ""} maxLength='2' minLength='2' /> 
            </div>
            <div className="input">
              <label htmlFor="passportNo">Номер паспорта</label>
              <input type="text" name="PassportNo" id="passportNo"  onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))} value={this.state.clients[0] ? this.state.clients[0].PassportNo : ""} maxLength='7' minLength='7' /> 
            </div>
            <div className="input">
              <label htmlFor="identification">Идентификационный номер</label>
              <input type="text" name="IdentificationNo" id="identification" onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))} value={this.state.clients[0] ? this.state.clients[0].IdentificationNo : ""} maxLength='14' minLength='14' /> 
            </div>
            <div className="input">
              <label htmlFor="authority">Выдан органом</label>
              <input type="text" name="Authority" id="authority" onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))} value={this.state.clients[0] ? this.state.clients[0].Authority : ""} /> 
            </div>
            <div className="input">
              <label htmlFor="dateOfIssue">Дата выдачи</label>
              <input type="date" name="DateOfIssue" id="dateOfIssue" onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))} value={this.state.clients[0] ? this.state.clients[0].DateOfIssue : ""} /> 
            </div>
            <div className="input">
              <label htmlFor="Nationality">Гражданство</label>
              <select name="Nationality" id="Nationality" onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))}>
                  <option>РБ</option>
                  <option>РФ</option>
                  <option>США</option>
              </select>
            </div>
            <div className="input">
              <label htmlFor="Registration">Адрес прописки</label>
              <input type="text" name="Registration" id="Registration" onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))} value={this.state.clients[0] ? this.state.clients[0].Registration : ""}/> 
            </div>
            <div className="input">
              <label htmlFor="address">Фактический адрес</label>
              <input type="text" name="CurrentAddress" id="address" onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))} value={this.state.clients[0] ? this.state.clients[0].CurrentAddress : ""} />  
            </div>
            <div className="input">
              <label htmlFor="mobile">Мобильный номер       +375</label>
              <input type="tel" name="Mobile" id="mobile" onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))} value={this.state.clients[0] ? this.state.clients[0].Mobile : ""} maxLength='9' minLength='9'/>  
            </div>
            <div className="input">
              <label htmlFor="e-mail">E-mail</label>
              <input type="email" name="E-mail" id="e-mail" onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))} value={this.state.clients[0] ? this.state.clients[0]['E-mail'] : ""} />  
            </div>
            <div className="input">
              <label htmlFor="job">Место работы</label>
              <input type="text" name="Job" id="job" onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))} value={this.state.clients[0] ? this.state.clients[0].Job : ""} /> 
            </div>
            <div className="input">
              <label htmlFor="position">Должность</label>
              <input type="text" name="Position" id="position" onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))} value={this.state.clients[0] ? this.state.clients[0].Position : ""} /> 
            </div>
            <div className="input">
              <label htmlFor="income">Месячный доход<span className="required">*</span></label>
              <input type="text" required name="MonthlyIncome" id="income" onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))} value={this.state.clients[0] ? this.state.clients[0].MonthlyIncome : ""} />  
            </div>
            <div className="input">
              <label htmlFor="MaritalStatus">Семейное положение</label>
              <select name="MaritalStatus" id="MaritalStatus" onChange = { event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))}>
                  <option>Холост</option>
                  <option>Женат</option>
                  <option>Замужем</option>
                  <option>Не замужем</option>
              </select> 
            </div>
            <div className="input checkbox">
              <label htmlFor="retirement">Пенсионер</label>
              <input type="checkbox" name="Retirement" id="retirement" onChange={ event => this.onChange(event.target.value, event.currentTarget.getAttribute('name'))} checked = {this.state.clients[0] ? this.state.clients[0].Retirement : false}/> 
            </div>    
            <div className="input submit">
              <input type="submit" id="submit" name=""/>
            </div>
          </form>
        </Route>
      </Switch>
		);
	}
}

export default AddClientForm;