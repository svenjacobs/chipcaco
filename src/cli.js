#!/usr/bin/env node

'use strict'

const commander = require('commander')
const chipcaco = require('./lib')

commander
  .version('0.1.1', '-v, --version')
  .arguments('<src> <dest>')

commander.parse(process.argv)

if (commander.args.length !== 2) {
  console.error('Error: Missing <src> and <dest> arguments!')
  commander.outputHelp()
  process.exit(1)
}

chipcaco.file(commander.args[0], commander.args[1])
  .catch((err) => {
    console.error('Error during conversion: ' + err.message)
    process.exit(1)
  })
