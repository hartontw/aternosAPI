# aternosAPI

Non Official [Aternos](https://aternos.org) API written in Node.js

### Installation

```bash
git clone https://<url>
cd aternosAPI
npm install
```

### Configuration

Create .env file in aternosAPI directory.
```
ATERNOS_USER=your_user
ATERNOS_PASSWORD=your_password
```

Full .env file looks like this.
```
ATERNOS_USER=your_user
ATERNOS_PASSWORD=your_password
HOST_NAME=localhost
PORT=3000
API_PASSWORD=strong_password
TOKEN_KEY=vulnerable_token_key
```

- **ATERNOS_USER**: required
- **ATERNOS_PASSWORD**: required
- **HOST_NAME**: for rest mode only, default "localhost"
- **PORT**: for rest mode only, default "3000"
- **API_PASSWORD**: for rest mode only, **if not set API is public**
- **TOKEN_KEY**: for rest private mode only, default "vulnerable_token_key"

### Usage

If you only have one server, use one of these commands:
```bash
npm run rest #for start the rest api, visit printed address for paths
npm run start #starts the server
npm run start-wait #starts the server and wait the queue for confirm
npm run stop #stop the server
npm run restart #restart the server
npm run state #get the name, state and queue
npm run gamedig #get gamedig complete info
```

If you have multiple servers, you can add --id param:
```bash
npm run start -- --id=myserver
```
or full usage:
```bash
node src/index.js --[rest, start [--wait], stop, restart, state, gamedig] [--id=<server id or name>]
```

### Rest API

Summary can be found on root path.

If the API is password protected:
- Post at /login with json body {"password":"api_password"} for get the token.
- Add to the header "x-access-token" with the token.
- Token is only valid for your IP address.

---
