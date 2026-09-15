/* ============================================================
 * MODULE: Minimalist Override
 * ------------------------------------------------------------
 * Applies a clean dark minimalist theme to the whole site.
 * Toggleable via the module loader — no cinematic wait,
 * styles apply instantly on load.
 *
 * Category: style
 * Subcategory: full-page
 * ============================================================ */

(function () {
    'use strict';

    const MODULE_ID = 'minimalist-override';
    const STYLE_TAG_ID = 'minimalist-override-style';

    // Never touch the module loader UI or anything inside it.
    const PROTECTED_SELECTORS = [
        '#ugs-ml-btn',
        '#ugs-ml-panel',
        '.ugs-ml-wrap',
        '.ugs-ml-panel',
        '.ugs-ml-btn',
        '.ugs-ml-header',
        '.ugs-ml-search-wrap',
        '.ugs-ml-search',
        '.ugs-ml-list',
        '.ugs-ml-item',
        '.ugs-ml-info',
        '.ugs-ml-name',
        '.ugs-ml-desc',
        '.ugs-ml-meta',
        '.ugs-ml-toggle',
        '.ugs-ml-empty',
        '.ugs-ml-footer',
        '.ugs-ml-count',
        '.ugs-ml-title',
        '.ugs-ml-warn-dot',
        '.ugs-ml-conflict-overlay',
        '.ugs-ml-conflict-modal',
        '.ugs-ml-conflict-title',
        '.ugs-ml-conflict-body',
        '.ugs-ml-conflict-list',
        '.ugs-ml-conflict-name',
        '.ugs-ml-conflict-tag',
        '.ugs-ml-conflict-hint',
        '.ugs-ml-conflict-actions',
        '.ugs-ml-conflict-cancel',
        '.ugs-ml-conflict-confirm',
        '.ugs-ml-tile',
        '.ugs-ml-tiles',
        '.ugs-ml-tile-label',
        '.ugs-ml-tile-desc',
        '.ugs-ml-tile-icon',
        '.ugs-ml-back',
        '.ugs-ml-view',
        '#ugs-module-loader-styles'
    ].join(', ');

    let styleTag = null;
    const strippedInlineStyles = [];
    const removedSheets = [];

    // ---------- APPLY ----------
    const apply = () => {
        if (styleTag) return;

        // Save & remove existing stylesheets (skip loader's own + ours)
        document.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => {
            if (el.id === 'ugs-module-loader-styles') return;
            if (el.id === STYLE_TAG_ID) return;
            removedSheets.push({ el, parent: el.parentNode, next: el.nextSibling });
            el.remove();
        });

        // Save & strip inline styles, skipping protected elements
        document.querySelectorAll('[style]').forEach(el => {
            if (el.closest(PROTECTED_SELECTORS)) return;
            strippedInlineStyles.push({ el, value: el.getAttribute('style') });
            el.removeAttribute('style');
        });

        const css = `
            /* ============ Minimalist Override ============ */
            html { background: #0e0f12 !important; }

            body {
                font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif !important;
                background: #0e0f12 !important;
                color: #e3e5e8 !important;
                min-height: 100vh !important;
                line-height: 1.5 !important;
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
            }

            /* SIDEBAR */
            body .sidebar {
                position: fixed !important;
                left: 0 !important; top: 0 !important;
                width: 72px !important;
                height: 100vh !important;
                background: #0a0b0d !important;
                border-right: 1px solid #1e2025 !important;
                padding: 16px 8px !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 6px !important;
                overflow-y: auto !important;
                z-index: 1000 !important;
                box-shadow: none !important;
                backdrop-filter: none !important;
            }
            body .sidebar::-webkit-scrollbar { width: 3px !important; }
            body .sidebar::-webkit-scrollbar-track { background: #0a0b0d !important; }
            body .sidebar::-webkit-scrollbar-thumb { background: #2a2d34 !important; border-radius: 0 !important; }

            body .sidebar-btn {
                background: #16181d !important;
                border: 1px solid #23262e !important;
                padding: 10px 0 !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                border-radius: 4px !important;
                cursor: pointer !important;
                color: #cfd2d9 !important;
                text-align: center !important;
                min-height: 42px !important;
                letter-spacing: 0.3px !important;
                font-family: inherit !important;
                transition: background 0.15s, border-color 0.15s !important;
                box-shadow: none !important;
            }
            body .sidebar-btn:hover {
                background: #1f2229 !important;
                border-color: #3a3f4b !important;
                transform: none !important;
            }
            body .sidebar-btn.empty {
                opacity: 0.3 !important;
                cursor: default !important;
                background: #121317 !important;
                border-color: #1b1d23 !important;
            }
            body .sidebar-btn.empty:hover {
                background: #121317 !important;
                border-color: #1b1d23 !important;
            }

            /* MAIN CONTENT */
            body .main-content {
                margin-left: 72px !important;
                flex: 1 !important;
                padding: 32px 28px 64px 28px !important;
                max-width: 1000px !important;
                width: 100% !important;
            }

            body h1 {
                color: #ffffff !important;
                font-weight: 450 !important;
                font-size: 28px !important;
                letter-spacing: -0.3px !important;
                margin-bottom: 24px !important;
                text-align: left !important;
                text-shadow: none !important;
                border-bottom: 1px solid #252830 !important;
                padding-bottom: 12px !important;
            }

            body h2 {
                color: #9aa0ab !important;
                font-weight: 400 !important;
                font-size: 15px !important;
                text-align: left !important;
                margin-bottom: 18px !important;
                line-height: 1.6 !important;
                text-shadow: none !important;
            }
            body h2 a {
                color: #c0c6d0 !important;
                text-decoration: none !important;
                font-size: 15px !important;
                text-shadow: none !important;
                border-bottom: 1px solid #353a45 !important;
                transition: border-color 0.15s, color 0.15s !important;
            }
            body h2 a:hover {
                color: #ffffff !important;
                border-bottom-color: #8a92a0 !important;
            }

            body input[type="text"] {
                background: #121317 !important;
                border: 1px solid #262a33 !important;
                padding: 12px 16px !important;
                width: 100% !important;
                max-width: 360px !important;
                border-radius: 4px !important;
                color: #e3e5e8 !important;
                font-size: 14px !important;
                font-family: inherit !important;
                outline: none !important;
                box-shadow: none !important;
                transition: border-color 0.15s !important;
            }
            body input[type="text"]::placeholder {
                color: #5f6672 !important;
                font-weight: 300 !important;
            }
            body input[type="text"]:focus { border-color: #4b5261 !important; }

            body #lolbutton {
                background: #16181d !important;
                border: 1px solid #282c35 !important;
                color: #b0b6c0 !important;
                padding: 12px 22px !important;
                font-size: 13px !important;
                font-weight: 400 !important;
                border-radius: 4px !important;
                cursor: pointer !important;
                font-family: inherit !important;
                margin-left: 10px !important;
                max-width: 200px !important;
                white-space: nowrap !important;
                box-shadow: none !important;
                transition: background 0.15s, border-color 0.15s, color 0.15s !important;
            }
            body #lolbutton:hover {
                background: #1f2229 !important;
                border-color: #3d424d !important;
                color: #e3e5e8 !important;
            }

            /* SECTIONS */
            body .letter-section {
                margin-bottom: 36px !important;
                padding: 0 !important;
                max-width: 100% !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
                min-height: 40px !important;
            }
            body .letter-section.empty { opacity: 0.4 !important; }

            body .letter-header {
                color: #ffffff !important;
                font-size: 18px !important;
                font-weight: 500 !important;
                letter-spacing: 0.2px !important;
                margin-bottom: 14px !important;
                padding-bottom: 8px !important;
                text-shadow: none !important;
                border-bottom: 1px solid #252830 !important;
            }

            body .buttons-container {
                display: flex !important;
                flex-direction: column !important;
                gap: 8px !important;
                align-items: flex-start !important;
            }

            body .empty-message {
                color: #5f6672 !important;
                font-style: normal !important;
                text-align: left !important;
                padding: 12px 0 !important;
                font-size: 14px !important;
            }

            body input[type="button"] {
                background: #121317 !important;
                border: 1px solid #23262e !important;
                padding: 12px 18px !important;
                font-size: 14px !important;
                font-weight: 400 !important;
                border-radius: 4px !important;
                cursor: pointer !important;
                width: 100% !important;
                max-width: 520px !important;
                color: #cfd2d9 !important;
                text-align: left !important;
                font-family: inherit !important;
                letter-spacing: 0.1px !important;
                box-shadow: none !important;
                transition: background 0.15s, border-color 0.15s !important;
            }
            body input[type="button"]:hover {
                background: #1a1d23 !important;
                border-color: #3a3f4b !important;
                color: #ffffff !important;
                transform: none !important;
                box-shadow: none !important;
            }
            body input[type="button"]:active {
                background: #0f1114 !important;
                transform: none !important;
                box-shadow: none !important;
            }

            @media (max-width: 768px) {
                body .sidebar { width: 56px !important; padding: 12px 5px !important; }
                body .sidebar-btn { padding: 8px 0 !important; font-size: 12px !important; min-height: 36px !important; }
                body .main-content { margin-left: 56px !important; padding: 20px 16px 48px 16px !important; }
                body h1 { font-size: 22px !important; }
                body input[type="button"] { max-width: 100% !important; }
            }
        `;

        styleTag = document.createElement('style');
        styleTag.id = STYLE_TAG_ID;
        styleTag.textContent = css;
        document.head.appendChild(styleTag);
    };

    // ---------- REMOVE ----------
    const remove = () => {
        if (!styleTag) return;

        styleTag.remove();
        styleTag = null;

        // Restore original stylesheets in their original positions
        removedSheets.forEach(({ el, parent, next }) => {
            try {
                if (next && next.parentNode === parent) {
                    parent.insertBefore(el, next);
                } else {
                    parent.appendChild(el);
                }
            } catch (e) {
                console.warn('[minimalist-override] restore sheet failed', e);
            }
        });
        removedSheets.length = 0;

        // Restore inline styles
        strippedInlineStyles.forEach(({ el, value }) => {
            if (el && el.parentNode && value !== null) {
                el.setAttribute('style', value);
            }
        });
        strippedInlineStyles.length = 0;
    };

    // ---------- REGISTER ----------
    if (!window.UGSModules) window.UGSModules = {};
    window.UGSModules[MODULE_ID] = { id: MODULE_ID, apply, remove };

    // Apply immediately
    apply();

    // Expose for manual control
    window.UGSMinimalistOverride = { apply, remove };
})();
