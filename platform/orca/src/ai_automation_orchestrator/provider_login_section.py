"""Provider login dashboard section."""


def get_provider_login_html() -> str:
    """Get HTML for provider login section."""
    return """
    <section id="providers-login-view" class="view">
        <header style="margin-bottom: 20px;">
            <h2 style="font-family: 'Space Mono'; font-weight: 700; font-size: 32px;">AI PROVIDERS</h2>
            <p style="color: var(--muted); font-size: 13px;">Login to your AI provider accounts to use their models</p>
        </header>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <!-- Google/Gemini -->
            <div class="card">
                <h3>Google Gemini</h3>
                <div style="display: flex; align-items: center; gap: 10px; margin: 15px 0;">
                    <div class="status-dot" id="google-status" style="width: 10px; height: 10px; border-radius: 50%; background: #aaa;"></div>
                    <span id="google-status-text" style="color: var(--muted); font-size: 12px;">Not connected</span>
                </div>
                <p style="color: var(--muted); font-size: 12px; margin: 10px 0; line-height: 1.5;">
                    Login with your Google account to access Gemini models. Uses secure OAuth authentication.
                </p>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button class="nav-btn" id="google-login-btn" style="flex: 1; border: 1px solid var(--border); justify-content: center;">
                        <span style="margin-right: 5px;">🔐</span> Login with Google
                    </button>
                    <button class="nav-btn" id="google-logout-btn" style="flex: 1; border: 1px solid var(--border); justify-content: center; display: none;">
                        <span style="margin-right: 5px;">🚪</span> Logout
                    </button>
                </div>
                <p id="google-last-login" style="color: var(--muted); font-size: 10px; margin-top: 10px;"></p>
            </div>

            <!-- OpenAI -->
            <div class="card">
                <h3>OpenAI (GPT-4, GPT-o1)</h3>
                <div style="display: flex; align-items: center; gap: 10px; margin: 15px 0;">
                    <div class="status-dot" id="openai-status" style="width: 10px; height: 10px; border-radius: 50%; background: #aaa;"></div>
                    <span id="openai-status-text" style="color: var(--muted); font-size: 12px;">Not connected</span>
                </div>
                <p style="color: var(--muted); font-size: 12px; margin: 10px 0; line-height: 1.5;">
                    Enter your OpenAI API key to use GPT-4 models. <a href="https://platform.openai.com/api-keys" style="color: var(--accent);">Get API key</a>
                </p>
                <div style="margin-top: 10px;">
                    <input type="password" id="openai-apikey" placeholder="sk-..." style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(255,255,255,0.05); color: white; margin-bottom: 10px;">
                    <div style="display: flex; gap: 10px;">
                        <button class="nav-btn" id="openai-save-btn" style="flex: 1; border: 1px solid var(--border); justify-content: center;">
                            <span style="margin-right: 5px;">💾</span> Save API Key
                        </button>
                        <button class="nav-btn" id="openai-logout-btn" style="flex: 1; border: 1px solid var(--border); justify-content: center; display: none;">
                            <span style="margin-right: 5px;">🚪</span> Logout
                        </button>
                    </div>
                </div>
                <p id="openai-last-login" style="color: var(--muted); font-size: 10px; margin-top: 10px;"></p>
            </div>

            <!-- Anthropic -->
            <div class="card">
                <h3>Anthropic (Claude)</h3>
                <div style="display: flex; align-items: center; gap: 10px; margin: 15px 0;">
                    <div class="status-dot" id="anthropic-status" style="width: 10px; height: 10px; border-radius: 50%; background: #aaa;"></div>
                    <span id="anthropic-status-text" style="color: var(--muted); font-size: 12px;">Not connected</span>
                </div>
                <p style="color: var(--muted); font-size: 12px; margin: 10px 0; line-height: 1.5;">
                    Enter your Anthropic API key to use Claude 3.5 models. <a href="https://console.anthropic.com/keys" style="color: var(--accent);">Get API key</a>
                </p>
                <div style="margin-top: 10px;">
                    <input type="password" id="anthropic-apikey" placeholder="sk-ant-..." style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(255,255,255,0.05); color: white; margin-bottom: 10px;">
                    <div style="display: flex; gap: 10px;">
                        <button class="nav-btn" id="anthropic-save-btn" style="flex: 1; border: 1px solid var(--border); justify-content: center;">
                            <span style="margin-right: 5px;">💾</span> Save API Key
                        </button>
                        <button class="nav-btn" id="anthropic-logout-btn" style="flex: 1; border: 1px solid var(--border); justify-content: center; display: none;">
                            <span style="margin-right: 5px;">🚪</span> Logout
                        </button>
                    </div>
                </div>
                <p id="anthropic-last-login" style="color: var(--muted); font-size: 10px; margin-top: 10px;"></p>
            </div>

            <!-- NVIDIA -->
            <div class="card">
                <h3>NVIDIA Build API</h3>
                <div style="display: flex; align-items: center; gap: 10px; margin: 15px 0;">
                    <div class="status-dot" id="nvidia-status" style="width: 10px; height: 10px; border-radius: 50%; background: #aaa;"></div>
                    <span id="nvidia-status-text" style="color: var(--muted); font-size: 12px;">Not connected</span>
                </div>
                <p style="color: var(--muted); font-size: 12px; margin: 10px 0; line-height: 1.5;">
                    Enter your NVIDIA API key to use 20+ open-source models. <a href="https://build.nvidia.com" style="color: var(--accent);">Get API key</a>
                </p>
                <div style="margin-top: 10px;">
                    <input type="password" id="nvidia-apikey" placeholder="nvapi_..." style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(255,255,255,0.05); color: white; margin-bottom: 10px;">
                    <div style="display: flex; gap: 10px;">
                        <button class="nav-btn" id="nvidia-save-btn" style="flex: 1; border: 1px solid var(--border); justify-content: center;">
                            <span style="margin-right: 5px;">💾</span> Save API Key
                        </button>
                        <button class="nav-btn" id="nvidia-logout-btn" style="flex: 1; border: 1px solid var(--border); justify-content: center; display: none;">
                            <span style="margin-right: 5px;">🚪</span> Logout
                        </button>
                    </div>
                </div>
                <p id="nvidia-last-login" style="color: var(--muted); font-size: 10px; margin-top: 10px;"></p>
            </div>
        </div>

        <style>
            #providers-login-view .card {
                background: var(--panel);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 20px;
            }

            #providers-login-view .card h3 {
                margin: 0 0 10px 0;
                font-size: 14px;
                text-transform: uppercase;
                color: var(--text);
                letter-spacing: 0.2em;
            }

            #providers-login-view .status-dot.connected {
                background: #10b981;
                box-shadow: 0 0 8px #10b981;
            }

            #providers-login-view .status-dot.expired {
                background: #f97316;
                box-shadow: 0 0 8px #f97316;
            }

            #providers-login-view input[type="password"] {
                font-family: 'Space Mono', monospace;
            }
        </style>

        <script>
            const userId = localStorage.getItem("orcaUserId") || "default";

            // Load initial status
            async function loadProviderStatus() {
                const res = await fetch('/api/auth/status?user_id=' + encodeURIComponent(userId));
                if (!res.ok) return;
                const data = await res.json();

                for (const p of data.providers) {
                    const statusDot = document.getElementById(p.provider + '-status');
                    const statusText = document.getElementById(p.provider + '-status-text');
                    const loginBtn = document.getElementById(p.provider + '-login-btn');
                    const logoutBtn = document.getElementById(p.provider + '-logout-btn');
                    const lastLoginEl = document.getElementById(p.provider + '-last-login');

                    if (p.configured) {
                        statusDot.classList.add('connected');
                        statusText.textContent = 'Connected';
                        statusText.style.color = '#10b981';
                        loginBtn?.style.display = 'none';
                        if (logoutBtn) logoutBtn.style.display = 'flex';
                        if (lastLoginEl && p.last_login) {
                            const date = new Date(p.last_login);
                            lastLoginEl.textContent = 'Last login: ' + date.toLocaleDateString();
                        }
                    } else {
                        statusDot.classList.remove('connected');
                        statusText.textContent = 'Not connected';
                        if (loginBtn) loginBtn.style.display = 'flex';
                        if (logoutBtn) logoutBtn.style.display = 'none';
                    }
                }
            }

            // Google OAuth login
            document.getElementById('google-login-btn').addEventListener('click', async () => {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({provider: 'google', user_id: userId})
                });
                const data = await res.json();
                window.location.href = data.login_url;
            });

            // API Key saving
            for (const provider of ['openai', 'anthropic', 'nvidia']) {
                document.getElementById(provider + '-save-btn')?.addEventListener('click', async () => {
                    const input = document.getElementById(provider + '-apikey');
                    const key = input.value.trim();
                    if (!key) {
                        alert('Please enter an API key');
                        return;
                    }

                    const res = await fetch('/api/auth/api-key', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({provider, api_key: key, user_id: userId})
                    });

                    if (res.ok) {
                        input.value = '';
                        alert('API key saved successfully!');
                        loadProviderStatus();
                    } else {
                        alert('Failed to save API key');
                    }
                });

                document.getElementById(provider + '-logout-btn')?.addEventListener('click', async () => {
                    const res = await fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({provider, user_id: userId})
                    });

                    if (res.ok) {
                        alert('Logged out successfully');
                        loadProviderStatus();
                    }
                });
            }

            // Check for OAuth callback
            const params = new URLSearchParams(window.location.search);
            if (params.get('auth_success')) {
                const provider = params.get('auth_success');
                alert(`Successfully authenticated with ${provider}!`);
                window.history.replaceState({}, document.title, window.location.pathname);
                loadProviderStatus();
            }

            loadProviderStatus();
        </script>
    </section>
    """
