/* ============================================================
 * UGS MODULE LOADER
 * ------------------------------------------------------------
 * Drop-in module loader with search, toggles, conflict
 * detection, and localStorage persistence.
 *
 * Theme:    GitHub dark mode (Primer palette)
 * Isolation: All rules are !important and scoped to .ugs-ml-*.
 *            Each loader element resets itself via `all: revert`
 *            so host-page CSS can't bleed in.
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

    // ---------- GITHUB PRIMER DARK PALETTE ----------
    const GH = {
        canvasDefault: '#0d1117',
        canvasSubtle: '#161b22',
        canvasInset: '#010409',
        borderDefault: '#30363d',
        borderMuted: '#21262d',
        fgDefault: '#c9d1d9',
        fgMuted: '#8b949e',
        fgSubtle: '#6e7681',
        accent: '#58a6ff',
        accentEmphasis: '#1f6feb',
        accentHover: '#79c0ff',
        success: '#3fb950',
        attention: '#d29922',
        danger: '#f85149',
        monoFont: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
        uiFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif'
    };

    // ---------- INJECT STYLES ----------
    // Every rule is !important so host page styles can't override.
    // Fonts, box-sizing, and resets are applied per-element so nothing
    // bleeds in from the host page.
    const style = document.createElement('style');
    style.id = 'ugs-module-loader-styles';
    style.textContent = `
        /* ============ Reset + isolation ============ */
        .ugs-ml-wrap,
        .ugs-ml-wrap *,
        .ugs-ml-conflict-overlay,
        .ugs-ml-conflict-overlay * {
            all: unset;
            box-sizing: border-box !important;
            font-family: ${GH.uiFont} !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
        }
        .ugs-ml-wrap *,
        .ugs-ml-conflict-overlay * {
            display: revert;
        }

        /* ============ Wrapper ============ */
        .ugs-ml-wrap {
            position: fixed !important;
            top: 14px !important;
            left: 14px !important;
            z-index: 2147483000 !important;
            font-size: 12px !important;
            line-height: 1.5 !important;
            color: ${GH.fgDefault} !important;
            display: block !important;
        }

        /* ============ Trigger button ============ */
        .ugs-ml-btn {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 44px !important;
            height: 44px !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 6px !important;
            background: ${GH.canvasSubtle} !important;
            border: 1px solid ${GH.borderDefault} !important;
            color: ${GH.fgDefault} !important;
            cursor: pointer !important;
            transition: background 120ms, border-color 120ms, color 120ms !important;
            box-shadow: 0 4px 14px rgba(1, 4, 9, 0.6) !important;
            outline: none !important;
        }
        .ugs-ml-btn:hover {
            background: ${GH.canvasDefault} !important;
            border-color: ${GH.fgSubtle} !important;
            color: ${GH.fgDefault} !important;
        }
        .ugs-ml-btn:focus-visible {
            border-color: ${GH.accent} !important;
            box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.3) !important;
        }
        .ugs-ml-btn.active {
            background: ${GH.canvasDefault} !important;
            border-color: ${GH.accent} !important;
            color: ${GH.accent} !important;
        }
        .ugs-ml-btn svg {
            width: 20px !important;
            height: 20px !important;
            fill: currentColor !important;
            display: block !important;
            pointer-events: none !important;
        }

        /* ============ Panel ============ */
        .ugs-ml-panel {
            position: absolute !important;
            top: 54px !important;
            left: 0 !important;
            width: 360px !important;
            max-height: 500px !important;
            background: ${GH.canvasDefault} !important;
            border: 1px solid ${GH.borderDefault} !important;
            border-radius: 6px !important;
            box-shadow: 0 16px 48px rgba(1, 4, 9, 0.8) !important;
            display: none !important;
            flex-direction: column !important;
            overflow: hidden !important;
            opacity: 0 !important;
            transform: translateY(-6px) !important;
            transition: opacity 140ms ease, transform 140ms ease !important;
        }
        .ugs-ml-panel.open {
            display: flex !important;
            opacity: 1 !important;
            transform: translateY(0) !important;
        }

        /* ============ Header ============ */
        .ugs-ml-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 10px 14px !important;
            border-bottom: 1px solid ${GH.borderMuted} !important;
            background: ${GH.canvasSubtle} !important;
            border-top-left-radius: 6px !important;
            border-top-right-radius: 6px !important;
        }
        .ugs-ml-title {
            font-size: 12px !important;
            font-weight: 600 !important;
            color: ${GH.fgDefault} !important;
            letter-spacing: 0 !important;
            display: inline-block !important;
        }
        .ugs-ml-count {
            font-size: 11px !important;
            color: ${GH.fgMuted} !important;
            font-family: ${GH.monoFont} !important;
            display: inline-block !important;
        }

        /* ============ Search ============ */
        .ugs-ml-search-wrap {
            padding: 10px 12px !important;
            border-bottom: 1px solid ${GH.borderMuted} !important;
            background: ${GH.canvasDefault} !important;
        }
        .ugs-ml-search {
            display: block !important;
            width: 100% !important;
            height: 32px !important;
            padding: 0 12px !important;
            margin: 0 !important;
            background: ${GH.canvasInset} !important;
            border: 1px solid ${GH.borderDefault} !important;
            border-radius: 6px !important;
            color: ${GH.fgDefault} !important;
            font-size: 12px !important;
            font-family: ${GH.uiFont} !important;
            outline: none !important;
            box-shadow: none !important;
            transition: border-color 120ms, box-shadow 120ms !important;
        }
        .ugs-ml-search::placeholder {
            color: ${GH.fgSubtle} !important;
            opacity: 1 !important;
        }
        .ugs-ml-search:focus {
            border-color: ${GH.accentEmphasis} !important;
            box-shadow: 0 0 0 3px rgba(31, 111, 235, 0.3) !important;
        }

        /* ============ List ============ */
        .ugs-ml-list {
            display: block !important;
            overflow-y: auto !important;
            padding: 6px !important;
            flex: 1 1 auto !important;
            min-height: 0 !important;
            background: ${GH.canvasDefault} !important;
        }
        .ugs-ml-list::-webkit-scrollbar { width: 8px !important; }
        .ugs-ml-list::-webkit-scrollbar-track { background: transparent !important; }
        .ugs-ml-list::-webkit-scrollbar-thumb {
            background: ${GH.borderDefault} !important;
            border-radius: 4px !important;
        }
        .ugs-ml-list::-webkit-scrollbar-thumb:hover {
            background: ${GH.fgSubtle} !important;
        }

        /* ============ Item ============ */
        .ugs-ml-item {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 10px !important;
            padding: 10px 10px !important;
            border-radius: 6px !important;
            transition: background 100ms !important;
            background: transparent !important;
            border: none !important;
        }
        .ugs-ml-item:hover {
            background: ${GH.canvasSubtle} !important;
        }

        .ugs-ml-info {
            min-width: 0 !important;
            flex: 1 1 auto !important;
            display: block !important;
        }
        .ugs-ml-name {
            display: block !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            color: ${GH.fgDefault} !important;
            margin: 0 0 2px 0 !important;
            padding: 0 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            line-height: 1.4 !important;
        }
        .ugs-ml-desc {
            display: block !important;
            font-size: 11px !important;
            color: ${GH.fgMuted} !important;
            margin: 0 !important;
            padding: 0 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            line-height: 1.4 !important;
        }
        .ugs-ml-meta {
            display: block !important;
            font-size: 10px !important;
            color: ${GH.fgSubtle} !important;
            font-family: ${GH.monoFont} !important;
            margin: 3px 0 0 0 !important;
            padding: 0 !important;
            letter-spacing: 0 !important;
            line-height: 1.4 !important;
        }

        .ugs-ml-warn-dot {
            display: inline-block !important;
            width: 6px !important;
            height: 6px !important;
            border-radius: 50% !important;
            background: ${GH.attention} !important;
            margin-left: 6px !important;
            vertical-align: middle !important;
            padding: 0 !important;
        }

        /* ============ Toggle ============ */
        .ugs-ml-toggle {
            flex-shrink: 0 !important;
            position: relative !important;
            width: 40px !important;
            height: 22px !important;
            border-radius: 11px !important;
            background: ${GH.borderDefault} !important;
            border: none !important;
            cursor: pointer !important;
            transition: background 160ms !important;
            padding: 0 !important;
            margin: 0 !important;
        }
        .ugs-ml-toggle::after {
            content: '' !important;
            position: absolute !important;
            top: 2px !important;
            left: 2px !important;
            width: 18px !important;
            height: 18px !important;
            border-radius: 50% !important;
            background: ${GH.canvasDefault} !important;
            transition: transform 160ms ease, background 160ms !important;
        }
        .ugs-ml-toggle.on {
            background: ${GH.accentEmphasis} !important;
        }
        .ugs-ml-toggle.on::after {
            transform: translateX(18px) !important;
            background: #ffffff !important;
        }
        .ugs-ml-toggle.loading {
            opacity: 0.5 !important;
            pointer-events: none !important;
        }

        /* ============ Empty / Footer ============ */
        .ugs-ml-empty {
            display: block !important;
            padding: 24px 16px !important;
            text-align: center !important;
            color: ${GH.fgMuted} !important;
            font-size: 12px !important;
            font-style: normal !important;
            font-family: ${GH.uiFont} !important;
        }

        .ugs-ml-footer {
            display: block !important;
            padding: 8px 12px !important;
            border-top: 1px solid ${GH.borderMuted} !important;
            font-size: 10px !important;
            color: ${GH.fgSubtle} !important;
            text-align: center !important;
            font-family: ${GH.monoFont} !important;
            letter-spacing: 0 !important;
            background: ${GH.canvasSubtle} !important;
            border-bottom-left-radius: 6px !important;
            border-bottom-right-radius: 6px !important;
        }

        /* ============ Conflict modal ============ */
        .ugs-ml-conflict-overlay {
            position: fixed !important;
            inset: 0 !important;
            z-index: 2147483646 !important;
            background: rgba(1, 4, 9, 0.7) !important;
            backdrop-filter: blur(3px) !important;
            -webkit-backdrop-filter: blur(3px) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            opacity: 0 !important;
            transition: opacity 160ms ease !important;
        }
        .ugs-ml-conflict-overlay.open {
            opacity: 1 !important;
        }

        .ugs-ml-conflict-modal {
            display: block !important;
            background: ${GH.canvasDefault} !important;
            border: 1px solid ${GH.borderDefault} !important;
            border-radius: 8px !important;
            width: 440px !important;
            max-width: calc(100vw - 32px) !important;
            padding: 20px !important;
            box-shadow: 0 24px 80px rgba(1, 4, 9, 0.9) !important;
            color: ${GH.fgDefault} !important;
            transform: translateY(6px) !important;
            transition: transform 160ms ease !important;
        }
        .ugs-ml-conflict-overlay.open .ugs-ml-conflict-modal {
            transform: translateY(0) !important;
        }

        .ugs-ml-conflict-title {
            display: block !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            color: ${GH.fgDefault} !important;
            margin: 0 0 12px 0 !important;
            padding: 0 !important;
            letter-spacing: 0 !important;
            line-height: 1.4 !important;
        }

        .ugs-ml-conflict-body {
            display: block !important;
            font-size: 13px !important;
            line-height: 1.55 !important;
            color: ${GH.fgMuted} !important;
            font-family: ${GH.uiFont} !important;
        }
        .ugs-ml-conflict-body p {
            display: block !important;
            margin: 0 0 10px 0 !important;
            padding: 0 !important;
        }
        .ugs-ml-conflict-body strong {
            color: ${GH.fgDefault} !important;
            font-weight: 600 !important;
        }

        .ugs-ml-conflict-list {
            display: block !important;
            list-style: none !important;
            padding: 8px 10px !important;
            margin: 8px 0 12px 0 !important;
            background: ${GH.canvasInset} !important;
            border: 1px solid ${GH.borderMuted} !important;
            border-radius: 6px !important;
            font-size: 12px !important;
        }
        .ugs-ml-conflict-list li {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 4px 0 !important;
            margin: 0 !important;
            list-style: none !important;
        }
        .ugs-ml-conflict-name {
            color: ${GH.fgDefault} !important;
            font-family: ${GH.monoFont} !important;
            font-size: 12px !important;
        }
        .ugs-ml-conflict-tag {
            display: inline-block !important;
            font-size: 10px !important;
            color: ${GH.accent} !important;
            background: rgba(88, 166, 255, 0.12) !important;
            border: 1px solid rgba(88, 166, 255, 0.35) !important;
            padding: 1px 6px !important;
            border-radius: 999px !important;
            letter-spacing: 0 !important;
            text-transform: uppercase !important;
            font-family: ${GH.monoFont} !important;
            line-height: 1.4 !important;
        }

        .ugs-ml-conflict-hint {
            display: block !important;
            font-size: 12px !important;
            color: ${GH.fgSubtle} !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        .ugs-ml-conflict-actions {
            display: flex !important;
            justify-content: flex-end !important;
            gap: 8px !important;
            margin-top: 18px !important;
        }
        .ugs-ml-conflict-actions button {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 6px 14px !important;
            font-size: 12px !important;
            font-family: ${GH.uiFont} !important;
            font-weight: 500 !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            transition: background 120ms, border-color 120ms, color 120ms !important;
            letter-spacing: 0 !important;
            line-height: 20px !important;
            outline: none !important;
        }
        .ugs-ml-conflict-cancel {
            background: ${GH.canvasSubtle} !important;
            color: ${GH.fgDefault} !important;
            border: 1px solid ${GH.borderDefault} !important;
        }
        .ugs-ml-conflict-cancel:hover {
            background: ${GH.borderMuted} !important;
            border-color: ${GH.fgSubtle} !important;
        }
        .ugs-ml-conflict-cancel:focus-visible {
            border-color: ${GH.accent} !important;
            box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.3) !important;
        }
        .ugs-ml-conflict-confirm {
            background: ${GH.accentEmphasis} !important;
            color: #ffffff !important;
            border: 1px solid rgba(240, 246, 252, 0.1) !important;
        }
        .ugs-ml-conflict-confirm:hover {
            background: #388bfd !important;
        }
        .ugs-ml-conflict-confirm:focus-visible {
            box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.4) !important;
        }

        /* ============ Responsive ============ */
        @media (max-width: 480px) {
            .ugs-ml-panel {
                width: calc(100vw - 28px) !important;
                max-width: 360px !important;
            }
            .ugs-ml-conflict-modal {
                padding: 16px !important;
            }
        }
    `;
    document.head.appendChild(style);

    // ---------- BUILD UI ----------
    const wrap = document.createElement('div');
    wrap.className = 'ugs-ml-wrap';
    wrap.innerHTML = `
        <button class="ugs-ml-btn" id="ugs-ml-btn" title="Modules" aria-label="Modules">
            <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M1.75 1.5a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h6.5a.75.75 0 0 1 0 1.5h-6.5A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v6.5a.75.75 0 0 1-1.5 0v-6.5a.25.25 0 0 0-.25-.25H1.75Z"></path>
                <path d="M12.75 8a.75.75 0 0 1 .75.75v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 .75-.75Z"></path>
            </svg>
        </button>
        <div class="ugs-ml-panel" id="ugs-ml-panel" role="dialog" aria-label="Module list">
            <div class="ugs-ml-header">
                <span class="ugs-ml-title">Modules</span>
                <span class="ugs-ml-count" id="ugs-ml-count">—</span>
            </div>
            <div class="ugs-ml-search-wrap">
                <input class="ugs-ml-search" id="ugs-ml-search" placeholder="Search modules…" autocomplete="off" spellcheck="false">
            </div>
            <div class="ugs-ml-list" id="ugs-ml-list">
                <div class="ugs-ml-empty">Loading modules…</div>
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
                <div class="ugs-ml-conflict-modal" role="alertdialog" aria-labelledby="ugs-ml-conflict-title">
                    <div class="ugs-ml-conflict-title" id="ugs-ml-conflict-title">Module conflict detected</div>
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
                                    : 'flagged';
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
                        <button class="ugs-ml-conflict-confirm" data-choice="confirm">Continue anyway</button>
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
            toggle.setAttribute('role', 'switch');
            toggle.setAttribute('aria-checked', installedIds.has(m.id) ? 'true' : 'false');

            toggle.addEventListener('click', async () => {
                if (toggle.classList.contains('loading')) return;
                const isOn = installedIds.has(m.id);

                if (isOn) {
                    installedIds.delete(m.id);
                    saveInstalled();

                    const mod = window.UGSModules && window.UGSModules[m.id];
                    if (mod && typeof mod.remove === 'function') {
                        try { mod.remove(); } catch (e) { console.warn('[UGS ML] remove hook failed:', e); }
                    }

                    const s = loadedScripts.get(m.id);
                    if (s) { s.remove(); loadedScripts.delete(m.id); }

                    toggle.classList.remove('on');
                    toggle.setAttribute('aria-checked', 'false');
                    toggle.title = 'Enable module';
                    renderList(search.value);
                } else {
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
                        toggle.setAttribute('aria-checked', 'true');
                        toggle.title = 'Disable module';
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
