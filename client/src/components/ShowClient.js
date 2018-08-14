import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Clients from './Clients';
import AvailableServices from './AvailableServices';


class ShowClient extends Component {
  
  deleteRequest = (event) => {
    event.preventDefault();
    let url = this.props.location.pathname + '/delete';
    let xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);
    xhr.send();

    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (xhr.status != 200) {
        alert( xhr.status + ': ' + xhr.statusText ); // пример вывода: 404: Not Found
      } else {
        alert(xhr.responseText);
       
      }
    }
  }


	render() {
		return(
      <div>
        <Clients url={this.props.location.pathname} />
        <Link to = {'/clients/' + this.props.match.params.id + '/edit'}>
          <button>edit</button>
        </Link>
        <button onClick = {this.deleteRequest}>delete</button>
        <AvailableServices url={this.props.location.pathname + '/deposits'} stateField = 'deposits' />
        <Link to = {this.props.location.pathname + '/deposits/add'}>
          <button>add deposit</button>
        </Link>
        <AvailableServices url={this.props.location.pathname + '/credits'} stateField = 'credits' />
        <Link to = {this.props.location.pathname + '/credits/add'}>
          <button>add credit</button>
        </Link>
      </div>
		)
	}
}

export default ShowClient;