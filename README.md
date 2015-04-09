genno
---

`npm install genno`

async array transformations and flow control with generators and channels (via [js-csp](https://github.com/ubolonton/js-csp))

- reduce, reduceRight
- map, mapSeries
- filter, filterSeries
- concurrent, series, waterfall

```js

var {go, chan, putAsync, timeout} = require('js-csp'),
  {map, mapSeries, filter, reduce, concurrent, series, waterfall} = require('./index.js');

// first, a helper to get a channel for a request
function fetch(url){
  var ch = chan();
  // make a request, put its response on a channel
  require('superagent').get(url).end((err, res)=> {putAsync(ch, err || res);  ch.close();});
  return ch;
}

var urls = ['http://www.google.com', 'http://www.jlongster.com', 'http://www.myntra.com'];

go(function*(){  
  // do a bunch of requests in parallel, 
  // and save their response lengths
  yield map(urls, function*(url){
    return (yield fetch(url)).text.length;
  }); //  [ 19643, 12148, 285823 ]
  // neat!

  // the same, but in series
  yield mapSeries(urls, function*(url){
    return (yield fetch(url)).text.length;
  });     //  [ 19683, 12148, 285826 ]

  // async filter like a boss
  yield filter(urls, function*(url){
    return (yield fetch(url)).text.length > 100000;
  });     //  [ 'http://www.myntra.com']
  // also available, filterSeries

  // arbitrary reduce
  yield reduce(urls, function*(weight, url){
  	return weight + (yield fetch(url)).text.length
  }, 0); 		// 319457
  // also available, reduceRight

  yield concurrent([
  	function*(){ yield timeout(800); return 'a'; },
  	function*(){ yield timeout(200); return 'b'; },
  	function*(){ yield timeout(300); return 'c'; }]); 
	// ['a', 'b', 'c' ], time taken 800ms

	
  yield series([
  	function*(){ yield timeout(800); return 'a'; },
  	function*(){ yield timeout(200); return 'b'; },
  	function*(){ yield timeout(300); return 'c'; }]); 
	// ['a', 'b', 'c' ], time taken 1300ms

	yield waterfall([
  	function*(x){ yield timeout(800); return x*2 },
  	function*(x){ yield timeout(200); return x+5 },
  	function*(x){ yield timeout(300); return 'c'; }]); 
	
});

 
```

tests - `npm test`


