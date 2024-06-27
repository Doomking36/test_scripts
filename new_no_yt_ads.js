// ==UserScript==
// @name         Remove YouTube In-Feed Ad Layout and Rich Item Renderer Ads
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Removes the in-feed ad layout and rich item renderer ads from YouTube pages
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function removeAdLayout() {
        // Remove in-feed ad layout
        const adLayout = document.querySelector('div#fulfilled-layout.style-scope.ytd-ad-slot-renderer');
        if (adLayout) {
            adLayout.remove();
            console.log('In-feed ad layout removed');
        }

        // Remove rich item renderer ads
        const richItemRenderers = document.querySelectorAll('ytd-rich-item-renderer.style-scope.ytd-rich-grid-row');
        richItemRenderers.forEach(renderer => {
            const adSlotRenderer = renderer.querySelector('ytd-ad-slot-renderer');
            if (adSlotRenderer) {
                renderer.remove();
                console.log('Rich item renderer ad removed');
            }
        });
    }

    // Run the function immediately
    removeAdLayout();

    // Set up a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                removeAdLayout();
            }
        });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });
})();

