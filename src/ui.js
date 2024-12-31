/* global navigate */
import './spatial-navigation-polyfill.js';
import {
  configAddChangeListener,
  configRead,
  configWrite,
  configGetDesc
} from './config.js';
import './ui.css';

// Disable Spatial Navigation key handling.
window.__spatialNavigation__.keyMode = 'NONE';

const ARROW_KEYS = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' };
const COLOR_KEY_CODES = new Map([
  [403, 'red'], [404, 'green'], [172, 'green'],
  [405, 'yellow'], [170, 'yellow'],
  [406, 'blue'], [191, 'blue']
]);

/**
 * Returns the color name associated with a key code or null if none.
 * @param {number} charCode
 * @returns {string | null}
 */
const getKeyColor = (charCode) => COLOR_KEY_CODES.get(charCode) || null;

/**
 * Creates a configuration checkbox element.
 * @param {string} key
 * @returns {HTMLElement}
 */
const createConfigCheckbox = (key) => {
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = configRead(key);
  input.addEventListener('change', (evt) => configWrite(key, evt.target.checked));

  configAddChangeListener(key, (evt) => {
    input.checked = evt.detail.newValue;
  });

  const label = document.createElement('label');
  label.appendChild(input);
  label.appendChild(document.createTextNode(`\u00A0${configGetDesc(key)}`));

  return label;
};

/**
 * Creates the options panel UI.
 * @returns {HTMLElement}
 */
const createOptionsPanel = () => {
  const container = document.createElement('div');
  container.className = 'ytaf-ui-container';
  container.style.display = 'none';
  container.tabIndex = 0;

  container.addEventListener('focus', () => console.info('Options panel focused!'), true);
  container.addEventListener('blur', () => console.info('Options panel blurred!'), true);
  container.addEventListener('keydown', handleOptionsPanelKeydown, true);

  const heading = document.createElement('h1');
  heading.textContent = 'webOS YouTube Extended';
  container.appendChild(heading);

  const generalOptions = [
    'enableAdBlock', 'upgradeThumbnails', 'hideLogo', 'removeShorts', 'enableSponsorBlock'
  ];

  generalOptions.forEach((key) => container.appendChild(createConfigCheckbox(key)));

  const sponsorOptions = [
    'enableSponsorBlockSponsor', 'enableSponsorBlockIntro',
    'enableSponsorBlockOutro', 'enableSponsorBlockInteraction',
    'enableSponsorBlockSelfPromo', 'enableSponsorBlockMusicOfftopic'
  ];

  const sponsorBlock = document.createElement('blockquote');
  sponsorOptions.forEach((key) => sponsorBlock.appendChild(createConfigCheckbox(key)));
  container.appendChild(sponsorBlock);

  const sponsorLink = document.createElement('div');
  sponsorLink.innerHTML = '<small>Sponsor segments skipping - https://sponsor.ajay.app</small>';
  container.appendChild(sponsorLink);

  return container;
};

/**
 * Handles keydown events in the options panel.
 * @param {KeyboardEvent} evt
 */
const handleOptionsPanelKeydown = (evt) => {
  console.info('Options panel key event:', evt.type, evt.keyCode);

  if (getKeyColor(evt.charCode) === 'green') return;

  if (evt.keyCode in ARROW_KEYS) {
    navigate(ARROW_KEYS[evt.keyCode]);
  } else if (evt.keyCode === 13 && evt instanceof KeyboardEvent) {
    document.activeElement.click();
  } else if (evt.keyCode === 27) {
    showOptionsPanel(false);
  }

  evt.preventDefault();
  evt.stopPropagation();
};

const optionsPanel = createOptionsPanel();
document.body.appendChild(optionsPanel);
let optionsPanelVisible = false;

/**
 * Toggles the visibility of the options panel.
 * @param {boolean} [visible=true]
 */
const showOptionsPanel = (visible = true) => {
  if (visible !== optionsPanelVisible) {
    optionsPanel.style.display = visible ? 'block' : 'none';
    if (visible) optionsPanel.focus(); else optionsPanel.blur();
    optionsPanelVisible = visible;
  }
};

window.ytaf_showOptionsPanel = showOptionsPanel;

/**
 * Displays a notification message.
 * @param {string} text
 * @param {number} [time=3000]
 */
export const showNotification = (text, time = 3000) => {
  let container = document.querySelector('.ytaf-notification-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'ytaf-notification-container';
    document.body.appendChild(container);
  }

  const message = document.createElement('div');
  message.className = 'message message-hidden';
  message.innerText = text;
  container.appendChild(message);

  setTimeout(() => message.classList.remove('message-hidden'), 100);
  setTimeout(() => {
    message.classList.add('message-hidden');
    setTimeout(() => message.remove(), 1000);
  }, time);
};

/**
 * Initializes the ability to hide the YouTube logo.
 */
const initHideLogo = () => {
  const style = document.createElement('style');
  document.head.appendChild(style);

  const setHidden = (hide) => {
    style.textContent = `ytlr-redux-connect-ytlr-logo-entity { visibility: ${hide ? 'hidden' : 'visible'}; }`;
  };

  setHidden(configRead('hideLogo'));
  configAddChangeListener('hideLogo', (evt) => setHidden(evt.detail.newValue));
};

/**
 * Applies UI fixes for known issues.
 */
const applyUIFixes = () => {
  try {
    const observer = new MutationObserver(() => {
      document.body.classList.remove('app-quality-root');
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  } catch (e) {
    console.error('Error setting up UI fixes:', e);
  }
};

applyUIFixes();
initHideLogo();

setTimeout(() => {
  showNotification('Press [GREEN] to open YTAF configuration screen');
}, 2000);

document.addEventListener('keydown', eventHandler, true);
document.addEventListener('keypress', eventHandler, true);
document.addEventListener('keyup', eventHandler, true);

/**
 * Handles global key events.
 * @param {KeyboardEvent} evt
 */
const eventHandler = (evt) => {
  console.info('Key event:', evt.type, evt.charCode, evt.keyCode);

  if (getKeyColor(evt.charCode) === 'green') {
    evt.preventDefault();
    evt.stopPropagation();
    showOptionsPanel(!optionsPanelVisible);
  }
};
