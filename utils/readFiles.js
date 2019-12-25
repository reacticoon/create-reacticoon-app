const fs = require('fs-extra')
const path = require('path')

const globby = require('globby')
const normalizeFilePaths = require('./normalizeFilePaths')

module.exports = async function readFiles (context) {
  const files = await globby(['**'], {
    cwd: context,
    onlyFiles: true,
    gitignore: true,
    ignore: ['**/node_modules/**', '**/.git/**'],
    dot: true
  })
  const res = {}
  for (const file of files) {
    const name = path.resolve(context, file)
    res[file] = fs.readFileSync(name, 'utf-8')
  }
  return normalizeFilePaths(res)
}