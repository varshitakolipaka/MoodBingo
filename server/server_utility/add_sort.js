/*
 ----------------------------------
 filename: shuffle_array.js 
 (local module)
 ----------------------------------- 
 */

 //function to keep track of the card won by a user
 function addAndSort(arr, val) {
   
	arr.push(val);
	i = arr.length - 1;
	item = arr[i];
	while (i > 0 && item < arr[i - 1]) {
		arr[i] = arr[i - 1];
		i -= 1;
	}
	arr[i] = item;
	return arr;
}

module.exports = addAndSort;