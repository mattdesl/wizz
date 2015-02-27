#!/usr/bin/env node
var path = require('path')
var wizz = require('./')
var minimist = require('minimist')

var args = process.argv.slice(2)
var browserifyArgs
var subIdx = args.indexOf('--')
if (subIdx > -1) {
  browserifyArgs = args.slice(subIdx + 1)
  args = args.slice(0, subIdx)
} else {
  // browserifyArgs = "-d"
}

var argv = minimist(args)

//support custom cwd and index.html file
//wzrd will take it as a 'path' option
argv.path = argv.dir || argv.d || process.cwd()
argv.port = argv.port || argv.p || 9966

argv.entries = argv._.map(function(arg) {
    if (arg.indexOf(':') === -1) 
        return { from: arg, to: arg }
    var parts = arg.split(':')
    return { from: parts[0], to: parts[1] }
}).map(function(e) {
    e.from = path.join(argv.path, e.from)
    return e
})

if (!argv.entries.length) {
  console.error('Usage: wizz [filename]')
  process.exit(1)
}

wizz(argv, function(err, result) {
    if (err) throw err

    var uri = ['http://localhost:', result.port, '/'].join('')
    if (argv.o || argv.open) 
        require('open')(uri)
    console.log(JSON.stringify({ 
        time: new Date(),
        level: 'info', 
        message: 'server running at '+uri 
    }))
})