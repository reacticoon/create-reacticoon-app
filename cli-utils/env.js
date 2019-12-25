const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const LRU = require('lru-cache')

let _hasYarn
const _yarnProjects = new LRU({
  max: 10,
  maxAge: 1000
})
let _hasGit
const _gitProjects = new LRU({
  max: 10,
  maxAge: 1000
})

// env detection
exports.hasYarn = () => {
  if (process.env.REACTICOON_TEST) {
    return true
  }
  if (_hasYarn != null) {
    return _hasYarn
  }
  try {
    execSync('yarn --version', { stdio: 'ignore' })
    return (_hasYarn = true)
  } catch (e) {
    return (_hasYarn = false)
  }
}

exports.hasProjectYarn = (cwd) => {
  if (_yarnProjects.has(cwd)) {
    return checkYarn(_yarnProjects.get(cwd))
  }

  const lockFile = path.join(cwd, 'yarn.lock')
  const result = fs.existsSync(lockFile)
  _yarnProjects.set(cwd, result)
  return checkYarn(result)
}

function checkYarn (result) {
  if (result && !exports.hasYarn()) throw new Error(`The project seems to require yarn but it's not installed.`)
  return result
}

exports.hasGit = () => {
  if (process.env.REACTICOON_TEST) {
    return true
  }
  if (_hasGit != null) {
    return _hasGit
  }
  try {
    execSync('git --version', { stdio: 'ignore' })
    return (_hasGit = true)
  } catch (e) {
    return (_hasGit = false)
  }
}

exports.hasProjectGit = (cwd) => {
  if (_gitProjects.has(cwd)) {
    return _gitProjects.get(cwd)
  }

  let result
  try {
    execSync('git status', { stdio: 'ignore', cwd })
    result = true
  } catch (e) {
    result = false
  }
  _gitProjects.set(cwd, result)
  return result
}

// OS
exports.isWindows = process.platform === 'win32'
exports.isMacintosh = process.platform === 'darwin'
exports.isLinux = process.platform === 'linux'

const browsers = {}
let hasCheckedBrowsers = false

function tryRun (cmd) {
  try {
    return execSync(cmd, {
      stdio: [0, 'pipe', 'ignore']
    }).toString().trim()
  } catch (e) {
    return ''
  }
}

function getLinuxAppVersion (binary) {
  return tryRun(`${binary} --version`).replace(/^.* ([^ ]*)/g, '$1')
}

function getMacAppVersion (bundleIdentifier) {
  const bundlePath = tryRun(`mdfind "kMDItemCFBundleIdentifier=='${bundleIdentifier}'"`)

  if (bundlePath) {
    return tryRun(`/usr/libexec/PlistBuddy -c Print:CFBundleShortVersionString ${
      bundlePath.replace(/(\s)/g, '\\ ')
    }/Contents/Info.plist`)
  }
}

Object.defineProperty(exports, 'installedBrowsers', {
  enumerable: true,
  get () {
    if (hasCheckedBrowsers) {
      return browsers
    }
    hasCheckedBrowsers = true

    if (exports.isLinux) {
      browsers.chrome = getLinuxAppVersion('google-chrome')
      browsers.firefox = getLinuxAppVersion('firefox')
    } else if (exports.isMacintosh) {
      browsers.chrome = getMacAppVersion('com.google.Chrome')
      browsers.firefox = getMacAppVersion('org.mozilla.firefox')
    } else if (exports.isWindows) {
      // get chrome stable version
      // https://stackoverflow.com/a/51773107/2302258
      const chromeQueryResult = tryRun(
        'reg query "HKLM\\Software\\Google\\Update\\Clients\\{8A69D345-D564-463c-AFF1-A69D9E530F96}" /v pv /reg:32'
      ) || tryRun(
        'reg query "HKCU\\Software\\Google\\Update\\Clients\\{8A69D345-D564-463c-AFF1-A69D9E530F96}" /v pv /reg:32'
      )
      if (chromeQueryResult) {
        const matched = chromeQueryResult.match(/REG_SZ\s+(\S*)$/)
        browsers.chrome = matched && matched[1]
      }

      // get firefox version
      // https://community.spiceworks.com/topic/111518-how-to-determine-version-of-installed-firefox-in-windows-batchscript
      const ffQueryResult = tryRun(
        'reg query "HKLM\\Software\\Mozilla\\Mozilla Firefox" /v CurrentVersion'
      )
      if (ffQueryResult) {
        const matched = ffQueryResult.match(/REG_SZ\s+(\S*)$/)
        browsers.firefox = matched && matched[1]
      }
    }

    return browsers
  }
})