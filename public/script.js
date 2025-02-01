class ShortlinkGenerator {
    constructor() {
        this.url = document.getElementById('url');
        this.alias = document.getElementById('alias');
        this.password = document.getElementById('password');
        this.maxClicks = document.getElementById('max-clicks');
        this.blockBots = document.getElementById('block-bots');
        this.generateBtn = document.getElementById('generateBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.error = document.getElementById('error');
        this.result = document.getElementById('result');
        this.shortlink = document.getElementById('shortlink');

        this.generateBtn.addEventListener('click', () => this.generate());
        this.copyBtn.addEventListener('click', () => this.copy());
    }

    async generate() {
        const url = this.url.value;
        if (!url) return this.showError('Please enter a valid URL');

        const alias = this.alias.value || '';
        const password = this.password.value || '';
        const maxClicks = this.maxClicks.value ? this.maxClicks.value : '';
        const blockBots = this.blockBots.checked ? 'true' : 'false';

        const data = new URLSearchParams();
        data.append('url', url);
        if (alias) data.append('alias', alias);
        if (password) data.append('password', password);
        if (maxClicks) data.append('max-clicks', maxClicks);
        data.append('block-bots', blockBots);

        try {
            const response = await fetch('https://spoo.me/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: data,
                redirect: 'follow'
            });

            if (response.ok || response.status === 302) {
                let shortlink = response.url;

                if (shortlink.includes('/result/')) {
                    shortlink = shortlink.replace('/result/', '/');
                }

                this.shortlink.value = shortlink;
                this.result.classList.remove('hidden');
                this.error.classList.add('hidden');
            } else {
                throw new Error('Invalid URL or duplicate alias');
            }
        } catch (err) {
            this.showError(err.message);
        }
    }

    async copy() {
        const originalText = this.copyBtn.textContent;
        try {
            await navigator.clipboard.writeText(this.shortlink.value);
            this.copyBtn.textContent = 'Copied to Clipboard!';
            setTimeout(() => this.copyBtn.textContent = originalText, 3000);
        } catch {
            this.showError('Failed to copy');
        }
    }

    showError(message) {
        this.error.textContent = message;
        this.error.classList.remove('hidden');
        this.result.classList.add('hidden');
    }
}

new ShortlinkGenerator();