function depositPercentCounter(sum, percent, term, monthAfterTerm) {
	//debugger;
	let endSum;
	let effectiveSum = +sum * Math.pow(1 + (+percent * 30 / 100 / 365), +term);
	endSum = effectiveSum;

	if (monthAfterTerm && monthAfterTerm > term) {
		let sumAfterTerm = effectiveSum * Math.pow(1 + (0.01 * 30 / 100 / 365), +monthAfterTerm - +term);
		endSum = sumAfterTerm;
	}
	
	let percents = endSum - +sum;
	return {endSum: endSum.toFixed(2), percents: percents.toFixed(2)};
}

export default depositPercentCounter;