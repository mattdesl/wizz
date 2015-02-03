#!/usr/bin/env node
var path = require('path')
var wizz = require('./')
var wzrd = require('wzrd')
var minimist = require('minimist')
var tinylr = require('tiny-lr')
var gaze = require('gaze')

var args = process.argv.slice(2)
var browserifyArgs
var subIdx = args.indexOf('--')
if (subIdx > -1) {
  browserifyArgs = args.slice(subIdx + 1)
  args = args.slice(0, subIdx)
}

var argv = minimist(args)

//support custom cwd and index.html file
argv.path = argv.path || argv.p || process.cwd()
argv.index = (argv.index || argv.i)
if (argv.index)
    argv.index = path.join(argv.path, argv.index)

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
  console.error('Usage: wzrd [filename]')
  process.exit(1)
}

wizz(argv, function(err, result) {
    if (err) throw err

    var uri = ['http://localhost:', result.port, '/'].join('')
    if (argv.o || argv.open) {
        require('open')(uri)
    }

    //fix up console logs.. 
    console.log('server running at', uri)
    var logger = console.log.bind(console)
    console.log = function(d) {
        var caught = false
        if (typeof d==='string') {
            try { 
                d = JSON.parse(d)
                if (d.url||d.time)
                    caught = true
                if (d.elapsed) 
                    logger('bundled in', d.elapsed)
            } catch(e) {}
        }
        if (!caught)
            logger.apply(this, Array.prototype.slice.call(arguments))
    }

    //really basic live-reload support
    argv.live = argv.live || argv.l
    if (argv.live) {
        //default lr port
        argv.live = typeof argv.live === 'number' ? argv.live : 35729

        var server = tinylr()
        server.listen(argv.live, 'localhost', function() {
            console.log('livereload running on port %s', argv.live);
        })

        var watch = (argv.watch || argv.w) 
        if (!watch) 
            watch = ['**/*.{js,html,css}', '!node_modules/**']
        
        gaze(watch, function(err, watcher) {
            this.on('changed', function(filepath) {
                try {
                    server.changed({ body: { files: [ filepath ] } });
                } catch (e) {
                    console.error(e)
                }
            })
        })
    }
})