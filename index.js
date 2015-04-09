var csp = require('js-csp'),
  { chan, putAsync, take, go, put, timeout, spawn } = csp;

function* defgen(x){
  return yield x;
}


export function reduce(arr, gen, init) {
  return go(function*(){
    var hasInit = init !== undefined
    var ret = hasInit ? init : arr[0];
    for(var i = hasInit ? 0 : 1, j = arr.length; i<j; i++){
      ret = yield spawn(gen(ret, arr[i], i));      
    }
    return yield ret;
  })  
}

export function map(arr, gen=defgen) {  
  return reduce(arr.map(val => spawn(gen(val))),
    function*(o, el){ return o.concat(yield el);}, [])
}

export function mapSeries(arr, gen=defgen){
  return reduce(arr, function*(o, el){ return o.concat(yield spawn(gen(el)));}, [])  
}

var sentinel = {};
export function filter(arr, f){
  return go(function*(){ return (yield map(arr, 
  	function*(el){ return (yield spawn(f(el))) ? el: sentinel })).filter( x => x!==sentinel);
  });
}

export function filterSeries(arr, f){
  return reduce(arr, function*(a, el){ return !!(yield spawn (f(el))) ?  a.concat(el) : a}, []);
}

export function reduceRight(arr, gen, init){
  return reduce(arr.reverse(), gen, init);
}


// flow control
export function concurrent (gens){
  return map(gens.map(gen => spawn(gen())), defgen);
}

export function series (gens){
  return mapSeries(gens, function*(gen){ return yield spawn(gen())});
}

export function waterfall(gens, init){
  return reduce(gens, function*(o, gen){ return yield spawn(gen(o)); }, init)      
}


// takeasync?