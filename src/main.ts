import './style.css';

interface ShortlinkResponse {
  short_url: string;
}

class ShortlinkGenerator {
  private urlInput!: HTMLInputElement;
  private aliasInput!: HTMLInputElement;
  private generateButton!: HTMLButtonElement;
  private errorText!: HTMLParagraphElement;
  private resultContainer!: HTMLDivElement;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.setupDOM();
    this.setupEventListeners();
  }

  private setupDOM(): void {
    const app = document.querySelector<HTMLDivElement>('#app');

    if (!app) {
      throw new Error('App element not found');
    }

    app.innerHTML = `
      <div class="card bg-base-300 w-96 shadow-xl rounded-lg p-8 border border-primary">
        <h2 class="text-xl font-semibold mb-6 text-center">Shortlink Generator</h2>
        <label class="input input-bordered bg-base-200 mb-4 flex items-center gap-2">
          <i class="fa-solid fa-link"></i>
          <input type="text" class="grow" id="url" placeholder="Enter URL" />
        </label>
        <label class="input input-bordered bg-base-200 mb-4 flex items-center gap-2">
          <i class="fa-solid fa-quote-right"></i>
          <input type="text" class="grow" id="alias" placeholder="Custom Alias (optional)" />
        </label>
        <button id="generateBtn" class="btn bg-base-200 border border-primary w-full flex items-center justify-center">
          <i class="fa-solid fa-download"></i> Generate Shortlink
        </button>
        <div id="error" class="alert rounded mt-4 hidden">
          <span id="errorMessage"></span>
        </div>
        <div id="result" class="hidden mt-4">
          <input id="shortlink" type="text" readonly class="input input-bordered w-full mb-4 text-center" />
          <button id="copyBtn" class="btn bg-base-200 w-full flex items-center justify-center">
            <i class="fas fa-copy mr-2"></i> Copy to Clipboard
          </button>
        </div>
        <div class="card-footer flex justify-between items-center pt-4 mt-6 border-t border-primary">
          <span class="font-bold">ReiivanTheOnlyOne .</span>
          <div class="flex gap-4">
            <a href="https://github.com/RevanSP" target="_blank" class="text-white">
              <i class="fab fa-github text-lg"></i>
            </a>
            <a href="https://www.instagram.com/m9nokuro/" target="_blank" class="text-white">
              <i class="fab fa-instagram text-lg"></i>
            </a>
            <a href="https://web.facebook.com/profile.php?id=100082958149027&_rdc=1&_rdr" target="_blank" class="text-white">
              <i class="fab fa-facebook text-lg"></i>
            </a>
          </div>
        </div>
      </div>
    `;

    const urlInput = document.querySelector<HTMLInputElement>('#url');
    const aliasInput = document.querySelector<HTMLInputElement>('#alias');
    const generateButton = document.querySelector<HTMLButtonElement>('#generateBtn');
    const errorText = document.querySelector<HTMLParagraphElement>('#error');
    const resultContainer = document.querySelector<HTMLDivElement>('#result');

    if (!urlInput || !aliasInput || !generateButton || !errorText || !resultContainer) {
      throw new Error('Required elements not found');
    }

    this.urlInput = urlInput;
    this.aliasInput = aliasInput;
    this.generateButton = generateButton;
    this.errorText = errorText;
    this.resultContainer = resultContainer;
  }

  private setupEventListeners(): void {
    this.generateButton.addEventListener('click', () => this.generateShortlink());

    const copyButton = document.querySelector<HTMLButtonElement>('#copyBtn');
    if (copyButton) {
      copyButton.addEventListener('click', () => this.copyToClipboard());
    }
  }

  private async generateShortlink(): Promise<void> {
    const url = this.urlInput.value;
    const alias = this.aliasInput.value;

    if (!url) {
      this.showError('Please enter a valid URL');
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append('url', url);
      if (alias) formData.append('alias', alias);

      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json() as ShortlinkResponse;
        this.showResult(data.short_url);
        this.hideError();
      } else if (response.status === 400) {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Duplicate URL detected or invalid URL format.';
        this.showError(errorMessage);
      } else if (response.status === 429) {
        this.showError('Too many requests. Please try again later.');
      } else {
        this.showError(`HTTP error ! Status: ${response.status}`);
      }
    } catch (error) {
      this.showError('An error occurred while generating the shortlink.');
    }
  }

  private showResult(shortlink: string): void {
    const shortlinkInput = document.querySelector<HTMLInputElement>('#shortlink');
    if (!shortlinkInput) {
      throw new Error('Shortlink input not found');
    }

    shortlinkInput.value = shortlink;
    this.resultContainer.classList.remove('hidden');
  }

  private showError(message: string): void {
    this.errorText.textContent = message;
    this.errorText.classList.remove('hidden');
    this.resultContainer.classList.add('hidden');
  }

  private hideError(): void {
    this.errorText.classList.add('hidden');
  }

  private async copyToClipboard(): Promise<void> {
    const shortlinkInput = document.querySelector<HTMLInputElement>('#shortlink');
    if (!shortlinkInput) {
      throw new Error('Shortlink input not found');
    }

    try {
      await navigator.clipboard.writeText(shortlinkInput.value);
      this.showResult('Shortlink copied to clipboard!');
    } catch (err) {
      this.showError('Failed to copy to clipboard');
    }
  }
}

new ShortlinkGenerator();