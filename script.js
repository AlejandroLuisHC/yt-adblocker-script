// ==UserScript==
// @name         YouTube ad-blocker
// @icon         https://www.gstatic.com/youtube/img/branding/favicon/favicon_192x192.png
// @version      1.0.0
// @description  Removes ads from YouTube videos and pages by using Enhancer for YouTube's 'Remove Ads' button.
// @author       AlejandroLHC
// @updateURL    https://github.com/AlejandroLuisHC/yt-adblocker-script/raw/main/script.js
// @downloadURL  https://github.com/AlejandroLuisHC/yt-adblocker-script/raw/main/script.js
// @match        https://www.youtube.com/*
// ==/UserScript==

(function () {
    'use strict';

    var searchInterval = 200
    var failCounter = 0;
    var masterSwitch = true;

    function removeAds() {
        const currentURL = window.location.href;
        if (masterSwitch) {
            if (/https:\/\/www\.youtube\.com\/watch\?.*/.test(currentURL)) {
                const adShowing = document.querySelector('.ad-showing');
                const bannerShowing = document.querySelector('#banner');
                const playerAdsShowing = document.querySelector('#player-ads');
                const button = document.querySelector('#efyt-not-interested');

                if (bannerShowing) {
                    bannerShowing.remove();
                }

                if (playerAdsShowing) {
                    playerAdsShowing.remove();
                }

                if (adShowing) {
                    if (button) {
                        button.click();
                        failCounter = 0;
                    }
                    else {
                        console.error("Failed to find button. Retrying in ", searchInterval, " ms");
                        failCounter = failCounter + 1;
                    }
                    if (failCounter > 10) {
                        var buttonNotFound = window.confirm("Failed to find the 'Remove Ads' button. Please make sure that Enhancer for YouTube is installed.\n\nPress 'OK' to redirect to the installation page.\nPress 'Cancel' to disable the Bypasser for this session.");
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
                const adCardShowing = document.querySelector('ytd-ad-slot-renderer')
                const ytAdBanner = document.querySelector('ytd-statement-banner-renderer');

                if (headAdShowing) {
                    headAdShowing.remove();
                }

                if (adCardShowing) {
                    const adParent = adCardShowing.parentNode.parentNode;
                    adParent.remove();
                }

                if(ytAdBanner) {
                    const adParent = ytAdBanner.parentNode.parentNode;
                    adParent.remove();
                }
            }
        }
    }
    setInterval(removeAds, searchInterval);
})();
