const axios = require('axios');
const { browser } = require('../utils/logger');
const Config = require('../utils/config');

class BitBrowserClient {
    constructor() {
        this.client = axios.create({
            baseURL: Config.getBitBrowserApi(),
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });
    }

    async request(endpoint, payload) {
        try {
            browser(`Sending request to ${endpoint}`);
            const response = await this.client.post(endpoint, payload);
            return response.data;
        } catch (err) {
            if (err.code === 'ECONNABORTED') {
                browser(`Request to ${endpoint} timed out`);
            } else {
                browser(`Request failed: ${err.message}`);
            }
            throw err;
        }
    }

    async createBrowser(fingerprint = {}) {
        const payload = {
            name: 'puppeteer-enhanced',
            proxyMethod: 2,
            proxyType: 'noproxy',
            browserFingerPrint: {
                coreVersion: '124',
                ...fingerprint
            }
        };
        const data = await this.request('/browser/update', payload);
        return data.data.id;
    }

    async openBrowser(id) {
        const data = await this.request('/browser/open', { id });
        return data.data;
    }

    async closeBrowser(id) {
        return this.request('/browser/close', { id });
    }

    async deleteBrowser(id) {
        return this.request('/browser/delete', { id });
    }
}

module.exports = BitBrowserClient;