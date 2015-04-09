var { go, chan, putAsync, timeout} = require('js-csp'),
  {map, mapSeries, filter, reduce, concurrent, series, waterfall} = require('./index.js');

var urls = ['http://www.google.com', 'http://www.jlongster.com', 'http://www.myntra.com'];

// first, a helper to get a channel for a request
function fetch(url){
  var ch = chan();
  // make a request, put its response on a channel
  require('superagent').get(url).end((err, res)=> {putAsync(ch, err || res);  ch.close();});
  return ch;
}

function log(...args){
  return console.log(...args);
}




go(function*(){  
  // do a bunch of requests in parallel, 
  // and save their response lengths
  console.time('map');
  log(yield map(urls, function*(url){
    return (yield fetch(url)).text.length;
  })); //  [ 19643, 12148, 285823 ]
  console.timeEnd('map');
  // neat!

  // the same, but in series
  log(yield mapSeries(urls, function*(url){
    return (yield fetch(url)).text.length;
  }));     //  [ 19683, 12148, 285826 ]

  // async filter like a boss
  log(yield filter(urls, function*(url){
    return (yield fetch(url)).text.length > 100000;
  }));     //  [ 'http://www.myntra.com']
  // also available, filterSeries

  // arbitrary reduce
  log(yield reduce(urls, function*(weight, url){
  	return weight + (yield fetch(url)).text.length
  }, 0)); 		// 319457
  // also available, reduceRight

  console.time('concurrent');
  log(yield concurrent([
  	function*(){ yield timeout(800); return 'a'; },
  	function*(){ yield timeout(200); return 'b'; },
  	function*(){ yield timeout(300); return 'c'; }])); 
  console.timeEnd('concurrent');
	// ['a', 'b', 'c' ], time taken 800ms

	
  log(yield series([
  	function*(){ yield timeout(800); return 'a'; },
  	function*(){ yield timeout(200); return 'b'; },
  	function*(){ yield timeout(300); return 'c'; }])); 
	// ['a', 'b', 'c' ], time taken 1300ms

	log(yield waterfall([
  	function*(x){ yield timeout(800); return x*2 },
  	function*(x){ yield timeout(200); return x+5 },
  	function*(x){ yield timeout(300); return x*x; }], 2)); 
  // 81
	
});

