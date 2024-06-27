// ==UserScript==
// @name         Remove Radio Content
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Removes the radio content div from the page
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to remove the element
    function removeRadioContent() {
        const radioContent = document.getElementById('radio_content');
        if (radioContent) {
            radioContent.remove();
        }
    }

    // Run the function when the page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeRadioContent);
    } else {
        removeRadioContent();
    }

    // Also run the function periodically in case the content is added dynamically
    setInterval(removeRadioContent, 1000);
})();

