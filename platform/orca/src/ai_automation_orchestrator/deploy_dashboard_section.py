"""Deploy Copilot Dashboard Section."""


def get_deploy_dashboard_html() -> str:
    """Get HTML for Deploy Copilot dashboard section."""
    return """
    <div class="deploy-copilot-section">
        <h2>🚀 Deploy Copilot</h2>
        <p class="section-description">Manage deployments for all services</p>

        <!-- Projects Grid -->
        <div class="projects-grid" id="projects-grid">
            <div class="loading">Loading projects...</div>
        </div>

        <!-- Deployment History -->
        <div class="deployment-history">
            <h3>📋 Deployment History</h3>
            <div id="history-list" class="history-list">
                <p class="loading">Loading history...</p>
            </div>
        </div>

        <!-- Deploy Modal -->
        <div id="deploy-modal" class="modal hidden">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>Deploy <span id="modal-project-name"></span></h3>

                <div class="form-group">
                    <label for="deploy-target">Target Environment:</label>
                    <select id="deploy-target">
                        <option value="dev">Development</option>
                        <option value="staging">Staging</option>
                        <option value="prod">Production</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="version-bump">Bump Version:</label>
                    <select id="version-bump">
                        <option value="none">No bump</option>
                        <option value="patch">Patch (v1.0.0 → v1.0.1)</option>
                        <option value="minor">Minor (v1.0.0 → v1.1.0)</option>
                        <option value="major">Major (v1.0.0 → v2.0.0)</option>
                    </select>
                </div>

                <button id="confirm-deploy" class="btn btn-primary">Deploy</button>
                <button id="cancel-deploy" class="btn btn-secondary">Cancel</button>

                <div id="deploy-logs" class="logs-output hidden">
                    <h4>Deployment Logs</h4>
                    <pre id="logs-content"></pre>
                </div>
            </div>
        </div>
    </div>

    <style>
        .deploy-copilot-section {
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            color: white;
            margin-bottom: 20px;
        }

        .deploy-copilot-section h2 {
            margin-top: 0;
            font-size: 24px;
        }

        .section-description {
            opacity: 0.9;
            margin-bottom: 20px;
        }

        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }

        .project-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 15px;
            transition: all 0.3s ease;
        }

        .project-card:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .project-name {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
        }

        .project-meta {
            font-size: 12px;
            opacity: 0.8;
            margin-bottom: 5px;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            margin-right: 8px;
        }

        .status-healthy { background: #10b981; }
        .status-unhealthy { background: #ef4444; }
        .status-unreachable { background: #f97316; }

        .project-actions {
            margin-top: 10px;
            display: flex;
            gap: 8px;
        }

        .btn {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            transition: all 0.2s ease;
        }

        .btn-primary {
            background: #10b981;
            color: white;
        }

        .btn-primary:hover {
            background: #059669;
            transform: scale(1.05);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .btn-danger {
            background: #ef4444;
            color: white;
        }

        .btn-danger:hover {
            background: #dc2626;
        }

        .deployment-history {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 15px;
        }

        .history-list {
            max-height: 300px;
            overflow-y: auto;
        }

        .history-item {
            background: rgba(255, 255, 255, 0.05);
            border-left: 3px solid #10b981;
            padding: 10px;
            margin-bottom: 8px;
            border-radius: 4px;
            font-size: 12px;
        }

        .history-item.failed {
            border-left-color: #ef4444;
        }

        .history-item.in-progress {
            border-left-color: #f97316;
        }

        .history-timestamp {
            opacity: 0.7;
            font-size: 11px;
        }

        .modal {
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .modal.hidden {
            display: none;
        }

        .modal-content {
            background: white;
            color: #333;
            padding: 30px;
            border-radius: 8px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .close {
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            color: #aaa;
        }

        .close:hover {
            color: #000;
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        .form-group select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        .logs-output {
            margin-top: 20px;
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 10px;
        }

        .logs-output.hidden {
            display: none;
        }

        #logs-content {
            background: #1f2937;
            color: #10b981;
            padding: 10px;
            border-radius: 4px;
            font-size: 11px;
            max-height: 200px;
            overflow-y: auto;
            margin: 0;
        }

        .loading {
            text-align: center;
            opacity: 0.7;
        }
    </style>

    <script>
        // Load projects
        async function loadProjects() {
            try {
                const response = await fetch('/api/deploy/projects');
                const projects = await response.json();

                const grid = document.getElementById('projects-grid');
                grid.innerHTML = '';

                projects.forEach(project => {
                    const card = document.createElement('div');
                    card.className = 'project-card';
                    card.innerHTML = `
                        <div class="project-name">${project.name}</div>
                        <div class="project-meta">Version: ${project.version}</div>
                        <div>
                            <span class="status-badge status-${project.status}">${project.status}</span>
                        </div>
                        <div class="project-actions">
                            <button class="btn btn-primary" onclick="openDeployModal('${project.id}', '${project.name}')">Deploy</button>
                            <button class="btn btn-secondary" onclick="healthCheck('${project.id}')">Health</button>
                            <button class="btn btn-danger" onclick="rollback('${project.id}')">Rollback</button>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            } catch (error) {
                console.error('Error loading projects:', error);
            }
        }

        // Load history
        async function loadHistory() {
            try {
                const response = await fetch('/api/deploy/history?limit=10');
                const history = await response.json();

                const list = document.getElementById('history-list');
                list.innerHTML = '';

                if (history.length === 0) {
                    list.innerHTML = '<p class="loading">No deployments yet</p>';
                    return;
                }

                history.reverse().forEach(record => {
                    const item = document.createElement('div');
                    item.className = `history-item ${record.status}`;
                    const date = new Date(record.timestamp).toLocaleString();
                    item.innerHTML = `
                        <div>${record.project_name} → ${record.target}</div>
                        <div class="history-timestamp">${date} | ${record.status}</div>
                        <div style="font-size: 11px; margin-top: 5px;">${record.duration_seconds.toFixed(2)}s</div>
                    `;
                    list.appendChild(item);
                });
            } catch (error) {
                console.error('Error loading history:', error);
            }
        }

        // Deploy modal
        const modal = document.getElementById('deploy-modal');
        const closeBtn = document.querySelector('.close');

        closeBtn.onclick = () => modal.classList.add('hidden');
        window.onclick = (event) => {
            if (event.target === modal) modal.classList.add('hidden');
        };

        function openDeployModal(projectId, projectName) {
            document.getElementById('modal-project-name').textContent = projectName;
            document.getElementById('confirm-deploy').onclick = () => deploy(projectId);
            modal.classList.remove('hidden');
        }

        async function deploy(projectId) {
            const target = document.getElementById('deploy-target').value;
            const bumpType = document.getElementById('version-bump').value;

            try {
                // Bump version if requested
                if (bumpType !== 'none') {
                    await fetch(`/api/deploy/${projectId}/bump-version`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ bump_type: bumpType })
                    });
                }

                // Deploy
                const response = await fetch(`/api/deploy/${projectId}/deploy`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ target })
                });

                const result = await response.json();

                // Show logs
                document.getElementById('logs-content').textContent = result.logs;
                document.getElementById('deploy-logs').classList.remove('hidden');

                if (result.status === 'success') {
                    setTimeout(() => {
                        alert('✓ Deployment successful!');
                        modal.classList.add('hidden');
                        loadProjects();
                        loadHistory();
                    }, 1000);
                }
            } catch (error) {
                alert('Deployment error: ' + error.message);
            }
        }

        async function rollback(projectId) {
            if (!confirm('Rollback to last successful deployment?')) return;

            try {
                const response = await fetch(`/api/deploy/${projectId}/rollback`, {
                    method: 'POST'
                });
                const result = await response.json();
                alert(`✓ Rollback complete: ${result.status}`);
                loadProjects();
                loadHistory();
            } catch (error) {
                alert('Rollback error: ' + error.message);
            }
        }

        async function healthCheck(projectId) {
            try {
                const response = await fetch(`/api/deploy/${projectId}/health`);
                const result = await response.json();
                alert(`${projectId}: ${result.status}`);
            } catch (error) {
                alert('Health check error: ' + error.message);
            }
        }

        // Initial load
        loadProjects();
        loadHistory();

        // Refresh every 30 seconds
        setInterval(loadProjects, 30000);
        setInterval(loadHistory, 30000);
    </script>
    """
