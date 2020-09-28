async function isVisible(context, selector) {    
    try {
        return await context.evaluate((selector) => {
            const e = document.querySelector(selector);
            if (e) {
              const style = window.getComputedStyle(e);
              return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
            }
            else {
              return false;
            }
          }, selector);
    }
    catch(e){}
}

async function getText(context, selector) {
    const text = await getProperty(context, selector, 'innerText');
    if (text) {
        return text.trim();
    }
}

async function getProperty(context, selector, property) {
    try {
        let item = await context.$(selector);
        if (item) {
            item = await item.getProperty(property);
            if (item) {
                return item.jsonValue();
            }
        }
    }
    catch(e){}
}

async function waitForFirst(context, timeout, ...selectors) {
    try {
        const elements = [];
        for(let selector of selectors) {
            elements.push(context.waitForSelector(selector, {timeout, visible:true}).catch());
        }
        await Promise.race(elements);
        return true;
    }
    catch(e) {
        return false;
    }
}

module.exports = {
    isVisible,
    getText,
    getProperty,
    waitForFirst,
}