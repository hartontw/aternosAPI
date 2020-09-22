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
        return { error };
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
else if (argv.state) {
    aternos.getState(argv.id)
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

    app.get('/', (req, res) => {
        res.json({
            ['/']: {
                get: 'This response'
            },
            ['/login']: {
                post: 'Raw token',
                body: {
                    password: 'api_password'
                }
            },
            ['/start']: {
                post: 'Try to start the server',
                params: {
                    id: 'id or name of the server, none for the first',
                    wait: 'wait for queue end and start, default false'
                },
                examples: [
                    'http://example.org/start?id=myserver&wait=true',
                    'http://example.org/start?id=ZXXasMBsEHXhFJ2L',
                    'http://example.org/start?wait=true',
                    'http://example.org/start'
                ]
            },
            ['/stop']: {
                post: 'Try to stop the server',
                params: {
                    id: 'id or name of the server, none for the first'
                },
                examples: [
                    'http://example.org/stop?id=myserver',
                    'http://example.org/stop?id=ZXXasMBsEHXhFJ2L',
                    'http://example.org/stop'
                ]
            },
            ['/restart']: {
                post: 'Try to restart the server',
                params: {
                    id: 'id or name of the server, none for the first'
                },
                examples: [
                    'http://example.org/restart?id=myserver',
                    'http://example.org/restart?id=ZXXasMBsEHXhFJ2L',
                    'http://example.org/restart'
                ]
            },
            ['/state']: {
                get: 'Get the current state of the server included queue time and position',
                params: {
                    id: 'id or name of the server, none for the first'
                },
                examples: [
                    'http://example.org/state?id=myserver',
                    'http://example.org/state?id=ZXXasMBsEHXhFJ2L',
                    'http://example.org/state'
                ]
            },
            ['/gamedig']: {
                get: 'Get GameDig json for Minecraft',
                params: {

                },
                examples: [
                ]
            }
        });
    })

    app.post('/login', (req, res) => {
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

    app.post('/start', authorized, async (req, res) => {
        try {
            res.json(await aternos.start(req.params.id, req.params.wait));
        }
        catch (error) {
            res.json({ error });
        }
    })

    app.post('/stop', authorized, async (req, res) => {
        try {
            res.json(await aternos.stop(req.params.id));
        }
        catch (error) {
            res.json({ error });
        }
    })

    app.post('/restart', authorized, async (req, res) => {
        try {
            res.json(await aternos.restart(req.params.id));
        }
        catch (error) {
            res.json({ error });
        }
    })

    app.post('/state', authorized, async (req, res) => {
        try {
            res.json(await aternos.start(req.params.id));
        }
        catch (error) {
            res.json({ error });
        }
    })

    app.post('/gamedig', authorized, async (req, res) => {
        try {
            res.json(await getGamedig({id:req.params.id, host:req.params.host}));
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
            "state": "node src/index.js --state",
            "gamedig": "node src/index.js --gamedig",
          },
        "usage": "--[rest, start [--wait], stop, restart, state, gamedig] [--id=<server id or name>]"
    });
}