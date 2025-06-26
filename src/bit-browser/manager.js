const BitBrowserClient = require('./api-client');
const { browser, error } = require('../utils/logger');

class BitBrowserManager {
    constructor() {
        this.client = new BitBrowserClient();
        this.activeBrowsers = new Map();
    }

    async createBrowser(fingerprint = {}) {
        try {
            const id = await this.client.createBrowser(fingerprint);
            browser(`Created browser with ID: ${id}`);
            this.activeBrowsers.set(id, { status: 'created' });
            return id;
        } catch (err) {
            error(`Failed to create browser: ${err.message}`);
            throw err;
        }
    }

    async openBrowser(id) {
        try {
            if (!this.activeBrowsers.has(id)) {
                throw new Error(`Browser ${id} not found`);
            }

            const debugInfo = await this.client.openBrowser(id);
            browser(`Opened browser ${id} at ${debugInfo.http}`);
            this.activeBrowsers.set(id, { ...this.activeBrowsers.get(id), status: 'open', debugInfo });
            return debugInfo;
        } catch (err) {
            error(`Failed to open browser ${id}: ${err.message}`);
            throw err;
        }
    }

    async closeBrowser(id) {
        try {
            if (!this.activeBrowsers.has(id)) {
                browser(`Browser ${id} already closed or not found`);
                return;
            }

            await this.client.closeBrowser(id);
            browser(`Closed browser ${id}`);
            this.activeBrowsers.set(id, { ...this.activeBrowsers.get(id), status: 'closed' });
        } catch (err) {
            error(`Failed to close browser ${id}: ${err.message}`);
        }
    }

    async deleteBrowser(id) {
        try {
            if (!this.activeBrowsers.has(id)) {
                browser(`Browser ${id} not found for deletion`);
                return;
            }

            await this.client.deleteBrowser(id);
            browser(`Deleted browser ${id}`);
            this.activeBrowsers.delete(id);
        } catch (err) {
            error(`Failed to delete browser ${id}: ${err.message}`);
        }
    }

    async cleanup() {
        browser('Cleaning up all active browsers');
        for (const [id, browserData] of this.activeBrowsers) {
            try {
                if (browserData.status === 'open') {
                    await this.closeBrowser(id);
                }
                await this.deleteBrowser(id);
            } catch (err) {
                error(`Cleanup failed for browser ${id}: ${err.message}`);
            }
        }
    }

    getDebugInfo(id) {
        const browserData = this.activeBrowsers.get(id);
        return browserData?.debugInfo || null;
    }
}

module.exports = BitBrowserManager;