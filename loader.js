/* ============================================================
 * UGS MODULE LOADER
 * ------------------------------------------------------------
 * Top-right GitHub-styled module loader with tile UI.
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

    // ---------- LOAD FONT AWESOME ----------
    if (!document.querySelector('link[data-ugs-ml-fa]')) {
        const fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        fa.setAttribute('data-ugs-ml-fa', '1');
        document.head.appendChild(fa);
    }

    // ---------- INJECT STYLES ----------
    const style = document.createElement('style');
    style.id = 'ugs-module-loader-styles';
    style.textContent = `
        /* ============ Isolation reset ============ */
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
        .ugs-ml-wrap *, .ugs-ml-conflict-overlay * { display: revert; }

        /* ============ Wrapper (TOP-RIGHT) ============ */
        .ugs-ml-wrap {
            position: fixed !important;
            top: 14px !important;
            right: 14px !important;
            left: auto !important;
            z-index: 2147483000 !important;
            font-size: 12px !important;
            line-height: 1.5 !important;
            color: ${GH.fgDefault} !important;
            display: block !important;
        }

        /* ============ Trigger (GitHub icon) ============ */
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
        .ugs-ml-btn i {
            font-size: 22px !important;
            line-height: 1 !important;
            color: inherit !important;
            display: inline-block !important;
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

        /* ============ Panel ============ */
        .ugs-ml-panel {
            position: absolute !important;
            top: 54px !important;
            right: 0 !important;
            left: auto !important;
            width: 380px !important;
            max-height: 520px !important;
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
            min-height: 40px !important;
        }
        .ugs-ml-title {
            font-size: 12px !important;
            font-weight: 600 !important;
            color: ${GH.fgDefault} !important;
            display: inline-block !important;
        }
        .ugs-ml-count {
            font-size: 11px !important;
            color: ${GH.fgMuted} !important;
            font-family: ${GH.monoFont} !important;
            display: inline-block !important;
        }
        .ugs-ml-back {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 6px !important;
            padding: 4px 8px !important;
            margin: 0 !important;
            font-size: 11px !important;
            font-weight: 500 !important;
            color: ${GH.fgMuted} !important;
            background: transparent !important;
            border: 1px solid transparent !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            transition: color 120ms, border-color 120ms !important;
        }
        .ugs-ml-back:hover {
            color: ${GH.fgDefault} !important;
            border-color: ${GH.borderDefault} !important;
        }
        .ugs-ml-back i {
            font-size: 11px !important;
            display: inline-block !important;
        }

        /* ============ Views ============ */
        .ugs-ml-view {
            display: none !important;
            flex-direction: column !important;
            flex: 1 1 auto !important;
            min-height: 0 !important;
            overflow: hidden !important;
        }
        .ugs-ml-view.active {
            display: flex !important;
        }

        /* ============ Tiles (home view) ============ */
        .ugs-ml-tiles {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
            padding: 16px !important;
        }
        .ugs-ml-tile {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            justify-content: flex-start !important;
            gap: 8px !important;
            padding: 18px 16px !important;
            background: ${GH.canvasSubtle} !important;
            border: 1px solid ${GH.borderDefault} !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            transition: background 120ms, border-color 120ms, transform 120ms !important;
            text-align: left !important;
            min-height: 108px !important;
        }
        .ugs-ml-tile:hover {
            background: ${GH.canvasDefault} !important;
            border-color: ${GH.fgSubtle} !important;
            transform: translateY(-1px) !important;
        }
        .ugs-ml-tile:focus-visible {
            border-color: ${GH.accent} !important;
            box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.3) !important;
        }
        .ugs-ml-tile-icon {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 32px !important;
            height: 32px !important;
            border-radius: 6px !important;
            background: rgba(88, 166, 255, 0.12) !important;
            color: ${GH.accent} !important;
            border: 1px solid rgba(88, 166, 255, 0.25) !important;
        }
        .ugs-ml-tile-icon i {
            font-size: 16px !important;
            display: inline-block !important;
        }
        .ugs-ml-tile-label {
            display: block !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            color: ${GH.fgDefault} !important;
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1.3 !important;
        }
        .ugs-ml-tile-desc {
            display: block !important;
            font-size: 11px !important;
            color: ${GH.fgMuted} !important;
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1.4 !important;
        }

        /* ============ Search view ============ */
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
        .ugs-ml-search::placeholder { color: ${GH.fgSubtle} !important; opacity: 1 !important; }
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
            padding: 10px !important;
            border-radius: 6px !important;
            transition: background 100ms !important;
            background: transparent !important;
            border: none !important;
        }
        .ugs-ml-item:hover { background: ${GH.canvasSubtle} !important; }

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
        .ugs-ml-toggle.on { background: ${GH.accentEmphasis} !important; }
        .ugs-ml-toggle.on::after {
            transform: translateX(18px) !important;
            background: #ffffff !important;
        }
        .ugs-ml-toggle.loading { opacity: 0.5 !important; pointer-events: none !important; }

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
        .ugs-ml-conflict-overlay.open { opacity: 1 !important; }

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
        .ugs-ml-conflict-confirm {
            background: ${GH.accentEmphasis} !important;
            color: #ffffff !important;
            border: 1px solid rgba(240, 246, 252, 0.1) !important;
        }
        .ugs-ml-conflict-confirm:hover { background: #388bfd !important; }

        /* ============ Responsive ============ */
        @media (max-width: 480px) {
            .ugs-ml-panel {
                width: calc(100vw - 28px) !important;
                max-width: 380px !important;
            }
            .ugs-ml-conflict-modal { padding: 16px !important; }
        }
    `;
    document.head.appendChild(style);

    // ---------- BUILD UI ----------
    const wrap = document.createElement('div');
    wrap.className = 'ugs-ml-wrap';
    wrap.innerHTML = `
        <button class="ugs-ml-btn" id="ugs-ml-btn" title="Modules" aria-label="Modules">
            <i class="fa-brands fa-github" aria-hidden="true"></i>
        </button>
        <div class="ugs-ml-panel" id="ugs-ml-panel" role="dialog" aria-label="Module loader">
            <div class="ugs-ml-header">
                <button class="ugs-ml-back" id="ugs-ml-back" style="display:none;" aria-label="Back">
                    <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
                    <span>Back</span>
                </button>
                <span class="ugs-ml-title" id="ugs-ml-title">Modules</span>
                <span class="ugs-ml-count" id="ugs-ml-count">—</span>
            </div>

            <!-- HOME VIEW: two app tiles -->
            <div class="ugs-ml-view active" id="ugs-ml-view-home">
                <div class="ugs-ml-tiles">
                    <button class="ugs-ml-tile" id="ugs-ml-tile-search" aria-label="Search modules">
                        <span class="ugs-ml-tile-icon"><i class="fa-solid fa-magnifying-glass"></i></span>
                        <span class="ugs-ml-tile-label">Search</span>
                        <span class="ugs-ml-tile-desc">Browse all available modules</span>
                    </button>
                    <button class="ugs-ml-tile" id="ugs-ml-tile-installed" aria-label="Installed modules">
                        <span class="ugs-ml-tile-icon"><i class="fa-solid fa-box-open"></i></span>
                        <span class="ugs-ml-tile-label">Installed</span>
                        <span class="ugs-ml-tile-desc">Your toggled-on modules</span>
                    </button>
                </div>
                <div class="ugs-ml-footer" id="ugs-ml-footer-home">—</div>
            </div>

            <!-- SEARCH VIEW -->
            <div class="ugs-ml-view" id="ugs-ml-view-search">
                <div class="ugs-ml-search-wrap">
                    <input class="ugs-ml-search" id="ugs-ml-search" placeholder="Search modules…" autocomplete="off" spellcheck="false">
                </div>
                <div class="ugs-ml-list" id="ugs-ml-list-search">
                    <div class="ugs-ml-empty">Loading modules…</div>
                </div>
                <div class="ugs-ml-footer" id="ugs-ml-footer">—</div>
            </div>

            <!-- INSTALLED VIEW -->
            <div class="ugs-ml-view" id="ugs-ml-view-installed">
                <div class="ugs-ml-list" id="ugs-ml-list-installed">
                    <div class="ugs-ml-empty">Loading…</div>
                </div>
                <div class="ugs-ml-footer" id="ugs-ml-footer-installed">—</div>
            </div>
        </div>
    `;
    document.body.appendChild(wrap);

    const btn = document.getElementById('ugs-ml-btn');
    const panel = document.getElementById('ugs-ml-panel');
    const backBtn = document.getElementById('ugs-ml-back');
    const titleEl = document.getElementById('ugs-ml-title');
    const countEl = document.getElementById('ugs-ml-count');

    const viewHome = document.getElementById('ugs-ml-view-home');
    const viewSearch = document.getElementById('ugs-ml-view-search');
    const viewInstalled = document.getElementById('ugs-ml-view-installed');

    const tileSearch = document.getElementById('ugs-ml-tile-search');
    const tileInstalled = document.getElementById('ugs-ml-tile-installed');

    const searchInput = document.getElementById('ugs-ml-search');
    const listSearch = document.getElementById('ugs-ml-list-search');
    const listInstalled = document.getElementById('ugs-ml-list-installed');

    const footerHome = document.getElementById('ugs-ml-footer-home');
    const footerSearch = document.getElementById('ugs-ml-footer');
    const footerInstalled = document.getElementById('ugs-ml-footer-installed');

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
    const findConflicts = (candidate) => {
        const conflicts = [];
        const explicit = new Set(candidate.conflictsWith || []);

        allModules.forEach(other => {
            if (other.id === candidate.id) return;
            if (!installedIds.has(other.id)) return;

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
                <div class="ugs-ml-conflict-modal" role="alertdialog">
                    <div class="ugs-ml-conflict-title">Module conflict detected</div>
                    <div class="ugs-ml-conflict-body">
                        <p>
                            <strong>${escapeHtml(candidate.name)}</strong> overlaps with
                            ${conflicts.length} already-enabled module${conflicts.length === 1 ? '' : 's'}.
                            Loading both may cause broken styling or unexpected behavior.
                        </p>
                        <ul class="ugs-ml-conflict-list">
                            ${conflicts.map(c => {
                                const label = c.reason === 'same-subcategory' ? 'same slot' : 'flagged';
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
                        <button class="ugs-ml-conflict-cancel">Cancel</button>
                        <button class="ugs-ml-conflict-confirm">Continue anyway</button>
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
            overlay.querySelector('.ugs-ml-conflict-cancel').addEventListener('click', () => close('cancel'));
            overlay.querySelector('.ugs-ml-conflict-confirm').addEventListener('click', () => close('confirm'));
            overlay.addEventListener('click', (e) => { if (e.target === overlay) close('cancel'); });
        });
    };

    // ---------- VIEW SWITCHING ----------
    const showView = (name) => {
        [viewHome, viewSearch, viewInstalled].forEach(v => v.classList.remove('active'));
        if (name === 'home') {
            viewHome.classList.add('active');
            backBtn.style.display = 'none';
            titleEl.textContent = 'Modules';
            countEl.textContent = '—';
        } else if (name === 'search') {
            viewSearch.classList.add('active');
            backBtn.style.display = 'inline-flex';
            titleEl.textContent = 'Search';
            setTimeout(() => searchInput.focus(), 50);
            renderSearch(searchInput.value);
        } else if (name === 'installed') {
            viewInstalled.classList.add('active');
            backBtn.style.display = 'inline-flex';
            titleEl.textContent = 'Installed';
            renderInstalled();
        }
    };

    tileSearch.addEventListener('click', () => showView('search'));
    tileInstalled.addEventListener('click', () => showView('installed'));
    backBtn.addEventListener('click', () => showView('home'));

    // ---------- RENDER: SEARCH LIST ----------
    const renderSearch = (filter = '') => {
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

        countEl.textContent = `${filtered.length} / ${allModules.length}`;

        if (filtered.length === 0) {
            listSearch.innerHTML = `<div class="ugs-ml-empty">${allModules.length === 0 ? 'No modules available.' : 'No matches.'}</div>`;
            return;
        }
        listSearch.innerHTML = '';
        filtered.forEach(m => listSearch.appendChild(buildItem(m)));
    };

    // ---------- RENDER: INSTALLED LIST ----------
    const renderInstalled = () => {
        const installed = allModules.filter(m => installedIds.has(m.id));
        countEl.textContent = `${installed.length} enabled`;

        if (installed.length === 0) {
            listInstalled.innerHTML = `<div class="ugs-ml-empty">No modules enabled yet.<br>Open Search to add some.</div>`;
            footerInstalled.textContent = '0 modules enabled';
            return;
        }
        listInstalled.innerHTML = '';
        installed.forEach(m => listInstalled.appendChild(buildItem(m)));
        footerInstalled.textContent = `${installed.length} module${installed.length === 1 ? '' : 's'} enabled`;
    };

    // ---------- BUILD ITEM (shared by both lists) ----------
    const buildItem = (m) => {
        const item = document.createElement('div');
        item.className = 'ugs-ml-item';

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

        // Warn dot for would-conflict modules (only in search view, only when not installed)
        const conflicts = findConflicts(m);
        if (conflicts.length > 0 && !installedIds.has(m.id)) {
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

                // Refresh both views
                if (viewSearch.classList.contains('active')) renderSearch(searchInput.value);
                if (viewInstalled.classList.contains('active')) renderInstalled();
            } else {
                const conflicts = findConflicts(m);
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

                    if (viewSearch.classList.contains('active')) renderSearch(searchInput.value);
                    if (viewInstalled.classList.contains('active')) renderInstalled();
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
        return item;
    };

    // ---------- SEARCH INPUT ----------
    searchInput.addEventListener('input', () => renderSearch(searchInput.value));

    // ---------- PANEL TOGGLE ----------
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = panel.classList.toggle('open');
        btn.classList.toggle('active', isOpen);
        if (isOpen) {
            // Always open to home view
            showView('home');
        }
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

    // ---------- FETCH MANIFEST ----------
    const fetchManifest = async () => {
        try {
            const res = await fetch(CONFIG.manifestUrl, { cache: 'no-cache' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            allModules = Array.isArray(data.modules) ? data.modules : [];

            // Home footer
            const installedCount = allModules.filter(m => installedIds.has(m.id)).length;
            footerHome.textContent = `${allModules.length} module${allModules.length === 1 ? '' : 's'} available · ${installedCount} enabled`;

            // Pre-render search
            renderSearch(searchInput.value);

            // Auto-load previously enabled modules
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
            listSearch.innerHTML = `<div class="ugs-ml-empty">Failed to load modules.<br><small>${escapeHtml(err.message)}</small></div>`;
            footerHome.textContent = 'manifest unreachable';
            footerSearch.textContent = 'manifest unreachable';
        }
    };

    fetchManifest();
})();
