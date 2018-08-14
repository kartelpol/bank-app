let addOperation = function (db, acc1, acc2, sum, description) {
	let obj = objectMaker(acc1, acc2, sum, description);
	db.query('INSERT INTO financial_operations SET ?', obj);
}


let objectMaker = function (acc1, acc2, sum, description) {
return {
		'Счет №1': acc1,
		'Счет №2': acc2,
		'Сумма': sum,
		'Описание операции': description
	   }
}


module.exports = {
	add: addOperation
}