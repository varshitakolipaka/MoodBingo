var randomWords = require('random-words');
var val = randomWords({ exactly: 3, join: '-' })
console.log(val);