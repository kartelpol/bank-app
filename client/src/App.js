import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { Switch } from 'react-router';
/*import { Provider } from 'react-redux';
import { createStore} from 'redux';
import thunk from 'redux-thunk';
import { ConnectedRouter } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';*/

import logo from './img/logo.png';
import './style/App.css';
import Control from './components/Controls';
import Clients from './components/Clients';
import AddClientForm from './components/AddClientForm';
import ShowClient from './components/ShowClient';
import AddDeposit from './components/AddDeposit';
import AddCredit from './components/AddCredit';
import ExecuteTransactions from './components/ExecuteTransactions';
import Transactions from './components/Transactions';

class App extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to the Bank Application</h1>
        </header> 
        <Control />
        <Switch>
          <Route exact path= '/clients/all'>
            <Clients url = '/clients/all'/>
          </Route>    
          <Route exact path='/transactions' component = {Transactions} />
          <Route exact path='/clients/:id/edit' component={AddClientForm} />
          <Route path='/clients/add' component={AddClientForm} />
          <Route exact path='/clients/:id' component={ShowClient} />
          <Route path='/clients/:id/deposits/add' component={AddDeposit} />
          <Route path='/clients/:id/credits/add' component={AddCredit} />
          <Route path='/execute_transactions' component = {ExecuteTransactions} />

        </Switch>
      </div>
    );
  }
}

export default App;