 let updateForm = (context, url, statefield, data ) => {
    let body = JSON.stringify(data) || "";
    console.log(url);

    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    console.log(body);
    if(body) xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(body);

    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;
      if (xhr.status != 200) {
        alert( xhr.status + ': ' + xhr.statusText ); // пример вывода: 404: Not Found
      } else if (IsJsonString(xhr.responseText)) {
        context.setState({ [statefield]: JSON.parse(xhr.responseText) });
      } else if (typeof xhr.responseText == 'string') {
        console.log(xhr.responseText);
        context.setState({'responseMessage': xhr.responseText});
      }
    }
  }

  let IsJsonString = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

  export default updateForm;