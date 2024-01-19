// ==UserScript==
// @name         YouTube Ad-blocker
// @icon         https://www.gstatic.com/youtube/img/branding/favicon/favicon_192x192.png
// @version      2.0
// @description  Removes ads from YouTube videos and pages using Enhancer for YouTube's 'Remove Ads' button.
// @author       AlejandroLHC
// @updateURL    https://github.com/AlejandroLuisHC/yt-adblocker-script/raw/main/script.user.js
// @downloadURL  https://github.com/AlejandroLuisHC/yt-adblocker-script/raw/main/script.user.js
// @match        https://www.youtube.com/*
// ==/UserScript==

(function () {
    'use strict';

    const searchInterval = 50;
    let failCounter = 0;
    let blockCounter = 0;
    let masterSwitch = true;

    function removeAds() {
        const currentURL = window.location.href;

        if (!masterSwitch || !currentURL.includes("youtube.com")) {
            return;
        }

        if (/https:\/\/www\.youtube\.com\/watch\?.*/.test(currentURL)) {
            const adShowing = document.querySelector('.ad-showing');
            const bannerShowing = document.querySelector('#banner');
            const playerAdsShowing = document.querySelector('#player-ads');
            const skipButtonShowing = document.querySelector('#youtube-ad-skip-button');
            const blockMessageShown = document.querySelector('ytd-enforcement-message-view-model');
            const button = document.querySelector('#efyt-not-interested');

            removeElement(bannerShowing);
            removeElement(playerAdsShowing);
            clickElement(skipButtonShowing);

            if (blockMessageShown) {
                navigateHistory();
                blockCounter = blockMessageShown ? blockCounter + 1 : 0;
            }

            if (blockCounter > 10) {
                handleAdBlockerRetry();
            }

            if (adShowing) {
                if (button) {
                    button.click();
                    failCounter = 0;
                } else {
                    handleButtonNotFound();
                }

                if (failCounter > 10) {
                    handleFailedToFindButton();
                }
            }
        }

        if (/https:\/\/www\.youtube\.com\/$/.test(currentURL)) {
            const headAdShowing = document.querySelector('#masthead-ad');
            const adCardShowing = document.querySelector('ytd-ad-slot-renderer');
            const ytAdBanner = document.querySelector('ytd-statement-banner-renderer');

            removeElement(headAdShowing);

            if (adCardShowing || ytAdBanner) {
                const adParent = (adCardShowing || ytAdBanner).parentNode.parentNode;
                removeElement(adParent);
            }
        }
    }

    function removeElement(element) {
        element?.remove();
    }

    function clickElement(element) {
        element?.click();
    }

    function navigateHistory() {
        History.back();
        History.forward();
    }

    function handleAdBlockerRetry() {
        const blocker = window.confirm("Make sure there are no other ad-blockers working on this page.\n\nPress 'OK' to retry.\nPress 'Cancel' to disable the YouTube ad-blocker script for this session.");

        if (blocker) {
            blockCounter = 0;
        } else {
            masterSwitch = false;
        }
    }

    function handleButtonNotFound() {
        console.error(`Failed to find button. Retrying in ${searchInterval} ms`);
        failCounter++;
    }

    function handleFailedToFindButton() {
        const buttonNotFound = window.confirm("Failed to find the 'Remove Ads' button. Please make sure that Enhancer for YouTube is installed.\n\nPress 'OK' to redirect to the installation page.\nPress 'Cancel' to disable the YouTube ad-blocker script for this session.");

        if (buttonNotFound) {
            window.open("https://chrome.google.com/webstore/detail/enhancer-for-youtube/ponfpcnoihfmfllpaingbgckeeldkhle");
            failCounter = 0;
        } else {
            masterSwitch = false;
        }
    }

    function checkUpdate() {
        if (!window.location.href.includes("youtube.com")) {
            return;
        }

        const scriptUrl = 'https://raw.githubusercontent.com/AlejandroLuisHC/yt-adblocker-script/main/script.user.js';

        fetch(scriptUrl)
            .then(response => response.text())
            .then(data => {
                const match = data.match(/@version\s+(\d+\.\d+)/);
                if (match) {
                    handleVersionCheck(parseFloat(match[1]));
                } else {
                    console.error('YouTube ad-blocker script: Unable to extract version from the GitHub script.');
                }
            })
            .catch(error => {
                console.error('YouTube ad-blocker script: Error checking for updates:', error);
            });
    }

    function handleVersionCheck(githubVersion) {
        const currentVersion = parseFloat(GM_info.script.version);

        if (githubVersion > currentVersion) {
            handleUpdateAvailable();
        }
    }

    function handleUpdateAvailable() {
        console.log('YouTube ad-blocker script: A new version is available. Please update your script.');

        if (window.confirm("YouTube ad-blocker script: A new version is available. Please update your script.")) {
            window.open(scriptUrl);
        }
    }

    checkUpdate();
    setInterval(removeAds, searchInterval);
})();
