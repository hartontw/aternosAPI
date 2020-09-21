const puppeteer = require('puppeteer');
const fs = require('fs');

const credentials = fs.existsSync('./.credentials') ? JSON.parse(fs.readFileSync('./.credentials')) : {};

function erase(text, ...filters)
{
    filters.forEach(filter => {
        while (text.includes(filter)){
            text = text.replace(filter, '');
        }        
    });

    return text;
}

async function login(id) {
    try {
        const startPage = 'https://aternos.org/go/';

        const user = process.env.ATERNOS_USER || credentials.aternos_user;
        const password = process.env.ATERNOS_PASSWORD || credentials.aternos_password;

        console.log(user);
    
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(startPage);
        await page.type('#user', user);
        await page.type('#password', password);
    
        await Promise.all([
            page.click('#login'),
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);

        const server = await page.$(`[data-id="${id}"]`);
        await Promise.all([
            server.click(),
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);

        const name = erase(await page.evaluate(ip => ip.href, await page.$('a.btn.btn-main.btn-small.btn-clickme')), 'https:', '/', '.aternos.me');

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

async function start(id) {
    const response = await login(id);
    
    if (!response) {
        return null;
    }

    const {browser, page, name} = response;

    try {        
        await page.click('#start');

        const confirmation = await page.$('a.btn.btn-green');
        if (confirmation) {
            await confirmation.click();
        }
        
        browser.close();
        return `Server ${name} with id: ${id} is started`;
    }
    catch(error) {
        browser.close();
        return error;
    }
}

async function stop(id) {
    const response = await login(id);
    
    if (!response) {
        return null;
    }

    const {browser, page, name} = response;

    try {
        await page.click('#stop');   
        browser.close();
        return `Server ${name} with id: ${id} is stopped`;
    }
    catch(error) {
        browser.close();
        return error;
    }
}

async function restart(id) {
    const response = await login(id);
    
    if (!response) {
        return null;
    }

    const {browser, page, name} = response;

    try {
        await page.click('#restart');   
        browser.close();
        return `Server ${name} with id: ${id} is restarted`;
    }
    catch(error) {
        browser.close();
        return error;
    }
}

module.exports = {
    start,
    stop,
    restart,
};