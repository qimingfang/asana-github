#!/usr/bin/env node
/* global exec */

require('shelljs/global')

const fs = require('fs')
// const _ = require('lodash')
const path = require('path')
const semver = require('semver')

const tmp = require('tmp')
tmp.setGracefulCleanup()

// Run `npm run release -- -r minor`
const argv = require('yargs')
  .usage('Usage:')
  .options('r', {
    alias: 'release',
    default: 'patch',
    describe: 'Which semver release type to increment',
    choices: ['patch', 'minor', 'major']
  })
  .argv

console.log('---> Syncing Github...')
exec('git checkout master')
exec('git pull')
exec('git merge origin/master')

console.log('---> Updating package.json...')
const packagePath = path.join(process.cwd(), './package.json')
const p = require(packagePath)

const oldVersion = p.version
const newVersion = semver.inc(oldVersion, argv.r)

p.version = newVersion

fs.writeFileSync(packagePath, JSON.stringify(p, null, '  '))

console.log('---> Updating CHANGELOG...')
exec('standard-changelog -i CHANGELOG.md -w')

console.log('---> Commiting and pushing to github...')
exec(`git commit -am 'chore: version bump ${newVersion}'`)
exec('git push origin master')

exec(`git tag v${newVersion}`)
exec('git push --tags')
console.log(`Version v${newVersion} has been pushed up`)
