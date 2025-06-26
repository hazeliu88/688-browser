const { expect } = require('chai');
const EnhancedBrowserManager = require('../src/main');
const { puppeteer } = require('../src/utils/logger');

describe('Cloudflare Protection Bypass Tests', function() {
    this.timeout(300000); // 5分钟超时
    
    let browserManager;
    
    before(async () => {
        browserManager = new EnhancedBrowserManager();
        await browserManager.launch();
    });
    
    after(async () => {
        await browserManager.cleanup();
    });
    
    // 测试Cloudflare标准防护
    it('should bypass Cloudflare protection on nowsecure.nl', async () => {
        puppeteer('Testing Cloudflare bypass on nowsecure.nl');
        const page = await browserManager.navigateTo('https://nowsecure.nl');
        
        // 检查是否通过Cloudflare验证
        const content = await page.content();
        expect(content).to.not.contain('Checking if the site connection is secure');
        expect(content).to.not.contain('Cloudflare');
        expect(content).to.contain('OH YEAH, you successfully reached this page!');
    });
    
    // 测试Cloudflare高级防护
    it('should bypass Cloudflare Enterprise protection', async () => {
        puppeteer('Testing Cloudflare Enterprise bypass');
        const page = await browserManager.navigateTo('https://www.sportscarddatabase.com');
        
        // 检查是否被拦截
        const title = await page.title();
        expect(title).to.not.contain('Just a moment');
        expect(title).to.not.contain('Checking your browser');
    });
    
    // 测试Cloudflare JS Challenge
    it('should bypass Cloudflare JS Challenge', async () => {
        puppeteer('Testing Cloudflare JS Challenge bypass');
        const page = await browserManager.navigateTo('https://www.freebitco.in');
        
        // 检查是否通过JS挑战
        const content = await page.content();
        expect(content).to.not.contain('Please enable JavaScript');
        expect(content).to.not.contain('Checking your browser');
        expect(content).to.contain('Free Bitcoin');
    });
    
    // 测试Cloudflare Captcha Challenge
    it('should bypass Cloudflare Captcha Challenge', async () => {
        puppeteer('Testing Cloudflare Captcha Challenge bypass');
        const page = await browserManager.navigateTo('https://www.humblebundle.com');
        
        // 检查是否被要求填写验证码
        const content = await page.content();
        expect(content).to.not.contain('Please complete the security check');
        expect(content).to.not.contain('CAPTCHA');
        expect(content).to.contain('Humble Bundle');
    });
    
    // 测试Cloudflare 5秒盾
    it('should bypass Cloudflare 5-second shield', async () => {
        puppeteer('Testing Cloudflare 5-second shield bypass');
        const page = await browserManager.navigateTo('https://www.coinpayu.com');
        
        // 检查是否在5秒内加载完成
        const content = await page.content();
        expect(content).to.not.contain('Please wait a few seconds');
        expect(content).to.not.contain('Checking your browser');
        expect(content).to.contain('CoinPayu');
    });
});