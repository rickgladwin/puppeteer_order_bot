import * as PuppeteerService from "./PuppeteerService";
import puppeteer from "puppeteer";

describe('PuppeteerService', () => {
    it('launches a browser instance', async () => {
        expect(typeof PuppeteerService.browser).toBe('undefined')
        // console.log(`typeof PuppeteerService.puppeteerBrowser`, typeof PuppeteerService.puppeteerBrowser);
        await PuppeteerService.launchBrowser()
        // console.log(`puppeteerBrowser:`, PuppeteerService.puppeteerBrowser);
        // console.log(`typeof puppeteerBrowser`, typeof PuppeteerService.puppeteerBrowser);
        // console.log(`puppeteerBrowser constructor name`, PuppeteerService.puppeteerBrowser.constructor.name);
        expect(PuppeteerService.browser.constructor.name).toBe('Browser')

        // await PuppeteerService.puppeteerBrowser.close()
    })
    it('loads a target web page', async () => {
        // PuppeteerService.puppeteerBrowser = await puppeteer.launch({headless: false})
    })
    it.todo('hovers over elements')
    it.todo('clicks on elements')
    it.todo('fills out form fields')
    it.todo('submits form data')
})
