var sbitjs = require('bitcoinjs-lib')

Object.assign(sbitjs.networks, require('./networks'))

sbitjs.utils = require('./utils')

module.exports = sbitjs