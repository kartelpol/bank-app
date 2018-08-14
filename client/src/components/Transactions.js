import React, { Component } from 'react';
import updateForm from '../utils/getInfo';
import AvailableServices from './AvailableServices';

class Transactions extends Component {
/*	state = {
		transactions: []
	}*/
/*
	componentDidMount = () => {
		updateForm(this, '/transactions', 'transactions', {});
	}*/

	render() {
		return (
			<AvailableServices url = '/transactions' stateField = 'transactions' />
		)
	}
}

export default Transactions;