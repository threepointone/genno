var csp = require('js-csp'),
  {chan, putAsync, take, go, put, timeout} = csp;
  // {into, merge, mapFrom, reduce} = csp.operations;

var {map, mapSeries, reduce, reduceRight, concurrent, series, waterfall, filter, filterSeries} = require('./index.js');

function* fake1(n){
	yield timeout(100*n);
	return n*10;
}

function* fake2(ret, n){
  yield timeout(Math.random()*100); 
  return ret - n;
}

function* fake3(n){
  yield timeout(Math.random()*100);
  return n*2;
}


require('chai').should();


describe('arrays', ()=> {
  it('map', done => {
    go(function*(){
      var start = Date.now();
      (yield map([1, 2, 3, 4], fake1)).should.eql([10, 20, 30, 40]); 

      var delta = (Date.now() - start) - 400;
      (delta < 50 && delta > 0).should.be.ok;
      done();  
    });
  })

  it('mapSeries', done => {
    go(function*(){
      var start = Date.now();
      (yield mapSeries([1, 2, 3, 4], fake1)).should.eql([10, 20, 30, 40]); 

      var delta = (Date.now() - start) - 1000;
      (delta < 50 && delta > 0).should.be.ok;
      done();  
    });          
  });

  // it('mapLimit');
  
  it('reduce', done => {
    go(function*(){
      var start = Date.now();
      
      (yield reduce([1, 2, 3, 4], fake2, 0))
        .should.eql(-10);
      
      var delta = (Date.now() - start);
      (delta < 400).should.be.ok;
      done();
    })
  });

  it('reduceRight', done => {
    go(function*(){
      (yield reduceRight([1, 2, 3, 4], fake2))
        .should.eql(-2);
      
      done();
    })
  });

  it('filter', done => {
    go(function*(){
      (yield filter([2, 3, 5, 6, 7, 8, 10, 11], function*(num){ yield timeout(Math.random()*200); return yield num%2===0}))
        .should.eql([2, 6, 8, 10])
        done();
    })
  })  

  it('filterSeries', done => {
    go(function*(){
      (yield filterSeries([2, 3, 5, 6, 7, 8, 10, 11], function*(num){ yield timeout(Math.random()*200); return yield num%2===0}))
        .should.eql([2, 6, 8, 10])
        done();
    })
  })  

  // it('detect')
  // it('detectSeries')
  // it('sortBy')
  // it('some')
  // it('every')
  // it('concat')
  // it('concatSeries')
})

describe('control flow', ()=>{
  it('concurrent', done => {
    go(function*(){
      (yield concurrent([3, 5, 7, 9].map(num => fake1.bind(this, num)))).should.eql([30, 50, 70, 90]);
      done();  
    }) 

  });

  it('series', done => {
    go(function*(){
      (yield series([1, 2, 3].map(num => fake1.bind(this, num)))).should.eql([10, 20, 30]);
      done();  
    })     
  });

  it('waterfall', done => {
    go(function*(){
      (yield waterfall([fake3, fake3, fake3], 2)).should.eql(16)
      done();
    })
  })

  // it('concurrentLimit')

})




