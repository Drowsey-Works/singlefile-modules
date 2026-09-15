// ============================================
// MODULE: Minimalist Override
// Completely restyles the site into a clean
// dark minimalist theme. Safe to toggle on/off
// and does NOT affect the UGS module loader UI.
// ============================================

(function() {
    const MODULE_ID = 'minimalist-override';
    const STYLE_TAG_ID = 'minimalist-override-style';

    // Protection selectors: elements matching these are NEVER touched
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
        '#ugs-module-loader-styles'
    ].join(', ');

    // Track our injected style tag so we can remove it on destroy
    let styleTag = null;

    // Track inline styles we stripped so we can restore them on destroy
    const strippedInlineStyles = [];

    // ---------- APPLY ----------
    const apply = () => {
        if (styleTag) return; // already applied

        // 1. Save & strip existing <link rel="stylesheet"> and <style> tags
        //    EXCEPT our own module loader styles.
        const removedSheets = [];
        document.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => {
            if (el.id === 'ugs-module-loader-styles') return;
            if (el.id === STYLE_TAG_ID) return;
            // Remember position for restore
            removedSheets.push({
                el,
                parent: el.parentNode,
                next: el.nextSibling
            });
            el.remove();
        });

        // 2. Save & strip inline styles, skipping protected elements and their descendants
        document.querySelectorAll('[style]').forEach(el => {
            if (el.closest(PROTECTED_SELECTORS)) return;
            strippedInlineStyles.push({
                el,
                value: el.getAttribute('style')
            });
            el.removeAttribute('style');
        });

        // 3. Inject the minimalist stylesheet — scoped so it can't hit loader UI
        const css = `
            /* === Minimalist Override === */
            body *:not(.ugs-ml-wrap):not(.ugs-ml-wrap *) {
                /* Reset everything first, then re-apply below */
            }

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
            .sidebar {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
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
            }
            .sidebar::-webkit-scrollbar { width: 3px !important; }
            .sidebar::-webkit-scrollbar-track { background: #0a0b0d !important; }
            .sidebar::-webkit-scrollbar-thumb { background: #2a2d34 !important; }

            .sidebar-btn {
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
            }
            .sidebar-btn:hover { background: #1f2229 !important; border-color: #3a3f4b !important; }
            .sidebar-btn.empty { opacity: 0.3 !important; cursor: default !important; background: #121317 !important; border-color: #1b1d23 !important; }
            .sidebar-btn.empty:hover { background: #121317 !important; border-color: #1b1d23 !important; }

            /* MAIN CONTENT */
            .main-content {
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
            }
            body h2 a {
                color: #c0c6d0 !important;
                text-decoration: none !important;
                font-size: 15px !important;
                border-bottom: 1px solid #353a45 !important;
                transition: border-color 0.15s, color 0.15s !important;
            }
            body h2 a:hover { color: #ffffff !important; border-bottom-color: #8a92a0 !important; }

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
                transition: border-color 0.15s !important;
            }
            body input[type="text"]::placeholder { color: #5f6672 !important; font-weight: 300 !important; }
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
                transition: background 0.15s, border-color 0.15s, color 0.15s !important;
            }
            body #lolbutton:hover { background: #1f2229 !important; border-color: #3d424d !important; color: #e3e5e8 !important; }

            /* SECTIONS */
            .letter-section {
                margin-bottom: 36px !important;
                padding: 0 !important;
                max-width: 100% !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
                min-height: 40px !important;
            }
            .letter-section.empty { opacity: 0.4 !important; }

            .letter-header {
                color: #ffffff !important;
                font-size: 18px !important;
                font-weight: 500 !important;
                letter-spacing: 0.2px !important;
                margin-bottom: 14px !important;
                padding-bottom: 8px !important;
                border-bottom: 1px solid #252830 !important;
            }

            .buttons-container {
                display: flex !important;
                flex-direction: column !important;
                gap: 8px !important;
                align-items: flex-start !important;
            }

            .empty-message {
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
                transition: background 0.15s, border-color 0.15s !important;
            }
            body input[type="button"]:hover { background: #1a1d23 !important; border-color: #3a3f4b !important; color: #ffffff !important; }
            body input[type="button"]:active { background: #0f1114 !important; }

            @media (max-width: 768px) {
                .sidebar { width: 56px !important; padding: 12px 5px !important; }
                .sidebar-btn { padding: 8px 0 !important; font-size: 12px !important; min-height: 36px !important; }
                .main-content { margin-left: 56px !important; padding: 20px 16px 48px 16px !important; }
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

        // Remove our stylesheet
        styleTag.remove();
        styleTag = null;

        // Restore inline styles that we stripped
        strippedInlineStyles.forEach(({ el, value }) => {
            if (el && el.parentNode && value !== null) {
                el.setAttribute('style', value);
            }
        });
        strippedInlineStyles.length = 0;

        // Note: we can't perfectly restore the original <link>/<style> tags
        // because we didn't save their references. If you need a true
        // uninstall, the simplest option is to reload the page.
    };

    // ---------- REGISTER WITH LOADER ----------
    // If the UGS module loader is present, register our lifecycle hooks
    // so toggling the switch calls apply() / remove().
    if (!window.UGSModules) window.UGSModules = {};
    window.UGSModules[MODULE_ID] = {
        apply,
        remove,
        id: MODULE_ID
    };

    // Auto-apply immediately when script is loaded (the loader will call
    // remove() when toggled off).
    apply();

    // Provide a global for manual control
    window.UGSMinimalistOverride = { apply, remove };
})();
