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

class URLStatistics {
    constructor() {
        this.aliasInput = document.getElementById('aliasStats');
        this.passwordInput = document.getElementById('passwordStats');
        this.getStatsBtn = document.getElementById('getStatsBtn');
        this.statsResult = document.getElementById('statsResult');
        this.errorDiv = document.getElementById('error');

        this.getStatsBtn.addEventListener('click', () => this.getStatistics());
    }

    async getStatistics() {
        const alias = this.aliasInput.value.trim();
        const password = this.passwordInput.value.trim() || '';

        if (!alias) {
            return this.showError('Please enter a valid alias');
        }

        const data = new URLSearchParams();
        if (password) {
            data.append('passwordStats', password);
        }

        const strippedAlias = alias.replace(/^https?:\/\/(?:www\.)?spoo\.me\/stats\//, '').replace(/^https?:\/\/(?:www\.)?spoo\.me\//, '');

        try {
            const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://spoo.me/stats/' + strippedAlias)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: data,
            });

            if (response.ok) {
                const jsonResponse = await response.json();
                console.log(jsonResponse);

                const stats = JSON.parse(jsonResponse.contents);

                this.displayStats(stats);
            } else {
                throw new Error('Failed to fetch statistics');
            }
        } catch (err) {
            this.showError(err.message);
        }
    }

    displayStats(stats) {
        this.statsResult.classList.remove('hidden');
        this.errorDiv.classList.add('hidden');

        const safeGet = (value, fallback = 'N/A') => (value || value === 0 ? value : fallback);

        this.statsResult.innerHTML = `
            <div class="card-body bg-base-300 border-2 border-black rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h2 class="card-title">URL Statistics</h2>
                <ul>
                    <li class="text-xs"><strong>URL :</strong> ${safeGet(stats.url)}</li>
                    <li class="text-xs"><strong>Total Clicks :</strong> ${safeGet(stats['total-clicks'], 0)}</li>
                    <li class="text-xs"<strong>Unique Clicks :</strong> ${safeGet(stats['total_unique_clicks'], 0)}</li>
                    <li class="text-xs"><strong>Last Click :</strong> ${safeGet(stats['last-click'])}</li>
                    <li class="text-xs"><strong>Country :</strong> ${safeGet(stats.unique_country ? Object.keys(stats.unique_country).join(', ') : '')}</li>
                    <li class="text-xs"><strong>Browser :</strong> ${safeGet(stats.unique_browser ? Object.keys(stats.unique_browser).join(', ') : '')}</li>
                    <li class="text-xs"><strong>Operating System :</strong> ${safeGet(stats.unique_os_name ? Object.keys(stats.unique_os_name).join(', ') : '')}</li>
                    <li class="text-xs"><strong>Referrer :</strong> ${safeGet(stats.unique_referrer ? Object.keys(stats.unique_referrer).join(', ') : '')}</li>
                    <li class="text-xs"><strong>Average Daily Clicks :</strong> ${safeGet(stats['average_daily_clicks'])}</li>
                    <li class="text-xs"><strong>Average Monthly Clicks :</strong> ${safeGet(stats['average_monthly_clicks'])}</li>
                    <li class="text-xs"><strong>Average Weekly Clicks :</strong> ${safeGet(stats['average_weekly_clicks'])}</li>
                    <li class="text-xs"><strong>Average Redirection Time :</strong> ${safeGet(stats['average_redirection_time'])} ms</li>
                    <li class="text-xs"><strong>Creation Date :</strong> ${safeGet(stats['creation-date'])}</li>
                    <li class="text-xs"><strong>Expired :</strong> ${safeGet(stats.expired === null ? 'No' : 'Yes')}</li>
                    <li class="text-xs"><strong>Block Bots :</strong> ${safeGet(stats['block-bots'] ? 'Yes' : 'No')}</li>
                    <li class="text-xs"><strong>Bots :</strong> ${safeGet(stats.bots ? Object.entries(stats.bots).map(([bot, count]) => `${bot}: ${count}`).join(', ') : '')}</li>
                    <li class="text-xs"><strong>Referrer Source :</strong> ${safeGet(stats.referrer ? Object.keys(stats.referrer).join(', ') : '')}</li>
                </ul>
            </div>
        `;
    }

    showError(message) {
        this.errorDiv.textContent = message;
        this.errorDiv.classList.remove('hidden');
        this.statsResult.classList.add('hidden');
    }
}

new URLStatistics();