// ==UserScript==
// @name         YouTube ad-blocker
// @icon         https://www.gstatic.com/youtube/img/branding/favicon/favicon_192x192.png
// @version      1.2
// @description  Removes ads from YouTube videos and pages by using Enhancer for YouTube's 'Remove Ads' button.
// @author       AlejandroLHC
// @updateURL    https://github.com/AlejandroLuisHC/yt-adblocker-script/raw/main/script.user.js
// @downloadURL  https://github.com/AlejandroLuisHC/yt-adblocker-script/raw/main/script.user.js
// @match        https://www.youtube.com/*
// ==/UserScript==

(function () {
    'use strict';

    const searchInterval = 50;
    let failCounter = 0;
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
            const button = document.querySelector('#efyt-not-interested');

            bannerShowing?.remove();
            playerAdsShowing?.remove();
            skipButtonShowing?.click();

            if (adShowing) {
                if (button) {
                    button.click();
                    failCounter = 0;
                } else {
                    console.error(`Failed to find button. Retrying in ${searchInterval} ms`);
                    failCounter++;
                }

                if (failCounter > 10) {
                    const buttonNotFound = window.confirm("Failed to find the 'Remove Ads' button. Please make sure that Enhancer for YouTube is installed.\n\nPress 'OK' to redirect to the installation page.\nPress 'Cancel' to disable the Bypasser for this session.");

                    if (buttonNotFound) {
                        window.open("https://chrome.google.com/webstore/detail/enhancer-for-youtube/ponfpcnoihfmfllpaingbgckeeldkhle");
                        failCounter = 0;
                    } else {
                        masterSwitch = false;
                    }
                }
            }
        }

        if (/https:\/\/www\.youtube\.com\/.*/.test(currentURL)) {
            const headAdShowing = document.querySelector('#masthead-ad');
            const adCardShowing = document.querySelector('ytd-ad-slot-renderer');
            const ytAdBanner = document.querySelector('ytd-statement-banner-renderer');

            headAdShowing?.remove();

            if (adCardShowing || ytAdBanner) {
                const adParent = (adCardShowing || ytAdBanner).parentNode.parentNode;
                adParent?.remove();
            }
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
                    const githubVersion = parseFloat(match[1]);
                    const currentVersion = parseFloat(GM_info.script.version);

                    if (githubVersion > currentVersion) {
                        console.log('YouTube ad-blocker script: A new version is available. Please update your script.');

                        if (window.confirm("YouTube ad-blocker script: A new version is available. Please update your script.")) {
                            window.open(scriptUrl);
                        }
                    }
                } else {
                    console.error('YouTube ad-blocker script: Unable to extract version from the GitHub script.');
                }
            })
            .catch(error => {
                console.error('YouTube ad-blocker script: Error checking for updates:', error);
            });
    }

    checkUpdate();
    setInterval(removeAds, searchInterval);
})();
