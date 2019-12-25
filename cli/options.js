const fs = require('fs')
const cloneDeep = require('lodash').cloneDeep
const getReacticoonConfigurationPath = require('./utils/getReacticoonConfigurationPath')
const { exit } = require('../cli-utils/exit')
const { error } = require('../cli-utils/logger')

const rcPath = exports.reacticoonConfigurationPath = getReacticoonConfigurationPath()

exports.defaults = {
  lastChecked: undefined,
  latestVersion: undefined,

  packageManager: undefined,
  plugins: [
    {
      resolve: 'reacticoon-dev-cli-plugin',
      options: {}
    }
  ]
}

let cachedOptions

exports.loadOptions = () => {
  if (cachedOptions) {
    return cachedOptions
  }
  if (fs.existsSync(rcPath)) {
    try {
      cachedOptions = JSON.parse(fs.readFileSync(rcPath, 'utf-8'))
    } catch (e) {
      error(
        `Error loading saved preferences: ` +
        `config/reacticoon.js may be corrupted or have syntax errors. ` +
        `Please fix/delete it and re-run vue-cli in manual mode.\n` +
        `(${e.message})`,
      )
      exit(1)
    }
    // validate(cachedOptions, schema, () => {
    //   error(
    //     `config/reacticoon.js may be outdated. ` +
    //     `Please delete it and re-run vue-cli in manual mode.`
    //   )
    // })
    return cachedOptions
  } else {
    return {}
  }
}

exports.saveOptions = toSave => {
  const options = Object.assign(cloneDeep(exports.loadOptions()), toSave)
  for (const key in options) {
    if (!(key in exports.defaults)) {
      delete options[key]
    }
  }
  cachedOptions = options
  try {
    fs.writeFileSync(rcPath, JSON.stringify(options, null, 2))
  } catch (e) {
    error(
      `Error saving preferences: ` +
      `make sure you have write access to ${rcPath}.\n` +
      `(${e.message})`
    )
  }
}

exports.savePreset = (name, preset) => {
  const presets = cloneDeep(exports.loadOptions().presets || {})
  presets[name] = preset
  exports.saveOptions({ presets })
}