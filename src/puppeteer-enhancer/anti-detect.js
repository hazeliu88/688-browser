const { puppeteer } = require('../utils/logger');

class AntiDetect {
    async apply(page, fingerprint) {
        try {
            puppeteer('Applying advanced anti-detection measures');
            
            // 应用反检测
            await page.evaluateOnNewDocument((fp) => {
                // 1. 彻底移除 navigator.webdriver
                try {
                    delete navigator.__proto__.webdriver;
                } catch (e) {}
                
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                    configurable: false,
                    enumerable: false
                });
                
                // 2. 覆盖 PluginArray 原型链
                function createPluginArray() {
                    const plugins = [
                        {
                            name: 'Chrome PDF Plugin',
                            filename: 'internal-pdf-viewer',
                            description: 'Portable Document Format',
                            version: '1.0'
                        },
                        {
                            name: 'Chrome PDF Viewer',
                            filename: 'internal-pdf-viewer',
                            description: '',
                            version: '1.0'
                        },
                        {
                            name: 'Native Client',
                            filename: 'internal-nacl-plugin',
                            description: '',
                            version: '1.0'
                        }
                    ];
                    
                    const handler = {
                        get: function(target, prop) {
                            if (prop === Symbol.toStringTag) return 'PluginArray';
                            if (prop === 'length') return target.length;
                            if (typeof prop === 'string' && !isNaN(prop)) {
                                return target[prop];
                            }
                            return Reflect.get(...arguments);
                        }
                    };
                    
                    return new Proxy(plugins, handler);
                }
                
                // 3. 覆盖 navigator.plugins
                Object.defineProperty(navigator, 'plugins', {
                    get: () => createPluginArray(),
                    configurable: false,
                    enumerable: true
                });
                
                // 4. 覆盖 navigator.mimeTypes
                Object.defineProperty(navigator, 'mimeTypes', {
                    get: () => [],
                    configurable: false,
                    enumerable: true
                });
                
                // 5. 覆盖 navigator.languages
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en'],
                    configurable: false,
                    enumerable: true
                });
                
                // 6. 覆盖 window.chrome
                Object.defineProperty(window, 'chrome', {
                    get: () => ({
                        app: { isInstalled: false },
                        webstore: {},
                        runtime: {},
                        csi: {},
                        loadTimes: () => {},
                        app: { isInstalled: false }
                    }),
                    configurable: false,
                    enumerable: false
                });
                
                // 7. 覆盖硬件信息
                Object.defineProperty(navigator, 'hardwareConcurrency', {
                    get: () => fp.hardwareConcurrency,
                    configurable: false,
                    enumerable: true
                });
                
                Object.defineProperty(navigator, 'deviceMemory', {
                    get: () => fp.deviceMemory,
                    configurable: false,
                    enumerable: true
                });
                
                // 8. 覆盖屏幕信息
                Object.defineProperty(screen, 'width', {
                    get: () => parseInt(fp.screen.split('x')[0]),
                    configurable: false,
                    enumerable: true
                });
                
                Object.defineProperty(screen, 'height', {
                    get: () => parseInt(fp.screen.split('x')[1]),
                    configurable: false,
                    enumerable: true
                });
                
                // 9. 覆盖 userAgent
                Object.defineProperty(navigator, 'userAgent', {
                    get: () => fp.userAgent,
                    configurable: false,
                    enumerable: true
                });
                
                // 10. 覆盖 WebGL 信息
                const getParameter = WebGLRenderingContext.prototype.getParameter;
                WebGLRenderingContext.prototype.getParameter = function(parameter) {
                    if (parameter === 37445) { // UNMASKED_VENDOR_WEBGL
                        return fp.webglVendor || 'Google Inc. (Intel)';
                    }
                    if (parameter === 37446) { // UNMASKED_RENDERER_WEBGL
                        return 'Intel Iris OpenGL Engine';
                    }
                    return getParameter.call(this, parameter);
                };
                
                // 11. 覆盖 console.debugger 检测
                const originalDebugger = console.debug;
                console.debug = function() {
                    if (arguments[0] && arguments[0].includes('debugger')) return;
                    return originalDebugger.apply(this, arguments);
                };
                
            }, fingerprint);
            
            // 设置用户代理
            await page.setUserAgent(fingerprint.userAgent);
            
            // 添加额外保护
            await page.evaluate(() => {
                // 覆盖 navigator.permissions
                const originalQuery = navigator.permissions.query;
                navigator.permissions.query = (parameters) => (
                    parameters.name === 'notifications' ? 
                        Promise.resolve({ state: 'denied' }) : 
                        originalQuery(parameters)
                );
            });
            
            puppeteer('Advanced anti-detection measures applied');
        } catch (err) {
            puppeteer(`Anti-detection failed: ${err.message}`);
            throw err;
        }
    }
}

module.exports = AntiDetect;