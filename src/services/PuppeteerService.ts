import puppeteer, { Browser, Page } from 'puppeteer'
import { config } from "../startup";
import { ItemOption, OrderItem } from "../entities/OrderItem";
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

// export let browser: Browser
// export let page: Page

// export const launchBrowser = async (): Promise<void> => {
//     browser = await puppeteer.launch(puppeteerOptions)
// }

// export const visitPage = async (targetUrl: string = 'https://opencart.abstracta.us/index.php?route=account/login'): Promise<void> => {
//     page = await browser.newPage()
//     await page.goto(targetUrl)
// }

export class PuppeteerService implements CustomerOrderServiceInterface {
    browser!: Browser
    page!: Page
    initialized: boolean

    constructor () {
        this.initialized = false
    }

    async init (): Promise<this> {
        this.browser = await puppeteer.launch(puppeteerOptions)
        this.page = await this.browser.newPage()
        await this.page.setViewport({
            width: 800,
            height: 800,
            deviceScaleFactor: 1,
        })
        this.initialized = true
        return this
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

    async addItemToCart (item_name: string, item_category: string, item_subcategory?: string, item_options?: Array<ItemOption>): Promise<void> {
        await this.ensureInit()
        await this.browseToItem(item_name, item_category, item_subcategory)
        // select options
        if (!!item_options) {
            item_options.forEach((item_option) => {
                this.page.select('select#' + item_option.id, item_option.value)
            })
        }
        // set quantity
        const quantityXPath = this.quantityXPath()
        await this.page.type(quantityXPath, '1')
        // add to cart
        await this.page.$x(this.addToCartXPath())
    }

    async browseToItem (item_name: string, item_category: string, item_subcategory?: string, item_options?: Array<ItemOption>): Promise<void> {
        await this.ensureInit()
        // target category nav
        const categoryXPath = this.categoryXPath(item_category)
        const categoryNav = (await this.page.$x(categoryXPath))[0]

        // click through to item listing page
        if (!!item_subcategory) {
            // target/click subcategory nav
            await categoryNav.hover()
            const subCategoryXPath = this.subCategoryXPath(item_subcategory)
            const subCategoryNav = (await this.page.$x(subCategoryXPath))[0]
            await subCategoryNav.click()
        } else {
            // click category nav
            await categoryNav.click()
        }

        // click the item on the listing page
        const itemXPath = this.itemXPath(item_name)
        const itemLink = (await this.page.$x(itemXPath))[0]
        await itemLink.click()

        // TODO: finish PuppeteerService module
        // TODO: update the controller/facade to make use of this service
    }

    async checkout (): Promise<void> {
        await this.ensureInit()
        return Promise.resolve(undefined);
    }

    categoryXPath (category_name: string): string {
        return ".//li/a[text()='" + category_name + "']"
    }

    subCategoryXPath (sub_category_name: string): string {
        return ".//li//ul/li/a[contains(text(),'" + sub_category_name + "')]"
    }

    itemXPath (item_name: string): string {
        return ".//a[text()='" + item_name + "']"
    }

    quantityXPath (): string {
        return ".//input[@name='quantity']"
    }

    addToCartXPath (): string {
        return ".//button[@id='button-cart']"
    }
}

export const login = async (): Promise<void> => {
    // visit login page
    // console.log(`login called with page:`, page);
    // console.log(`openCartConfig.loginEmail:`, openCartConfig.loginEmail);
    // console.log(`openCartConfig.loginPassword:`, openCartConfig.loginPassword);
    // await page.type(openCartConfig.loginEmailXPath, openCartConfig.loginEmail)
    // await page.type(openCartConfig.loginPasswordXPath, openCartConfig.loginPassword)
    // await page.type(openCartConfig.loginEmailId, openCartConfig.loginEmail)
    // await page.waitForTimeout(3000)
    // await page.type(openCartConfig.loginPasswordId, openCartConfig.loginPassword)
    // await page.waitForTimeout(3000)
    // const loginButton = (await page.$x(openCartConfig.loginSubmitXPath))[0]
    // await loginButton.click()
    // fill in login form
    // submit login form
    // await page.click()
}

const sampleItem = {
    "category": "Cameras",
    "subCategory": null,
    "itemName": "Nikon D300"
}

export const main = async (): Promise<void> => {
    const puppeteerService = await new PuppeteerService().init()
    await puppeteerService.accessStore(openCartConfig.url)
    await puppeteerService.browseToItem(sampleItem.itemName, sampleItem.category)
    await puppeteerService.addItemToCart(sampleItem.itemName, sampleItem.category)



    // browser = await puppeteer.launch(puppeteerOptions)
    // console.log(`browser:`, browser);
    // page = await browser.newPage()
    // console.log(`page:`, page);
    // await page.setViewport({
    //     width: 800,
    //     height: 800,
    //     deviceScaleFactor: 1,
    // });
    // await page.goto(targetUrl)
    // await page.waitForTimeout(3000)
    // const componentsText = 'Components'
    // const componentsNavXPath = ".//li/a[text()='" + componentsText + "']"
    // const componentsNav = (await page.$x(componentsNavXPath))[0]
    // await componentsNav.hover()
    // const monitorsText = 'Monitors'
    // const componentsSubNavXPath = ".//li//ul/li/a[contains(text(),'" + monitorsText + "')]"
    // const componentsSubNav = (await page.$x(componentsSubNavXPath))[0]
    // await componentsSubNav.hover()
    // await login()
}

if (require.main === module) {
    main().then(r => {console.log(`done.`)})
}
