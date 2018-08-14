import React, { Component } from 'react';
import { Link, Route  } from 'react-router-dom';
import { Redirect, Switch } from 'react-router';
import Moment from 'react-moment';

import '../style/addDeposit.css';
import updateForm from '../utils/getInfo';
import  translateInfoToList from '../utils/parseServicesInfo';
import  depositPercentCounter from '../utils/depositPercentCounter';

class AddDeposit extends Component {
  state = {
    deposits: [],
    type: 'отзывной',
    activeDeposit: '',
    depositInfo: [],
    dateNow: Date.now(),
    userInfo: {}
  }

  componentDidMount = () => {
    updateForm(this, '/deposits/' + this.state.type, 'deposits');
  }

  changeDepositsType = (value) => {
    this.setState({
      ...this.state,
      type: value
    }, () => {
      this.setState({
        ...this.state,
        depositInfo: [],
        userInfo: []
      });
      updateForm(this, '/deposits/' + this.state.type, 'deposits');
    });
  }

  chooseDeposit = (value) => {
    this.setState({
      ...this.state,
      activeDeposit: value,
      userInfo: []
    }, () => updateForm(this, '/deposits/details/' + this.state.activeDeposit, 'depositInfo'));
  }

  onSumChange = (event) => {
    if (this.state.userInfo['Срок хранения вклада, месяц']) {
      let obj = depositPercentCounter(event.target.value, this.state.depositInfo[0]['Процентная ставка'], this.state.depositInfo[0]['Срок вклада (в месяцах)'], this.state.userInfo['Срок хранения вклада, месяц'] );
      console.log(obj);
      this.setState({
        userInfo: {
          ...this.state.userInfo, 
          "Первоначальный размер вклада, BYR": event.target.value,
          "Проценты, BYR": obj.percents,
          "Итоговая сумма, BYR": obj.endSum
        }
      });
    } else {
      this.setState({
        userInfo: {
          ...this.state.userInfo, 
          "Первоначальный размер вклада, BYR": event.target.value
        }
      });
    }
  }

  onTermChange = (event) => {
    if (this.state.userInfo['Первоначальный размер вклада, BYR']) {
      let obj = depositPercentCounter(this.state.userInfo['Первоначальный размер вклада, BYR'], this.state.depositInfo[0]['Процентная ставка'], this.state.depositInfo[0]['Срок вклада (в месяцах)'], event.target.value);
      console.log(obj);
      this.setState({
        userInfo: {
          ...this.state.userInfo, 
          "Срок хранения вклада, месяц": event.target.value,
          "Проценты, BYR": obj.percents,
          "Итоговая сумма, BYR": obj.endSum
        }
      });
    } else {
      this.setState({
        userInfo: {
          ...this.state.userInfo, 
          "Срок хранения вклада, месяц": event.target.value
        }
      });
    }
  }


  addDeposit = (event) => {
    event.preventDefault();
    let data = this.state.userInfo;
    data.idInvestment = this.state.depositInfo[0].idInvestment;
    data.idCLient = this.props.match.params.id;
    data["Дата открытия"] = document.getElementById('date').textContent;
    updateForm(this, this.props.location.pathname, "addDepositResult", data);
  }

	render() {
		return (
      <div>
        <Switch>
        {console.log(this)}
          <Route exact path = '/clients/:id/deposits/add/successfuly'>
            <div className="deposit-form">
              {this.state.responseMessage ? <div>{this.state.responseMessage}</div> : 
                this.state.addDepositResult ?
                <div>
                  <h2>Ваш депозит успешно добавлен</h2>
                  <div>{translateInfoToList(this.state.addDepositResult[0])}</div>
                </div> :
                <Redirect to={'/clients/' + this.props.match.params.id}/>
              } 
            </div>
          </Route>

          <Route exact path = '/clients/:id/deposits/add'>
          <div>
            {this.state.responseMessage && (<Redirect to={this.props.location.pathname + '/successfuly'} />)}
            {this.state.addDepositResult && (<Redirect to={this.props.location.pathname + '/successfuly'} />)}
            <p>Выберите тип вклада</p>
            <select name="depositsType" onChange = { event => this.changeDepositsType(event.currentTarget.value)} >
              <option>отзывной</option>
              <option>безотзывной</option>
            </select>
            {this.state.deposits.length !=0 &&
              (<div>
                <p>Выберите вклад</p>
                <select onChange = { event => this.chooseDeposit(event.currentTarget.value)} >
                <option selected disabled>не выбран</option>
                  {this.state.deposits.map((deposit, key) => {
                    return (<option key = {key}>{deposit['Название вклада']}</option>)
                  })}
                </select>
              </div>)
            }
            <div className="deposit">
              { this.state.depositInfo.length !=0 && (<div className='deposits-info'>{this.state.depositInfo.map((deposit, key) => translateInfoToList(deposit, key))}</div>)}
              { this.state.depositInfo.length !=0 && (
                <div className = 'user-info'>
                  <form onSubmit = {this.addDeposit}>
                    <p>Текущая дата</p>
                    <Moment id="date" format='YYYY-MM-DD'>{Date.now()}</Moment>

                    <label htmlFor = "term">Введите срок хранения вклада (в месяцах)</label>
                    <input required type="number" onChange={this.onTermChange}  min={this.state.depositInfo[0]['Срок вклада (в месяцах)']} placeholder={this.state.depositInfo[0]['Срок вклада (в месяцах)']} id="term"/>
                    
                    <label htmlFor = "deposit">Введите сумму вклада</label>
                    <input required type="number" onChange={this.onSumChange} min={this.state.depositInfo[0]['Min сумма первоначального взноса, BYR']} id="deposit" placeholder={this.state.depositInfo[0]['Min сумма первоначального взноса, BYR']}/>
                    
                    {this.state.userInfo['Проценты, BYR'] && 
                      <div style = {{'textAlign': "left"}}>
                        <p>Проценты:  {this.state.userInfo['Проценты, BYR']}</p>
                        <p>Общая итоговая сумма:  {this.state.userInfo['Итоговая сумма, BYR']}</p>
                      </div>
                    }
                    
                    <input type='submit'/>
                  </form>
                </div>
              )}
            </div>
          </div>
          </Route>
        </Switch>
      </div>
		)
	}
}

export default AddDeposit;