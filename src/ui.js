/*global navigate*/
import './spatial-navigation-polyfill.js';
import {
  configAddChangeListener,
  configRead,
  configWrite,
  configGetDesc
} from './config.js';
import './ui.css';

window.__spatialNavigation__.keyMode = 'NONE';

const ARROW_KEY_CODE = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' };
const colorCodeMap = new Map([
  [403, 'red'], [404, 'green'], [172, 'green'],
  [405, 'yellow'], [170, 'yellow'], [406, 'blue'], [191, 'blue']
]);

function getKeyColor(charCode) {
  return colorCodeMap.get(charCode) || null;
}

function createConfigCheckbox(key) {
  const elmInput = document.createElement('input');
  elmInput.type = 'checkbox';
  elmInput.checked = configRead(key);

  elmInput.addEventListener('change', (evt) => configWrite(key, evt.target.checked));
  configAddChangeListener(key, (evt) => elmInput.checked = evt.detail.newValue);

  const elmLabel = document.createElement('label');
  elmLabel.appendChild(elmInput);
  elmLabel.appendChild(document.createTextNode(`\u00A0${configGetDesc(key)}`));
  return elmLabel;
}

function createOptionsPanel() {
  const elmContainer = document.createElement('div');
  elmContainer.classList.add('ytaf-ui-container');
  elmContainer.style.display = 'none';
  elmContainer.tabIndex = 0;

  elmContainer.addEventListener('keydown', (evt) => {
    if (getKeyColor(evt.charCode) !== 'green' && evt.keyCode in ARROW_KEY_CODE) {
      navigate(ARROW_KEY_CODE[evt.keyCode]);
    } else if (evt.keyCode === 13) {
      if (evt instanceof KeyboardEvent) {
        document.activeElement.click();
      }
    } else if (evt.keyCode === 27) {
      showOptionsPanel(false);
    }
    evt.preventDefault();
    evt.stopPropagation();
  });

  elmContainer.appendChild(document.createElement('h1')).textContent = 'webOS YouTube Extended';
  ['enableAdBlock', 'upgradeThumbnails', 'hideLogo', 'removeShorts', 'enlargeVideosOnHomepage', 'enableSponsorBlock']
    .forEach(key => elmContainer.appendChild(createConfigCheckbox(key)));

  const elmBlock = document.createElement('blockquote');
  ['enableSponsorBlockSponsor', 'enableSponsorBlockIntro', 'enableSponsorBlockOutro', 'enableSponsorBlockInteraction', 'enableSponsorBlockSelfPromo', 'enableSponsorBlockMusicOfftopic']
    .forEach(key => elmBlock.appendChild(createConfigCheckbox(key)));
  elmContainer.appendChild(elmBlock);

  const elmSponsorLink = document.createElement('div');
  elmSponsorLink.innerHTML = '<small>Sponsor segments skipping - https://sponsor.ajay.app</small>';
  elmContainer.appendChild(elmSponsorLink);

  return elmContainer;
}

const optionsPanel = createOptionsPanel();
document.body.appendChild(optionsPanel);

let optionsPanelVisible = false;
function showOptionsPanel(visible = true) {
  if (visible !== optionsPanelVisible) {
    optionsPanel.style.display = visible ? 'block' : 'none';
    optionsPanelVisible = visible;
    if (visible) {
      optionsPanel.focus();
    } else {
      optionsPanel.blur();
    }
  }
}

window.ytaf_showOptionsPanel = showOptionsPanel;

document.addEventListener('keydown', (evt) => {
  if (getKeyColor(evt.charCode) === 'green') {
    evt.preventDefault();
    evt.stopPropagation();
    showOptionsPanel(!optionsPanelVisible);
  }
}, true);

document.addEventListener('keypress', (evt) => {
  if (getKeyColor(evt.charCode) === 'green') {
    evt.preventDefault();
    evt.stopPropagation();
  }
}, true);

document.addEventListener('keyup', (evt) => {
  if (getKeyColor(evt.charCode) === 'green') {
    evt.preventDefault();
    evt.stopPropagation();
  }
}, true);

export function showNotification(text, time = 3000) {
  const notificationContainer = document.querySelector('.ytaf-notification-container') || (() => {
    const c = document.createElement('div');
    c.classList.add('ytaf-notification-container');
    document.body.appendChild(c);
    return c;
  })();

  const elm = document.createElement('div');
  const elmInner = document.createElement('div');
  elmInner.innerText = text;
  elmInner.classList.add('message', 'message-hidden');
  elm.appendChild(elmInner);
  notificationContainer.appendChild(elm);

  setTimeout(() => elmInner.classList.remove('message-hidden'), 100);
  setTimeout(() => {
    elmInner.classList.add('message-hidden');
    setTimeout(() => elm.remove(), 1000);
  }, time);
}

function initHideLogo() {
  const style = document.createElement('style');
  document.head.appendChild(style);

  const setHidden = (hide) => {
    style.textContent = `ytlr-redux-connect-ytlr-logo-entity { visibility: ${hide ? 'hidden' : 'visible'}; }`;
  };

  setHidden(configRead('hideLogo'));
  configAddChangeListener('hideLogo', (evt) => setHidden(evt.detail.newValue));
}

function applyUIFixes() {
  try {
    const bodyClasses = document.body.classList;
    const observer = new MutationObserver((records, observer) => {
      if (bodyClasses.contains('app-quality-root')) {
        bodyClasses.remove('app-quality-root');
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  } catch (e) {
    console.error('error in body class observer:', e);
  }
}

applyUIFixes();
initHideLogo();

setTimeout(() => {
  showNotification('Press [GREEN] to open YTAF configuration screen');
}, 2000);
