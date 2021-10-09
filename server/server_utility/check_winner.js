const declareWinner = (array, rows) => {

	//rows
	var arr = array;

	for (var i = 0; i < arr.length; i++) {
		if ((arr[i] + 1) % rows == 1) {
			var k = 0;
			for (var j = 0; j < rows; j++) {
				if (arr.includes(arr[i] + j, i)) {
					k++;
				}
			}

			if (k == rows) {
				console.log("Game Won through rows");
				return 0;
			}
		}
	}

	//column

	var len = arr.length;

	for (var rem = 0; rem < rows; rem += 1) {

		var count = 0;

		for (var j = 0; j < len; j += 1) {

			if ((arr[j] + 1) % rows == rem) {
				count++;
				console.log("inside column");
				console.log(arr[j]);
			}
		}
		if (count == rows) {
			console.log("game win through columns");
			return 1;
		}
	}

	//diagonal 1

	var count = 0;
	for (var j = 0; j < len; j += 1) {

		if (parseInt(arr[j], 10) % (parseInt(rows, 10) + 1) == 0) {

			count++;
		}
	}
	if (count == rows) {
		console.log("won using diagonals 1");
		return 2;
	}

	//diagonal 2
	var count2 = 0;
	for (var j = 0; j < rows; j++) {
		let smol = parseInt(rows) - 1;
		let prod = j * smol;
		let sum = parseInt(rows, 10) + parseInt(prod, 10);
		let final = sum - 1;

		if (arr.includes(final)) {
			count2++;
		}
	}
	if (count2 == rows) {
		console.log("won using diagonals 2");
		return 3;
	}
	return 4;
};

module.exports = declareWinner;