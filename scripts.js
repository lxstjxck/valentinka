const introScreen = document.getElementById('introScreen');
const yesButton = document.getElementById('yesButton');
const noButton = document.getElementById('noButton');
const mainContent = document.getElementById('mainContent');
const loaderScreen = document.getElementById('loaderScreen');
const typewriterEl = document.getElementById('typewriter');

const TYPE_SPEED_MS = 80;
const TYPE_SPEED_VARIANCE_MS = 25;
const TYPE_SOUND_ENABLED = true;
const TYPE_SOUND_VOLUME = 0.001;
let typeAudioContext = null;
let typeNoiseBuffer = null;

const NO_AREA_WIDTH = 1000;
const NO_AREA_HEIGHT = 600;
const NO_AREA_MARGIN = 12;
let noMovePending = false;
let lastNoMoveAt = 0;

function moveNoButton(event) {
  if (!noButton || !introScreen) {
    return;
  }

  const now = Date.now();
  if (noMovePending || now - lastNoMoveAt < 140) {
    return;
  }

  if (event) {
    const buttonRect = noButton.getBoundingClientRect();
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;
    const distance = Math.hypot(event.clientX - buttonCenterX, event.clientY - buttonCenterY);
    if (distance > 200) {
      return;
    }
  }

  noMovePending = true;
  requestAnimationFrame(() => {
    const buttonRect = noButton.getBoundingClientRect();
    const areaWidth = Math.min(window.innerWidth, NO_AREA_WIDTH);
    const areaHeight = Math.min(window.innerHeight, NO_AREA_HEIGHT);
    const rangeX = Math.max(0, areaWidth - buttonRect.width - NO_AREA_MARGIN * 2);
    const rangeY = Math.max(0, areaHeight - buttonRect.height - NO_AREA_MARGIN * 2);
    const left = NO_AREA_MARGIN + Math.random() * rangeX;
    const top = NO_AREA_MARGIN + Math.random() * rangeY;
    noButton.style.position = 'fixed';
    noButton.style.left = `${left}px`;
    noButton.style.top = `${top}px`;
    noButton.style.transform = 'translate(0, 0)';
    lastNoMoveAt = Date.now();
    noMovePending = false;
  });
}

function initTypeAudio() {
  if (!TYPE_SOUND_ENABLED) {
    return;
  }
  if (!typeAudioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      typeAudioContext = new AudioContext();
    }
  }
  if (typeAudioContext && typeAudioContext.state === 'suspended') {
    typeAudioContext.resume();
  }
}

function getTypeNoiseBuffer() {
  if (!typeAudioContext) {
    return null;
  }
  if (typeNoiseBuffer) {
    return typeNoiseBuffer;
  }
  const duration = 0.03;
  const sampleCount = Math.floor(typeAudioContext.sampleRate * duration);
  const buffer = typeAudioContext.createBuffer(1, sampleCount, typeAudioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
  }
  typeNoiseBuffer = buffer;
  return buffer;
}

function playTypeSound() {
  if (!TYPE_SOUND_ENABLED || !typeAudioContext) {
    return;
  }
  const buffer = getTypeNoiseBuffer();
  if (!buffer) {
    return;
  }
  const source = typeAudioContext.createBufferSource();
  source.buffer = buffer;
  const gain = typeAudioContext.createGain();
  gain.gain.value = TYPE_SOUND_VOLUME * (0.8 + Math.random() * 0.4);
  source.connect(gain);
  gain.connect(typeAudioContext.destination);
  source.start();
}

function startTypewriter(text) {
  if (!typewriterEl) {
    return;
  }
  typewriterEl.textContent = '';
  typewriterEl.classList.remove('is-done');
  let index = 0;
  const tick = () => {
    if (index >= text.length) {
      typewriterEl.classList.add('is-done');
      return;
    }
    const char = text[index];
    typewriterEl.textContent += char;
    if (char.trim() !== '') {
      playTypeSound();
    }
    index += 1;
    const delay = TYPE_SPEED_MS + Math.random() * TYPE_SPEED_VARIANCE_MS;
    setTimeout(tick, delay);
  };
  tick();
}

async function loadTextForTyping() {
  if (!typewriterEl) {
    return;
  }
  try {
    const response = await fetch('text.txt', { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Failed to load text.txt: ${response.status}`);
    }
    const text = await response.text();
    startTypewriter(text);
  } catch (error) {
    typewriterEl.textContent = 'Не удалось загрузить текст.';
    console.error(error);
  }
}

function acceptValentine() {
  if (!introScreen || !mainContent || !loaderScreen) {
    return;
  }
  introScreen.classList.add('hidden');
  introScreen.addEventListener('transitionend', () => {
    introScreen.style.display = 'none';
  }, { once: true });

  loaderScreen.classList.add('active');

  setTimeout(() => {
    loaderScreen.classList.remove('active');
    mainContent.style.display = 'block';
    mainContent.style.animation = 'fadeIn 1.2s';
    initTypeAudio();
    loadTextForTyping();
  }, 3500);
}

if (yesButton) {
  yesButton.addEventListener('click', acceptValentine);
}
if (noButton) {
  window.addEventListener('mousemove', moveNoButton);
  window.addEventListener('touchmove', moveNoButton, { passive: true });
  noButton.addEventListener('mouseenter', moveNoButton);
  noButton.addEventListener('touchstart', moveNoButton);
  noButton.addEventListener('click', moveNoButton);
}
