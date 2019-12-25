const inquirer = require('inquirer')
const {
  execa,
  warn,
  hasProjectGit
} = require('../cli-utils')

module.exports = async function confirmIfGitDirty (context) {
  if (process.env.REACTICOON_SKIP_DIRTY_GIT_PROMPT || process.env.REACTICOON_CLI_API_MODE) {
    return true
  }

  process.env.REACTICOON_CLI_SKIP_DIRTY_GIT_PROMPT = true

  if (!hasProjectGit(context)) {
    return true
  }

  const { stdout } = await execa('git', ['status', '--porcelain'], { cwd: context })
  if (!stdout) {
    return true
  }

  warn(`There are uncommited changes in the current repository, it's recommended to commit or stash them first.`)
  const { ok } = await inquirer.prompt([
    {
      name: 'ok',
      type: 'confirm',
      message: 'Still proceed?',
      default: false
    }
  ])
  return ok
}