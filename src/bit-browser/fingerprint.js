class FingerprintGenerator {
    static generateRandom() {
        const fingerprints = [
            {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                screen: '1920x1080',
                fonts: ['Arial', 'Times New Roman', 'Helvetica'],
                webglVendor: 'Google Inc. (Intel)',
                platform: 'Win32',
                deviceMemory: 8,
                hardwareConcurrency: 4
            },
            {
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
                screen: '1440x900',
                fonts: ['Helvetica', 'Arial', 'Times'],
                webglVendor: 'Apple Inc.',
                platform: 'MacIntel',
                deviceMemory: 8,
                hardwareConcurrency: 8
            },
            {
                userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                screen: '1366x768',
                fonts: ['Ubuntu', 'Arial', 'Liberation Sans'],
                webglVendor: 'Google Inc. (Intel)',
                platform: 'Linux x86_64',
                deviceMemory: 4,
                hardwareConcurrency: 2
            }
        ];
        
        return fingerprints[Math.floor(Math.random() * fingerprints.length)];
    }
}

module.exports = FingerprintGenerator;