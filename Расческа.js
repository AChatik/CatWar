// ==UserScript==
// @name         Расческа
// @namespace    http://tampermonkey.net/
// @version      1.0.8
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

var iconURL = "https://catwar.net/cw3/moves/136526.png";
var DiagonalsImagesDefault = "https://raw.githubusercontent.com/AChatik/CatWar/refs/heads/main/diag1.png | https://raw.githubusercontent.com/AChatik/CatWar/refs/heads/main/diag2.png";
var settings = {
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
  padding:2px;
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
  right:100px;
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
    <b><a href="https://catwar.net/cat1646323" style="color:rgb(219, 197, 197);">PIPos</a></b>
    <br>
    <a href="https://catwar.net/cat1615741" style="color:rgb(219, 197, 197);">Güliedistodiez</a>
    
    <h3>Тестировщики</h3>
    
    <a href="https://catwar.net/cat1630560" style="color:rgb(219, 197, 197);">Tecdrej</a>
    <br>
    <a href="https://catwar.net/cat1629151" style="color:rgb(219, 197, 197);">Элеонора</a>
  </span>
</div>
`;


var clickerHTML = `
<div id="clicker">
  <div>
    Скрытый <input type="checkbox" ${settings['TransparentClicker'] ? 'checked' : ''} class="RascheskaCheckbox" id="Clicker_TransparentClicker">
    Диагонали <input type="checkbox" ${settings['DisplayDiagonals'] ? 'checked' : ''} ${settings['DiagonalsCompositedIds'].length == 0 ? 'disabled' : ''} class="RascheskaCheckbox" id="Clicker_DisplayDiagonals">
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
  });// снова копипастим....
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
      let HTML = `<div title="${id['name']}" style="display: inline-block; width:100px; height:150px; scale: 75%; background-image: url(&quot;catwar.net/cw3/composited/${id["id"]}.png&quot;)"></div>`;
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
          <a align="center" style="color:rgb(219, 197, 197);" href="https://catwar.net/cat${ID}">
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
      injectedLinks.splice(injectedLinks.indexOf(`https://catwar.net/cat${id}`), 1);
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
      let i = diag.attributes.getNamedItem("my_id").value;
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
    let HTML = `<div id="diag_${i}" my_id="${i}"><input placeholder="Пояснялка" value="${name}" class="RascheskaSettings_TransparentInput" id="diagName_${i}"> </input> <input placeholder="Вставьте id картинки" class="DiagonalsCompositedId" id="diagId_${i}" value="${id}"> <button class="RascheskaSettings_Btn" id="removeDiag_${i}" style="font-size:14px;height:30px; padding:5px;">Удалить</button> </div>`

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
  let catID = document.querySelector("#branch").querySelector("p").attributes.getNamedItem("data-cat").value;
  settings['SavedCatsNames'][catID] = place.querySelector("p").querySelector("big").innerHTML;
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

function injectNotesForLinks() {

  document.querySelectorAll('a').forEach(link => {
    if (injectedLinks.includes(link.href)) {
      return;
    }
    injectedLinks.push(link.href);
    if (link.href.startsWith("https://catwar.net/cat")) {
      
      let catID = link.href.replace('https://catwar.net/cat', '');
      
      let notes = settings['MyCatsNotes'][catID];

      if (notes == undefined && settings['HideEmptyNotes']) return;

      console.log(`Вставлена заметка для кота https://catwar.net/cat${catID}`);
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

function inject() {
    //подсос стилей 
    let head = document.querySelector("head");
    let styleNode = document.createElement("style");
    styleNode.innerHTML = inject_CSS;
    head.appendChild(styleNode)

    if (window.location.href.startsWith('https://catwar.net/settings')) {
      injectSettings();
    }
    if (window.location.href.startsWith('https://catwar.net/cw3/')) {
      console.log("Это игровая");
      if (!settings['HideClicker']) {
        injectClicker();
      }
    }
    if (window.location.href.startsWith('https://catwar.net/time')) {
      let HTML =`<div id="secret_hleb" align="center" style="height:400px; width:100%; background-image: url(&quot;https://github.com/AChatik/CatWar/blob/main/hleb.png?raw=true&quot;);background-repeat: repeat;"></div>`;
      document.querySelector("#branch").innerHTML += HTML;
    }
    if (window.location.href.startsWith('https://catwar.net/cat')) {
      injectNotes();
    }
   
    injectNotesForLinks();

}

inject();
