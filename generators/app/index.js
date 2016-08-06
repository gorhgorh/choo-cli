'use strict'

const utils = require('../../lib/utils')
const path = require('path')
const chalk = require('chalk')
const pad = require('left-pad')
const fs = require('fs')

const choochoo = fs.readFileSync(path.resolve(__dirname, '../../choo!')).toString()
function formatState (state) {
  switch (state) {
    case 'read':
      return chalk.grey.bold(pad('read', 7))
    case 'deleted':
      return chalk.magenta.bold(pad('move', 7))
    case 'modified':
      return chalk.green.bold(pad('stamp', 7))
    case undefined:
      return chalk.cyan.bold(pad('NEW', 7))
    default:
      return chalk.magenta.bold(pad(state, 7))
  }
}
module.exports = (props) => {
  const destinationPath = utils.newProjectPath(props.projectName)
  const templatePath = path.join(__dirname, 'template')
  const mv = (a, b) => utils.xfs.move(destinationPath(a), destinationPath(b))
  const targetDirName = destinationPath().split('/').pop()
  utils.xfs.copyTpl(`${templatePath}/**`, destinationPath(), props)
  mv('_choo.yaml', 'choo.yaml')
  mv('_editorconfig', '.editorconfig')
  mv('_gitignore', '.gitignore')
  mv('_package.json', 'package.json')

  utils.xfs.store.each((record, i) => {
    const file = record.history[record.history.length - 1]
    if (file.indexOf('template') > -1) {
      const state = formatState('read')
      const filePath = chalk.grey.bold('[$' + file.substring(file.indexOf('template'), file.length) + ']')
      console.log(`${state}  ${filePath}`)
    } else if (file.indexOf(targetDirName) > -1) {
      const state = formatState(record.state)
      const filePath = chalk.white.bold(file.substring(file.indexOf(targetDirName), file.length))
      console.log(`${state}  ${filePath}`)
    } else {
      const state = formatState(record.state)
      const filePath = chalk.white.bold(file.split('/').pop())
      console.log(`${state}  ${filePath}`)
    }
  })
  console.log('\n\n')
  console.log(chalk.white.yellow('HOORAY!'), '\tYour application scaffold is complete!')
  console.log(choochoo)
  console.log(`\t\tRunning ${chalk.yellow.bold('npm install')} for you...\n\n`)
  utils.xfs.commit(utils.npmInstall)
}
