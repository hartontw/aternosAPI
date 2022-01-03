# aternosAPI

Non Official [Aternos](https://aternos.org) API written in Node.js

Aternos is a legitimate corporation and its benefits comes with ads in the web page. Please use it with responsibility.

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
PUBLIC_START=false
PUBLIC_INFO=false
DEBUG=false
```

- **ATERNOS_USER**: Required. Aternos account user.
- **ATERNOS_PASSWORD**: Required. Aternos account password.
- **HOST_NAME**: Rest mode only. IP or Hostname of the API. Default "localhost".
- **PORT**: Rest mode only. Port of the API. Default "3000".
- **API_PASSWORD**: Rest mode only. Required password for get the Token. **If not set, entire API is public**.
- **TOKEN_KEY**: Rest auth mode only. Access Token for access. Default "vulnerable_token_key".
- **PUBLIC_START**: Rest auth mode only. Disable auth for Start route only. If server is started, this route do nothing. Default "false".
- **PUBLIC_INFO**: Rest auth mode only. Disable auth for Info and Gamedig. Default "false".
- **DEBUG**: If true show browser navigation. Defaul "false".

### Usage

If you only have one server, use one of these commands:
```bash
npm run rest #for start the rest api, visit printed address for paths
npm run start #starts the server
npm run start-wait #starts the server and wait the queue for confirm
npm run stop #stop the server
npm run restart #restart the server
npm run info #get the name, info and queue
npm run gamedig #get gamedig complete info
```

If you have multiple servers, you can add --id param:
```bash
npm run start -- --id=myserver
```
or full usage:
```bash
node src/index.js --[rest, start [--wait], stop, restart, info, gamedig] [--id=<server id or name>]
```

### Rest API

Summary can be found on root path.

If the API is password protected:
- Post at /login with json body {"password":"api_password"} for get the token.
- Add to the header "x-access-token" with the token.
- Token is only valid for your IP address.

---
