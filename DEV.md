# Socket Tunnel Setup Instructions

## Running the Server

To run the server, use the following command:

```bash
node bin/server -p 8088 --tunnelport 8087 -d -s test
```

## Running the Client

To run the client, use this command:

```bash
node bin/client -s http://127.0.0.1:8087 --sub test -p 3000
```

**Note:** `3000` is the port of your web app to tunnel.

## Accessing the Tunneled App

Open your browser and navigate to:

```
http://test.localhost:8088
```

## Testing with Nginx

For a more realistic environment, you can use Nginx:

1. Check the Nginx configuration at:
   ```
   ./nginx/config/conf.d/socket-tunnel.conf
   ```
   

2. Start the Nginx setup:
   ```bash
   docker compose up
   ```



3. Run the client with a different port:
   ```bash
   node bin/client -s http://127.0.0.1:8888 --sub test -p 3000
   ```

4. Access the tunneled app through Nginx:
   ```
   http://test.localhost:8888
   ```

## Проблемы с производительностью
В продакшене очень медленно прогружаются крупные файлы. Локально не воспроизводится никак, даже с nginx. 
Возможно, дело в удаленности сервера, но маловероятно, слишком уж медленно.
Может где-то в сетевом стеке что-то не так. Нужно проверить, что именно происходит на сервере и на cloudflare.
