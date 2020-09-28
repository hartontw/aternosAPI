require('dotenv').config();
const { argv } = require('yargs');
const aternos = require('./aternos');
const Gamedig = require('gamedig');

async function getGamedig(id) {
    try {
        let host;
        if (!id || id[0] === '#') {
            host = await aternos.getHostname(id);
        }
        else {
            host = `${id}.aternos.me`;
        }
        return await Gamedig.query({ type: 'minecraft', host });
    }
    catch (error) {
        return { error: error.message };
    }
}

if (argv.start) {
    aternos.start(argv.id, argv.wait)
        .then(console.log)
        .catch(console.error);
}
else if (argv.stop) {
    aternos.stop(argv.id)
        .then(console.log)
        .catch(console.error);
}
else if (argv.restart) {
    aternos.restart(argv.id)
        .then(console.log)
        .catch(console.error);
}
else if (argv.info) {    
    aternos.getInfo(argv.id)
        .then(console.log)
        .catch(console.error);
}
else if (argv.gamedig) {
    getGamedig(argv.id)
        .then(console.log)
        .catch(console.error);
}
else if (argv.rest) {
    const express = require('express');
    const jwt = require('jsonwebtoken');

    const app = express();
    app.use(express.json());

    app.listen(process.env.PORT || 3000, process.env.HOST_NAME || 'localhost', () => {
        console.log(`${process.env.HOST_NAME || 'localhost'}:${process.env.PORT || 3000}`);
    });

    app.get('/api', (req, res) => {
        res.json({
            ['/api']: {
                get: 'This response'
            },
            ['/api/login']: {
                post: 'Raw token',
                body: {
                    password: 'api_password'
                }
            },
            ['/api/start']: {
                post: 'Try to start the server',
                query: {
                    id: 'id or name of the server, none for the first',
                    wait: 'wait for queue end and start, default false'
                },
                examples: [
                    'http://example.org/api/start?id=myserver&wait=true',
                    'http://example.org/api/start?id=#ZXXasMBsEHXhFJ2L',
                    'http://example.org/api/start?wait=true',
                    'http://example.org/api/start'
                ]
            },
            ['/api/stop']: {
                post: 'Try to stop the server',
                query: {
                    id: 'id or name of the server, none for the first'
                },
                examples: [
                    'http://example.org/api/stop?id=myserver',
                    'http://example.org/api/stop?id=#ZXXasMBsEHXhFJ2L',
                    'http://example.org/api/stop'
                ]
            },
            ['/api/restart']: {
                post: 'Try to restart the server',
                query: {
                    id: 'id or name of the server, none for the first'
                },
                examples: [
                    'http://example.org/api/restart?id=myserver',
                    'http://example.org/api/restart?id=#ZXXasMBsEHXhFJ2L',
                    'http://example.org/api/restart'
                ]
            },
            ['/api/info']: {
                get: 'Get the info of the server included queue time and position',
                query: {
                    id: 'id or name of the server, none for the first'
                },
                examples: [
                    'http://example.org/api/info?id=myserver',
                    'http://example.org/api/info?id=#ZXXasMBsEHXhFJ2L',
                    'http://example.org/api/info'
                ]
            },
            ['/api/gamedig']: {
                get: 'Get GameDig json for Minecraft',
                query: {
                    id: 'id or name of the server, none for the first'
                },
                examples: [
                    'http://example.org/api/gamedig?id=myserver',
                    'http://example.org/api/gamedig?id=#ZXXasMBsEHXhFJ2L',
                    'http://example.org/api/gamedig'
                ]
            }
        });
    })

    app.post('/api/login', (req, res) => {
        const auth = sign(req);
        if (!auth) {
            res.status(401).json({
                auth: false,
                message: 'Invalid password'
            });
        }
        else {
            res.json(auth);
        }
    });

    app.post('/api/start', authStart, async (req, res) => {
        try {
            res.json(await aternos.start(req.query.id, req.query.wait));            
        }
        catch (error) {
            res.json({ error });
        }
    })

    app.post('/api/stop', authorized, async (req, res) => {
        try {
            res.json(await aternos.stop(req.query.id));
        }
        catch (error) {
            res.json({ error });
        }
    })

    app.post('/api/restart', authorized, async (req, res) => {
        try {
            res.json(await aternos.restart(req.query.id));
        }
        catch (error) {
            res.json({ error });
        }
    })

    app.get('/api/info', authInfo, async (req, res) => {
        try {
            res.json(await aternos.getInfo(req.query.id));
        }
        catch (error) {
            res.json({ error });
        }
    })

    app.get('/api/gamedig', authInfo, async (req, res) => {
        try {
            res.json(await getGamedig(id));
        }
        catch (error) {
            res.json({ error });
        }
    })

    function sign(req) {
        if (process.env.API_PASSWORD) {
            if (process.env.API_PASSWORD === req.body.password) {
                const token = jwt.sign({ ip: req.connection.remoteAddress.toString() }, process.env.TOKEN_KEY || 'vulnerable_token_key');
                return { auth: true, token };
            }
        }
        else {
            return { auth: true };
        }
    }

    function authStart(req, res, next) {
        if (process.env.PUBLIC_START) {
            next();            
        }
        else {            
            authorized(req, res, next);
        }
    }

    function authInfo(req, res, next) {
        if (process.env.PUBLIC_INFO) {
            next();
        }
        else {            
            authorized(req, res, next);
        }
    }

    function authorized(req, res, next) {
        if (process.env.API_PASSWORD) {

            let token = req.headers['x-access-token'];
            if (token) {
                const decoded = jwt.verify(token, process.env.TOKEN_KEY || 'vulnerable_token_key');
                if (decoded.ip === req.connection.remoteAddress.toString()) {
                    return next();
                }
            }

            return res.status(401).json({
                auth: false,
                message: 'No valid token provided'
            });
        }

        return next();
    }
}
else {
    console.log({
        "scripts": {
            "rest": "node src/index.js --rest",
            "start": "node src/index.js --start",
            "start-wait": "node src/index.js --start --wait",
            "stop": "node src/index.js --stop",
            "restart": "node src/index.js --stop",
            "info": "node src/index.js --info",
            "gamedig": "node src/index.js --gamedig",
          },
        "usage": "--[rest, start [--wait], stop, restart, info, gamedig] [--id=<server id or name>]"
    });
}