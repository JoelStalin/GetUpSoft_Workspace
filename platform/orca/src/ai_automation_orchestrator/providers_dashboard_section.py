"""AI Providers dashboard section HTML and JavaScript."""


def get_providers_section_html() -> str:
    """Return the HTML/CSS/JS for the AI Providers dashboard section."""
    return """
        <!-- AI PROVIDERS VIEW -->
        <section id="providers-view" class="view">
            <header style="margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h2 style="font-family: 'Space Mono'; font-weight: 700; font-size: 32px; margin: 0;">AI PROVIDERS</h2>
                <p style="color: var(--muted); margin: 10px 0 0 0; font-size: 14px;">Configure paid LLM providers for specialized tasks</p>
              </div>
              <div id="providers-status" style="text-align: right; font-size: 12px;">
                <div style="color: var(--accent); font-weight: 700;">0 / 4 CONNECTED</div>
              </div>
            </header>

            <!-- Provider Cards -->
            <div class="workbench-grid" style="grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 24px;">

              <!-- OpenAI Provider Card -->
              <div class="card" style="border: 1px solid var(--border); position: relative;">
                <div style="position: absolute; top: 20px; right: 20px;">
                  <span class="provider-badge" id="openai-badge" style="background: rgba(255,255,255,0.1); color: var(--muted); padding: 6px 12px; border-radius: 12px; font-size: 11px; text-transform: uppercase; font-weight: 600;">DISCONNECTED</span>
                </div>
                <h3 style="font-size: 14px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.2em; margin: 0 0 10px 0;">🤖 OpenAI</h3>
                <p style="color: var(--muted); font-size: 12px; margin: 0 0 20px 0; line-height: 1.5;">GPT-4o for documentation, SEO copywriting, and technical content generation</p>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                  <div>
                    <label style="display: block; font-size: 12px; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">API Key</label>
                    <input type="password" id="openai-key" class="orca-input" placeholder="sk-proj-..." style="padding: 12px 16px; font-size: 13px; width: 100%;" />
                  </div>
                  <div style="display: flex; gap: 10px;">
                    <button onclick="saveProvider('openai')" class="btn-exec" style="flex: 1; height: 40px; font-size: 12px;">Connect</button>
                    <button onclick="validateProvider('openai')" class="nav-btn" style="flex: 1; height: 40px; border: 1px solid var(--border);">Test</button>
                    <button onclick="removeProvider('openai')" class="nav-btn" style="flex: 1; height: 40px; border: 1px solid var(--border); color: #ff4444;">Clear</button>
                  </div>
                  <div id="openai-status" style="font-size: 11px; color: var(--muted); padding: 8px; background: rgba(0,0,0,0.2); border-radius: 8px; display: none;"></div>
                </div>
              </div>

              <!-- Claude Provider Card -->
              <div class="card" style="border: 1px solid var(--border); position: relative;">
                <div style="position: absolute; top: 20px; right: 20px;">
                  <span class="provider-badge" id="claude-badge" style="background: rgba(255,255,255,0.1); color: var(--muted); padding: 6px 12px; border-radius: 12px; font-size: 11px; text-transform: uppercase; font-weight: 600;">DISCONNECTED</span>
                </div>
                <h3 style="font-size: 14px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.2em; margin: 0 0 10px 0;">🧠 Claude 3.5 Sonnet</h3>
                <p style="color: var(--muted); font-size: 12px; margin: 0 0 20px 0; line-height: 1.5;">Anthropic Claude for planning, code review, and architecture decisions</p>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                  <div>
                    <label style="display: block; font-size: 12px; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">API Key</label>
                    <input type="password" id="claude-key" class="orca-input" placeholder="sk-ant-..." style="padding: 12px 16px; font-size: 13px; width: 100%;" />
                  </div>
                  <div style="display: flex; gap: 10px;">
                    <button onclick="saveProvider('claude')" class="btn-exec" style="flex: 1; height: 40px; font-size: 12px;">Connect</button>
                    <button onclick="validateProvider('claude')" class="nav-btn" style="flex: 1; height: 40px; border: 1px solid var(--border);">Test</button>
                    <button onclick="removeProvider('claude')" class="nav-btn" style="flex: 1; height: 40px; border: 1px solid var(--border); color: #ff4444;">Clear</button>
                  </div>
                  <div id="claude-status" style="font-size: 11px; color: var(--muted); padding: 8px; background: rgba(0,0,0,0.2); border-radius: 8px; display: none;"></div>
                </div>
              </div>

              <!-- Gemini Provider Card -->
              <div class="card" style="border: 1px solid var(--border); position: relative;">
                <div style="position: absolute; top: 20px; right: 20px;">
                  <span class="provider-badge" id="gemini-badge" style="background: rgba(255,255,255,0.1); color: var(--muted); padding: 6px 12px; border-radius: 12px; font-size: 11px; text-transform: uppercase; font-weight: 600;">DISCONNECTED</span>
                </div>
                <h3 style="font-size: 14px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.2em; margin: 0 0 10px 0;">🎨 Google Gemini</h3>
                <p style="color: var(--muted); font-size: 12px; margin: 0 0 20px 0; line-height: 1.5;">Gemini 2.0 Flash for image generation, UI design with Stitch/Figma integration</p>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                  <div>
                    <label style="display: block; font-size: 12px; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">API Key</label>
                    <input type="password" id="gemini-key" class="orca-input" placeholder="AIzaSy..." style="padding: 12px 16px; font-size: 13px; width: 100%;" />
                  </div>
                  <div style="display: flex; gap: 10px;">
                    <button onclick="saveProvider('gemini')" class="btn-exec" style="flex: 1; height: 40px; font-size: 12px;">Connect</button>
                    <button onclick="validateProvider('gemini')" class="nav-btn" style="flex: 1; height: 40px; border: 1px solid var(--border);">Test</button>
                    <button onclick="removeProvider('gemini')" class="nav-btn" style="flex: 1; height: 40px; border: 1px solid var(--border); color: #ff4444;">Clear</button>
                  </div>
                  <div id="gemini-status" style="font-size: 11px; color: var(--muted); padding: 8px; background: rgba(0,0,0,0.2); border-radius: 8px; display: none;"></div>
                </div>
              </div>

              <!-- Manus Provider Card -->
              <div class="card" style="border: 1px solid var(--border); position: relative;">
                <div style="position: absolute; top: 20px; right: 20px;">
                  <span class="provider-badge" id="manus-badge" style="background: rgba(255,255,255,0.1); color: var(--muted); padding: 6px 12px; border-radius: 12px; font-size: 11px; text-transform: uppercase; font-weight: 600;">DISCONNECTED</span>
                </div>
                <h3 style="font-size: 14px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.2em; margin: 0 0 10px 0;">📱 Manus AI</h3>
                <p style="color: var(--muted); font-size: 12px; margin: 0 0 20px 0; line-height: 1.5;">Social media automation, content scheduling, and multi-platform posting</p>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                  <div>
                    <label style="display: block; font-size: 12px; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">API Key</label>
                    <input type="password" id="manus-key" class="orca-input" placeholder="manus_..." style="padding: 12px 16px; font-size: 13px; width: 100%;" />
                  </div>
                  <div style="display: flex; gap: 10px;">
                    <button onclick="saveProvider('manus')" class="btn-exec" style="flex: 1; height: 40px; font-size: 12px;">Connect</button>
                    <button onclick="validateProvider('manus')" class="nav-btn" style="flex: 1; height: 40px; border: 1px solid var(--border);">Test</button>
                    <button onclick="removeProvider('manus')" class="nav-btn" style="flex: 1; height: 40px; border: 1px solid var(--border); color: #ff4444;">Clear</button>
                  </div>
                  <div id="manus-status" style="font-size: 11px; color: var(--muted); padding: 8px; background: rgba(0,0,0,0.2); border-radius: 8px; display: none;"></div>
                </div>
              </div>

            </div>

            <!-- Model Selection and Configuration -->
            <div style="margin-top: 40px; padding: 30px; background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius);">
              <h3 style="margin: 0 0 20px 0; font-size: 14px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.2em;">TASK-BASED MODEL SELECTION</h3>
              <div class="workbench-grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">

                <div style="padding: 20px; background: rgba(0,0,0,0.3); border-radius: 12px; border-left: 3px solid #00ff00;">
                  <div style="font-size: 12px; color: var(--muted); margin-bottom: 10px; text-transform: uppercase; font-weight: 600;">Documentation</div>
                  <div style="font-size: 13px; color: #fff; font-weight: 500;">OpenAI GPT-4o</div>
                  <div style="font-size: 11px; color: var(--muted); margin-top: 8px;">$5-15 per M tokens</div>
                </div>

                <div style="padding: 20px; background: rgba(0,0,0,0.3); border-radius: 12px; border-left: 3px solid #00ff00;">
                  <div style="font-size: 12px; color: var(--muted); margin-bottom: 10px; text-transform: uppercase; font-weight: 600;">Planning & Review</div>
                  <div style="font-size: 13px; color: #fff; font-weight: 500;">Claude 3.5 Sonnet</div>
                  <div style="font-size: 11px; color: var(--muted); margin-top: 8px;">$3-15 per M tokens</div>
                </div>

                <div style="padding: 20px; background: rgba(0,0,0,0.3); border-radius: 12px; border-left: 3px solid #00ff00;">
                  <div style="font-size: 12px; color: var(--muted); margin-bottom: 10px; text-transform: uppercase; font-weight: 600;">UI & Images</div>
                  <div style="font-size: 13px; color: #fff; font-weight: 500;">Gemini 2.0 Flash</div>
                  <div style="font-size: 11px; color: var(--muted); margin-top: 8px;">Free + Paid overflow</div>
                </div>

                <div style="padding: 20px; background: rgba(0,0,0,0.3); border-radius: 12px; border-left: 3px solid #00ff00;">
                  <div style="font-size: 12px; color: var(--muted); margin-bottom: 10px; text-transform: uppercase; font-weight: 600;">Social Media</div>
                  <div style="font-size: 13px; color: #fff; font-weight: 500;">Manus AI</div>
                  <div style="font-size: 11px; color: var(--muted); margin-top: 8px;">Free + Premium tiers</div>
                </div>

              </div>
            </div>

            <!-- Cost & Budget Info -->
            <div style="margin-top: 30px; padding: 30px; background: rgba(255,0,56,0.05); border: 1px solid rgba(255,0,56,0.1); border-radius: var(--radius);">
              <h3 style="margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; color: var(--accent); letter-spacing: 0.2em;">💰 ESTIMATED MONTHLY COST</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
                <div>
                  <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; margin-bottom: 5px;">Conservative</div>
                  <div style="font-size: 20px; font-weight: 700; color: #fff;">$75-85</div>
                  <div style="font-size: 10px; color: var(--muted); margin-top: 5px;">Free tiers + limited paid</div>
                </div>
                <div>
                  <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; margin-bottom: 5px;">Moderate</div>
                  <div style="font-size: 20px; font-weight: 700; color: #fff;">$260</div>
                  <div style="font-size: 10px; color: var(--muted); margin-top: 5px;">Regular usage, all providers</div>
                </div>
                <div>
                  <div style="font-size: 11px; color: var(--muted); text-transform: uppercase; margin-bottom: 5px;">Enterprise</div>
                  <div style="font-size: 20px; font-weight: 700; color: #fff;">$530+</div>
                  <div style="font-size: 10px; color: var(--muted); margin-top: 5px;">High volume, all features</div>
                </div>
              </div>
            </div>
        </section>

        <script>
          async function loadProvidersStatus() {
            try {
              const res = await fetch('/api/providers/status');
              const data = await res.json();
              const configured = data.configured_count || 0;
              document.getElementById('providers-status').innerHTML = `<div style="color: var(--accent); font-weight: 700;">${configured} / ${data.total} CONNECTED</div>`;

              // Update badges
              data.providers?.forEach(provider => {
                const badge = document.getElementById(`${provider.provider}-badge`);
                if (badge) {
                  if (provider.configured) {
                    badge.textContent = 'CONNECTED ✓';
                    badge.style.background = 'rgba(0, 255, 0, 0.1)';
                    badge.style.color = '#00ff00';
                  } else {
                    badge.textContent = 'DISCONNECTED';
                    badge.style.background = 'rgba(255, 255, 255, 0.1)';
                    badge.style.color = 'var(--muted)';
                  }
                }
              });
            } catch(e) {
              console.error('Error loading providers status:', e);
            }
          }

          async function saveProvider(provider) {
            const key = document.getElementById(`${provider}-key`)?.value;
            if (!key) {
              alert('Por favor ingresa una API key');
              return;
            }

            try {
              const res = await fetch(`/api/providers/${provider}/connect`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({api_key: key})
              });

              if (res.ok) {
                const statusDiv = document.getElementById(`${provider}-status`);
                statusDiv.textContent = '✓ Conectado exitosamente';
                statusDiv.style.color = '#00ff00';
                statusDiv.style.display = 'block';
                setTimeout(() => {
                  statusDiv.style.display = 'none';
                  loadProvidersStatus();
                }, 2000);
              } else {
                const error = await res.json();
                alert('Error: ' + (error.detail || 'Error al conectar'));
              }
            } catch(e) {
              alert('Error de conexión: ' + e.message);
            }
          }

          async function validateProvider(provider) {
            const key = document.getElementById(`${provider}-key`)?.value;
            const statusDiv = document.getElementById(`${provider}-status`);

            if (!key) {
              statusDiv.textContent = '⚠ Ingresa una API key primero';
              statusDiv.style.color = '#ffaa00';
              statusDiv.style.display = 'block';
              return;
            }

            statusDiv.textContent = '🔄 Validando...';
            statusDiv.style.color = 'var(--muted)';
            statusDiv.style.display = 'block';

            try {
              const res = await fetch(`/api/providers/${provider}/validate`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({api_key: key})
              });

              if (res.ok) {
                statusDiv.textContent = '✓ API key válida';
                statusDiv.style.color = '#00ff00';
              } else {
                const error = await res.json();
                statusDiv.textContent = '✗ ' + (error.detail || 'Error de validación');
                statusDiv.style.color = '#ff4444';
              }
            } catch(e) {
              statusDiv.textContent = '✗ Error de conexión';
              statusDiv.style.color = '#ff4444';
            }
          }

          async function removeProvider(provider) {
            if (!confirm(`¿Eliminar credenciales de ${provider}?`)) return;

            try {
              const res = await fetch(`/api/providers/${provider}/disconnect`, {
                method: 'DELETE'
              });

              if (res.ok) {
                document.getElementById(`${provider}-key`).value = '';
                const statusDiv = document.getElementById(`${provider}-status`);
                statusDiv.textContent = '✓ Credenciales eliminadas';
                statusDiv.style.color = '#ffaa00';
                statusDiv.style.display = 'block';
                setTimeout(() => {
                  statusDiv.style.display = 'none';
                  loadProvidersStatus();
                }, 1500);
              }
            } catch(e) {
              alert('Error al eliminar: ' + e.message);
            }
          }

          // Load status on section visible
          loadProvidersStatus();
        </script>
    """
