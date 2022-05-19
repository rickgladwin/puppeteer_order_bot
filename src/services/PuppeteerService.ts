import puppeteer, { Browser, Page } from 'puppeteer'
import { config } from "../startup";
import { ItemOption } from "../entities/OrderItem";
import { CustomerOrderServiceInterface } from "./CustomerOrderFacade";
import { CustomerOrder, PaymentMethodEnum } from "../entities/CustomerOrder";
import stateValueMatcher from "../data/OpenCartPaymentStateValues.json"

const puppeteerOptions = {
    headless: false,
    height: 800,
}

export const openCartConfig = {
    url: 'https://opencart.abstracta.us/index.php?route=account/login',
    checkoutUrl: 'https://opencart.abstracta.us/index.php?route=checkout/checkout',
    accountOrdersUrl: 'https://opencart.abstracta.us/index.php?route=account/order',
    loginEmailXPath: './/*[@id="input-email"]',
    loginPasswordXPath: './/*[@id="input-password"]',
    loginSubmitXPath: './/*[@value="Login"]',
    loginEmailId: '#input-email',
    loginPasswordId: '#input-password',
    loginEmail: config.open_cart_email as string,
    loginPassword: config.open_cart_password as string,
}

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
        await this.page.waitForXPath(quantityXPath);
        await this.page.evaluate( () => { (document.getElementById('input-quantity') as HTMLInputElement).value = '1' })

        // add to cart
        const addToCartXPath = this.addToCartXPath();
        await (await this.page.$x(addToCartXPath))[0].click()
    }

    async browseToItem (item_name: string, item_category: string, item_subcategory?: string, item_options?: Array<ItemOption>): Promise<void> {
        await this.ensureInit()
        // target category nav
        const categoryXPath = this.categoryXPath(item_category)
        await this.page.waitForXPath(categoryXPath, { timeout: 10000 })
        const categoryNav = (await this.page.$x(categoryXPath))[0]

        // click through to item listing page
        if (!!item_subcategory) {
            console.log(`item ${item_name} has subcategory ${item_subcategory}`);
            // target/click subcategory nav
            await categoryNav.hover()
            const subCategoryXPath = this.subCategoryXPath(item_subcategory)
            console.log(`subCategoryXPath:`, subCategoryXPath);
            const subCategoryNav = (await this.page.$x(subCategoryXPath))[0]
            // await this.page.evaluate(element => element.click(), subCategoryNav)
            await Promise.all([
                this.page.waitForNavigation(),
                await subCategoryNav.click()
            ])
        } else {
            console.log(`item ${item_name} has no subcategory`);
            // click category nav
            await Promise.all([
                this.page.waitForNavigation(),
                await categoryNav.click()
            ])
        }

        // click the item on the listing page
        const itemXPath = this.itemXPath(item_name)
        await this.page.waitForXPath(itemXPath)
        const itemLinks = await this.page.$x(itemXPath)
        const itemLink = itemLinks[0]
        await Promise.all([
            this.page.waitForNavigation(),
            await itemLink.click()
        ])
    }

    async checkout (order: CustomerOrder): Promise<void> {
        await this.ensureInit()
        // goto checkout page
        console.log(`going to checkout page`);
        await this.page.goto(openCartConfig.checkoutUrl)

        const alreadyLoggedIn = await this.alreadyLoggedIn()

        if (!alreadyLoggedIn) {
            console.log(`not already logged in`);
            // fill out Returning Customer login form
            await this.page.waitForSelector('#button-login')
            console.log(`login button seen`);
            const loginButton = (await this.page.$x(this.loginButtonXPath()))[0]
            // console.log(`loginButton:`, loginButton);
            await this.page.type('#input-email', openCartConfig.loginEmail)
            await this.page.type('#input-password', openCartConfig.loginPassword)
            await this.page.evaluate(element => element.click(), loginButton)
            console.log(`login button clicked`);
        }

        // fill out new billing address
        await this.page.waitForSelector('#button-payment-address')
        const newBillingAddressRadioXPath = this.newBillingAddressRadioXPath();
        await this.page.waitForXPath(newBillingAddressRadioXPath, { timeout: 10000 })
        await (await this.page.$x(newBillingAddressRadioXPath))[0].click()
        await this.page.type('#input-payment-firstname', order.customerFirstName)
        await this.page.type('#input-payment-lastname', order.customerLastName)
        await this.page.type('#input-payment-address-1', order.customerAddress)
        await this.page.type('#input-payment-city', order.customerCity)
        await this.page.evaluate( () => (document.getElementById('input-payment-postcode') as HTMLInputElement).value = '')
        await this.page.type('#input-payment-postcode', order.customerZip)
        await this.page.select('#input-payment-country', "223") // United States
        const matchedStateValue = this.inputPaymentZoneValue(order)
        console.log(`matchedStateValue: ${matchedStateValue}`, typeof matchedStateValue);
        await this.page.waitForSelector('#input-payment-zone')
        await this.page.waitForTimeout(3000)
        console.log(`payment zone selector seen`);
        await this.page.select('#input-payment-zone', matchedStateValue)
        console.log(`payment zone selected`);
        const buttonPaymentAddress = (await this.page.$x(".//*[@id='button-payment-address']"))[0]
        await this.page.evaluate(element => element.click(), buttonPaymentAddress)
        console.log(`payment address button clicked`);

        // fill out new delivery address
        await this.page.waitForSelector('#button-shipping-address')
        console.log(`button shipping address seen`);
        const newDeliveryAddressRadioXPath = this.newDeliveryAddressRadioXPath();
        await (await this.page.$x(newDeliveryAddressRadioXPath))[0].click()
        await this.page.type('#input-shipping-firstname', order.customerFirstName)
        await this.page.type('#input-shipping-lastname', order.customerLastName)
        await this.page.type('#input-shipping-address-1', order.customerAddress)
        await this.page.type('#input-shipping-city', order.customerCity)
        await this.page.evaluate( () => (document.getElementById('input-shipping-postcode') as HTMLInputElement).value = '')
        await this.page.type('#input-shipping-postcode', order.customerZip)
        await this.page.select('#input-shipping-country', "223") // United States
        await this.page.select('#input-shipping-zone', matchedStateValue)
        await this.page.click('#button-shipping-address')

        // fill out delivery method/details
        await this.page.waitForSelector('#button-shipping-method')
        console.log(`buttonShippingMethod seen`);
        if (!!order.deliveryNotes) {
            const shippingMethodCommentsXPath = this.shippingMethodCommentsXPath();
            const shippingMethodComments = (await this.page.$x(shippingMethodCommentsXPath))[0];
            await shippingMethodComments.type(order.deliveryNotes)
        }
        const buttonShippingMethod = (await this.page.$x(".//*[@id='button-shipping-method']"))[0]
        // console.log(`buttonShippingMethod:`, buttonShippingMethod);
        await this.page.waitForTimeout(3000)
        await this.page.evaluate(element => element.click(), buttonShippingMethod)
        console.log(`buttonShippingMethod clicked`);
        // await this.page.click('#button-shipping-method')

        // fill out payment method
        let paymentMethodXPath: string
        if (order.paymentMethod === PaymentMethodEnum.BANK) {
            console.log(`payment method is BANK`);
            paymentMethodXPath = this.paymentMethodBankXPath()
        } else if (order.paymentMethod === PaymentMethodEnum.CASH) {
            console.log(`payment method is CASH`);
            paymentMethodXPath = this.paymentMethodCashXPath()
        } else {
            throw new Error(`payment method is not valid (${order.paymentMethod}`)
        }
        await this.page.waitForXPath(paymentMethodXPath)
        await (await this.page.$x(paymentMethodXPath))[0].click()
        if (!!order.paymentNotes) {
            const paymentMethodCommentsXPath = this.paymentMethodCommentsXPath();
            const paymentMethodComments = (await this.page.$x(paymentMethodCommentsXPath))[0];
            await paymentMethodComments.type(order.paymentNotes)
        }

        // agree to T&C
        await this.page.waitForSelector('#button-payment-method')
        const tocCheckboxXPath = this.termsAndConditionsXPath();
        const tocCheckbox = (await this.page.$x(tocCheckboxXPath))[0]
        const tocIsChecked = await (await tocCheckbox.getProperty('checked')).jsonValue() as boolean
        if (!tocIsChecked) {
            await tocCheckbox.click()
        }
        await this.page.click('#button-payment-method')

        // confirm order
        await this.page.waitForSelector('#button-confirm')
        const buttonConfirm = (await this.page.$('#button-confirm'))
        const allItemsPresent = await this.allOrderItemsPresent(order)
        if (!allItemsPresent) {
            throw new Error(`not all customer order items appear in the confirm order table`)
        }
        await this.page.evaluate(element => element.click(), buttonConfirm)

        // await this.page.click('#button-confirm')
    }

    async alreadyLoggedIn(): Promise<boolean> {
        // look for a nav item containing "Login"
        const myAccountLoginXPath = this.myAccountLoginXPath()
        let myAccountLogin
        try {
            myAccountLogin = await this.page.$x(myAccountLoginXPath)
        } catch (e: any) {
            console.log(`myAccountLogin error caught:`, e.message);
            return true
        }

        if (myAccountLogin.length > 0) {
            return false
        }

        if (myAccountLogin.length === 0) {
            return true
        }

        throw new Error(`can't determine login status`)
    }

    async fetchLatestOrderId(): Promise<string> {
        console.log(`fetchLatestOrderId called`);
        await this.ensureInit()
        let alreadyLoggedIn: boolean

        alreadyLoggedIn = await this.alreadyLoggedIn()

        // const alreadyLoggedIn = await this.alreadyLoggedIn()
        console.log(`alreadyLoggedIn when fetching order id:`, alreadyLoggedIn);
        console.log(`init ensured. going to ${openCartConfig.accountOrdersUrl}`);
        try {
            await this.page.waitForTimeout(3000)
            await this.page.goto(openCartConfig.accountOrdersUrl)
        } catch (e: any) {
            console.log(`could not navigate:`, e.message);
        }
        console.log(`goto complete to ${openCartConfig.accountOrdersUrl}`);
        const latestAccountOrderIdXPath = this.latestAccountOrderIdXPath()
        await this.page.waitForXPath(latestAccountOrderIdXPath)
        const latestOrderIdElement = (await this.page.$x(latestAccountOrderIdXPath))[0]
        const latestOrderIdString = await latestOrderIdElement.evaluate(element => element.textContent) as string
        return latestOrderIdString.replace('#', '')
    }

    async allOrderItemsPresent (order: CustomerOrder): Promise<boolean> {
        console.log(`allOrderItemsPresent called for order items`, order.items);
        // TODO: Login and clear the cart before every order
        //  OR create a command line prompt to remind.
        const orderConfirmItemsXPath = this.orderConfirmItemsXPath()
        await this.page.waitForXPath(orderConfirmItemsXPath)
        const itemsInOrderTable = await this.page.$x(orderConfirmItemsXPath)
        // confirm item count
        if (order.items.length != itemsInOrderTable.length) {
            console.log(`order.items.length (${order.items.length}) does not equal ${itemsInOrderTable.length}`);
            console.log(`itemsInOrderTable:`, itemsInOrderTable);
            return false
        }
        // confirm item presence
        // for each item in order, check presence in confirm order table
        let itemNamesInOrderTable = await Promise.all(itemsInOrderTable.map(async (itemInOrderTable) => {
            return await itemInOrderTable.evaluate(element => element.textContent) as string
        }))
        order.items.forEach(item => {
            if(!itemNamesInOrderTable.includes(item.itemName)) {
                return false
            }
        })

        return true
    }

    inputPaymentZoneValue (order: CustomerOrder): string {
        const stateMatcher: Array<StateMatcherElement> = stateValueMatcher
        // console.log(`stateMatcher:`, stateMatcher);
        const matchedState = stateMatcher.filter(matchObject => {
            return matchObject.stateAbbreviation === order.customerState
        })[0]

        if (!matchedState) {
            throw new Error(`customerState (${order.customerState}) does not match a checkout value`)
        }

        return matchedState.value
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

    // checkoutButtonXPath (): string {
    //     return ".//button[span/@id='cart-total']"
    // }

    // checkoutLinkXPath (): string {
    //     return ".//a/strong[contains(text(),'Checkout')]"
    // }

    checkoutOptionPanelContentXPath (): string {
        return ".//*[@id='collapse-checkout-option']"
    }

    myAccountLoginXPath (): string {
        return ".//*[@id='top-links']//a[contains(text(),'Login')]"
    }

    loginButtonXPath (): string {
        return ".//input[@id='button-login']"
    }

    newBillingAddressRadioXPath (): string {
        return ".//input[@name='payment_address'][@value='new']"
    }

    newDeliveryAddressRadioXPath (): string {
        return ".//input[@name='shipping_address'][@value='new']"
    }

    shippingMethodCommentsXPath (): string {
        return ".//*[@id='collapse-shipping-method']//textarea"
    }

    paymentMethodBankXPath (): string {
        return ".//input[@name='payment_method'][@value='bank_transfer']"
    }

    paymentMethodCashXPath (): string {
        return ".//input[@name='payment_method'][@value='cod']"
    }

    paymentMethodCommentsXPath (): string {
        return ".//*[@id='collapse-payment-method']//textarea"
    }

    termsAndConditionsXPath (): string {
        return ".//*[@id='collapse-payment-method']//input[@name='agree']"
    }

    orderConfirmItemsXPath (): string {
        return ".//*[@id='collapse-checkout-confirm']//tr/td/a"
    }

    latestAccountOrderIdXPath (): string {
        return "(.//*[@id='account-order']//*[@id='content']//table/tbody/tr)[1]/td[1]"
    }
}

const sampleOrder1 = {
"orderId": "ord_123",
"customerFirstName": "Jeffrey",
"customerLastName": "Martinez",
"customerAddress": "887 Cedar Lane",
"customerCity": "Cambridge",
"customerState": "MA",
"customerZip": "02141",
"deliveryNotes": null,
"paymentMethod": PaymentMethodEnum.CASH,
"paymentNotes": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do e iusmod tempor incididunt ut labore et dolore magna aliqua.",
"items": [
    {
        "category": "Components",
        "subCategory": "Monitors",
        "itemName": "Samsung SyncMaster 941BW"
    },
],
}

export const sampleOrder2 = {
    "orderId": "ord_123",
    "customerFirstName": "Jeffrey",
    "customerLastName": "Martinez",
    "customerAddress": "887 Cedar Lane",
    "customerCity": "Cambridge",
    "customerState": "MA",
    "customerZip": "02141",
    "deliveryNotes": null,
    "paymentMethod": PaymentMethodEnum.CASH,
    "paymentNotes": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do e iusmod tempor incididunt ut labore et dolore magna aliqua.",
    "items": [
        {
            "category": "Phones & PDAs",
            "subCategory": null,
            "itemName": "iPhone"
        },
        {
            "category": "Tablets",
            "subCategory": null,
            "itemName": "Samsung Galaxy Tab 10.1"
        },
        {
            "category": "Components",
            "subCategory": "Monitors",
            "itemName": "Samsung SyncMaster 941BW"
        }
    ]
}

export type StateMatcherElement = {
    value: string,
    stateName: string,
    stateAbbreviation: string,
}

// sample run
export const main = async (): Promise<void> => {
    const sampleOrder = sampleOrder1
    const puppeteerService = await new PuppeteerService().init()
    await puppeteerService.accessStore(openCartConfig.url)
    await puppeteerService.addItemToCart(sampleOrder.items[0].itemName, sampleOrder.items[0].category, sampleOrder.items[0].subCategory)
    await puppeteerService.checkout(sampleOrder)
    const accountOrderId = await puppeteerService.fetchLatestOrderId()
    console.log(`accountOrderId:`, accountOrderId);
}

// perform the sample run if the PuppeteerService module is called directly
if (require.main === module) {
    main().then(r => {console.log(`done.`, r)})
}
