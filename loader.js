/* ============================================================
 * UGS MODULE LOADER
 * ------------------------------------------------------------
 * Drop-in module loader with search, toggles, conflict
 * detection, and localStorage persistence.
 *
 * Usage:
 *   <script src="https://cdn.jsdelivr.net/gh/USER/REPO@main/loader.js"></script>
 *
 * Expects a modules.json manifest next to this file.
 * ============================================================ */

(function () {
    'use strict';

    // ---------- AUTO-DETECT BASE URL ----------
    const SELF = document.currentScript;
    const BASE = SELF && SELF.src
        ? SELF.src.replace(/\/[^/]*$/, '/')
        : 'https://cdn.jsdelivr.net/gh/USER/REPO@main/';

    const CONFIG = {
        manifestUrl: BASE + 'modules.json',
        baseUrl: BASE,
        storageKey: 'ugs-installed-modules'
    };

    // Prevent double-init
    if (window.__UGS_ML_LOADED__) return;
    window.__UGS_ML_LOADED__ = true;

    // ---------- INJECT STYLES ----------
    const style = document.createElement('style');
    style.id = 'ugs-module-loader-styles';
    style.textContent = `
        .ugs-ml-wrap {
            position: fixed;
            top: 14px;
            left: 14px;
            z-index: 2147483000;
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            font-size: 13px;
            color: #e3e5e8;
        }

        .ugs-ml-btn {
            width: 42px;
            height: 42px;
            border-radius: 8px;
            background: #16181d;
            border: 1px solid #2a2e37;
            color: #cfd2d9;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s, border-color 0.15s, transform 0.15s;
            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
            padding: 0;
        }
        .ugs-ml-btn:hover {
            background: #1f2229;
            border-color: #3d424d;
            color: #ffffff;
            transform: translateY(-1px);
        }
        .ugs-ml-btn svg { width: 20px; height: 20px; fill: currentColor; }
        .ugs-ml-btn.active {
            background: #1f2229;
            border-color: #4b5261;
            color: #ffffff;
        }

        .ugs-ml-panel {
            position: absolute;
            top: 50px;
            left: 0;
            width: 340px;
            max-height: 480px;
            background: #0d0e11;
            border: 1px solid #23262e;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.7);
            display: none;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
            transition: opacity 0.18s ease, transform 0.18s ease;
        }
        .ugs-ml-panel.open {
            display: flex;
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        .ugs-ml-header {
            padding: 14px 16px 10px;
            border-bottom: 1px solid #1b1e24;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .ugs-ml-title {
            font-size: 13px;
            font-weight: 500;
            letter-spacing: 0.4px;
            color: #ffffff;
        }
        .ugs-ml-count {
            font-size: 11px;
            color: #5f6672;
            letter-spacing: 0.3px;
        }

        .ugs-ml-search-wrap {
            padding: 10px 12px;
            border-bottom: 1px solid #1b1e24;
        }
        .ugs-ml-search {
            width: 100%;
            background: #121317;
            border: 1px solid #262a33;
            border-radius: 6px;
            padding: 8px 12px;
            color: #e3e5e8;
            font-size: 13px;
            font-family: inherit;
            outline: none;
            transition: border-color 0.15s;
        }
        .ugs-ml-search::placeholder { color: #5f6672; }
        .ugs-ml-search:focus { border-color: #4b5261; }

        .ugs-ml-list {
            overflow-y: auto;
            padding: 6px;
            flex: 1;
        }
        .ugs-ml-list::-webkit-scrollbar { width: 4px; }
        .ugs-ml-list::-webkit-scrollbar-track { background: transparent; }
        .ugs-ml-list::-webkit-scrollbar-thumb { background: #2a2d34; border-radius: 2px; }

        .ugs-ml-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 10px 12px;
            border-radius: 6px;
            transition: background 0.12s;
        }
        .ugs-ml-item:hover { background: #14171c; }

        .ugs-ml-info { min-width: 0; flex: 1; }
        .ugs-ml-name {
            font-size: 13px;
            font-weight: 500;
            color: #e3e5e8;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .ugs-ml-desc {
            font-size: 11px;
            color: #6a7080;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .ugs-ml-meta {
            font-size: 10px;
            color: #4d5361;
            margin-top: 2px;
            letter-spacing: 0.2px;
        }

        .ugs-ml-warn-dot {
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #d9a94b;
            margin-left: 6px;
            vertical-align: middle;
            box-shadow: 0 0 6px rgba(217,169,75,0.6);
        }

        .ugs-ml-toggle {
            flex-shrink: 0;
            width: 38px;
            height: 22px;
            border-radius: 11px;
            background: #23262e;
            border: 1px solid #2a2e37;
            position: relative;
            cursor: pointer;
            transition: background 0.18s, border-color 0.18s;
        }
        .ugs-ml-toggle::after {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #6a7080;
            transition: transform 0.18s ease, background 0.18s;
        }
        .ugs-ml-toggle.on {
            background: #2a4a7a;
            border-color: #3a6aa0;
        }
        .ugs-ml-toggle.on::after {
            transform: translateX(16px);
            background: #79aadb;
        }
        .ugs-ml-toggle.loading { opacity: 0.6; pointer-events: none; }

        .ugs-ml-empty {
            padding: 24px 16px;
            text-align: center;
            color: #5f6672;
            font-size: 12px;
            font-style: italic;
        }

        .ugs-ml-footer {
            padding: 8px 12px;
            border-top: 1px solid #1b1e24;
            font-size: 10px;
            color: #4d5361;
            text-align: center;
            letter-spacing: 0.3px;
        }

        /* ---------- CONFLICT MODAL ---------- */
        .ugs-ml-conflict-overlay {
            position: fixed;
            inset: 0;
            z-index: 2147483646;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.2s ease;
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        }
        .ugs-ml-conflict-overlay.open { opacity: 1; }

        .ugs-ml-conflict-modal {
            background: #0d0e11;
            border: 1px solid #2a2e37;
            border-radius: 10px;
            width: 420px;
            max-width: calc(100vw - 32px);
            padding: 22px 22px 18px;
            box-shadow: 0 24px 80px rgba(0,0,0,0.8);
            color: #e3e5e8;
            transform: translateY(8px);
            transition: transform 0.2s ease;
        }
        .ugs-ml-conflict-overlay.open .ugs-ml-conflict-modal { transform: translateY(0); }

        .ugs-ml-conflict-title {
            font-size: 15px;
            font-weight: 500;
            color: #ffffff;
            margin-bottom: 12px;
            letter-spacing: 0.3px;
        }

        .ugs-ml-conflict-body {
            font-size: 13px;
            line-height: 1.55;
            color: #b0b6c0;
        }
        .ugs-ml-conflict-body p { margin: 0 0 10px; }
        .ugs-ml-conflict-body strong { color: #ffffff; font-weight: 500; }

        .ugs-ml-conflict-list {
            list-style: none;
            padding: 8px 10px;
            margin: 8px 0 12px;
            background: #121317;
            border: 1px solid #23262e;
            border-radius: 6px;
            font-size: 12px;
        }
        .ugs-ml-conflict-list li {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 4px 0;
        }
        .ugs-ml-conflict-name { color: #e3e5e8; }
        .ugs-ml-conflict-tag {
            font-size: 10px;
            color: #79aadb;
            background: rgba(121,170,219,0.1);
            border: 1px solid rgba(121,170,219,0.25);
            padding: 1px 7px;
            border-radius: 3px;
            letter-spacing: 0.3px;
            text-transform: uppercase;
        }

        .ugs-ml-conflict-hint {
            font-size: 12px;
            color: #6a7080;
            margin: 0;
        }

        .ugs-ml-conflict-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 16px;
        }
        .ugs-ml-conflict-actions button {
            padding: 8px 16px;
            font-size: 12px;
            font-family: inherit;
            font-weight: 500;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.15s, border-color 0.15s, color 0.15s;
            letter-spacing: 0.3px;
        }
        .ugs-ml-conflict-cancel {
            background: transparent;
            border: 1px solid #2a2e37;
            color: #b0b6c0;
        }
        .ugs-ml-conflict-cancel:hover {
            background: #16181d;
            border-color: #3d424d;
            color: #e3e5e8;
        }
        .ugs-ml-conflict-confirm {
            background: #2a4a7a;
            border: 1px solid #3a6aa0;
            color: #ffffff;
        }
        .ugs-ml-conflict-confirm:hover {
            background: #345b8f;
            border-color: #4a7ab5;
        }

        @media (max-width: 480px) {
            .ugs-ml-panel { width: calc(100vw - 28px); max-width: 340px; }
        }
    `;
    document.head.appendChild(style);

    // ---------- BUILD UI ----------
    const wrap = document.createElement('div');
    wrap.className = 'ugs-ml-wrap';
    wrap.innerHTML = `
        <button class="ugs-ml-btn" id="ugs-ml-btn" title="Modules">
            <svg viewBox="0 0 24 24"><path d="M12 2l9 5v10l-9 5-9-5V7l9-5zm0 2.18L4.82 8 12 11.82 19.18 8 12 4.18zM4 9.65v6.7l7 3.89v-6.7L4 9.65zm9 10.59l7-3.89v-6.7l-7 3.89v6.7z"/></svg>
        </button>
        <div class="ugs-ml-panel" id="ugs-ml-panel">
            <div class="ugs-ml-header">
                <span class="ugs-ml-title">Modules</span>
                <span class="ugs-ml-count" id="ugs-ml-count">—</span>
            </div>
            <div class="ugs-ml-search-wrap">
                <input class="ugs-ml-search" id="ugs-ml-search" placeholder="Search modules..." autocomplete="off">
            </div>
            <div class="ugs-ml-list" id="ugs-ml-list">
                <div class="ugs-ml-empty">Loading modules...</div>
            </div>
            <div class="ugs-ml-footer" id="ugs-ml-footer">—</div>
        </div>
    `;
    document.body.appendChild(wrap);

    const btn = document.getElementById('ugs-ml-btn');
    const panel = document.getElementById('ugs-ml-panel');
    const list = document.getElementById('ugs-ml-list');
    const search = document.getElementById('ugs-ml-search');
    const count = document.getElementById('ugs-ml-count');
    const footer = document.getElementById('ugs-ml-footer');

    // ---------- STATE ----------
    let allModules = [];
    let installedIds = new Set(JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]'));
    const loadedScripts = new Map();

    // ---------- HELPERS ----------
    const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    const saveInstalled = () => {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify([...installedIds]));
    };

    const resolveUrl = (path) => {
        if (/^https?:\/\//i.test(path)) return path;
        return CONFIG.baseUrl + path.replace(/^\/+/, '');
    };

    const loadScript = (url) => new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = url;
        s.onload = () => resolve(s);
        s.onerror = () => reject(new Error('Failed to load ' + url));
        document.body.appendChild(s);
    });

    // ---------- CONFLICT DETECTION ----------
    const findConflicts = (candidate, installedIdsSet, allModules) => {
        const conflicts = [];
        const explicit = new Set(candidate.conflictsWith || []);

        allModules.forEach(other => {
            if (other.id === candidate.id) return;
            if (!installedIdsSet.has(other.id)) return;

            const otherKey = `${other.category}:${other.subcategory}`;
            if (explicit.has(other.id) || explicit.has(otherKey)) {
                conflicts.push({ module: other, reason: 'declared' });
                return;
            }

            const otherExplicit = new Set(other.conflictsWith || []);
            const candidateKey = `${candidate.category}:${candidate.subcategory}`;
            if (otherExplicit.has(candidate.id) || otherExplicit.has(candidateKey)) {
                conflicts.push({ module: other, reason: 'declared-by-other' });
                return;
            }

            if (
                candidate.category &&
                other.category === candidate.category &&
                other.subcategory === candidate.subcategory
            ) {
                conflicts.push({ module: other, reason: 'same-subcategory' });
            }
        });

        return conflicts;
    };

    // ---------- CONFLICT MODAL ----------
    const showConflictWarning = (candidate, conflicts) => {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'ugs-ml-conflict-overlay';
            overlay.innerHTML = `
                <div class="ugs-ml-conflict-modal">
                    <div class="ugs-ml-conflict-title">Module Conflict Detected</div>
                    <div class="ugs-ml-conflict-body">
                        <p>
                            <strong>${escapeHtml(candidate.name)}</strong> overlaps with
                            ${conflicts.length} already-enabled module${conflicts.length === 1 ? '' : 's'}.
                            Loading both may cause broken styling or unexpected behavior.
                        </p>
                        <ul class="ugs-ml-conflict-list">
                            ${conflicts.map(c => {
                                const label = c.reason === 'same-subcategory'
                                    ? 'same slot'
                                    : 'explicitly flagged';
                                return `<li>
                                    <span class="ugs-ml-conflict-name">${escapeHtml(c.module.name)}</span>
                                    <span class="ugs-ml-conflict-tag">${label}</span>
                                </li>`;
                            }).join('')}
                        </ul>
                        <p class="ugs-ml-conflict-hint">
                            Disable the conflicting module${conflicts.length === 1 ? '' : 's'} first,
                            or continue and risk visual bugs.
                        </p>
                    </div>
                    <div class="ugs-ml-conflict-actions">
                        <button class="ugs-ml-conflict-cancel" data-choice="cancel">Cancel</button>
                        <button class="ugs-ml-conflict-confirm" data-choice="confirm">Continue Anyway</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            requestAnimationFrame(() => overlay.classList.add('open'));

            const close = (choice) => {
                overlay.classList.remove('open');
                setTimeout(() => overlay.remove(), 200);
                resolve(choice === 'confirm');
            };

            overlay.querySelector('.ugs-ml-conflict-cancel')
                .addEventListener('click', () => close('cancel'));
            overlay.querySelector('.ugs-ml-conflict-confirm')
                .addEventListener('click', () => close('confirm'));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close('cancel');
            });
        });
    };

    // ---------- PANEL TOGGLE ----------
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = panel.classList.toggle('open');
        btn.classList.toggle('active', isOpen);
        if (isOpen) search.focus();
    });

    document.addEventListener('click', (e) => {
        if (!wrap.contains(e.target)) {
            panel.classList.remove('open');
            btn.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('open')) {
            panel.classList.remove('open');
            btn.classList.remove('active');
        }
    });

    // ---------- RENDER ----------
    const renderList = (filter = '') => {
        const q = filter.trim().toLowerCase();
        const filtered = allModules.filter(m => {
            if (!q) return true;
            return (
                m.name.toLowerCase().includes(q) ||
                (m.description || '').toLowerCase().includes(q) ||
                (m.author || '').toLowerCase().includes(q) ||
                (m.category || '').toLowerCase().includes(q) ||
                (m.subcategory || '').toLowerCase().includes(q)
            );
        });

        count.textContent = `${filtered.length} / ${allModules.length}`;

        if (filtered.length === 0) {
            list.innerHTML = `<div class="ugs-ml-empty">${allModules.length === 0 ? 'No modules available.' : 'No matches.'}</div>`;
            return;
        }

        list.innerHTML = '';
        filtered.forEach(m => {
            const item = document.createElement('div');
            item.className = 'ugs-ml-item';
            item.dataset.id = m.id;

            const info = document.createElement('div');
            info.className = 'ugs-ml-info';

            const categoryLine = m.category
                ? `${escapeHtml(m.category)}${m.subcategory ? ' · ' + escapeHtml(m.subcategory) : ''} · `
                : '';

            info.innerHTML = `
                <div class="ugs-ml-name">${escapeHtml(m.name)}</div>
                <div class="ugs-ml-desc">${escapeHtml(m.description || '')}</div>
                <div class="ugs-ml-meta">
                    ${categoryLine}v${escapeHtml(m.version || '0.0.0')} · ${escapeHtml(m.author || 'unknown')}
                </div>
            `;

            // Warn dot for would-conflict modules
            const wouldConflict = findConflicts(m, installedIds, allModules).length > 0;
            if (wouldConflict && !installedIds.has(m.id)) {
                const dot = document.createElement('span');
                dot.className = 'ugs-ml-warn-dot';
                dot.title = 'Conflicts with an enabled module';
                info.querySelector('.ugs-ml-name').appendChild(dot);
            }

            const toggle = document.createElement('div');
            toggle.className = 'ugs-ml-toggle' + (installedIds.has(m.id) ? ' on' : '');
            toggle.title = installedIds.has(m.id) ? 'Disable module' : 'Enable module';

            toggle.addEventListener('click', async () => {
                if (toggle.classList.contains('loading')) return;
                const isOn = installedIds.has(m.id);

                if (isOn) {
                    // ----- DISABLE -----
                    installedIds.delete(m.id);
                    saveInstalled();

                    // Call module's remove() hook if registered
                    const mod = window.UGSModules && window.UGSModules[m.id];
                    if (mod && typeof mod.remove === 'function') {
                        try { mod.remove(); } catch (e) { console.warn('[UGS ML] remove hook failed:', e); }
                    }

                    const s = loadedScripts.get(m.id);
                    if (s) { s.remove(); loadedScripts.delete(m.id); }

                    toggle.classList.remove('on');
                    toggle.title = 'Enable module';

                    // Refresh list to update warn dots
                    renderList(search.value);
                } else {
                    // ----- ENABLE -----
                    const conflicts = findConflicts(m, installedIds, allModules);
                    if (conflicts.length > 0) {
                        const proceed = await showConflictWarning(m, conflicts);
                        if (!proceed) return;
                    }

                    toggle.classList.add('loading');
                    try {
                        const url = resolveUrl(m.file);
                        const s = await loadScript(url);
                        loadedScripts.set(m.id, s);
                        installedIds.add(m.id);
                        saveInstalled();
                        toggle.classList.add('on');
                        toggle.title = 'Disable module';

                        // Refresh list to update warn dots
                        renderList(search.value);
                    } catch (err) {
                        console.error('[UGS ML]', err);
                        toggle.title = 'Failed to load';
                        alert(`Failed to load module "${m.name}".\n${err.message}`);
                    } finally {
                        toggle.classList.remove('loading');
                    }
                }
            });

            item.appendChild(info);
            item.appendChild(toggle);
            list.appendChild(item);
        });
    };

    // ---------- SEARCH ----------
    search.addEventListener('input', () => renderList(search.value));

    // ---------- FETCH MANIFEST ----------
    const fetchManifest = async () => {
        try {
            const res = await fetch(CONFIG.manifestUrl, { cache: 'no-cache' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            allModules = Array.isArray(data.modules) ? data.modules : [];
            renderList(search.value);
            footer.textContent = `${allModules.length} module${allModules.length === 1 ? '' : 's'} available`;

            // Auto-reload previously enabled modules
            for (const m of allModules) {
                if (installedIds.has(m.id) && !loadedScripts.has(m.id)) {
                    try {
                        const url = resolveUrl(m.file);
                        const s = await loadScript(url);
                        loadedScripts.set(m.id, s);
                    } catch (err) {
                        console.warn('[UGS ML] auto-load failed for', m.id, err);
                    }
                }
            }
        } catch (err) {
            console.error('[UGS ML] manifest fetch failed:', err);
            list.innerHTML = `<div class="ugs-ml-empty">Failed to load modules.<br><small>${escapeHtml(err.message)}</small></div>`;
            footer.textContent = 'manifest unreachable';
        }
    };

    fetchManifest();
})();
