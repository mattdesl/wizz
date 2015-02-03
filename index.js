var wzrd = require('wzrd')
var portfinder = require('portfinder')
var path = require('path')
var fs = require('fs')
var xtend = require('xtend')

var noop = function(){}

var defaults = {
    port: 9966,
    entries: []
};

module.exports = function(opt, cb) {
    cb = cb || noop
    opt = xtend(defaults, opt)

    portfinder.basePort = opt.port
    portfinder.getPort(function(err, port) {
        opt.port = port
        wzrd.http(opt).listen(port, function(err) {
            if (err) cb(err)
            else cb(null, opt)
        })
    })
}