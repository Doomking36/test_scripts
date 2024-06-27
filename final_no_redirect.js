// ==UserScript==
// @name         Link Redirect and New Tab Confirmation
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Creates a popup window for confirmation when redirecting to external links or opening new tabs
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const trustedDomains = ['youtube.com', 'google.com', 'reddit.com'];
    let lastConfirmedUrl = null;
    let lastConfirmationTime = 0;

    function isExternalOrUntrustedLink(url) {
        const currentDomain = window.location.hostname;
        const linkDomain = new URL(url).hostname;
        return currentDomain !== linkDomain && !trustedDomains.some(domain => linkDomain.includes(domain));
    }

    function truncateUrl(url, maxLength = 50) {
        if (url.length <= maxLength) return url;
        const parsedUrl = new URL(url);
        const domain = parsedUrl.hostname;
        const path = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
        const truncatedPath = path.length > maxLength - domain.length - 4 
            ? path.substr(0, maxLength - domain.length - 4) + '...' 
            : path;
        return domain + truncatedPath;
    }

    function showConfirmationPopup(url, isNewTab = false) {
        return new Promise((resolve) => {
            const popup = document.createElement('div');
            popup.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: white;
                border: 2px solid #ccc;
                padding: 20px;
                z-index: 9999;
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
                max-width: 80%;
                max-height: 80%;
                overflow-y: auto;
                word-wrap: break-word;
            `;

            const truncatedUrl = truncateUrl(url);
            const fullUrlElement = `<div style="font-size: 0.8em; margin-top: 10px; overflow-wrap: break-word;">${url}</div>`;

            popup.innerHTML = `
                <p>This page is trying to ${isNewTab ? 'open a new tab' : 'redirect you'} to:</p>
                <p><strong>${truncatedUrl}</strong></p>
                ${truncatedUrl !== url ? fullUrlElement : ''}
                <p>Do you want to proceed?</p>
                <div style="text-align: center;">
                    <button id="confirmRedirect" style="margin-right: 10px;">Yes</button>
                    <button id="cancelRedirect">No</button>
                </div>
            `;

            document.body.appendChild(popup);

            document.getElementById('confirmRedirect').addEventListener('click', () => {
                document.body.removeChild(popup);
                lastConfirmedUrl = url;
                lastConfirmationTime = Date.now();
                resolve(true);
            });

            document.getElementById('cancelRedirect').addEventListener('click', () => {
                document.body.removeChild(popup);
                resolve(false);
            });
        });
    }

    async function handleRedirect(url, isNewTab = false) {
        if (isExternalOrUntrustedLink(url)) {
            if (url === lastConfirmedUrl && Date.now() - lastConfirmationTime < 5000) {
                return true; // Allow the redirect without confirmation if it was recently confirmed
            }
            return await showConfirmationPopup(url, isNewTab);
        }
        return true;
    }

    // Intercept link clicks
    document.addEventListener('click', async function(e) {
        const link = e.target.closest('a');
        if (link) {
            e.preventDefault();
            e.stopPropagation();
            const isNewTab = link.target === '_blank' || e.ctrlKey || e.metaKey;
            if (await handleRedirect(link.href, isNewTab)) {
                if (isNewTab) {
                    window.open(link.href, '_blank');
                } else {
                    window.location.href = link.href;
                }
            }
        }
    }, true);

    // Intercept form submissions
    document.addEventListener('submit', async function(e) {
        const form = e.target;
        e.preventDefault();
        e.stopPropagation();
        if (await handleRedirect(form.action)) {
            form.submit();
        }
    }, true);

    // Override window.open
    const originalOpen = window.open;
    window.open = async function(url, name, features) {
        if (await handleRedirect(url, true)) {
            return originalOpen.call(window, url, name, features);
        }
        return null;
    };

    // Override location changes
    ['assign', 'replace', 'href'].forEach(prop => {
        let original = window.location[prop];
        Object.defineProperty(window.location, prop, {
            set: async function(url) {
                if (await handleRedirect(url)) {
                    original.call(this, url);
                }
            }
        });
    });

    // Intercept history API
    ['pushState', 'replaceState'].forEach(method => {
        let original = history[method];
        history[method] = async function(state, title, url) {
            if (!url || await handleRedirect(url)) {
                original.call(this, state, title, url);
            }
        };
    });
})();

