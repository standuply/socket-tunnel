// libs
const http = require('http');
const tldjs = require('tldjs');
const ss = require('socket.io-stream');
const uuid = require('uuid/v4');

const tunnelServer = http.createServer({
    keepAlive: true
});

// socket.io instance
const io = require('socket.io')(tunnelServer, {
    //allowEIO3: true,
    transports: ['websocket']
});
io.on('connection', function (socket) {
    console.log(new Date(), ': connection');

    ss(socket).once('receiveFile', function (stream) {
        console.log(new Date(), ': receiveFile');
        stream.on('error', function () {
            console.log(new Date(), ': stream error');
        });
        let size = 0;
        let startedAt;
        stream.on('data', function (data) {
            if (!startedAt) {
                startedAt = new Date();
            }
            size += data.length;
            console.log(new Date(), ':  received ' + size/1024 + 'KB');
        });
        stream.on('end', function () {
            const took = new Date() - startedAt;
            console.log(new Date(), `: end, took ${took}ms`);
        });
    });

});

tunnelServer.on('error', (e) => {
    console.error(e)
});
tunnelServer.listen(8899, '0.0.0.0', function () {
    console.log(new Date(), ': listening');
});
