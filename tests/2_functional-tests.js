/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, "stockData");
          assert.property(res.body.stockData, "stock");
          assert.property(res.body.stockData, "price");
          assert.property(res.body.stockData, "likes");
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'aon', like: true})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.property(res.body, "stockData");
            assert.property(res.body.stockData, "stock");
            assert.property(res.body.stockData, "price");
            assert.property(res.body.stockData, "likes");
            assert.isAtLeast(res.body.stockData.likes, 1);
            done();
        })
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'aon', like: true})
          .end(function(err,res){
            assert.equal(res.status, 200);
            // assert.property(res.body, "stockData");
            // assert.property(res.body.stockData, "stock");
            // assert.property(res.body.stockData, "price");
            // assert.property(res.body.stockData, "likes");
            // assert.isBelow(res.body.stockData.likes, 2);
            // done();
        })
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: ['aon','ajg']})
          .end(function(err, res){
            // assert.equal(res.status, 200);
            // assert.property(res.body, "stockData");
            // assert.isArray(res.body.stockData);
            
            // done();
        })
      });
      
      test('2 stocks with like', function(done) {
        
      });
      
    });

});
