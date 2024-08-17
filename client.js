const net = require('net');
const ss = require('socket.io-stream');
const { Transform } = require('stream');

class BufferAccumulator extends Transform {
    constructor(options = {}) {
        super(options);
        this.accumulator = Buffer.alloc(512 * 1024);
        this.accumulatedSize = 0;
        this.flushInterval = options.flushInterval || 150;
        this.timer = null;
        this.resetTimer();
    }

    resetTimer() {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.flush(), this.flushInterval);
    }

    flush() {
        if (this.accumulatedSize > 0) {
            this.push(this.accumulator.subarray(0, this.accumulatedSize));
            this.accumulator = Buffer.alloc(512 * 1024);
            this.accumulatedSize = 0;
        }
        this.resetTimer();
    }

    _transform(chunk, encoding, callback) {
        this.resetTimer();
        while (chunk.length > 0) {
            const remainingSpace = this.accumulator.length - this.accumulatedSize;
            const bytesToCopy = Math.min(remainingSpace, chunk.length);
            chunk.copy(this.accumulator, this.accumulatedSize, 0, bytesToCopy);
            this.accumulatedSize += bytesToCopy;
            if (this.accumulatedSize === this.accumulator.length) {
                this.push(this.accumulator);
                this.accumulator = Buffer.alloc(512 * 1024);
                this.accumulatedSize = 0;
            }
            chunk = chunk.slice(bytesToCopy);
        }
        callback();
    }

    _flush(callback) {
        clearTimeout(this.timer);
        this.flush();
        callback();
    }
}

module.exports = function (options) {
    const socket = require('socket.io-client')(options.server, {
        transports: ["websocket"]
    });

    socket.on('connect', () => {
        console.log(`${new Date()}: connected`);
        console.log(`${new Date()}: requesting subdomain ${options.subdomain} via ${options.server}`);
        socket.emit('createTunnel', options.subdomain);
    });

    socket.on('connect_error', (err) => {
        console.log(`${new Date()}: connection error: ${err}`);
    });

    socket.on('incomingClient', (clientId) => {
        console.log(`incomingClient: ${clientId}`);
        const client = net.connect({
            port: options.port,
            host: options.hostname,
        }, () => {
            console.log(`${clientId} connected to ${options.hostname}:${options.port}`);
            const s = ss.createStream({ highWaterMark: 512 * 1024 });

            // let size = 0;
            // client.on('data', (data) => {
            //     size += data.length;
            //     console.log(`${clientId} received ${size/1024} KB`);
            // });

            const acc = new BufferAccumulator();
            // net.connect send data with 64KB buffer, we need to increase it using BufferAccumulator to speed up the transfer
            client.pipe(acc).pipe(s);
            s.pipe(client);

            s.on('end', () => {
                client.destroy();
            });

            ss(socket).emit(clientId, s);
        });

        client.on('error', () => {
            const s = ss.createStream();
            ss(socket).emit(clientId, s);
            s.end();
        });
    });
};
