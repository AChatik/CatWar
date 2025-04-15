// ==UserScript==
// @name         Расческа
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Делает взаимодействие с сайто мприятнее
// @author       PIPos
// @updateURL    https://raw.githubusercontent.com/AChatik/CatWar/main/Расческа.js
// @downloadURL  https://raw.githubusercontent.com/AChatik/CatWar/main/Расческа.js
// @match        https://catwar.net/cw3/
// @icon         https://catwar.net/cw3/things/3611.png
// @grant        none
// @license      MIT
// @contributionURL https://catwar.net/cat1646323
// @supportURL https://catwar.net/cat1646323
// @homepageURL https://github.com/AChatik/CatWar
// @copyright 2025, PIPos (https://github.com/AChatik)


// ==/UserScript==

// ==/OpenUserJS==
// @author PIPos
// ==/OpenUserJS==

(function() { 'use strict'; })(); //это че ваще

var settings = {
  SmoothEverything: true,
  SmoothTime: 0.2
};

const inject_CSS =`

a {
  display: inline-block; 
  border: 2px solid transparent;
  border-radius: 5px; 
  transition: ${settings['SmoothTime']}s ease; 
  text-decoration: none; 
  color: inherit;
}

a:hover {
  background-color: #ffffff22;
}

div.skill:hover, div.parameter:hover, .move_name:hover {
  scale: 1.05;
}

.move_name:hover {
  opacity: 130%;
  -webkit-box-shadow: 0px 0px 10px 4px rgba(255, 255, 255, 0.15);
  -moz-box-shadow: 0px 0px 10px 4px rgba(255, 255, 255, 0.15);
  box-shadow: 0px 0px 10px 4px rgba(255, 255, 255, 0.15);
}

${settings['SmoothEverything'] ? '* {transition: '+settings["SmoothTime"]+'s ease;}' : ''}

a:hover {
  border-radius: 8px;
  background-color: #FFFFFF33;
}

.move_name {
  cursor: pointer;
}

button {
  padding: 5px,0px,5px,0px;
  border-radius: 7px;
  cursor: pointer;
}
`;

function inject() {
    var head = document.querySelector("head");
    var styleNode = document.createElement("style");
    styleNode.innerHTML = inject_CSS;
    head.appendChild(styleNode)
}
inject();
