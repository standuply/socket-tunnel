const net = require("net");
module.exports = function (options) {
    // require the things we need
    var net = require('net');
    var ss = require('socket.io-stream');
    var socket = require('socket.io-client')(options['server'], {
        transports: ["websocket"]
    });

    socket.on('connect', function () {
        console.log(new Date() + ': connected');
        console.log(new Date() + ': requesting subdomain ' + options['subdomain'] + ' via ' + options['server']);

        socket.emit('createTunnel', options['subdomain']);
    });

    socket.on('connect_error', function (err) {
        console.log(new Date() + ': connection error: ' + err);
    });

    const client = net.connect({
        port: options['port'],
        host: options['hostname'],
        highWaterMark: 1024 * 1024
    });

    socket.on('incomingClient', function (clientId) {
        const client = net.connect({
            port: options['port'],
            host: options['hostname'],
            highWaterMark: 1024 * 1024
        }, function () {
            const s = ss.createStream({
                highWaterMark: 1024 * 1024
            });

            // const superRead = client._read.bind(client);
            // client._read = function (n) {
            //     console.log('client._read');
            //     superRead(n);
            // };

            let size = 0;
            client.on('data', function (data) {
                size += data.length;
                console.log(clientId+ ' received ' + size/1024 + 'KB');
            });

            s.pipe(client).pipe(s);

            s.on('end', function () {
                console.log(clientId + ' end');
                client.destroy();
            });

            client.on('end', function () {
                //s.destroy();
            });

            ss(socket).emit(clientId, s);
        });

        client.on('error', function () {
            // handle connection refusal
            var s = ss.createStream();
            ss(socket).emit(clientId, s);
            s.end();
        });
    });
};
