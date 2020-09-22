const puppeteer = require('puppeteer');

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }   

function erase(text, ...filters)
{
    filters.forEach(filter => {
        while (text.includes(filter)){
            text = text.replace(filter, '');
        }        
    });
    return text;
}

async function findServer(page, id) {
    let server = id && await page.$(`[data-id="${id}"]`);
    if (!server) {
        const servers = await page.$$('div.server-body');
        for (const srv of servers) {
            if (!id) {
                return srv;
            }

            const name = await srv.$eval('.server-name', el => el.innerText);
            if (name === id) {
                return srv;
            }
        }
    }
    return server;
}

async function getServerName(page) {
    return erase(await page.evaluate(ip => ip.href, await page.$('a.btn.btn-main.btn-small.btn-clickme')), 'https:', '/', '.aternos.me');
}

async function login(id) {
    try {
        const startPage = 'https://aternos.org/go/';
    
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(startPage);
        await page.type('#user', process.env.ATERNOS_USER);
        await page.type('#password', process.env.ATERNOS_PASSWORD);
    
        await Promise.all([
            page.click('#login'),
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);

        const server = await findServer(page, id);
        if (!server) {
            throw `Server ${id} not found`;
        }

        await Promise.all([
            server.click(),
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);

        const name = await getServerName(page);

        const choices = await page.$('#accept-choices');
        if (choices) {
            await choices.click();
        }
    
        return {browser, page, name};
    }
    catch(error) {
        console.error(error);
        return null;
    }
}

async function start(id, wait) {
    const response = await login(id);
    
    if (!response) {
        return null;
    }

    const {browser, page, name} = response;

    const state = { name };

    try {
        state.value = await page.$eval('.statuslabel-label', el => el.innerText);

        await page.click('#start');   
        
        await sleep(2000);

        const confirmation = await page.$('a.btn.btn-green');
        if (confirmation) {
            await confirmation.click();
        }        

        await sleep(2000);        
        
        state.queue = await getQueue(page);                
        
        if (wait && state.queue) {
            const waiting = new Date();
            const time = state.queue.time * 1000;
            while (new Date() - waiting < time) {                
                if (state.queue.time < 90) {
                    await page.click('#confirm');
                    await sleep(2000);
                    delete state.queue;
                    break;
                }
                else {
                    await sleep(1000);
                    state.queue = await getQueue(page);
                }
            }
        }

        state.value = await page.$eval('.statuslabel-label', el => el.innerText);
    }
    catch(error) {
        state.value = error;
    }
    finally {
        browser.close();
        return state;
    }
}

async function stop(id) {
    const response = await login(id);
    
    if (!response) {
        return null;
    }

    const {browser, page, name} = response;

    const state = { name };

    try {
        await page.click('#stop');   
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        state.value = await page.$eval('span.statuslabel-label', el => el.innerText);
    }
    catch(error) {
        state.value = error;
    }
    finally {
        browser.close();
        return state;
    }
}

async function restart(id) {
    const response = await login(id);
    
    if (!response) {
        return null;
    }

    const {browser, page, name} = response;

    const state = { name };

    try {
        await page.click('#restart');   
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await sleep(2000);
        state.value = await page.$eval('span.statuslabel-label', el => el.innerText);
    }
    catch(error) {
        state.value = error;
    }
    finally {
        browser.close();
        return state;
    }
}

async function getQueue(page) {
    let time = await page.$eval('span.server-status-label-left', el => el.innerText);
    let people = await page.$eval('span.server-status-label-right.queue-position', el => el.innerText);

    if (time && people) {            
        people = people.split('/');
        return {
            time: erase(time, 'ca.', 'min').trim() * 60,
            position: people[0].trim() * 1,
            waiting: people[1].trim() * 1
        };
    } 
}

async function getState(id) {
    const response = await login(id);
    
    if (!response) {
        return null;
    }

    const {browser, page, name} = response;    

    const state = { name };

    try {
        state.value = await page.$eval('span.statuslabel-label', el => el.innerText);
        state.queue = await getQueue(page);
    }
    catch(error) {        
        state.value = error;
    }    
    finally {
        browser.close();
        return state;
    }
}

async function getHostname(id) {
    const response = await login(id);
    
    if (!response) {
        return null;
    }

    const {browser, page, name} = response;        

    browser.close();
    return `${name}.aternos.me`;
}

module.exports = {
    start,
    stop,
    restart,
    getState,
    getHostname
};