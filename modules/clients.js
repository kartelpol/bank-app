function getAllClients (req, res, db) {
  let query = db.query("SELECT *  FROM client", function(err, response) {
    if(err) {
      res.send('Error. Cannot update information about clients.');
      throw err;
    } else {
      res.send(response);
    }
  });
}



function getClientInfo (req, res, db) {
  let query = db.query('SELECT * FROM client WHERE idClient = ' + req.params.id, (err, response) => {
    if(err) {
      throw err;
    } else {
      res.send(response);
    }
  });
}



function editClient (req, res, db) {

  let oldInfo = db.query('SELECT * FROM client WHERE idClient = ' + req.params.id, (err, response) => {
    if(err) throw err;
  });

  let newInfo = createDataObject(req.body);

  let passingNewInfo = db.query("UPDATE client SET? WHERE idClient = " + req.params.id, newInfo, (err, response) => {
  if (err) {
    res.send('Ошибка! Проверьте формат введенных данных');
    throw err;  
  } else res.send("Информация о клиенте успешно отредактирована");
  });
}



async function addNewClient (req, res, db) {
  let obj= createDataObject(req.body);

  let validResult = validateForm(req.body);
  if (validResult) {
    res.send(validResult);
    return;
  }
  
  await new Promise((resolve, reject) => {
    db.query("SELECT PassportNo, IdentificationNo FROM client", obj, function(err, response) {
      if (err) throw err;
      response.forEach((row) => {
        if (row.PassportNo == req.body.PassportNo || row.IdentificationNo == req.body.IdentificationNo) {
          res.send('Пользователь с такими паспортными данными уже существует');
          return;
        }
      });
      resolve();
    });
  }).catch((err) => res.send(err.message));

  let query = db.query("INSERT INTO client SET?", obj, function(err, response) {
    if (err) {
      res.send('Ошибка! Проверьте формат введенных данных');
      throw err;  
    } else res.end('Клиент успешно добавлен в базу');
  });
}

function validateForm(obj) {
    for (let key in obj) {
      if (key === 'LastName' || key === 'FirstName' || key === 'FatherName') {
        var reg = new RegExp("^[A-zА-яЁё]+$");
        if (!reg.test(obj[key])) {
          return 'Формат ФИО предусматривает только буквы'
        }
      } 
    }
}



function deleteClient (req, res, db) {
  let query = db.query('DELETE FROM client WHERE idClient = ' + req.params.id, function(err, response) {
    if(err) {
      throw err;
    } else {
      res.send('Клиент удален');
    }
  });
}


function createDataObject(obj) {
  let newObj = {};
  for(let key in obj) {
    if( obj[key] ) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

module.exports = {getAllClients: getAllClients,
                  getClientInfo: getClientInfo, 
                  addNewClient: addNewClient,
                  deleteClient: deleteClient, 
                  editClient: editClient,
                };