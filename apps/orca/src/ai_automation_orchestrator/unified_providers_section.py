"""Unified AI Providers configuration section."""


def get_unified_providers_html() -> str:
    """Get consolidated HTML for AI Providers section with user auth."""
    return r"""
    <section id="ai-providers-view" class="view">
        <!-- User Authentication Header -->
        <div style="position: absolute; top: 20px; right: 40px; display: flex; align-items: center; gap: 15px;">
            <div id="user-info" style="text-align: right; display: none;">
                <div style="color: white; font-weight: 500;" id="user-name">User</div>
                <div style="color: var(--muted); font-size: 12px;" id="user-email">user@example.com</div>
            </div>
            <button id="user-menu-btn" class="nav-btn" style="border: 1px solid var(--accent); padding: 8px 15px; display: none;">
                👤 Account
            </button>
            <button id="login-btn" class="nav-btn" style="border: 1px solid var(--accent); padding: 8px 15px;">
                🔐 Login
            </button>
        </div>

        <!-- Main Header -->
        <header style="margin-bottom: 30px;">
            <h2 style="font-family: 'Space Mono'; font-weight: 700; font-size: 32px; margin-bottom: 5px;">AI PROVIDERS</h2>
            <p style="color: var(--muted); font-size: 13px;">Consolidated AI model provider configuration and authentication</p>
        </header>

        <!-- Login Modal -->
        <div id="login-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 1000; align-items: center; justify-content: center;">
            <div style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; padding: 40px; width: 420px; max-width: 90%;">
                <h3 style="margin-bottom: 10px;">Login to Orca</h3>
                <p style="color: var(--muted); font-size: 12px; margin-bottom: 25px;">Choose your preferred login method</p>

                <!-- Google OAuth Login -->
                <button id="google-login-btn" style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 4px; background: rgba(255,255,255,0.05); color: white; cursor: pointer; font-size: 14px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath fill='white' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='white' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='white' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3E%3C/svg%3E" alt="Google" style="width: 16px; height: 16px;">
                    Sign in with Google
                </button>

                <div style="position: relative; margin: 20px 0; display: flex; align-items: center;">
                    <div style="flex: 1; height: 1px; background: var(--border);"></div>
                    <div style="padding: 0 10px; color: var(--muted); font-size: 12px;">OR</div>
                    <div style="flex: 1; height: 1px; background: var(--border);"></div>
                </div>

                <!-- Email/Name Login -->
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: var(--muted); margin-bottom: 5px;">Email</label>
                    <input type="email" id="login-email" placeholder="your@email.com" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px; background: rgba(255,255,255,0.05); color: white;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 12px; color: var(--muted); margin-bottom: 5px;">Password (optional)</label>
                    <input type="password" id="login-password" placeholder="Password (if you have one)" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px; background: rgba(255,255,255,0.05); color: white;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 12px; color: var(--muted); margin-bottom: 5px;">Name (optional if no password)</label>
                    <input type="text" id="login-name" placeholder="Your Name" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px; background: rgba(255,255,255,0.05); color: white;">
                </div>
                <div style="display: flex; gap: 10px;">
                    <button id="login-submit-btn" class="nav-btn" style="flex: 1; border: 1px solid var(--accent); justify-content: center;">
                        Sign In / Register
                    </button>
                    <button id="login-cancel-btn" class="nav-btn" style="flex: 1; border: 1px solid var(--border); justify-content: center;">
                        Cancel
                    </button>
                </div>
            </div>
        </div>

        <!-- Providers Grid -->
        <div id="providers-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px;">
            <!-- NVIDIA API Provider -->
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 style="margin: 0;">🔧 NVIDIA Build API</h3>
                        <p style="color: var(--muted); font-size: 11px; margin: 5px 0 0 0;">Cloud-based inference</p>
                    </div>
                    <div id="nvidia-badge" class="status-dot" style="width: 10px; height: 10px; border-radius: 50%; background: #aaa;"></div>
                </div>
                <div style="margin: 15px 0; padding: 10px; background: rgba(0,100,150,0.2); border-left: 3px solid #0066cc; border-radius: 4px;">
                    <p style="color: var(--muted); font-size: 12px; margin: 0; line-height: 1.5;">
                        Access 23+ models including Mistral, Llama, and NV-Embed via NVIDIA's cloud API.
                        <a href="https://build.nvidia.com" style="color: var(--accent);" target="_blank">Get API Key →</a>
                    </p>
                </div>
                <div style="margin-top: 10px;">
                    <input type="password" class="provider-key" data-provider="nvidia" placeholder="sk-..." style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(255,255,255,0.05); color: white; margin-bottom: 10px; font-size: 11px;">
                    <div style="display: flex; gap: 8px;">
                        <button class="provider-save-btn" data-provider="nvidia" style="flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(100,200,255,0.1); color: white; cursor: pointer; font-size: 12px;">
                            💾 Save
                        </button>
                        <button class="provider-test-btn" data-provider="nvidia" style="flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(100,200,255,0.1); color: white; cursor: pointer; font-size: 12px;">
                            ✓ Test
                        </button>
                    </div>
                </div>
                <p class="provider-status" data-provider="nvidia" style="color: var(--muted); font-size: 10px; margin-top: 10px;"></p>
            </div>

            <!-- Ollama Local Provider -->
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 style="margin: 0;">🏠 Ollama (Local)</h3>
                        <p style="color: var(--muted); font-size: 11px; margin: 5px 0 0 0;">LAN-based inference</p>
                    </div>
                    <div id="ollama-badge" class="status-dot" style="width: 10px; height: 10px; border-radius: 50%; background: #aaa;"></div>
                </div>
                <div style="margin: 15px 0; padding: 10px; background: rgba(100,150,0,0.2); border-left: 3px solid #ccaa00; border-radius: 4px;">
                    <p style="color: var(--muted); font-size: 12px; margin: 0; line-height: 1.5;">
                        Run models locally on your LAN. No API keys needed. Requires Ollama installation.
                        <a href="https://ollama.ai" style="color: var(--accent);" target="_blank">Install Ollama →</a>
                    </p>
                </div>
                <div style="margin-top: 10px;">
                    <input type="text" class="provider-endpoint" data-provider="ollama" placeholder="http://localhost:11434" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(255,255,255,0.05); color: white; margin-bottom: 10px; font-size: 11px;">
                    <div style="display: flex; gap: 8px;">
                        <button class="provider-save-btn" data-provider="ollama" style="flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(200,200,100,0.1); color: white; cursor: pointer; font-size: 12px;">
                            💾 Save
                        </button>
                        <button class="provider-test-btn" data-provider="ollama" style="flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(200,200,100,0.1); color: white; cursor: pointer; font-size: 12px;">
                            ✓ Test
                        </button>
                    </div>
                </div>
                <p class="provider-status" data-provider="ollama" style="color: var(--muted); font-size: 10px; margin-top: 10px;"></p>
            </div>

            <!-- OpenAI -->
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 style="margin: 0;">🧠 OpenAI (GPT-4, o1)</h3>
                        <p style="color: var(--muted); font-size: 11px; margin: 5px 0 0 0;">Cloud API</p>
                    </div>
                    <div id="openai-badge" class="status-dot" style="width: 10px; height: 10px; border-radius: 50%; background: #aaa;"></div>
                </div>
                <div style="margin: 15px 0; padding: 10px; background: rgba(100,100,0,0.2); border-left: 3px solid #00aa00; border-radius: 4px;">
                    <p style="color: var(--muted); font-size: 12px; margin: 0; line-height: 1.5;">
                        GPT-4, GPT-4o, o1-preview models.
                        <a href="https://platform.openai.com/api-keys" style="color: var(--accent);" target="_blank">Get API Key →</a>
                    </p>
                </div>
                <div style="margin-top: 10px;">
                    <input type="password" class="provider-key" data-provider="openai" placeholder="sk-..." style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(255,255,255,0.05); color: white; margin-bottom: 10px; font-size: 11px;">
                    <div style="display: flex; gap: 8px;">
                        <button class="provider-save-btn" data-provider="openai" style="flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(100,200,100,0.1); color: white; cursor: pointer; font-size: 12px;">
                            💾 Save
                        </button>
                        <button class="provider-test-btn" data-provider="openai" style="flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(100,200,100,0.1); color: white; cursor: pointer; font-size: 12px;">
                            ✓ Test
                        </button>
                    </div>
                </div>
                <p class="provider-status" data-provider="openai" style="color: var(--muted); font-size: 10px; margin-top: 10px;"></p>
            </div>

            <!-- Anthropic (Claude) -->
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 style="margin: 0;">🤖 Anthropic (Claude)</h3>
                        <p style="color: var(--muted); font-size: 11px; margin: 5px 0 0 0;">Cloud API</p>
                    </div>
                    <div id="anthropic-badge" class="status-dot" style="width: 10px; height: 10px; border-radius: 50%; background: #aaa;"></div>
                </div>
                <div style="margin: 15px 0; padding: 10px; background: rgba(150,100,0,0.2); border-left: 3px solid #ff9900; border-radius: 4px;">
                    <p style="color: var(--muted); font-size: 12px; margin: 0; line-height: 1.5;">
                        Claude 3.5 Sonnet, Opus models.
                        <a href="https://console.anthropic.com" style="color: var(--accent);" target="_blank">Get API Key →</a>
                    </p>
                </div>
                <div style="margin-top: 10px;">
                    <input type="password" class="provider-key" data-provider="anthropic" placeholder="sk-ant-..." style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(255,255,255,0.05); color: white; margin-bottom: 10px; font-size: 11px;">
                    <div style="display: flex; gap: 8px;">
                        <button class="provider-save-btn" data-provider="anthropic" style="flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(255,150,100,0.1); color: white; cursor: pointer; font-size: 12px;">
                            💾 Save
                        </button>
                        <button class="provider-test-btn" data-provider="anthropic" style="flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(255,150,100,0.1); color: white; cursor: pointer; font-size: 12px;">
                            ✓ Test
                        </button>
                    </div>
                </div>
                <p class="provider-status" data-provider="anthropic" style="color: var(--muted); font-size: 10px; margin-top: 10px;"></p>
            </div>

            <!-- Google Gemini -->
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 style="margin: 0;">🔮 Google Gemini</h3>
                        <p style="color: var(--muted); font-size: 11px; margin: 5px 0 0 0;">Cloud API</p>
                    </div>
                    <div id="google-badge" class="status-dot" style="width: 10px; height: 10px; border-radius: 50%; background: #aaa;"></div>
                </div>
                <div style="margin: 15px 0; padding: 10px; background: rgba(200,0,100,0.2); border-left: 3px solid #dd33ff; border-radius: 4px;">
                    <p style="color: var(--muted); font-size: 12px; margin: 0; line-height: 1.5;">
                        Gemini Pro 1.5 models.
                        <a href="https://aistudio.google.com/apikey" style="color: var(--accent);" target="_blank">Get API Key →</a>
                    </p>
                </div>
                <div style="margin-top: 10px;">
                    <input type="password" class="provider-key" data-provider="google" placeholder="AIza..." style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(255,255,255,0.05); color: white; margin-bottom: 10px; font-size: 11px;">
                    <div style="display: flex; gap: 8px;">
                        <button class="provider-save-btn" data-provider="google" style="flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(255,100,200,0.1); color: white; cursor: pointer; font-size: 12px;">
                            💾 Save
                        </button>
                        <button class="provider-test-btn" data-provider="google" style="flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(255,100,200,0.1); color: white; cursor: pointer; font-size: 12px;">
                            ✓ Test
                        </button>
                    </div>
                </div>
                <p class="provider-status" data-provider="google" style="color: var(--muted); font-size: 10px; margin-top: 10px;"></p>
            </div>

            <!-- Cohere -->
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 style="margin: 0;">⚡ Cohere</h3>
                        <p style="color: var(--muted); font-size: 11px; margin: 5px 0 0 0;">Cloud API</p>
                    </div>
                    <div id="cohere-badge" class="status-dot" style="width: 10px; height: 10px; border-radius: 50%; background: #aaa;"></div>
                </div>
                <div style="margin: 15px 0; padding: 10px; background: rgba(0,150,150,0.2); border-left: 3px solid #00cccc; border-radius: 4px;">
                    <p style="color: var(--muted); font-size: 12px; margin: 0; line-height: 1.5;">
                        Command models for text generation and embeddings.
                        <a href="https://dashboard.cohere.ai" style="color: var(--accent);" target="_blank">Get API Key →</a>
                    </p>
                </div>
                <div style="margin-top: 10px;">
                    <input type="password" class="provider-key" data-provider="cohere" placeholder="..." style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(255,255,255,0.05); color: white; margin-bottom: 10px; font-size: 11px;">
                    <div style="display: flex; gap: 8px;">
                        <button class="provider-save-btn" data-provider="cohere" style="flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(0,200,200,0.1); color: white; cursor: pointer; font-size: 12px;">
                            💾 Save
                        </button>
                        <button class="provider-test-btn" data-provider="cohere" style="flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: 4px; background: rgba(0,200,200,0.1); color: white; cursor: pointer; font-size: 12px;">
                            ✓ Test
                        </button>
                    </div>
                </div>
                <p class="provider-status" data-provider="cohere" style="color: var(--muted); font-size: 10px; margin-top: 10px;"></p>
            </div>
        </div>

        <!-- Provider Status Summary -->
        <div style="margin-top: 40px; padding: 20px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px;">
            <h3 style="margin-top: 0;">Status Summary</h3>
            <p style="color: var(--muted); font-size: 12px; margin-bottom: 15px;">
                Configured providers will be used for AI tasks. Test connections to verify settings.
            </p>
            <div id="status-summary" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                <!-- Populated by JavaScript -->
            </div>
        </div>
    </section>

    <script>
    // User Authentication
    function setupUserAuth() {
        const loginBtn = document.getElementById('login-btn');
        const loginModal = document.getElementById('login-modal');
        const loginCancelBtn = document.getElementById('login-cancel-btn');
        const loginSubmitBtn = document.getElementById('login-submit-btn');
        const userInfo = document.getElementById('user-info');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const userMenuBtn = document.getElementById('user-menu-btn');

        // Check if user is logged in
        fetch('/api/auth/verify-session', {
            credentials: 'include'
        })
        .then(r => r.json())
        .then(data => {
            if (data.valid) {
                return fetch('/api/auth/me', { credentials: 'include' });
            }
            throw new Error('Not authenticated');
        })
        .then(r => r.json())
        .then(user => {
            loginBtn.style.display = 'none';
            userInfo.style.display = 'block';
            userMenuBtn.style.display = 'block';
            userName.textContent = user.name;
            userEmail.textContent = user.email;
            window.currentUserId = user.user_id;
        })
        .catch(() => {
            loginBtn.style.display = 'block';
            userInfo.style.display = 'none';
            userMenuBtn.style.display = 'none';
        });

        loginBtn.addEventListener('click', () => {
            loginModal.style.display = 'flex';
        });

        loginCancelBtn.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });

        // Google OAuth Login
        const googleLoginBtn = document.getElementById('google-login-btn');
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => {
                fetch('/api/auth/google/start')
                    .then(r => r.json())
                    .then(data => {
                        // Redirect to Google login
                        window.location.href = data.url;
                    })
                    .catch(err => {
                        alert('Failed to start Google login: ' + err.message);
                    });
            });
        }

        loginSubmitBtn.addEventListener('click', () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const name = document.getElementById('login-name').value;

            if (!email) {
                alert('Email is required');
                return;
            }

            // Check if password is provided (root/admin login)
            if (password) {
                // Password-based login for root user
                fetch('/api/auth/login-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include'
                })
                .then(r => {
                    if (!r.ok) {
                        return r.json().then(data => {
                            throw new Error(data.detail || 'Invalid email or password');
                        });
                    }
                    return r.json();
                })
                .then(data => {
                    loginModal.style.display = 'none';
                    // Reset form
                    document.getElementById('login-email').value = '';
                    document.getElementById('login-password').value = '';
                    document.getElementById('login-name').value = '';
                    window.location.reload();
                })
                .catch(err => {
                    alert('Login failed: ' + err.message);
                });
            } else {
                // Email/name registration or login
                if (!name && !email) {
                    alert('Please provide email (and name for new users)');
                    return;
                }

                fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, name: name || undefined }),
                    credentials: 'include'
                })
                .then(r => {
                    if (!r.ok) {
                        return r.json().then(data => {
                            throw new Error(data.detail || 'Login failed');
                        });
                    }
                    return r.json();
                })
                .then(data => {
                    loginModal.style.display = 'none';
                    // Reset form
                    document.getElementById('login-email').value = '';
                    document.getElementById('login-password').value = '';
                    document.getElementById('login-name').value = '';
                    window.location.reload();
                })
                .catch(err => {
                    alert('Login failed: ' + err.message);
                });
            }
        });
    }

    // Provider Configuration
    function setupProviders() {
        document.querySelectorAll('.provider-save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const provider = e.target.dataset.provider;
                const keyInput = document.querySelector(\`.provider-key[data-provider="\\${provider}"]\`);
                const endpointInput = document.querySelector(\`.provider-endpoint[data-provider="\\${provider}"]\`);
                const value = keyInput?.value || endpointInput?.value;

                if (!value) {
                    alert('Please enter a value');
                    return;
                }

                if (!window.currentUserId) {
                    alert('Please login first');
                    return;
                }

                fetch('/api/providers/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: window.currentUserId,
                        provider_id: provider,
                        config: { key: value }
                    }),
                    credentials: 'include'
                })
                .then(r => r.json())
                .then(data => {
                    document.querySelector(\`.provider-status[data-provider="\\${provider}"]\`).textContent = '✓ Saved';
                    document.getElementById(provider + '-badge').style.background = '#4caf50';
                })
                .catch(err => {
                    alert('Error saving config: ' + err.message);
                });
            });
        });

        document.querySelectorAll('.provider-test-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const provider = e.target.dataset.provider;
                const statusEl = document.querySelector(\`.provider-status[data-provider="\\${provider}"]\`);
                statusEl.textContent = 'Testing...';

                fetch('/api/providers/test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider_id: provider }),
                    credentials: 'include'
                })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        statusEl.textContent = '✓ Connection OK';
                        document.getElementById(provider + '-badge').style.background = '#4caf50';
                    } else {
                        statusEl.textContent = '✗ Connection failed';
                        document.getElementById(provider + '-badge').style.background = '#f44336';
                    }
                })
                .catch(err => {
                    statusEl.textContent = '✗ Error: ' + err.message;
                });
            });
        });
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        setupUserAuth();
        setupProviders();
    });
    </script>
    """
