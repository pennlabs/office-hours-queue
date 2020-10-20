import puppeteer from "puppeteer";

async function login(browser) {
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    });
    await page.goto("http://localhost:8000/admin");
    await page.$eval("input[name=username]", (el, value) => {
        // eslint-disable-next-line
        el.value = "admin";
    });
    await page.$eval("input[name=password]", (el, value) => {
        // eslint-disable-next-line
        el.value = "ying1234";
    });
    const element = await page.$("input[type=submit]");
    await element.click();
    await page.waitForNavigation();
    return page;
}

describe("snapshot tests", () => {
    let browser;

    beforeAll(async () => {
        browser = await puppeteer.launch();
    });

    it("snapshot landing page", async () => {
        const page = await browser.newPage();
        await page.setViewport({
            width: 1440,
            height: 900,
            deviceScaleFactor: 1,
        });
        await page.goto("http://localhost:3000");
        const image = await page.screenshot();
        expect(image).toMatchImageSnapshot();
    });

    it("snapshot dashboard", async () => {
        const page = await login(browser);
        await page.goto("http://localhost:3000");
        const image = await page.screenshot();
        expect(image).toMatchImageSnapshot();
    });

    afterAll(async () => {
        await browser.close();
    });
});
