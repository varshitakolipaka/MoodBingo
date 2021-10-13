/*
 ----------------------------------
 filename: shuffle_array.js 
 (local module)
 ----------------------------------- 
 */

 //function to randomise the card selected at every turns
 const shuffleArray = (array)  => {
  console.log("inside_s1");
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

module.exports = shuffleArray;