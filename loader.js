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
            border: 1px solid rgba(88, 166, 255, 0.35) !important
