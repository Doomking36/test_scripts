// ==UserScript==
// @name         Remove Head Slider and Header
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Removes the head slider and specific header from the website
// @match        https://www.mgeko.cc/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to remove elements
    function removeElements() {
        // Remove head slider
        const headSlider = document.querySelector('.head-slider-top');
        if (headSlider) {
            headSlider.remove();
        }

        // Remove specific header
        const header = document.querySelector('header#header');
        if (header) {
            header.remove();
        }
    }

    // Run the function when the page loads
    window.addEventListener('load', removeElements);

    // Also run the function immediately in case the page has already loaded
    removeElements();

    // Set up a MutationObserver to watch for dynamically added elements
    const observer = new MutationObserver(removeElements);
    observer.observe(document.body, { childList: true, subtree: true });
})();

