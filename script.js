// === Быстрая настройка ===
// Положи аудиофайл в assets/ и укажи здесь его имя.
const TRACK_SRC = 'assets/LXNYA - Sunrise.mp3';

const audio = document.getElementById('audio');
const player = document.querySelector('.music-card');
const playButton = document.getElementById('play-button');
const trackStatus = document.getElementById('track-status');
const progressFill = document.getElementById('progress-fill');
const currentTimeLabel = document.getElementById('current-time');
const durationLabel = document.getElementById('duration');

const translations = {
  ru: {
    views: 'просмотров', online: 'в сети', idle: 'немного музыки для этого момента',
    musicError: 'Добавь MP3 в папку assets — см. README', playing: 'сейчас играет',
    paused: 'пауза', play: 'Воспроизвести трек', pause: 'Поставить на паузу',
    about: '01 / ОБО МНЕ',
    aboutHtml: '<p>Привет, я <strong>Лёня</strong> — начинающий C# разработчик.</p><p>Интересуюсь разработкой компьютерных игр, Linux и информационной безопасностью.</p><p>Сейчас я разрабатываю проект <strong>escontroller</strong>, который должен помочь инди-разработчикам быстрее создавать игры.</p><p>Посмотреть этот проект можно на моём GitHub, он есть ниже.</p><p class="about-muted">Always learning. Always building.</p>',
    exploring: 'сейчас изучаю', activity: '02 / АКТИВНОСТЬ НА GITHUB',
    range30: 'contributions за последние 30 дней', range90: 'contributions за последние 3 месяца',
    range365: 'contributions за последний год', loading: 'загрузка активности',
    loaded: 'активность загружена', unavailable: 'данные недоступны',
    selected: 'contributions за выбранный период',
    footnote: 'Активность публичного профиля GitHub. Обнови данные скриптом из README.',
    updated: 'Активность GitHub · данные обновлены ', less: 'меньше', more: 'больше',
    footer: 'сделано из любопытства', musicLabel: 'Музыкальный плеер',
    activityLabel: 'Активность GitHub', calendarLabel: 'Календарь активности GitHub',
    linksLabel: 'Мои ссылки', description: 'luinty — начинающий C# разработчик. Personal space.'
  },
  en: {
    views: 'views', online: 'online', idle: 'a little soundtrack for this moment',
    musicError: 'Add an MP3 file to assets — see README', playing: 'now playing',
    paused: 'paused', play: 'Play track', pause: 'Pause track',
    about: '01 / ABOUT ME',
    aboutHtml: '<p>Hi, I’m <strong>Leonid</strong> — an aspiring C# developer.</p><p>I’m interested in game development, Linux, and information security.</p><p>I’m currently building <strong>escontroller</strong>, a project designed to help indie developers create games faster.</p><p>You can check it out on my GitHub below.</p><p class="about-muted">Always learning. Always building.</p>',
    exploring: 'currently exploring', activity: '02 / GITHUB ACTIVITY',
    range30: 'contributions in the last 30 days', range90: 'contributions in the last 3 months',
    range365: 'contributions in the last year', loading: 'loading activity',
    loaded: 'activity loaded', unavailable: 'data unavailable',
    selected: 'contributions in the selected period',
    footnote: 'Activity from the public GitHub profile. Update it with the script in the README.',
    updated: 'GitHub activity · data refreshed ', less: 'less', more: 'more',
    footer: 'made with curiosity', musicLabel: 'Music player',
    activityLabel: 'GitHub activity', calendarLabel: 'GitHub contributions calendar',
    linksLabel: 'My links', description: 'luinty — aspiring C# developer. Personal space.'
  }
};
let currentLanguage = 'ru';
function tr(key) { return translations[currentLanguage][key] || key; }
function updateContributionFootnote() {
  if (!contributionFootnote) return;
  if (!contributionUpdatedAt) { contributionFootnote.textContent = tr('footnote'); return; }
  const updated = new Date(contributionUpdatedAt);
  const dateText = Number.isNaN(updated.getTime()) ? contributionUpdatedAt :
    updated.toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  contributionFootnote.textContent = tr('updated') + dateText;
}
function applyLanguage(language) {
  currentLanguage = language === 'en' ? 'en' : 'ru';
  syncLanguageButtons();
  document.documentElement.lang = currentLanguage;
  document.title = currentLanguage === 'en' ? 'luinty — profile' : 'luinty — профиль';
  document.getElementById('page-description').content = tr('description');
  document.getElementById('site-views-label').textContent = tr('views');
  document.getElementById('online-label').textContent = tr('online');
  document.getElementById('track-status').textContent = audio.paused ? tr('idle') : tr('playing');
  document.getElementById('about-heading').textContent = tr('about');
  document.getElementById('about-description').innerHTML = tr('aboutHtml');
  document.getElementById('exploring-label').textContent = tr('exploring');
  document.getElementById('activity-heading').textContent = tr('activity');
  document.getElementById('legend-less').textContent = tr('less');
  document.getElementById('legend-more').textContent = tr('more');
  document.querySelector('[data-range="30"]').textContent = currentLanguage === 'en' ? '30 days' : '30 дн.';
  document.getElementById('range-90-label').textContent = currentLanguage === 'en' ? '3 months' : '3 месяца';
  document.getElementById('range-365-label').textContent = currentLanguage === 'en' ? 'Year' : 'Год';
  const periodControls = document.querySelector('.contributions-controls');
  if (periodControls) periodControls.setAttribute('aria-label', currentLanguage === 'en' ? 'Activity period' : 'Период активности');
  document.getElementById('footer-tagline').textContent = tr('footer');
  document.getElementById('music-player-card').setAttribute('aria-label', tr('musicLabel'));
  document.querySelector('.contributions-card').setAttribute('aria-label', tr('activityLabel'));
  document.getElementById('contributions-chart-wrap').setAttribute('aria-label', tr('calendarLabel'));
  document.querySelector('.social-links').setAttribute('aria-label', tr('linksLabel'));
  playButton.setAttribute('aria-label', audio.paused ? tr('play') : tr('pause'));
  try { localStorage.setItem('luinty-language', currentLanguage); } catch (error) {}
  renderContributionGrid();
  if (contributionDays) setContributionStatus(tr('loaded'));
  updateContributionFootnote();
}
try {
  const storedLanguage = localStorage.getItem('luinty-language');
  if (storedLanguage === 'en' || storedLanguage === 'ru') currentLanguage = storedLanguage;
} catch (error) {}
function syncLanguageButtons() {
  document.querySelectorAll('.language-button').forEach((button) => {
    const selected = button.dataset.language === currentLanguage;
    button.classList.toggle('is-active', selected);
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    button.dataset.active = selected ? 'true' : 'false';
  });
}
document.addEventListener('click', (event) => {
  const button = event.target.closest('.language-button[data-language]');
  if (button) applyLanguage(button.dataset.language);
});
let contributionUpdatedAt = null;


// Аудио подключается локально, без внешних музыкальных сервисов.
audio.src = TRACK_SRC;
audio.autoplay = true;
audio.preload = 'auto';

let autoplayFallbackArmed = false;
async function attemptAutoplay() {
  try {
    await audio.play();
    autoplayFallbackArmed = false;
    document.removeEventListener('pointerdown', retryAutoplay);
    document.removeEventListener('keydown', retryAutoplay);
    document.removeEventListener('touchstart', retryAutoplay);
  } catch (error) {
    if (!autoplayFallbackArmed) {
      autoplayFallbackArmed = true;
      document.addEventListener('pointerdown', retryAutoplay, { once: true });
      document.addEventListener('keydown', retryAutoplay, { once: true });
      document.addEventListener('touchstart', retryAutoplay, { once: true });
    }
  }
}
function retryAutoplay() {
  attemptAutoplay();
}
attemptAutoplay();

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

playButton.addEventListener('click', async () => {
  if (audio.paused) {
    try {
      await audio.play();
    } catch (error) {
      trackStatus.textContent = tr('musicError');
    }
  } else {
    audio.pause();
  }
});

audio.addEventListener('play', () => {
  player.classList.add('is-playing');
  playButton.setAttribute('aria-label', tr('pause'));
  trackStatus.textContent = tr('playing');
});
audio.addEventListener('pause', () => {
  player.classList.remove('is-playing');
  playButton.setAttribute('aria-label', tr('play'));
  if (!audio.ended && audio.currentTime > 0) trackStatus.textContent = tr('paused');
});
audio.addEventListener('loadedmetadata', () => {
  durationLabel.textContent = formatTime(audio.duration);
});
audio.addEventListener('timeupdate', () => {
  currentTimeLabel.textContent = formatTime(audio.currentTime);
  const progress = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  progressFill.style.width = `${progress}%`;
});
audio.addEventListener('ended', () => {
  progressFill.style.width = '0%';
  currentTimeLabel.textContent = '0:00';
  trackStatus.textContent = tr('idle');
});
audio.addEventListener('error', () => {
  trackStatus.textContent = tr('musicError');
});

// Небольшое количество листьев: фон остаётся свободным и кликабельным.
const leavesContainer = document.getElementById('leaves');
const leafCount = window.matchMedia('(max-width: 560px)').matches ? 9 : 14;
for (let i = 0; i < leafCount; i += 1) {
  const leaf = document.createElement('span');
  leaf.className = 'leaf';
  leaf.style.setProperty('--left', `${Math.random() * 100}%`);
  leaf.style.setProperty('--size', `${7 + Math.random() * 7}px`);
  leaf.style.setProperty('--opacity', `${0.18 + Math.random() * 0.25}`);
  leaf.style.setProperty('--duration', `${17 + Math.random() * 19}s`);
  leaf.style.setProperty('--delay', `${-Math.random() * 35}s`);
  leaf.style.setProperty('--sway', `${-35 + Math.random() * 70}px`);
  leavesContainer.appendChild(leaf);
}

// === GitHub contributions ===
// Данные обновляются скриптом scripts/update_contributions.py.
// На GitHub Pages их ежедневно обновляет workflow в .github/workflows.
const contributionGrid = document.getElementById('contributions-grid');
const contributionMonths = document.getElementById('contributions-months');
const contributionTotal = document.getElementById('contributions-total');
const contributionLabel = document.getElementById('contributions-total-label');
const contributionStatus = document.getElementById('contributions-status');
const contributionFootnote = document.getElementById('contributions-footnote');
const contributionChartWrap = document.getElementById('contributions-chart-wrap');
const contributionButtons = document.querySelectorAll('.contributions-range');

const contributionRanges = {
  30: { key: 'range30', days: 30 },
  90: { key: 'range90', months: 3 },
  365: { key: 'range365', months: 12 },
};

let contributionDays = null;
let activeContributionRange = 365;

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addCalendarDays(date, amount) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount, 12);
}

function subtractCalendarMonths(date, amount) {
  const targetMonth = new Date(date.getFullYear(), date.getMonth() - amount, 1, 12);
  const lastDayOfMonth = new Date(
    targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 12,
  ).getDate();
  targetMonth.setDate(Math.min(date.getDate(), lastDayOfMonth));
  return targetMonth;
}

function setContributionStatus(message, isError = false) {
  if (!contributionStatus) return;
  contributionStatus.classList.toggle('is-error', isError);
  const indicator = contributionStatus.querySelector('i') || document.createElement('i');
  contributionStatus.replaceChildren(indicator, document.createTextNode(message));
}

function renderContributionGrid() {
  const range = contributionRanges[activeContributionRange];
  contributionLabel.textContent = tr(range.key);

  contributionButtons.forEach((button) => {
    const selected = Number(button.dataset.range) === activeContributionRange;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });

  if (!contributionDays) return;

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const startDate = range.months
    ? subtractCalendarMonths(today, range.months)
    : addCalendarDays(today, -(range.days - 1));
  const dates = [];
  for (let date = startDate; date <= today; date = addCalendarDays(date, 1)) {
    dates.push(date);
  }
  const startOffset = startDate.getDay(); // GitHub calendar starts on Sunday.
  const weekCount = Math.ceil((startOffset + dates.length) / 7);
  const dayByDate = new Map(contributionDays.map((day) => [day.date, day]));

  contributionMonths.replaceChildren();
  contributionGrid.replaceChildren();
  contributionChartWrap.style.setProperty('--week-count', weekCount);

  let total = 0;
  const cells = document.createDocumentFragment();
  const monthMarkers = document.createDocumentFragment();

  for (let index = 0; index < startOffset; index += 1) {
    const spacer = document.createElement('span');
    spacer.className = 'contribution-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    cells.appendChild(spacer);
  }

  for (let index = 0; index < dates.length; index += 1) {
    const date = dates[index];
    const dateKey = localDateKey(date);
    const entry = dayByDate.get(dateKey) || { count: 0, level: 0 };
    const count = Math.max(0, Number(entry.count) || 0);
    const level = Math.min(4, Math.max(0, Number(entry.level) || 0));
    total += count;

    if (index === 0 || date.getDate() === 1) {
      const monthLabel = document.createElement('span');
      monthLabel.textContent = date.toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'ru-RU', { month: 'short' });
      monthLabel.style.gridColumn = String(Math.floor((startOffset + index) / 7) + 1);
      monthMarkers.appendChild(monthLabel);
    }

    const cell = document.createElement('span');
    cell.className = 'contribution-cell';
    cell.dataset.level = String(level);
    cell.setAttribute('role', 'gridcell');
    const readableDate = date.toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'ru-RU', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
    const tooltip = currentLanguage === 'en'
      ? `${count} ${count === 1 ? 'contribution' : 'contributions'} on ${readableDate}`
      : `${readableDate}: ${count} contributions`;
    cell.title = tooltip;
    cell.setAttribute('aria-label', tooltip);
    cells.appendChild(cell);
  }

  contributionMonths.appendChild(monthMarkers);
  contributionGrid.appendChild(cells);
  contributionGrid.setAttribute('aria-colcount', String(weekCount));
  contributionTotal.textContent = total.toLocaleString(currentLanguage === 'en' ? 'en-US' : 'ru-RU');
}

async function loadContributions() {
  setContributionStatus(tr('loading'));
  try {
    const response = await fetch('data/contributions.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
    contributionUpdatedAt = payload.updatedAt || null;
    if (!Array.isArray(payload.contributions) || payload.contributions.length === 0) {
      throw new Error('Contribution data is empty');
    }

    contributionDays = payload.contributions
      .filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day.date))
      .map((day) => ({
        date: day.date,
        count: Number(day.count) || 0,
        level: Math.min(4, Math.max(0, Number(day.level) || 0)),
      }));

    if (contributionDays.length === 0) throw new Error('No valid contribution days');

    renderContributionGrid();
    setContributionStatus(tr('loaded'));

    if (payload.updatedAt) {
      const updated = new Date(payload.updatedAt);
      const dateLabel = Number.isNaN(updated.getTime()) ? payload.updatedAt : updated.toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
      contributionFootnote.textContent = tr('updated') + dateLabel;
    } else {
      contributionFootnote.textContent = tr('footnote');
    }
  } catch (error) {
    contributionDays = null;
    contributionTotal.textContent = '—';
    contributionLabel.textContent = tr('selected');
    contributionGrid.replaceChildren();
    contributionMonths.replaceChildren();
    setContributionStatus(tr('unavailable'), true);
    contributionFootnote.textContent = tr('footnote');
  }
}

contributionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeContributionRange = Number(button.dataset.range);
    renderContributionGrid();
  });
});

loadContributions();
applyLanguage(currentLanguage);

// Плавное появление секций при прокрутке.
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

document.getElementById('year').textContent = new Date().getFullYear();

// Count actual page loads for the website (not GitHub profile visits).
async function loadSiteViews() {
  const output = document.getElementById('site-views-count');
  try {
    const response = await fetch('https://countapi.mileshilliard.com/api/v1/hit/luinty_profile_site_views_2026', { cache: 'no-store', mode: 'cors' });
    if (!response.ok) throw new Error('Counter request failed');
    const data = await response.json();
    const value = Number(data.value);
    if (!Number.isFinite(value)) throw new Error('Invalid counter value');
    output.textContent = value.toLocaleString(currentLanguage === 'en' ? 'en-US' : 'ru-RU');
  } catch (error) {
    output.textContent = '—';
    output.title = 'Счётчик временно недоступен';
  }
}
loadSiteViews();
