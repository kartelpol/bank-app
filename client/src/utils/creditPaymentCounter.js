function creditPaymentCounter (credit, term, percent) {
	let i = +percent / 1200;
	let a = Math.pow(1 + i, +term);
	let K =  a * i / (a - 1);

	let payment = K*credit;
	return payment.toFixed(1);
}

export default creditPaymentCounter;