import React from 'react';

let translateInfoToList = (obj, key) => {
    let regExpForId = /^id/;
    let arr = [];

    for(let key in obj) {
      if (!regExpForId.exec(key)){
        arr.push(<p key = {key}>{key + ':' + obj[key]}</p>);
      }
    }
    return arr;
  }
  export default translateInfoToList;