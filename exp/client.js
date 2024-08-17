// require the things we need
var net = require('net');
var ss = require('socket.io-stream');
var socket = require('socket.io-client')('ws://clones.s.stanly-tech.xyz:8899', {
    transports: ["websocket"]
});
const fs = require('fs');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

socket.on('connect', async function () {
    console.log(new Date() + ': connected');

    const dataFile = fs.createReadStream('./data.zip', {
        highWaterMark: 512 * 1024
    });
    const s = ss.createStream({
        highWaterMark: 512 * 1024
    });
    dataFile.pipe(s);

    ss(socket).emit('receiveFile', s);
    console.log(new Date() + ': sent file');
});

socket.on('connect_error', function (err) {
    console.log(new Date() + ': connection error: ' + err);
});
