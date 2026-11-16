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

// Аудио подключается локально, без внешних музыкальных сервисов.
audio.src = TRACK_SRC;

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
      trackStatus.textContent = 'Добавь MP3 в папку assets — см. README';
    }
  } else {
    audio.pause();
  }
});

audio.addEventListener('play', () => {
  player.classList.add('is-playing');
  playButton.setAttribute('aria-label', 'Поставить на паузу');
  trackStatus.textContent = 'now playing';
});
audio.addEventListener('pause', () => {
  player.classList.remove('is-playing');
  playButton.setAttribute('aria-label', 'Воспроизвести трек');
  if (!audio.ended && audio.currentTime > 0) trackStatus.textContent = 'paused';
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
  trackStatus.textContent = 'a little soundtrack for this moment';
});
audio.addEventListener('error', () => {
  trackStatus.textContent = 'Добавь MP3 в папку assets — см. README';
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
  30: { label: 'contributions in the last 30 days', days: 30 },
  90: { label: 'contributions in the last 3 months', months: 3 },
  365: { label: 'contributions in the last year', months: 12 },
};

let contributionDays = null;
let activeContributionRange = 30;

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
  contributionLabel.textContent = range.label;

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
      monthLabel.textContent = date.toLocaleDateString('en-US', { month: 'short' });
      monthLabel.style.gridColumn = String(Math.floor((startOffset + index) / 7) + 1);
      monthMarkers.appendChild(monthLabel);
    }

    const cell = document.createElement('span');
    cell.className = 'contribution-cell';
    cell.dataset.level = String(level);
    cell.setAttribute('role', 'gridcell');
    const readableDate = date.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
    const tooltip = `${count} ${count === 1 ? 'contribution' : 'contributions'} on ${readableDate}`;
    cell.title = tooltip;
    cell.setAttribute('aria-label', tooltip);
    cells.appendChild(cell);
  }

  contributionMonths.appendChild(monthMarkers);
  contributionGrid.appendChild(cells);
  contributionGrid.setAttribute('aria-colcount', String(weekCount));
  contributionTotal.textContent = total.toLocaleString('en-US');
}

async function loadContributions() {
  setContributionStatus('loading activity');
  try {
    const response = await fetch('data/contributions.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
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
    setContributionStatus('activity loaded');

    if (payload.updatedAt) {
      const updated = new Date(payload.updatedAt);
      const dateLabel = Number.isNaN(updated.getTime())
        ? payload.updatedAt
        : updated.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      contributionFootnote.textContent = `GitHub profile activity · data refreshed ${dateLabel}`;
    } else {
      contributionFootnote.textContent = 'GitHub profile activity · refresh the data with the update script';
    }
  } catch (error) {
    contributionDays = null;
    contributionTotal.textContent = '—';
    contributionLabel.textContent = 'contributions in the selected period';
    contributionGrid.replaceChildren();
    contributionMonths.replaceChildren();
    setContributionStatus('data unavailable', true);
    contributionFootnote.textContent = 'Run: python scripts/update_contributions.py — details in README';
  }
}

contributionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeContributionRange = Number(button.dataset.range);
    renderContributionGrid();
  });
});

loadContributions();

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
