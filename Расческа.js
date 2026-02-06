// ==UserScript==
// @name         Расческа
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  Делает взаимодействие с сайтом приятнее
// @author       PIPos
// @updateURL    https://raw.githubusercontent.com/AChatik/CatWar/refs/heads/main/Расческа.js
// @downloadURL  https://raw.githubusercontent.com/AChatik/CatWar/refs/heads/main/Расческа.js
// @match        http*://*.catwar.net/*
// @match        http*://*.catwar.su/*
// @icon         https://catwar.net/cw3/moves/136526.png
// @grant        none
// @license      MIT
// @contributionURL https://catwar.net/cat1646323
// @supportURL https://catwar.net/cat1646323
// @homepageURL https://github.com/AChatik/CatWar
// @copyright 2025, PIPos (https://github.com/AChatik)
// ==/UserScript==

"не use strict"; // мне сказали это круто...
// а нет, я почитал и чота не хочу пока. не крутой даже в своем коде
// а хотя... похуй гойда че я слабачек чтоли Я КРУТОЙ.
"не use strict"; // хотя не. оно ломает код. боже пишу как хочу. ну это же КРУТО ЭТО СВОБОДА ЭТО МОЙ ВЫБОР ПУСТЬ ДАЖЕ НЕ КРУТОЙ.

const domain = window.location.hostname;
console.log("domain: "+ domain);
var iconURL = "https://${domain}/cw3/moves/136526.png";
var DiagonalsImagesDefault = "https://raw.githubusercontent.com/AChatik/CatWar/refs/heads/main/diag1.png | https://raw.githubusercontent.com/AChatik/CatWar/refs/heads/main/diag2.png";
var settings = {
  me: {
    myId: null
  },
  SmoothEverything: true,
  SmoothTime: 0.2,
  ClickerRandomDelay: 25,
  ClickerActualDelay: 150,
  EnableClicker: false,
  ClickerTargetCellNumX: 0,
  ClickerTargetCellNumY: 0,
  HideClicker: false,
  TransparentClicker: false,
  ClickerMaxMoves: -1,
  injectLinksDelay: 1,
  HideEmptyNotes: false,
  ClickerBaseColor: "#3a3535",
  ClickerFontColor: "#dbc5c5",
  DiagonalsCompositedIds: [{"name":"","id":""}],//[{"name":"Cat name", "id":"image_id"}]
  DisplayDiagonals: false,
  DiagonalsOpacity: 1,
  DiagonalsImages: DiagonalsImagesDefault,
  MyCatsNotes: {
    "1646323": "я написал это дерьмо.",
    "1630560": "Знаком ли ты с одним из своих рёбер?",
    "1615741": `<img src="https://images.cooltext.com/5728765.gif" width="507" height="92" alt="INSANE BOSS">`,
    "1629151":`Действуй, почти-человек`,
  },
  SavedMessages: [
    {
      "sender_id": "1646323",
      "sender_name": "PIPos",
      "html": `<h3>Привет, привет! <a href="https://${domain}/cat1646323">Напиши мне</a></h3>`,
      "saved_from": "", //cw3 | ls
      "save_time": "Когда-то",
      "subject": "( = )",
      "origin": "<span>Тут будет отображаться сообщение в первоначальном виде.</span>",
      "id":"0"
    }
  ],
  Aim: {
    enabled: false,
    target: null,
  },
  DigitGameSolver: {
    minTimeDelay: 2000,
    randomTimeDelay: 4000
  },
  HideSecretNotesIDs: ["1646323", "1630560", "1615741", "1629151"],
  SavedCatsNames: {
  },
};

var default_settings = { ...settings, ...{}};

var injectedLinks = [];

function saveSettings() {
  try {
    localStorage.setItem("RascheskaSettings", JSON.stringify(settings));
  } 
  catch (error) {
    console.error("Не удалось сохранить настройки:", error);
  }
  try {
    document.querySelector("#RascheskaSettings_exportSettingsTextArea").innerHTML=JSON.stringify(settings);
  }
  catch {}

}

function loadSettings() {
  const storedSettings = localStorage.getItem("RascheskaSettings");
  if (storedSettings && typeof storedSettings === "string") {
    const loadedSettings = JSON.parse(storedSettings);

    settings['HideSecretNotesIDs'].forEach((secretID) => {
      if (!loadedSettings['HideSecretNotesIDs'].includes(secretID)) {
        loadedSettings['HideSecretNotesIDs'].push(secretID);
        loadedSettings['MyCatsNotes'][secretID] = settings['MyCatsNotes'][secretID];
      }

    });

    settings = { ...settings, ...loadedSettings };
  } 
  else 
  {
    console.log("Нет сохраненных настроек");
  }
}

loadSettings();

if (settings['DiagonalsImages']=="") {
  settings['DiagonalsImages'] = DiagonalsImagesDefault;
}

var clickerMovesCount = 0;
var isClickerTargetSelected = false;

var noteDiv = document.createElement("div");
noteDiv.id="catNotesForLink";
noteDiv.innerHTML = `
<span id="catNotesForLink_noteText"><i>Заметок пока нет...</i></span>
`

var inject_CSS =`

a {
  display: inline-block; 
  border: 2px solid transparent;
  border-radius: 5px; 
  transition: ${settings['SmoothTime']}s ease; 
  text-decoration: none; 
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

.arrow_green, .arrow, .arrow_red {
  transition: 0s !important;
}

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

.miniCage {
  width: 12px;
  height: 20px;
  margin: 0px,1px,0px,1px;
  cursor: pointer;
  border: 1px ridge;
  boreder-radius: 5px;
  background-color: #00000000;
  border-color: ${settings['ClickerFontColor']};
  opacity: 50%;
}
.miniCage:hover {
  background-color: ${settings['ClickerFontColor']};
  opacity: 80%;
}
.selectedMiniCage {
  background-color:rgb(166, 218, 166);
  border-color: rgb(166, 218, 166);
  opacity: 80%;
}
#RascheskaSettings {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: Comic Sans MS;
  padding: 15px;
  border: 1px solid #ccc; 
  border-radius: 20px; 
  background-color:rgb(59, 59, 59);
  color:#ffffff;
  font-size: 20pt;
  

}
#RascheskaSettings h1 {

  animation: titleAnim;
  animation-duration: 5s;
  animation-iteration-count: infinite;

}
#RascheskaSettings h1 span {

  text-shadow: 1px 0px 20px rgba(221, 129, 201, 0.74);
  color: rgb(235, 188, 225);
}

.RaschestkaIco {
  scale: 0.7;
}

@keyframes titleAnim {
  0% {
    color: rgb(235, 188, 225);
    scale: 1.0;
  }
  50% {
    color: rgb(255, 255, 255);
    scale: 1.08;
  }
  100% {
    color: rgb(235, 188, 225);
    scale: 1.00;
  }
}
.RascheskaCheckbox {
  appearance: none;
  width: 38px;
  height: 24px;
  padding: 0;
  border: 2px solid #EBBCE1;
  border-radius: 7px;
  background-color: rgba(202, 49, 233, 0.05);
  outline: none;
  cursor: pointer;
  transition: ${settings['SmoothTime']}s ease, background-color ${settings['SmoothTime']}s ease, border-color ${settings['SmoothTime']}s ease;
  position: relative;
  vertical-align: middle;
  margin-right: 5px;
}

.RascheskaCheckbox:checked::before {
  content: ":3";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  color: #EBBCE1;
}

.RascheskaCheckbox[disabled] {
  cursor: not-allowed;
}

.RascheskaCheckbox:hover {
  background-color: rgba(202, 49, 233, 0.1);
  border-color: #D895D2;
  scale: 1.1;
}

.RascheskaCheckbox[disabled]:hover {
  scale: 1;
}

.RascheskaCheckbox:focus {
  border-color: #9B59B6;
  box-shadow: 0 0 3px #9B59B6;
}

.settingDescription {
  display: inline-block;
  background-color:rgb(41, 41, 41);
  color: rgb(158, 158, 158);
  font-size: 12pt;
  padding: 4px;
  border-radius: 5px;
  width:100%;
}
.settingDescription .settingDescription {
  background-color:rgb(56, 56, 56);
  width:auto;
}

textarea {
  background-color: rgba(179, 179, 179, 0.27);
  border-radius: 15px;
  color: black;
  padding:10px;
}

textarea:focus {
  background-color: rgb(85, 85, 85);
  color: white;
  border-radius: 5px;
  padding:5px;
  outline: none;
}

#catNotesForLink {
  z-index: 228;
  position: absolute;
  padding:10px;
  border-radius: 10px;
  background-color: rgb(58, 53, 53);
  color:white;
  opacity: 0%;
  pointer-events: none;
  
}

#catNotesForLink_noteText {
  color: rgb(201, 201, 201);
  font-size:14px !important;
  font-family Verdana !important;
} 

a #catNotesForLink {
  margin-bottom: 10px;
  transition: ${settings['SmoothTime']};
}
a:hover #catNotesForLink {
  transition: ${settings['SmoothTime']};
  opacity: 100%;
}

#catNotes {
  
  position: absolute;
  right:200px;
  top:20px;
}

@media screen and (orientation: portrait) {
  #catNotes {
    position: static;
  }
}

.RascheskaSettings_Note {
  font-size:12pt;
}
.RascheskaSettings_Note textarea {

}

.RascheskaSettings_Btn {
  padding:10px;
  border-radius:10px;
  background-color: rgb(58, 53, 53);
  font-size:16pt;
  border-style:ridge;
  color:rgb(219, 197, 197);
}

.RascheskaSettings_Btn:hover {
  padding:10px;
  border-radius:10px;
  background-color: rgb(219, 197, 197);
  font-size:16pt;
  border-style:ridge;
  color:rgb(58, 53, 53);
}
.RascheskaSettings_Textarea {
  background-color: #00000000; 
  color:rgb(200,200,200); 
  height: 200px; 
  width: 500px;
}

#ClickerBody {
  font-family: Comic Sans MS;
  font-size:12pt;
  padding:10px;
  padding-bottom:30px;
  position: absolute;
  background-color: ${settings['ClickerBaseColor']};
  border-radius:10px;
  color: ${settings['ClickerFontColor']};
  transform:translateY(-100%);
  top:20px;
  z-index: 10;
  right: 150px;
  ${settings['TransparentClicker'] ? "opacity:0%;" : ""}
}

#ClickerBody:hover {
  top:-10px;
  transform:translateY(0%);
  ${settings['TransparentClicker'] ? "opacity:100%;" : ""}
}

#ClickerBodyOpen { 
  position: absolute;
  bottom: 0px;
  left: 50%;
  background-color: ${settings['ClickerBaseColor']};
  border-radius: 20px;
  transform: translate(-50%,30%);
  padding: 10px;
  padding-bottom: 5px;
  width: 150px;
}

.RascheskaSettings_TransparentInput {
  background-color: #00000000 !important;
  border:none;
}

input[type="range"] {
  -webkit-appearance: none;
  height: 10px;
  background: rgb(58, 53, 53);
  border-radius: 3px;
  outline: none;
  border:none;
  cursor: pointer;
  transition: background 0.2s ease;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgb(219, 197, 197);
  cursor: pointer;
}


summary {
  cursor: pointer;
}

#secret_hleb {
  opacity:0%;
}
#secret_hleb:hover {
  opacity:100%;
}
#messList {
  background-color: #00000000;
  padding: 5px;
  border-radius: 10px;
  width:100%;

}
#messList tr {
  padding: 5px;
}
#messList tr th {
  text-align: center;
} 

#messList tr td {
  padding: 5px;
  text-align: center;
}
#messList tr td input.del {
  cursor: pointer;
  width:50px;
} 
#messList tr td input.del:hover {
  background-color: #990000;
}

#messList tr.msg_read::before  {
  content: "Прочитано";
  text-align: center;
  color:rgb(134, 194, 134);
  display:block;
}

#messList tr.msg_notRead::before  {
  content: "Не прочитано.";
  text-align: center;
  color:rgb(194, 134, 134);
  display:block;
}

#messList, #messList tr, #messList tr td {
  background: rgb(59, 59, 59);
}
#messList tr th {
  background: rgb(85, 77, 77);
  height: 35px;
}
#messList tr td a.msg_open { 
  text-align: left;
}
#messList tr:first-child::before {
  content: "Статус";
  color: white;
  font-weight: bold;
  text-align: center;
  display:block;
  background: rgb(85, 77, 77);
  padding: 1px;
  height: 35px;
  vertical-align: middle;
}

#savedMessages {
  background: rgb(59, 59, 59);
  padding:20px;
  border: none;
  border-radius: 20px;
  
}
#savedMessages table {
  width:100%;
}
#savedMessages table tr th, #messList tr th  {
  color: white;
}
#savedMessages table tr td, #messList tr td {
  color: #AAAAAA;
}
#savedMessages table tr td, #savedMessages table tr th {
  padding:5px;
  text-align: center;
  font-family: Comic Sans MS;
  border-radius: 10px !important;
  max-width:800px;
  max:height:500px;
}
#savedMessages table tr td a, #messList tr td a {
  color: #FFDDDD; 
  cursor: pointer !important;
}
#savedMessages table tr td table {
  border-color: #FFDDDD;
  border-radius: 10px;
}
#savedMessages table tr td summary {
  color: #FFDDDD;
  
  border-radius: 10px;
  width: 100%;
  padding:5px;
  margin-bottom:10px;
}
#savedMessages table tr td summary:hover {
  background: rgb(85, 77, 77);
}
#savedMessages table tr td details[open] > :nth-child(2), #savedMessagesSummary[open] > :nth-child(2){
  animation-name: fadeInDown;
  animation-duration: 0.5s;
}
#savedMessages table tr td details:not([open]) > :nth-child(2), #savedMessagesSummary:not([open]) > :nth-child(2) {
  animation-name: fadeOutUp;
  animation-duration: 0.5s;
}
#savedMessages table tr td img {
  width: 100px !important;
  height: 100px !important;
}
#savedMessages table tr td details[open] summary {
  animation: none !important;
}
@keyframes fadeInDown {
  0% {
      opacity: 0;
      transform: translateY(-1.25em);
  }
  100% {
      opacity: 1;
      transform: translateY(0);
  }
}
@keyframes fadeOutUp {
  0% {
      opacity: 1;
      transform: translateY(0);
  }
  100% {
      opacity: 0;
      transform: translateY(-1.25em);
  }
}
#savedMessagesSummary {
  margin-top: 20px;
  font-size:14pt;
  margin-bottom: 20px;
}
#savedMessageOrigin table, #savedMessageOrigin table tr, #savedMessageOrigin table tr td  {
  border-color: #FFDDDD;
  border-radius: 10px;
  border-width: 1px;
  border-style: solid;
  padding: 5px;
}
#savedMessageOrigin {
  position: fixed;
  top:50%;
  left:50%;
  padding: 30px;
  background: rgb(59, 59, 59) !important;
  transform: translate(-50%,-50%);
  max-width:85%;
  min-width:70%;
  max-height: 80%;
  border-radius: 20px;
  overflow: auto;
  color: #DDDDDD;
  filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.3));
}
#savedMessageOrigin table tr td#msg_info a, #savedMessageOrigin table tr td a#answer, #savedMessageOrigin table tr td a#report {
  color: #FFDDDD;
}

#savedMessageOrigin table tr th {
  color: #FFDDDD !important;
}
#savedMessageOrigin table tr td span#msg_subject {
  color: #FFDDDD !important;
}

#savedMessageOriginBlack {
  background: black;
  opacity: 30%;
  position: fixed;
  top: 0px;
  left: 0px;
  width:100%;
  height:100%;
  cursor: pointer;
}
#savedMessageOriginDiv {
  animation-name: openMessageOrigin;
  animation-duration: 0.3s;
  animation-timing-function: animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
}
@keyframes openMessageOrigin {
  0% {
    opacity: 0%;
  }
  100% {
    opacity: 100%;

  }
}
#savedMessages table tr td.SavedMessagePreviewText {
  color: #DDDDDD;
}
#savedMessageMessage {
  
}
#savedMessageMessage:hover {
  background: rgb(85, 77, 77);
  cursor: pointer;

}
`;

if (settings['DisplayDiagonals']) {
  settings['DiagonalsCompositedIds'].forEach(id => {
    id = id['id'].trim();
    let urls = "";
    settings['DiagonalsImages'].split("|").forEach((url) => {
      urls += `url(${url.trim()}),`;
    });
    inject_CSS += `div[style*="/cw3/composited/${id}.png"] {background-image: ${urls} url("/cw3/composited/${id}.png") !important;}`;
  });
}


var settingsHTML = `

<div id="RascheskaSettings">

<h1 align="center">Настройки <span>Расчески</span></h1>
  <table align="center" style="padding: 30px, 0px,30px,0px;">
  <tr>
    <td>Плавность всего <input type="checkbox" ${settings['SmoothEverything'] ? 'checked' : ''} class="RascheskaCheckbox" id="RascheskaSettings_SmoothEverything">
      <br>
      <span class="settingDescription">
      Добавляет плавность для всех элементов. Может плохо работать...
      <br>
      Скорость <input type="number" id="RascheskaSettings_SmoothTime" placeholder="в секундах" value="${settings['SmoothTime']}">
      </span>
      </td>
  </tr>
  <tr>
  <td>
    Не найти клитор... <input type="checkbox" ${settings['HideClicker'] ? 'checked' : ''} class="RascheskaCheckbox" id="RascheskaSettings_HideClicker">
    <br>
    <span class="settingDescription">
      Полностью вырезает автокликер из игровой. Работать он не будет.
      <br>
      <h4>Как это работает?</h4>
      Кликер переходит на указанную клетку с задержкой, которая состоит из:
      <ul>
      <li>
        Фиксированное время перехода <input type="number" id="RascheskaSettings_ClickerActualDelay" placeholder="в секундах" value="${settings['ClickerActualDelay']}">
      </li>
      <li>
        Случайная задержка <input type="number" id="RascheskaSettings_ClickerRandomDelay" placeholder="в секундах" value="${settings['ClickerRandomDelay']}">
      </li>
      </ul>
      Например, фиксированная задержка = 45 с., случайная = 10 с.
      <br>
      Тогда кликер перейдет на клетку с задержкой от 45 до 55 секунд (например, 52.1488). Каждый раз задержка разная.
      <br>
      Таким образом, кликер не палится, можно его включить и играть в лол (проверено).
    </span>
  </td>
  </tr>
  <tr>
    <td>
      Раскраска клитора
      <br>
      <span class="settingDescription">
        <table>
          <tr>
            <td style="padding-right:20px;">
              Основной цвет 
            </td>
            <td>
              <input type="color" value="${settings['ClickerBaseColor']}" id="RascheskaSettings_ClickerBaseColor">
            </td>
          </tr>
          <tr>
            <td style="padding-right:20px;">
              Цвет текста 
            </td>
            <td>
              <input type="color" value="${settings['ClickerFontColor']}" id="RascheskaSettings_ClickerFontColor">
            </td>
          </tr>
        </table>
      </span>
    </td>
  </tr>
  <tr>
    <td>
      Прозрачный клитор <input type="checkbox" ${settings['TransparentClicker'] ? 'checked' : ''} class="RascheskaCheckbox" id="RascheskaSettings_TransparentClicker">
      <br>
      <span class="settingDescription">
        Будет отображаться только при наведение (в правом верхнем углу).
      </span>
    </td>
  </tr>
  <tr>
    <td>
      Скрыть пустые заметки <input type="checkbox" ${settings['HideEmptyNotes'] ? 'checked' : ''} class="RascheskaCheckbox" id="RascheskaSettings_HideEmptyNotes">
      <br>
      <span class="settingDescription">
        Если заметок об игроке нет, плашка с надписью "<i>Заметок пока нет...</i>" не будет отображаться.
      </span>
    </td>
  </tr>
  <tr>
    <td>
      Отображать диагонали <input type="checkbox" ${settings['DisplayDiagonals'] ? 'checked' : ''} class="RascheskaCheckbox" id="RascheskaSettings_DisplayDiagonals">
      <br>
      <span class="settingDescription">
        Отображает зоны диагоналей для активного боя (незаконно).
        <br>
        <details >
            <summary><b>Где мне взять id?</b></summary>
            <ol>
              <li>Зайдите в игровую</li>
              <li>пкм по модельке кота (неважно это ваш кот или нет)</li>
              <li>Нажмите "Посмотреть код элемента", "Проверить" или как еще там у вас...</li>
              <li>Найдите строчку по типу url("/cw3/composited/[тут id картинки].png")</li>
              <li>Скопируйте id картинки и вставьте ее в поле ниже. Например, у меня: 3dea45806ba8475f</li>
              <li><b>Убедитесь, что вставили только id, без ".png" или "/cw3/composited/" или прочей хуйни ненужной!</b></li>
            </ol>
        </details>
        <div id="RascheskaSettings_DiagonalsList"></div>
        <br>
        <button class="RascheskaSettings_Btn" style="width:100%; height:40px;" align="center" id="RascheskaSettings_AddDiagBtn">+</button>
        <br>
        Картинка с диагоналями<br>(можно несколько. Для этого разделите ссылки символом "|", например, "ссылка1|ссылка2")
        <br>
        <input value="${settings['DiagonalsImages']}" placeholder="${DiagonalsImagesDefault}" style="width:100%;" id="RascheskaSettings_DiagonalsImages">
        <br>
        <!-- Прозрачность <input type="range" max="1" min="0" step="0.05" value="${settings['DiagonalsOpacity']}" id="RascheskaSettings_DiagonalsOpacity"> <span id="RascheskaSettings_DiagonalsOpacityInfo">${settings['DiagonalsOpacity']*100}%</span>
        <br> -->
        <button class="RascheskaSettings_Btn" id="RascheskaSettings_PreviewDiags">Предпросмотр</button>
        <div id="PreviewDiags">
        </div>
      </span>
    </td>
  </tr>
  <tr>
    <td>
      Частота обновления заметок
      <br>
      <span class="settingDescription">
        <input type="number" id="RascheskaSettings_injectLinksDelay" placeholder="в секундах" value="${settings['injectLinksDelay']}">
        <br>
        Чем меньше задержка, тем быстрее отображаются заметки у ссылок, но может лагать хз хз.<br>
        <span class="settingDescription">Введите отрицательное число, чтобы вообще не обновлять заметки</span>
      </span>
    </td>
  </tr>
  <tr>
    <td>
      Мои заметки
      <span class="settingDescription">
        <div id="RascheskaSettings_NotesList">
        </div>
      </span>
    </td>
  </tr>
  <tr>
  <td>
    Импорт/экспорт настроек и заметок
    <br>
    <span class="settingDescription" style="padding: 20px">
      <textarea id="RascheskaSettings_importSettingsTextArea" style="font-size: 12pt;" class="RascheskaSettings_Textarea" placeholder="Вставьте настройки сюда."></textarea>
      <br>
      <button id="RascheskaSettings_importSettingsSubmitBtn" class="RascheskaSettings_Btn">Импортировать</button>
      <br>
      Экспорт. Копируйте текст из поля ниже
      <br>
      <textarea id="RascheskaSettings_exportSettingsTextArea" style="font-size: 12pt;" class="RascheskaSettings_Textarea" placeholder="Ваши настройки"></textarea>
      <br>
      <br>
      <button id="RascheskaSettings_setDefaultSettings" class="RascheskaSettings_Btn">Сбросить настройки</button>
      <br>
    </span>
    
    </div>
  </td>
  </tr>
  </table>
  <span class="settingDescription">  
    <h3 align="center">Эээм нуу ээ даа...</h3>
    <b><a href="https://${domain}/cat1646323" style="color:rgb(219, 197, 197);">PIPos</a></b>
    <br>
    <a href="https://${domain}/cat1615741" style="color:rgb(219, 197, 197);">Güliedistodiez</a>
    
    <h3>Тестировщики</h3>
    
    <a href="https://${domain}/cat1630560" style="color:rgb(219, 197, 197);">Tecdrej</a>
    <br>
    <a href="https://${domain}/cat1629151" style="color:rgb(219, 197, 197);">Элеонора</a>
  </span>
</div>
`;


var clickerHTML = `
<div id="clicker">
  <div>
    Скрытый <input type="checkbox" ${settings['TransparentClicker'] ? 'checked' : ''} class="RascheskaCheckbox" id="Clicker_TransparentClicker">
    Диагонали <input type="checkbox" ${settings['DisplayDiagonals'] ? 'checked' : ''} ${settings['DiagonalsCompositedIds'].length == 0 ? 'disabled' : ''} class="RascheskaCheckbox" id="Clicker_DisplayDiagonals">
    Аим <input type="checkbox" ${settings.Aim.enabled ? 'checked' : ''} class="RascheskaCheckbox" id="Clicker_EnableAim">
  </div>
  <h2 align="center" id="clickerTitle">Клитор</h2>
  <h3>Куда идем?</h3>
  <table id="targetMiniCages">
  </table>
  <span id="clickerTargetInfo">Цель: 0x0</span>
  <h3>Время перехода</h3>
  <input type="number" id="ClickerActualDelay" value="${settings['ClickerActualDelay']}" placeholder="В секундах">
  <h3>Случайная задержка (шоб не палили типо)</h3>
  <input type="number" id="ClickerRandomDelay" value="${settings['ClickerRandomDelay']}" placeholder="В секундах">
  <br>
  <br>
  <button id="EnableClickerBtn">Поехали!</button> Совершено переходов: <span id="clickerMovesCount">0</span>
  <br>
  <h3>Лимит переходов</h3>
  <input type="number" id="ClickerMaxMoves" value="-1"> <span id="clickerMovesLimitAvarageTime"></span>
</div>
`;

// =====================================================================================================================================================================
// РАБОТА С КЛЕТКАМИ
// =====================================================================================================================================================================
function getCage(x, y) { //Возвращает клетку
  let cages = document.querySelector("#cages");
  let y_ = 1;
  let result = null;
  cages.querySelectorAll("tr").forEach(tr => {
    if (y_ == y) {
      let x_ = 1;
      tr.querySelectorAll("td").forEach(td => {
        if (x_ == x) {
          result = td;
        }
        x_++;
      });
    }
    y_++;
  });
  return result;
}

function miniCageClick(x,y) { 
  settings['ClickerTargetCellNumX'] = x;
  settings['ClickerTargetCellNumY'] = y;
  document.querySelector("#clickerTargetInfo").innerHTML = "Цель: "+x+'x'+y;
}

function resetSelectedMiniCages() {
  document.querySelectorAll('.selectedMiniCage').forEach(element => {
    element.classList.remove("selectedMiniCage");
  });
}

function initTargetMiniCages() { //Создает матрицу клеток для кликера
  let node = document.querySelector('#targetMiniCages');
  for (let y = 1; y <= 6; y++) {
    let lineNode = document.createElement("tr");
    for (let x = 1; x<=10; x++) {
      let td = document.createElement("td");
      let div = document.createElement("div");
      div.classList.add("miniCage");
      div.addEventListener("click",()=>{ 

        if (div.classList.contains("selectedMiniCage")) {
          div.classList.remove(`selectedMiniCage`);
          isClickerTargetSelected = false;
          return;
        }

        miniCageClick(x,y); 
        resetSelectedMiniCages();
        isClickerTargetSelected = true;
        div.classList.add("selectedMiniCage");
      });
      td.appendChild(div);
      lineNode.appendChild(td);
    }
    node.appendChild(lineNode);
  }
}

// =====================================================================================================================================================================
// КЛИКЕР И ЕГО ЛОГИКА
// =====================================================================================================================================================================

function updateClickerTitle(delay) {
  
  let title = document.querySelector("#clickerTitle");
  if (delay <= 0 || !settings['EnableClicker'] ) {
    title.innerHTML = "Клитор";
    return;
  }
  else {
    title.innerHTML = `Клитор (${delay} с.)`;
    setTimeout(() => {updateClickerTitle(delay-1)},1000);
  }
}

function updateClickerDelay() {
  let delay = Math.random() * settings['ClickerRandomDelay'] + settings['ClickerActualDelay'];
  updateClickerTitle(Math.round(delay));
  setTimeout(ClickerClick, delay*1000);
}

function ClickerClick() {
  if (settings['ClickerMaxMoves'] > 0) {
    document.querySelector("#ClickerMaxMoves").value = settings['ClickerMaxMoves'] -= 1;
    clickerMovesLimit_change();
  }
  else if (settings['ClickerMaxMoves'] == 0) {
    switchClicker();
    return;
  }
  if (settings['EnableClicker']) {
    updateClickerDelay();
    console.log("Клитор перешел.");
    let cage = getCage(settings['ClickerTargetCellNumX'], settings['ClickerTargetCellNumY']);
    try {
      cage.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      clickerMovesCount += 1;
      document.querySelector("#clickerMovesCount").innerHTML = ""+clickerMovesCount;
    }
    catch (error) {
      console.error(`Не удалось перейти. \nCage: ${cage}\nError: ${error}`)
    }
  }
}

function parseDelays() {
  settings['ClickerRandomDelay'] = parseFloat(document.querySelector("#ClickerRandomDelay").value);
  settings['ClickerActualDelay'] = parseFloat(document.querySelector("#ClickerActualDelay").value);
}

function switchClicker() {
  if (!isClickerTargetSelected) {
    return;
  }
  if (settings['EnableClicker']  || clickerMovesCount) {
    settings['EnableClicker'] = false;
    console.log("Клитор остановлен");
    EnableClickerBtn.innerHTML = "Поехали!";
    return;
  }
  try {
    parseDelays();
    settings['EnableClicker'] = true;
    EnableClickerBtn.innerHTML = "Хватит";
    console.log("Клитор запущен. Задержка: "+ settings['ClickerActualDelay']+' с. + ~'+settings['ClickerRandomDelay']+' c.');
  }
  catch (e) {
    document.querySelector("#clicker").innerHTML += "Задержка должна быть числом!";
    return;
  }
  
  ClickerClick();
}

function clickerMovesLimit_change() {
  parseDelays();
  ClickerMaxMovesInput = document.querySelector("#ClickerMaxMoves");
  settings['ClickerMaxMoves'] = parseInt(ClickerMaxMovesInput.value);
  if (settings['ClickerMaxMoves'] >= 0) {
    parseDelays();
    document.querySelector("#clickerMovesLimitAvarageTime").innerHTML = `Осталось примерно ${new Date((settings['ClickerActualDelay'] + settings['ClickerRandomDelay']/2)*1000*settings['ClickerMaxMoves']).toISOString().substring(11,19)}`;
  }
  
}

//внедрение кликера
function injectClicker() {
  
  let clickerPlace = document.querySelector("html");
  let div = document.createElement("div");
  div.id = "ClickerBody";
  div.innerHTML = `${clickerHTML}<div id="ClickerBodyOpen" align="center"><b>Клитор</b></div>`;
  clickerPlace.appendChild(div);
  document.querySelector("#EnableClickerBtn").addEventListener("click", switchClicker);
  document.querySelector("#ClickerMaxMoves").addEventListener("change", clickerMovesLimit_change);
  document.querySelector("#ClickerActualDelay").addEventListener("change", clickerMovesLimit_change);
  document.querySelector("#ClickerRandomDelay").addEventListener("change", clickerMovesLimit_change);
  
  let DisplayDiagonalsCheckBox = document.querySelector("#Clicker_DisplayDiagonals");
  let TransparentClickerCheckBox = document.querySelector("#Clicker_TransparentClicker");
  let Clicker_EnableAim = document.querySelector("#Clicker_EnableAim");
  DisplayDiagonalsCheckBox.addEventListener("change", () => {
    settings['DisplayDiagonals'] = DisplayDiagonalsCheckBox.checked;
    location.reload();
    saveSettings();
  });
  TransparentClickerCheckBox.addEventListener("change", () => {
    settings['TransparentClicker'] = TransparentClickerCheckBox.checked;
    location.reload();
    saveSettings();
  });
  Clicker_EnableAim.addEventListener("change", () => {
    settings.Aim.enabled = Clicker_EnableAim.checked;
    saveSettings();
  });
  initTargetMiniCages();
}

// =====================================================================================================================================================================
// ВНЕДРЕНИЕ
// =====================================================================================================================================================================

function injectSettings() {
  //document.querySelector("#branch").innerHTML += settingsHTML;
  document.querySelector("#branch").insertAdjacentHTML("beforeend", settingsHTML)

  //эвенты изменения для сохранения настроек. Какой то костыль ебаный а лан пох хули мне епта бля
  let HideClickerCheckBox = document.querySelector("#RascheskaSettings_HideClicker");
  let SmoothEverythingCheckBox = document.querySelector("#RascheskaSettings_SmoothEverything");
  let SmoothTimeInput = document.querySelector("#RascheskaSettings_SmoothTime");
  let ClickerActualDelayInput = document.querySelector("#RascheskaSettings_ClickerActualDelay");
  let ClickerRandomDelayInput = document.querySelector("#RascheskaSettings_ClickerRandomDelay");
  let HideEmptyNotesCheckBox = document.querySelector("#RascheskaSettings_HideEmptyNotes");
  let injectLinksDelayInput = document.querySelector("#RascheskaSettings_injectLinksDelay");
  let ClickerBaseColorInput = document.querySelector("#RascheskaSettings_ClickerBaseColor");
  let ClickerFontColorInput = document.querySelector("#RascheskaSettings_ClickerFontColor");
  let DisplayDiagonalsCheckBox = document.querySelector("#RascheskaSettings_DisplayDiagonals");
  let TransparentClickerCheckBox = document.querySelector("#RascheskaSettings_TransparentClicker");
  TransparentClickerCheckBox = document.querySelector("#RascheskaSettings_TransparentClicker");
  
  let AddDiagBtn = document.querySelector("#RascheskaSettings_AddDiagBtn");
  let PreviewDiagsBtn = document.querySelector("#RascheskaSettings_PreviewDiags");
  //let DiagonalsOpacity = document.querySelector("#RascheskaSettings_DiagonalsOpacity"); // НЕ НУ А ЧЕ МНЕ ЕЩЕ ДЕЛАТЬ ТО???
  let DiagonalsImages = document.querySelector("#RascheskaSettings_DiagonalsImages");

  HideClickerCheckBox.addEventListener("change", () => {
    settings['HideClicker'] = HideClickerCheckBox.checked;
    saveSettings();
  });
  SmoothEverythingCheckBox.addEventListener("change", () => {
    settings['SmoothEverything'] = SmoothEverythingCheckBox.checked;
    saveSettings();
  });
  SmoothTimeInput.addEventListener("change", () => {
    settings['SmoothTime'] = parseFloat(SmoothTimeInput.value);
    saveSettings();
  });
  SmoothTimeInput.addEventListener("change", () => {
    settings['SmoothTime'] = parseFloat(SmoothTimeInput.value);
    saveSettings();
  });
  ClickerActualDelayInput.addEventListener("change", () => {
    settings['ClickerActualDelay'] = parseFloat(ClickerActualDelayInput.value);
    saveSettings();
  });
  ClickerRandomDelayInput.addEventListener("change", () => {
    settings['ClickerRandomDelay'] = parseFloat(ClickerRandomDelayInput.value); // СТРАШНО БЛЯТЬ
    saveSettings();
  });
  HideEmptyNotesCheckBox.addEventListener("change", () => {
    settings['HideEmptyNotes'] = HideEmptyNotesCheckBox.checked;
    saveSettings();
  });
  injectLinksDelayInput.addEventListener("change", () => {
    settings['injectLinksDelay'] = parseFloat(injectLinksDelayInput.value);
    saveSettings();
  });
  ClickerBaseColorInput.addEventListener("change", () => {
    settings['ClickerBaseColor'] = ClickerBaseColorInput.value;
    saveSettings();
  });
  ClickerFontColorInput.addEventListener("change", () => {
    settings['ClickerFontColor'] = ClickerFontColorInput.value;
    saveSettings();
  });
  DisplayDiagonalsCheckBox.addEventListener("change", () => {
    settings['DisplayDiagonals'] = DisplayDiagonalsCheckBox.checked;
    saveSettings();
  });
  TransparentClickerCheckBox.addEventListener("change", () => {
    settings['TransparentClicker'] = TransparentClickerCheckBox.checked;
    saveSettings();
  });
  
  // снова копипастим....
  // DiagonalsOpacity.addEventListener("change", () => {
  //   settings['DiagonalsOpacity'] = DiagonalsOpacity.value;
  //   document.querySelector("#RascheskaSettings_DiagonalsOpacityInfo").innerHTML = `${settings['DiagonalsOpacity']*100}%`;
  //   saveSettings();
  // }); //увы
  DiagonalsImages.addEventListener("change", () => {
    settings['DiagonalsImages'] = DiagonalsImages.value;
    saveSettings();
  });
  PreviewDiagsBtn.addEventListener("click", () => {
    let div = document.querySelector("#PreviewDiags");
    div.replaceChildren(...[]);
    settings['DiagonalsCompositedIds'].forEach((id) => {
      let HTML = `<div title="${id['name']}" style="display: inline-block; width:100px; height:150px; scale: 75%; background-image: url(&quot;${domain}/cw3/composited/${id["id"]}.png&quot;)"></div>`;
      div.innerHTML += HTML;
    });
  });


  document.querySelector("#RascheskaSettings_importSettingsSubmitBtn").addEventListener("click", () => {
    const loadedSettings = JSON.parse(document.querySelector("#RascheskaSettings_importSettingsTextArea").value);
    settings = { ...settings, ...loadedSettings };
    saveSettings();
  });
  document.querySelector("#RascheskaSettings_exportSettingsTextArea").innerHTML=JSON.stringify(settings);
  document.querySelector("#RascheskaSettings_setDefaultSettings").addEventListener("click", ()=>{
    console.log("Настройки сброшены!");
    settings = default_settings;
    saveSettings();
  });

  // ЗАМЕТКИ
  let notes = document.querySelector("#RascheskaSettings_NotesList"); 
  notes.innerHTML += `<table class="RascheskaSettings_Note"></table>`
  let table = notes.querySelector("table");
  table.style.padding = "20px";
  for (var [ID, note] of Object.entries(settings['MyCatsNotes'])) {
    if (settings['HideSecretNotesIDs'].includes(ID)) {
      continue;
    }
    table.innerHTML += `
      <tr style="margin-top: 10px;">
        <td style="font-size: 20pt; vertical-align: top; width: 150px">
          <a align="center" style="color:rgb(219, 197, 197);" href="https://${domain}/cat${ID}">
            ${settings['SavedCatsNames'][ID]}
          </a>
        </td>
        <td style="position: relative; padding-bottom:65px;">
          <textarea cat-id="${ID}" class="RascheskaSettings_Textarea">${note}</textarea>
          <br>
          <button class="RascheskaSettings_Btn" id="RascheskaSettings_DeleteNoteBtn_${ID}" cat-id="${ID}" style="position: absolute; width:100%; height:50px;">
            Удалить
          </button>
        </td>
      </tr>
    `;
    
  }
  //КАКОЙ ЖЕ ПОНОС.
  table.querySelectorAll('[id^="RascheskaSettings_DeleteNoteBtn_"]').forEach((delBtn) => {
    delBtn.addEventListener("click", () => {
      let id = delBtn.attributes.getNamedItem("cat-id").value;
      console.log("Заметка о "+id+" удалена");
      delete settings['MyCatsNotes'][id];
      delBtn.innerHTML = "Удалено";
      saveSettings();
      delBtn.style.display = "none";
    });
  });

  table.querySelectorAll('[id^="RascheskaSettings_NoteTextarea_"]').forEach((noteTextarea) => {

    noteTextarea.addEventListener("change", () => {
      console.log("Заметка сохранена");
      let id = noteTextarea.attributes.getNamedItem("cat-id").value;
      injectedLinks.splice(injectedLinks.indexOf(`https://${domain}/cat${id}`), 1);
      settings['MyCatsNotes'][id] = noteTextarea.value;
      saveSettings();
    });
    console.log("Отображена заметка "+ID);
  });
  if (table.innerHTML == "") {
    table.innerHTML = "Вы можете добавить заметку в профиле игрока."
  }

  function saveDiagsData() {
    let diags = document.querySelector("#RascheskaSettings_DiagonalsList");
    settings['DiagonalsCompositedIds'] = [];
    diags.childNodes.forEach(diag => {
      let i = diag.attributes.getNamedItem("myId").value;
      let name = diag.querySelector(`#diagName_${i}`);
      let id = diag.querySelector(`#diagId_${i}`);
      if (name != null && id != null) {
          settings['DiagonalsCompositedIds'].push({"name":name.value.trim(), "id":id.value.trim()});
      }
    });
    saveSettings();
  }

  //ДИАГИ

  function CreateDiagField(diags, i, name, id) {
    let HTML = `<div id="diag_${i}" myId="${i}"><input placeholder="Пояснялка" value="${name}" class="RascheskaSettings_TransparentInput" id="diagName_${i}"> </input> <input placeholder="Вставьте id картинки" class="DiagonalsCompositedId" id="diagId_${i}" value="${id}"> <button class="RascheskaSettings_Btn" id="removeDiag_${i}" style="font-size:14px;height:30px; padding:5px;">Удалить</button> </div>`

    diags.insertAdjacentHTML("beforeend",HTML);
    diags.querySelector(`#diagName_${i}`).addEventListener("change",saveDiagsData);
    diags.querySelector(`#diagId_${i}`).addEventListener("change",saveDiagsData);
    diags.querySelector(`#removeDiag_${i}`).addEventListener("click",() => {
      let diags =  document.querySelector("#RascheskaSettings_DiagonalsList");
      diags.removeChild(diags.querySelector(`#diag_${i}`));
      saveDiagsData();
    });
  }

  let diags = document.querySelector("#RascheskaSettings_DiagonalsList");
  let i = 0;
  settings['DiagonalsCompositedIds'].forEach(data => {
    let id = data['id'].trim();
    let name = data['name'].trim();
    CreateDiagField(diags,i,name,id);
    i++;
  }); 

  function AddDiagField() {
    let diags = document.querySelector("#RascheskaSettings_DiagonalsList");
    let i = GetLastDiagId()+1;
    let name = "";
    let id = "";
    settings['DiagonalsCompositedIds'].push({"name":name, "id":id})
    CreateDiagField(diags,i,name,id);
    saveDiagsData();
    saveSettings();
  }

  AddDiagBtn.addEventListener("click", () => {
    AddDiagField();
  });

}
function GetLastDiagId(){
  return settings['DiagonalsCompositedIds'].length-1;
}
function injectNotes() {
  let place = document.querySelector("#branch");
  place.style.position = "relative";
  let catID = document.querySelector("#id_val").value;
  settings['SavedCatsNames'][catID] = place.querySelector("div.summary-profile > div > span > big").innerHTML;
  saveSettings();
  console.log(`Имя сохранено (${settings['SavedCatsNames'][catID]})`);
  console.log(`Текущий ID кота: ${catID}`);
  let notes = settings['MyCatsNotes'][catID];
  let textAreaDiv = document.createElement("div");
  textAreaDiv.innerHTML=`<textarea id="catNotes" style="; width: 450px; height: 200px;" placeholder="Заметки. Вы можете использовать HTML теги, например, <h1>Заголовок</h1>">${ notes == undefined ? "" : notes}</textarea>`;
  //place.innerHTML = place.innerHTML = place.innerHTML.replace('<br clear="left">', `<br><br><br clear="left">`) ;
  place.appendChild(  textAreaDiv);
  
  place.querySelector("#catNotes").addEventListener("change", () => {
    settings['MyCatsNotes'][catID] = place.querySelector("#catNotes").value;
    console.log(`Заметка сохранена (${settings['MyCatsNotes'][catID]})`);
    saveSettings();
  });

}
function groupSavedMessagesBySubject(msgs) {
  let g = {};
  msgs.forEach((item) => {
    let s = item['subject'];
    if (s.startsWith("Re: ")) {
      s = s.substring(4,s.length);
    }
    if (g[s] === undefined) {
      g[s] = [item];
    }
    else {
      g[s].push(item);
    }
    
  });
  return g;
}

function injectNotesForLinks() {

  document.querySelectorAll('a').forEach(link => {
    if (injectedLinks.includes(link)) {
      return;
    }
    injectedLinks.push(link);
    if (link.href.startsWith(`https://${domain}/cat`)) {
      
      let catID = link.href.replace(`https://${domain}/cat`, '');
      
      let notes = settings['MyCatsNotes'][catID];

      if (notes == undefined && settings['HideEmptyNotes']) return;

      console.log(`Вставлена заметка для кота https://${domain}/cat${catID}`);
      //link.title = notes == undefined ? "Заметок пока нет..." : notes;
      link.addEventListener('mouseenter', () => {
        link.appendChild(noteDiv);
        //notesDiv.style.display = 'block';
        noteDiv.querySelector("#catNotesForLink_noteText").innerHTML = notes == undefined ? "<i>Заметок пока нет...</i>" : notes.replace("\n", "<br>");

      });
    }
    else {
      //console.log(link.href);
    }
  });
  if (settings['injectLinksDelay'] >= 0 ) setTimeout(injectNotesForLinks, settings['injectLinksDelay']*1000);
}
function getSavedMessageById(id) {
  let res = false;
  settings['SavedMessages'].forEach(msg => {
    if (msg['id'] == id) {
      res = msg;
    }
  })
  return res;
}

function hideSavedMessageOrigin(e) {
  document.querySelector("body").removeChild(e);
}

function showSavedMessageOrigin(html) {
  let div = document.createElement("div");
  let content = document.createElement("div");
  content.insertAdjacentHTML("afterbegin", `<div style="width:100%; height: 30px; position: absolute; top:0px; left:0px; margin-bottom: 50px;  border-radius: 20px 20px 0px 0px ; background: rgb(85, 77, 77);"></div><div style="margin-bottom:10px"></div>`);
  content.align = "center";
  content.id = "savedMessageOrigin";
  content.insertAdjacentHTML('beforeend',html);
  let bg = document.createElement("div");
  bg.id = "savedMessageOriginBlack";
  document.addEventListener('keydown', function(e) {
  if (e.key == "Escape") {
    hideSavedMessageOrigin(div);
  }
});
  bg.addEventListener("click", () => {
    hideSavedMessageOrigin(div);
  });
  div.insertAdjacentElement("beforeend", bg );
  div.insertAdjacentElement("beforeend", content);
  div.id = "savedMessageOriginDiv";
  document.querySelector("body").insertAdjacentElement("beforeend", div);
  
}

function injectMessageSaver() {
  if (window.location.href.startsWith(`https://${domain}/ls?id=`)) {
    let msg = document.querySelector("#msg_table");
    if (msg == null) {
      setTimeout(injectMessageSaver, 0.2);
      return;
    }
    let sender_href = msg.querySelector("#msg_login").href;
    let sender_name = msg.querySelector("#msg_login").innerHTML;
    let html = msg.querySelector(".parsed").innerHTML;
    let subject = msg.querySelector("#msg_subject")
    let id = new URLSearchParams(document.location.search).get("id");
    let now = new Date();
    let data = {
      "sender_href": sender_href,
      "sender_name": sender_name, 
      "html": html,
      "saved_from": "ls", //cw3 | ls
      "save_time": `${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()} в ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
      "subject": subject.innerHTML,
      "origin": msg.innerHTML,
      "id": id
    };
    let is_saved = getSavedMessageById(id) != false;
    console.log(`Сообщение ${id} ${is_saved}`);
    let save_btn = document.createElement("button");
    save_btn.classList.add("RascheskaSettings_Btn");
    save_btn.innerHTML = "Сохранить",
    save_btn.addEventListener("click", () => {
      if (is_saved) return;
      is_saved = true;
      settings['SavedMessages'].push(data);
      save_btn.innerHTML = "Сохранено!";
      save_btn.enabled = false;
      saveSettings();
    })
    if (!is_saved) {
      
      msg.insertAdjacentElement("afterend", save_btn);
      msg.insertAdjacentHTML("afterend", `<div style="height: 20px;"></div>`);
    }
    
  }
  else if (window.location.href.startsWith(`https://${domain}t/ls`)) {
    let div = document.createElement("div");
    div.open = true;
    div.id = "savedMessages";
    table = document.createElement("table");
    table.innerHTML = `<tr><th>Отправитель</th><th>Дата сохранения</th><th>Сообщение</th><th style="color: #AAAAAA">Удаление</th>`;

      //"sender_id": "1646323",
      //"sender_name": "PIPos",
      //"html": `<h3>Привет, привет! <a href="https://catwar.net/cat1646323">Напиши мне</a></h3>`,
      //"saved_from": "", //cw3 | ls
      //"save_time": "Когда-то",
      //"subject": "( = )",
      //"origin": "<span>Тут будет отображаться сообщение в первоначальном виде.</span>",
      //"id":"0"

      // <td>${msg['html']}</td>
      //      <details>
      //      <summary>Оригинал</summary>
      //      <table border="1">${msg['origin']}</table>
      //     </details>
    let lastSubject = "";
    let g = groupSavedMessagesBySubject(settings['SavedMessages']);
    Object.keys(g).forEach(key => {
      table.insertAdjacentHTML("beforeend", `
        <tr>
          <td colspan="9">
            <h3 style="background-color: rgb(172, 155, 155); border-radius: 10px; padding:5px; color:rgb(51, 44, 44);">${key}</h3>
          </td>
        </tr>
      `);
      g[key].forEach(msg => {
        if (msg == null) return;
        let tr = document.createElement("tr");
        let previewText = $('<div/>').html(msg['html']).text();
        let maxLen = 130;
        tr.innerHTML = `
            <td style="border-left: 2px solid #FFDDDD;"> <a href="${msg['sender_href']}">${msg['sender_name']}</a></td>
            <td>${msg['save_time'] == undefined ? 'Когда-то' : msg['save_time']}</td>
            <td class="SavedMessagePreviewText" title="Нажмите, чтобы посмотреть оригинал" id="savedMessageMessage">
              <span class="savedMessageMessage" style="color: #EEEEEE; font-size: 16px;">${  previewText.length > maxLen ? previewText.substring(0, maxLen) + "..." : previewText }</span>
            </td>
            <td id="saved_msg_tools">
            </td>
        `;
        
        let del_msg_btn = document.createElement("button");
        del_msg_btn.innerHTML = "Удалить";
        del_msg_btn.classList.add("RascheskaSettings_Btn");
        del_msg_btn.addEventListener("click", () => {
          console.log("Сообщение удалено");
          del_msg_btn.enabled=false;
          if (del_msg_btn.innerHTML == "Удалено!") return;
          del_msg_btn.innerHTML = "Удалено!";
          settings['SavedMessages'].splice(settings['SavedMessages'].indexOf(msg),1);
          saveSettings();

        });
        let open_origin_msg_btn = tr.querySelector("#savedMessageMessage");
        open_origin_msg_btn.addEventListener("click",() => {
          showSavedMessageOrigin(`<table>${msg['origin']}</table>`);
        }); 
        tr.querySelector("#saved_msg_tools").insertAdjacentElement("beforeend",del_msg_btn);
        table.insertAdjacentElement("beforeend",tr);
      });
    });

    div.insertAdjacentElement("beforeend", table);
    let details = document.createElement("details");
    details.innerHTML += "<summary id=\"savedMessagesSummary\">Сохраннные сообщения</summary>";
    details.insertAdjacentElement("beforeend", div)
    document.querySelector("#branch").insertAdjacentElement("beforeend", details);
    document.querySelector("#links").insertAdjacentHTML("beforeend"," | <a href=\"#savedMessagesSummary\">Сохраненные сообщения</a>")
  }
}

function FixGenderDisplay() 
{
    let avatarFemka = document.querySelector(`#branch > div.view-profile > div.col-avatar > div > img[src*="/avatar/"][style*="pink"]`);
    let avatarMale = document.querySelector(`#branch > div.view-profile > div.col-avatar > div > img[src*="/avatar/"][style*="blue"]`);
    
    if (avatarFemka != null) {
      //avatar.insertAdjacentHTML("afterend","<span>Кошка</span>");
      console.log("Gender: кошка");
      document.querySelector(`#branch > div.summary-profile > div > span > big`).innerHTML += " (кошка)";//` (<font style="color: pink;">кошка</font>)`;
    }
    else if (avatarMale != null) {
      console.log("Gender: кот");
      //avatar.insertAdjacentHTML("afterend","<span>Кошка</span>");
      document.querySelector(`#branch > div.summary-profile > div > span > big`).innerHTML += " (кот)";  //` (<font style="color: blue;">кот</font>)`;
    }
    else {
      console.log("Gender: другой");
      document.querySelector(`#branch > div.summary-profile > div > span > big`).innerHTML += " (трансуха)";  //` (<font style="color: blue;">кот</font>)`;
    }
    
}

function simulateKeyPress(key, event="keydown") {
  let e = new KeyboardEvent(event, {
  'key': key,
  'code': 'Key'+key,
  'charCode': key.charCodeAt(0),
  'keyCode': key.charCodeAt(0),
  'which': key.charCodeAt(0),
  'shiftKey': false
  });
  document.dispatchEvent(e);
}

function hideSetTargetButtons() {
  document.querySelectorAll("button.setTargetBtn").forEach(btn => {
    btn.parentElement.removeChild(btn);
  });

}

function hideTargetImage() {
  let old = document.querySelector("#AimTargetImage");
  if (old != null) old.parentElement.removeChild(old);

}


function angle(cx, cy, ex, ey) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx);
  theta *= 180 / Math.PI;
  if (theta < 0) theta = 360 + theta;
  return theta;
}

function getAngleToTarget(arrow, target) {
  let x1 = arrow.getBoundingClientRect().x;
  let y1 = arrow.getBoundingClientRect().y;
  let x2 = target.getBoundingClientRect().x;
  let y2 = target.getBoundingClientRect().y;
  let a = angle(x1, y1, x2, y2);
  return a;
}

function getArrowAngle(arrow) {  
  let data = arrow.style.transform.split();
  let r = null;
  data.forEach(d => {
    if (d.includes("rotate")) {
      d = d.replace("rotate(","").replace("deg)","");
      d = d.replace("deg)","")
      r= parseFloat(d);
    }
  });

  if (r != null) {
    r+=180;
    while (true) {
      if (r > 360) {
        r -= 360;
      }
      else {
        break;
      }
    }
  }

  return r;

}  

function getAimRotationDirection(targetA, currentA) {

  let diff = targetA - currentA;

  if (diff > 180) {
      diff -= 360;
  } else if (diff < -180) {
      diff += 360;
  }

  let key;
  if (diff > 0) {
      key = "L";
  } else {
      key = "J";
  }
  
  return key;
}

function AimUpdate() {
  let arrow = document.querySelector("#arrow"+settings.me.myId);
  let target = null;
  if (settings.Aim.enabled && arrow != null) {
    let cats = document.querySelectorAll(`.catWithArrow`);
    cats.forEach(cat => {
      let name = cat.querySelector(`.cat_tooltip u a`).innerHTML;
      if (name == settings.Aim.target) {
        target = cat;
        let img = document.createElement("img");
        img.src = "https://raw.githubusercontent.com/AChatik/CatWar/refs/heads/main/target.png";
        img.style.position = "absolute";
        img.style.height = "auto";
        img.style.width = "100%";
        img.style.top = "25px";
        img.style.opacity = "40%";
        img.id = "AimTargetImage";
        hideTargetImage();
        //cat.querySelector(".cat").style.position = "relative";
        cat.insertAdjacentElement("beforeend", img);
      }
      if (AimUpdate.injectedCats.includes(cat)) return;

      let setTargetBtn = document.createElement("button");
      setTargetBtn.innerHTML = "X";
      setTargetBtn.title = "Пометить как цель для наведения";
      setTargetBtn.style.margin = "5px"; 
      setTargetBtn.classList.add("setTargetBtn");
      setTargetBtn.classList.add("RascheskaSettings_Btn");
      setTargetBtn.addEventListener("click", (e) => {
        if (settings.Aim.target == name) {
          settings.Aim.target = null;
          hideTargetImage();
          resetAimUpdateKeys();

          return;
        }
        settings.Aim.target = name;
      });
      cat.style.position = "relative";
      setTargetBtn.style.position = "absolute";
      setTargetBtn.style.zIndex = 10;
      setTargetBtn.style.right = "0px";
      setTargetBtn.style.bottom = "0px";
      setTargetBtn.style.width = "25px";
      setTargetBtn.style.height = "25px";
      setTargetBtn.style.fontSize = "12px";
      setTargetBtn.style.padding = "2px";
      setTargetBtn.style.rotat =
      cat.insertAdjacentElement("beforeend", setTargetBtn)
      AimUpdate.injectedCats.push(cat);
    });
    
    if (target != null) {
      let targetA = getAngleToTarget(arrow, target);
      let currentA = getArrowAngle(arrow);
      //console.log(currentA, targetA);
      if (Math.abs(currentA - targetA) > 10) {
        if (!AimUpdate.isKeyPressed) {
          let key = getAimRotationDirection(targetA, currentA);

          
          simulateKeyPress(key);
          console.log("Rotating arrow");
          AimUpdate.pressedKey = key;
          AimUpdate.isKeyStopped = false;
          AimUpdate.isKeyPressed = true;
        }
      }
      else {
        if (!AimUpdate.isKeyStopped) {
          AimUpdate.isKeyStopped = true;
          AimUpdate.isKeyPressed = false;
          simulateKeyPress(AimUpdate.pressedKey, "keyup");
          console.log("Stop arrow rotation");
        }
      }
    }

  }
  else {
    hideSetTargetButtons();
    hideTargetImage();
    AimUpdate.injectedCats = [];

  }
  
}
function resetAimUpdateKeys() {
  AimUpdate.isKeyPressed = false;
  AimUpdate.isKeyStopped = false;
  AimUpdate.pressedKey = "J";
}
resetAimUpdateKeys();
AimUpdate.injectedCats = [];

async function aimUpdater() {
  AimUpdate();
  setTimeout(aimUpdater, 0.2);
}

function injectAim() {
  console.log("Внедряем аим...")
  aimUpdater();

}

class OptimalGuesser {
    constructor(min = -100000000000000, max = 100000000000000) {
        this.min = min;
        this.max = max;
        this.history = [];
        this.boundaryNumber = 0;
    }

    getGuess() {
        let guess = 0;
        if (this.history.length > 0) guess = Math.floor((this.min + this.max) / 2);
        this.history.push({ guess, range: [this.min, this.max] });
        this.boundaryNumber = guess;
        return guess;
    }
    update(response) {
        const cleanResponse = response.toLowerCase();
        
        if (cleanResponse.includes('больше')) {
            this.min = Math.max(this.min, this.boundaryNumber);
        } else if (cleanResponse.includes('меньше')) {
            this.max = Math.min(this.max, this.boundaryNumber);
        }
        
        if (this.min > this.max) {
            console.error(`Ошибка: min(${this.min}) > max(${this.max})`);
            throw new Error('Противоречивые ответы');
        }
    }
    getRemainingAttempts() {
      return Math.ceil(Math.log2(this.max - this.min + 1)) + this.history.length;
    }

    getStats() {
        return {
            currentRange: [this.min, this.max],
            history: this.history,
            attempts: this.history.length,
            worstCaseLeft: this.getRemainingAttempts()
        };
    }
}

function DigitGameSolver() {
  if (!DigitGameSolver.isRunning) return;
  DigitGameSolver.inProgress = true;
  let mess_form = document.querySelector("#mess");
  let chat_table = document.querySelector("#tab_divs").querySelector("[style=\"display: block;\"]").querySelector("table.chat_table");
  mess_form.setAttribute("contenteditable", false);

  let stats = DigitGameSolver.OptimalGuesser.getStats();
  let precent = Math.round(stats.attempts / stats.worstCaseLeft * 100);
  if (precent != NaN) {

    DigitGameSolver.startBtn.innerHTML = "казино выкачено на " + precent + `%<br>ОСТАНОВИТЬ ВЫКАЧИВАНИЕ КАЗИКА НАХРЕН!!!!🛑🛑🛑<br><hr style="max-width: 100%; left: 0px; border-style: solid ; transition: width 0.2s ease; background-color: white; height:5px; margin: 5px; border-radius: 3px; opacity:70%;"></hr>`;
    DigitGameSolver.startBtn.querySelector("hr").setAttribute("width", `${100-Math.round((Date.now() - DigitGameSolver.lastMessageTime) / DigitGameSolver.currentDelay * 100)}%`);
  }

  if (DigitGameSolver.lastResponse == null) {
    DigitGameSolver.lastResponse = DigitGameSolver.getLastResponse(chat_table);
  }
  //console.log(Date.now() - DigitGameSolver.lastMessageTime, DigitGameSolver.currentDelay, DigitGameSolver.state)
  if (Date.now() - DigitGameSolver.lastMessageTime > DigitGameSolver.currentDelay && DigitGameSolver.state == "guessing") {
    console.log("Угадываем число...");
    let delay = Math.random() * settings.DigitGameSolver.randomTimeDelay + settings.DigitGameSolver.randomTimeDelay;
    console.log("Ждем "+delay/1000+" секунд");
    if (DigitGameSolver.lastResponse != null) {
      
      let respText = DigitGameSolver.lastResponse.querySelector(".parsed").innerHTML;
      let type = respText.split()[0];
      if (type.includes("Молодец,") && DigitGameSolver.OptimalGuesser.history.length > 0) {
        console.log("Ура! Мы угадали число!");
        DigitGameSolver.OptimalGuesser = new OptimalGuesser();
        injectDigitGameSolver.resetStartBtn(startBtn);
        return;
      }
      DigitGameSolver.OptimalGuesser.update(type);
    }
    let guess = DigitGameSolver.OptimalGuesser.getGuess();
    mess_form.innerHTML = "/number "+guess;
    document.querySelector("#mess_submit").click();
    console.log("Ждем ответа от Системолапа...");
    DigitGameSolver.currentDelay = delay;
    DigitGameSolver.lastMessageTime = Date.now();
    DigitGameSolver.state = "waitingResponse";
  }
  if (DigitGameSolver.state == "waitingResponse") {
    if (document.querySelector("#error").innerHTML == "Не флудите." && document.querySelector("#error").style.display == "block") {
      
      if (!DigitGameSolver.isResending ) {
        console.warn("Попались на флуде! Чуток ждем...");
        DigitGameSolver.isResending = true;
        setTimeout(() => {
          DigitGameSolver.isResending = false;
          document.querySelector("#mess_submit").click();
        },20000)
      }
      
    }
    if (DigitGameSolver.getLastResponse(chat_table) != null && DigitGameSolver.lastResponse != null) {
      //console.log(DigitGameSolver.getLastResponse(chat_table).getAttribute("data-id"), DigitGameSolver.lastResponse.getAttribute("data-id"), DigitGameSolver.lastResponse)
    }
    if ((DigitGameSolver.getLastResponse(chat_table) != null && DigitGameSolver.lastResponse == null) || DigitGameSolver.getLastResponse(chat_table).getAttribute("data-id") != DigitGameSolver.lastResponse.getAttribute("data-id")) {
      console.log("Ответ от Системолапа получен");
      DigitGameSolver.lastResponse = DigitGameSolver.getLastResponse(chat_table);
      DigitGameSolver.state = "guessing";
    }
  }

  if (!DigitGameSolver.isRunning) {
    mess_form.setAttribute("contenteditable", false);
    return;
  }
  DigitGameSolver.inProgress = false;
  if (!DigitGameSolver.inProgress) setTimeout(DigitGameSolver, 100);

}
DigitGameSolver.inProgress = false;
DigitGameSolver.lastResponse = null;
DigitGameSolver.state = "guessing";
DigitGameSolver.isRunning = false;
DigitGameSolver.lastMessageTime = 0;
DigitGameSolver.currentDelay = 1;
DigitGameSolver.getLastResponse = function(chat_table) {
  r = null;
  return chat_table.querySelectorAll(".mess_tr")[0];
  chat_table.querySelectorAll(".mess_tr").forEach(m => {
    if (m.querySelector(".author_td a").innerHTML == "Системолап" && m.querySelector("parsed").innerHTML.includes(", ")) {
      r = m;
      return;
    }
  });
  return r;
}

function injectDigitGameSolver() {
  if (!window.location.href.startsWith(`https://${domain}/chat`)) return;

  let startCheckLoadTime = Date.now();

  function Loaded() {
    if (!document.querySelector(`#online a`).href.includes("cat44")) return;
    if (!document.querySelector(`#online font`).innerHTML.includes("Смотрит на тебя")) return;
    console.log("Открыт чат с системолапом, внедряем выкачку казино...");
    let startBtn = document.createElement("button");
    startBtn.innerHTML = "НАЧАТЬ ВЫКАЧКУ КАЗИНО!!!!💥💥💥";
    startBtn.classList.add("RascheskaSettings_Btn");
    startBtn.addEventListener("click", e => {
      if (!DigitGameSolver.isRunning) {
        
        startBtn.innerHTML = "ХВАТИТ ВЫКАЧИВАТЬ";
        DigitGameSolver.isRunning = true;
        DigitGameSolver.OptimalGuesser = new OptimalGuesser();
        DigitGameSolver.startBtn = startBtn;
        DigitGameSolver();
      }
      else {
        injectDigitGameSolver.resetStartBtn(startBtn);

      }
      
    })
    document.querySelector("#tabs").insertAdjacentElement("beforeend", startBtn);
  }

  function checkLoad() {
    let tabs = document.querySelector("#online");
    
    if (Date.now() - startCheckLoadTime > 6000) {
      console.warn("Не удалось внедрить выкачку казино (страница не загрузилась)");
      return;
    }
    if (tabs == null || tabs.children.length == 0) {
      setTimeout(checkLoad, 200);
    }
    else {
      setTimeout(Loaded, 400);
    }
  }
  checkLoad();
}

injectDigitGameSolver.resetStartBtn = function(startBtn) {
    startBtn.innerHTML = "НАЧАТЬ ВЫКАЧКУ КАЗИНО!!!!💥💥💥";
    document.querySelector("#mess").setAttribute("contenteditable", true);
    DigitGameSolver.isRunning = false;
}

function inject() {
    //подсос стилей 
    let head = document.querySelector("head");
    let styleNode = document.createElement("style");
    styleNode.innerHTML = inject_CSS;
    head.appendChild(styleNode)

    if (window.location.href.startsWith(`https://${domain}/settings`)) {
      injectSettings();
    }
    if (window.location.href.startsWith(`https://${domain}/cw3/`)) {
      console.log("Это игровая");
      if (!settings['HideClicker']) {
        injectClicker();
      }
      injectAim();
    }
    if (window.location.href.startsWith(`https://${domain}/time`)) {
      let HTML =`<div id="secret_hleb" align="center" style="height:400px; width:100%; background-image: url(&quot;https://github.com/AChatik/CatWar/blob/main/hleb.png?raw=true&quot;);background-repeat: repeat;"></div>`;
      document.querySelector("#branch").innerHTML += HTML;
    }
    if (window.location.href.startsWith(`https://${domain}/cat`)) {
      injectNotes();
      FixGenderDisplay();
    }
    injectMessageSaver();
    injectNotesForLinks();
    injectDigitGameSolver();
}
settings.DigitGameSolver.minTimeDelay = 3000;
settings.DigitGameSolver.randomTimeDelay = 5000;
async function parseMyId() {
  let myId = null;
  let r = await fetch("https://catwar.su");
  let html = await r.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  myId = doc.querySelector(`#id_val`).innerHTML;
  return myId;
}
async function tryParseMyID() {
  if (settings.me.myId == null) {
    console.log("Идентифицируем вашего кота...");
    let myId = null;
    try {
      myId = await parseMyId();
    }
    catch {
      console.error("parse err");
    }
    if (myId != null) {
      settings.me.myId = myId;
      saveSettings();
      console.log("Ваш кот идентифицирован! Ваш ID: "+myId);
    }
    else console.warn("Не удалось идентифицировать вашего кота. Некоторые функции могут не работать...");
  }
}

async function main() {
  await tryParseMyID();
  inject();
}
main();
