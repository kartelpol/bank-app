import React, { Component } from 'react';
import '../style/Table.css';
import updateForm from '../utils/getInfo';


class AvailableServices extends Component {
  state = {
    deposits: [], 
    credits: [], 
    transactions: []
  }

  componentDidMount = () => {
    console.log(this.props.url);
    updateForm(this, this.props.url, this.props.stateField, {});
  }

  translateFieldsHelper = (obj) => {
    let regExpForId = /^id/;
    let headArr = [];
    let arr = [];
    for(let key in obj) {
      if (!regExpForId.exec(key)){
        headArr.push(<th key = {key}>{key}</th>)
        arr.push(<td key = {key}>{obj[key]}</td>);
      }
    }
    return {header: headArr, values: arr};
  }

  getHeader = (obj) => {
    return this.translateFieldsHelper(obj).header;
  }

  getRow = (obj) => {
    return this.translateFieldsHelper(obj).values;
  }


	render() {
		return (
      <div className='table'>
        <table>
          <tbody>
            {this.state[this.props.stateField][0] && <tr>{this.getHeader(this.state[this.props.stateField][0])}</tr>}
            { this.state.responseMessage ?
              (<div>{this.state.responseMessage}</div>) : 
              this.state[this.props.stateField].map((row, id) => {
                return (<tr key={id}>{this.getRow(row)}</tr>)
            })}
          </tbody>
        </table>
      </div>
		)
	}

}

export default AvailableServices;