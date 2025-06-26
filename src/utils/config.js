require('dotenv').config();

class Config {
    static get(key, defaultValue = null) {
        return process.env[key] || defaultValue;
    }

    static getBitBrowserApi() {
        return this.get('BIT_BROWSER_API', 'http://127.0.0.1:54345');
    }

    static isHeadless() {
        return this.get('PUPPETEER_HEADLESS', 'false') === 'true';
    }

    static getLogLevel() {
        return this.get('LOG_LEVEL', 'info');
    }

    static isDebugMode() {
        return this.get('DEBUG_MODE', 'false') === 'true';
    }

    static getBrowserTimeout() {
        return parseInt(this.get('BROWSER_TIMEOUT', '60000'), 10);
    }

    static getTurnstileSetting() {
        return this.get('TURNSTILE_ENABLED', 'true') === 'true';
    }
}

module.exports = Config;