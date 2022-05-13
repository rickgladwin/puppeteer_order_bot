import puppeteer from 'puppeteer'
import { config } from "../startup";

const puppeteerOptions = {
    headless: false,
    height: 800,
}

const openCartConfig = {
    url: 'https://opencart.abstracta.us/index.php?route=account/login',
    loginEmailXPath: './/*[@id="input-email"]',
    loginPasswordXPath: './/*[@id="input-password"]',
    loginSubmitXPath: './/*[@value="Login"]',
    loginEmailId: '#input-email',
    loginPasswordId: '#input-password',
    loginEmail: config.open_cart_email as string,
    loginPassword: config.open_cart_password as string,
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
    // console.log(`login called with page:`, page);
    // console.log(`openCartConfig.loginEmail:`, openCartConfig.loginEmail);
    // console.log(`openCartConfig.loginPassword:`, openCartConfig.loginPassword);
    // await page.type(openCartConfig.loginEmailXPath, openCartConfig.loginEmail)
    // await page.type(openCartConfig.loginPasswordXPath, openCartConfig.loginPassword)
    await page.type(openCartConfig.loginEmailId, openCartConfig.loginEmail)
    await page.waitForTimeout(3000)
    await page.type(openCartConfig.loginPasswordId, openCartConfig.loginPassword)
    await page.waitForTimeout(3000)
    const loginButton = (await page.$x(openCartConfig.loginSubmitXPath))[0]
    await loginButton.click()
    // fill in login form
    // submit login form
    // await page.click()
}

export const main = async (targetUrl: string = 'https://opencart.abstracta.us/index.php?route=account/login'): Promise<void> => {
    browser = await puppeteer.launch(puppeteerOptions)
    page = await browser.newPage()
    await page.setViewport({
        width: 800,
        height: 800,
        deviceScaleFactor: 1,
    });
    await page.goto(targetUrl)
    await page.waitForTimeout(3000)
    await login()
}

if (require.main === module) {
    main().then(r => {console.log(`done.`)})
}
