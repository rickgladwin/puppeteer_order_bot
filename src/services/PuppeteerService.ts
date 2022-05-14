import puppeteer from 'puppeteer'
import { config } from "../startup";
import { OrderItem } from "../entities/OrderItem";
import { CustomerOrderServiceInterface } from "./CustomerOrderFacade";

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

export class PuppeteerService implements CustomerOrderServiceInterface {
    browser: any
    page: any
    initialized: boolean

    constructor () {
        this.initialized = false
    }

    async init (): Promise<void> {
        this.browser = await puppeteer.launch(puppeteerOptions)
        this.page = await this.browser.newPage()
        await this.page.setViewport({
            width: 800,
            height: 800,
            deviceScaleFactor: 1,
        })
        this.initialized = true
    }

    async ensureInit (): Promise<void> {
        if (!this.initialized) {
            await this.init()
        }
    }

    async accessStore (store_url: string): Promise<void> {
        await this.ensureInit()
        await this.page.goto(store_url)
    }

    addItemToCart (item_name: string, item_category?: string, item_subcategory?: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    async browseToItem (item_name: string, item_category: string, item_subcategory?: string): Promise<void> {
        // target category nav
        const categoryXPath = this.categoryXPath(item_category)
        const categoryNav = (await page.$x(categoryXPath))[0]

        // click through to item listing page
        if (!!item_subcategory) {
            // target/click subcategory nav
            await categoryNav.hover()
            const subCategoryXPath = this.subCategoryXPath(item_subcategory)
            const subCategoryNav = (await page.$x(subCategoryXPath))[0]
            await subCategoryNav.click()
        } else {
            // click category nav
            await categoryNav.click()
        }

        // TODO: finish PuppeteerService module
        // TODO: update the controller/facade to make use of theis service

        // click
        const monitorsText = 'Monitors'
        const componentsSubNavXPath = ".//li//ul/li/a[contains(text(),'" + monitorsText + "')]"
        const componentsSubNav = (await page.$x(componentsSubNavXPath))[0]
        await componentsSubNav.hover()


        // return Promise.resolve(undefined);
    }

    checkout (): Promise<void> {
        return Promise.resolve(undefined);
    }

    categoryXPath (category_name: string): string {
        return ".//li/a[text()='" + category_name + "']"
    }

    subCategoryXPath (sub_category_name: string): string {
        return ".//li//ul/li/a[contains(text(),'" + sub_category_name + "')]"
    }

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

export const addItemToCart = async (orderItem: OrderItem): Promise<void> => {

}

export const main = async (targetUrl: string = 'https://opencart.abstracta.us/index.php?route=account/login'): Promise<void> => {
    browser = await puppeteer.launch(puppeteerOptions)
    console.log(`browser:`, browser);
    page = await browser.newPage()
    console.log(`page:`, page);
    await page.setViewport({
        width: 800,
        height: 800,
        deviceScaleFactor: 1,
    });
    await page.goto(targetUrl)
    await page.waitForTimeout(3000)
    const componentsText = 'Components'
    const componentsNavXPath = ".//li/a[text()='" + componentsText + "']"
    const componentsNav = (await page.$x(componentsNavXPath))[0]
    await componentsNav.hover()
    const monitorsText = 'Monitors'
    const componentsSubNavXPath = ".//li//ul/li/a[contains(text(),'" + monitorsText + "')]"
    const componentsSubNav = (await page.$x(componentsSubNavXPath))[0]
    await componentsSubNav.hover()
    await login()
}

if (require.main === module) {
    main().then(r => {console.log(`done.`)})
}
