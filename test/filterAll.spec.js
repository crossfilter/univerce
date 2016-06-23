var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var expect = chai.expect

var universe = require('../universe')
var crossfilter = require('crossfilter2')

var filters = require('../src/filters')
var _ = require('../src/lodash')

var data = require('./data')

describe('universe filterAll', function() {

  var u

  beforeEach(function() {
    u = universe(data)
  })

  afterEach(function() {
    return u.then(function(u){
      return u.destroy()
    })
  })

  /* demostrates that filterAll is missing from universe instance */
  it('has the filterAll method', function() {  // fails
    return u.then(function(u) {
      expect(typeof u.filterAll).to.deep.equal('function')
    })
  })

  /* demostrates that filterAll method in ./src/filters.js does not
    clear filters themselves.  */
  it('can filterAll', function() {
    var data

    return u.then(function(u) {
      return u.query({
          groupBy: 'tip',
          select: {
            $count: true
          }
        })
        .then(function(res) {
          data = res.data
          expect(data).to.deep.equal([
            { key: 0, value: { count: 8 } },
            { key: 100, value: { count: 3 } },
            { key: 200, value: { count: 1 } }
          ])
          return res.universe.filter('type', 'cash')
        })
        .then(function(u) {
          expect(data).to.deep.equal([
            { key: 0, value: { count: 2 } },
            { key: 100, value: { count: 0 } },
            { key: 200, value: { count: 0 } }
          ])
          expect(u.filters.type.value).to.deep.equal('cash')
          return u
        })
        .then(function(u) {
          return filters(u).filterAll()  // manually calling filterAll
        })
        .then(function(u){
          expect(u.filters).to.deep.equal({})
          return u
        })
        .then(function(u){
          expect(data).to.deep.equal([
            { key: 0, value: { count: 8 } },
            { key: 100, value: { count: 3 } },
            { key: 200, value: { count: 1 } }
          ])
        })
    })
  })

  /* demostrates manually removing filters */
  it('can force filterAll', function() {
    var data

    return u.then(function(u) {
      return u.query({
          groupBy: 'tip',
          select: {
            $count: true
          }
        })
        .then(function(res) {
          data = res.data
          expect(data).to.deep.equal([
            { key: 0, value: { count: 8 } },
            { key: 100, value: { count: 3 } },
            { key: 200, value: { count: 1 } }
          ])
          return res.universe.filter('type', 'cash')
        })
        .then(function(u) {
          expect(data).to.deep.equal([
            { key: 0, value: { count: 2 } },
            { key: 100, value: { count: 0 } },
            { key: 200, value: { count: 0 } }
          ])
          expect(u.filters.type.value).to.deep.equal('cash')
          return u
        })
        .then(function(u) {
          return Promise.all(_.keys(u.filters).map(function(key) {  // manually clearing each filter
            return u.filter(key)
          }))
          .then(function() {  // manually clearing filters object
            return filters(u).filterAll()
          })
        })
        .then(function(u){
          expect(data).to.deep.equal([
            { key: 0, value: { count: 8 } },
            { key: 100, value: { count: 3 } },
            { key: 200, value: { count: 1 } }
          ])
          expect(u.filters).to.deep.equal({})
        })
    })
  })
})