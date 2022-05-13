import puppeteer from 'puppeteer'

const puppeteerOptions = {
    headless: false,
}

const openCartConfig = {
    url: 'https://opencart.abstracta.us/index.php?route=account/login',
    loginEmailXPath: './/*[@id="input-email"]',
    loginPasswordXPath: './/*[@id="input-password"]',
    loginSubmitXPath: './/*[@value="Login"]',
    loginEmail: process.env.OPEN_CART_EMAIL as string,
    loginPassword: process.env.OPEN_CART_PASSWORD as string,
}

export let browser: puppeteer.Browser
export let page: puppeteer.Page

export const launchBrowser = async (): Promise<void> => {
    browser = await puppeteer.launch(puppeteerOptions)
}

export const visitPage = async (targetUrl: string = 'https://opencart.abstracta.us/index.php?route=account/login'): Promise<void> => {
    page = await browser.newPage()
    await page.goto(targetUrl)
}

export const login = async (): Promise<void> => {
    // visit login page
    console.log(`login called with page:`, page);
    await page.type(openCartConfig.loginEmailXPath, openCartConfig.loginEmail)
    await page.type(openCartConfig.loginPasswordXPath, openCartConfig.loginPassword)

    // fill in login form
    // submit login form
}

export const main = async (targetUrl: string = 'https://opencart.abstracta.us/index.php?route=account/login') => {
    browser = await puppeteer.launch(puppeteerOptions)
    page = await browser.newPage()
    await page.goto(targetUrl)
    await login()
}

if (require.main === module) {
    main().then(r => {console.log(`done.`)})
}
