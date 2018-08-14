import React, { Component } from 'react';
import Moment from 'react-moment';
import { Route  } from 'react-router-dom';
import { Redirect, Switch } from 'react-router';

import '../style/addCredit.css';
import updateForm from '../utils/getInfo';
import  translateInfoToList from '../utils/parseServicesInfo';
import  creditPaymentCounter from '../utils/creditPaymentCounter';

class AddCredit extends Component {
  state = {
    credits: [],
    activeCredit: '',
    creditInfo: [],
    dateNow: Date.now(),
    userInfo: {idClient: this.props.match.params.id }
  }

  componentDidMount = () => {
    updateForm(this, '/credits/all', 'credits');
  }

  chooseCredit = (value) => {
    this.setState({
      ...this.state,
      activeCredit: value
    }, () => { updateForm(this, '/credits/' + this.state.activeCredit, 'creditInfo')})
  }

  onChangeCreditSum = (event) => {
    let payment = creditPaymentCounter(event.target.value, this.state.creditInfo[0]['Срок кредитования, месяц'], this.state.creditInfo[0]['Процентная ставка'] );
    let commonPayment = +payment * +this.state.creditInfo[0]['Срок кредитования, месяц'];
    commonPayment = commonPayment.toFixed(2);
    this.setState({
      userInfo: {
        ...this.state.userInfo, 
        'Сумма кредита, BYR': event.target.value,
        'Ежемесячный платеж, BYR' : payment,
        'Сумма к погашению' : commonPayment
      }
    }) 
  }

  addCredit = (event) => {
    event.preventDefault();
    let data = this.state.userInfo;
    data.idCredit = this.state.creditInfo[0].idCredit;
    data["Дата выдачи кредита"] = document.getElementById('date').textContent;
    data["Срок погашения, месяц"] = this.state.creditInfo[0]["Срок кредитования, месяц"];
    updateForm(this, this.props.location.pathname, "addCreditResult", data);
  }


	render() {
    console.log(this);
		return(
        <Switch>
          <Route  exact path='/clients/:id/credits/add' render={() => 
            <div className="credit-form">
            { this.state.responseMessage  && (<Redirect to={this.props.location.pathname + '/successfuly'} />)}
            { this.state.addCreditResult  && (<Redirect to={this.props.location.pathname + '/successfuly'} />)}
              <p>Выберите кредит</p>
                <select onChange={ event => this.chooseCredit(event.currentTarget.value)}>
                <option selected disabled >Не выбрано</option>
                {this.state.credits.map((credit, key) => {
                  return <option key = {key}>{credit["Название кредита"]}</option>
                })}
                </select>
                <div className="credit">
                  { this.state.creditInfo.length !=0 && (<div className='credits-info'>{this.state.creditInfo.map((credit, key) => translateInfoToList(credit, key))}</div>)}
                  { this.state.creditInfo.length !=0 && (
                    <div className = 'user-info'>
                      <form onSubmit = {this.addCredit}>
                        <p>Текущая дата</p>
                        <Moment id="date" format='YYYY-MM-DD'>{Date.now()}</Moment>
                    
                        <label htmlFor = "credit">Введите сумму кредитования</label>
                        <input required type="number" onChange={this.onChangeCreditSum} id="credit" max={this.state.creditInfo[0]['Макс. сумма кредита, BYR']} min={this.state.creditInfo[0]['Мин. сумма кредита, BYR']} placeholder={this.state.creditInfo[0]['Мин. сумма кредита, BYR']}/>
                      
                        {this.state.userInfo["Ежемесячный платеж, BYR"] &&
                          <div>
                            <p>Общая сумма к погашению: <span>{this.state.userInfo["Сумма к погашению"] + ' BYR'}</span></p>
                            <p>Ежемесячный платеж: <span>{this.state.userInfo["Ежемесячный платеж, BYR"]+ ' BYR'}</span></p>
                          </div>
                        }
                
                        <input type='submit'/>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            }/>
          
          <Route path='/clients/:id/credits/add/successfuly' render = {()=> 
            <div className="credit-form">
              {this.state.responseMessage ? <div>{this.state.responseMessage}</div> : 
                this.state.addCreditResult ?
                <div>
                  <h2>Ваш кредит успешно добавлен</h2>
                  <div>{translateInfoToList(this.state.addCreditResult[0])}</div>
                </div> :
                <Redirect to={'/clients/' + this.props.match.params.id}/>
              } 
            </div>
          }/>
        </Switch>
		) 
	}
}

export default AddCredit;