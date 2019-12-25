[
  'cmd',
  'env',
  'exit',
  'enhanceErrorMessages',
  'logger',
  'module',
  'pluginResolution',
].forEach(m => {
  Object.assign(exports, require(`./${m}`))
})

exports.chalk = require('chalk')
exports.execa = require('execa')
exports.semver = require('semver')