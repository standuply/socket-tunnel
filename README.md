# socket-tunnel

Tunnel HTTP Connections via socket.io streams.

It's a fork of not popular, but very strong implementation of tunneling requests over socket.io. Original [repo](https://github.com/ericbarch/socket-tunnel).

Changes from the original describes in [Pull Request](https://github.com/ericbarch/socket-tunnel/pull/2)

## Usage

### Server

1. Run ```npm i -g @standuply/socket-tunnel```
2. Run ```st-server --help```
```
Usage: node ./bin/server --hostname [string] --port [number] --subdomain [string]

Options:
  -h, --hostname   Accepts connections on the hostname                                        [default: "127.0.0.1"]
  -p, --port       Listens port in OS                                                         [default: 3000]
  -s, --subdomain  Name of subdomain uses. It's required when server listens on a subdomain.  [default: ""]
```
3. If using Nginx as proxy to your server, then configure Nginx by sample below:
```
# Example of Nginx config to proxying requests to socket-tunnel server
server {
    # 10.10.0.1 is an external ip of your server
    # Also, may use https 443 port    
    listen 10.10.0.1:80;
        
    server_name subdomain.example.com *.subdomain.example.com;
    
    # Uncomment these lines if using 443 port
    # ssl on;
    # ssl_certificate /path/to/certificate/file.crt;
    # ssl_certificate_key /path/to/key/file.key;
    # ssl_prefer_server_ciphers on;

    location / {
        # 127.0.0.1:3000 is address of your ran socket-tunnel server
        proxy_pass http://127.0.0.1:3000/;

        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_http_version 1.1;
        
        # Use 'https' instead if using 443 port
        proxy_set_header X-Forwarded-Proto http;
        
        proxy_set_header X-NginX-Proxy true;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        proxy_redirect off;
    }
}

```
4. Add DNS entry like *.domain.com or *.subdomain.domain.com
5. Run st-server with your options and enjoy :clap:

### Client

1. Run ```npm i -g @standuply/socket-tunnel```
2. Run ```st-client --help```
```
Usage: node ./bin/client --server [string] --subdomain [string] --hostname [string] --port [number]

Options:
  -s, --server        (Required) Tunnel server endpoint                                
  --sub, --subdomain  (Required) Name of tunneling resource                            
  -h, --hostname      Address of local server for forwarding over socket-tunnel          [default: "127.0.0.1"]
  -p, --port          (Required) Port of local server for forwarding over socket-tunnel

```
3. Run st-client with your options and enjoy :clap:

## Credits

Forked by Igor Perevozchikov.

## License

This project is licensed under the MIT License - see the LICENSE file for details