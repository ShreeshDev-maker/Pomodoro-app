// Pomodoro Timer App

// DOM Elements
const startBtn = document.querySelector(".btn-start");
const pauseBtn = document.querySelector(".btn-pause");
const resetBtn = document.querySelector(".btn-reset");
const minutesDisplay = document.querySelector(".minutes");
const secondsDisplay = document.querySelector(".seconds");
const sessionBtns = document.querySelectorAll(".session-btn");
const currentSessionDisplay = document.querySelector(".current-session");
const workDurationInput = document.getElementById("work-duration");
const breakDurationInput = document.getElementById("break-duration");
const longBreakDurationInput = document.getElementById("long-break-duration");
const sessionsCountDisplay = document.querySelector(".sessions-count");
const focusTimeDisplay = document.querySelector(".focus-time");
const rightCircle = document.querySelector(".right-side.circle");
const leftCircle = document.querySelector(".left-side.circle");

// Audio
const bellSound = new Audio("./sounds/bell.wav");
const backgroundMusic = new Audio();
const musicToggleBtn = document.getElementById("music-toggle");
const nowPlayingDisplay = document.getElementById("now-playing");

// State Variables
let timerState = {
  isRunning: false,
  isPaused: false,
  currentSession: "work", // work, break, long-break
  sessionType: "work",
  totalSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  interval: null,
  sessionsCompleted: 0,
  totalFocusTime: 0,
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  musicFiles: [
    "./music/lofi1.mp3",
    "./music/lofi2.mp3",
    "./music/lofi3.mp3",
    "./music/lofi4.mp3",
    "./music/lofi5.mp3",
    "./music/lofi6.mp3",
  ],
  currentMusicIndex: 0,
  isMusicPlaying: false,
};

// Initialize
function init() {
  updateDisplay();
  attachEventListeners();
  loadSettings();
}

// Attach Event Listeners
function attachEventListeners() {
  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", () => {
    if (timerState.isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  });
  resetBtn.addEventListener("click", resetTimer);
  sessionBtns.forEach((btn) => {
    btn.addEventListener("click", changeSession);
  });
  workDurationInput.addEventListener("change", updateWorkDuration);
  breakDurationInput.addEventListener("change", updateBreakDuration);
  longBreakDurationInput.addEventListener("change", updateLongBreakDuration);
  musicToggleBtn.addEventListener("click", toggleMusic);
  backgroundMusic.addEventListener("ended", playNextMusic);
}

// Save Settings to Local Storage
function saveSettings() {
  localStorage.setItem(
    "pomodoroSettings",
    JSON.stringify({
      workDuration: timerState.workDuration,
      breakDuration: timerState.breakDuration,
      longBreakDuration: timerState.longBreakDuration,
      sessionsCompleted: timerState.sessionsCompleted,
      totalFocusTime: timerState.totalFocusTime,
    })
  );
}

// Load Settings from Local Storage
function loadSettings() {
  const saved = localStorage.getItem("pomodoroSettings");
  if (saved) {
    const data = JSON.parse(saved);
    timerState.workDuration = data.workDuration || 25;
    timerState.breakDuration = data.breakDuration || 5;
    timerState.longBreakDuration = data.longBreakDuration || 15;
    timerState.sessionsCompleted = data.sessionsCompleted || 0;
    timerState.totalFocusTime = data.totalFocusTime || 0;

    workDurationInput.value = timerState.workDuration;
    breakDurationInput.value = timerState.breakDuration;
    longBreakDurationInput.value = timerState.longBreakDuration;
    updateStatsDisplay();
  }
}

// Change Session Type
function changeSession(e) {
  const sessionType = e.target.dataset.session;
  timerState.currentSession = sessionType;

  // Update active button
  sessionBtns.forEach((btn) => btn.classList.remove("active"));
  e.target.classList.add("active");

  // Stop running timer
  if (timerState.isRunning) {
    clearInterval(timerState.interval);
    timerState.isRunning = false;
    timerState.isPaused = false;
  }

  // Set session type
  switch (sessionType) {
    case "work":
      timerState.totalSeconds = timerState.workDuration * 60;
      currentSessionDisplay.textContent = "Work Session";
      break;
    case "break":
      timerState.totalSeconds = timerState.breakDuration * 60;
      currentSessionDisplay.textContent = "Short Break";
      break;
    case "long-break":
      timerState.totalSeconds = timerState.longBreakDuration * 60;
      currentSessionDisplay.textContent = "Long Break";
      break;
  }

  timerState.remainingSeconds = timerState.totalSeconds;
  resetCircle();
  updateDisplay();
  toggleButtons();
}

// Update Work Duration
function updateWorkDuration(e) {
  timerState.workDuration = parseInt(e.target.value);
  if (timerState.currentSession === "work" && !timerState.isRunning) {
    timerState.totalSeconds = timerState.workDuration * 60;
    timerState.remainingSeconds = timerState.totalSeconds;
    updateDisplay();
  }
  saveSettings();
}

// Update Break Duration
function updateBreakDuration(e) {
  timerState.breakDuration = parseInt(e.target.value);
  if (timerState.currentSession === "break" && !timerState.isRunning) {
    timerState.totalSeconds = timerState.breakDuration * 60;
    timerState.remainingSeconds = timerState.totalSeconds;
    updateDisplay();
  }
  saveSettings();
}

// Update Long Break Duration
function updateLongBreakDuration(e) {
  timerState.longBreakDuration = parseInt(e.target.value);
  if (timerState.currentSession === "long-break" && !timerState.isRunning) {
    timerState.totalSeconds = timerState.longBreakDuration * 60;
    timerState.remainingSeconds = timerState.totalSeconds;
    updateDisplay();
  }
  saveSettings();
}

// Start Timer
function startTimer() {
  if (timerState.isRunning) return;

  timerState.isRunning = true;
  timerState.isPaused = false;
  toggleButtons();

  timerState.interval = setInterval(() => {
    timerState.remainingSeconds--;

    // Update display and circle
    updateDisplay();
    updateCircle();

    // Timer complete
    if (timerState.remainingSeconds <= 0) {
      timerComplete();
    }
  }, 1000);
}

// Pause Timer
function pauseTimer() {
  timerState.isPaused = true;
  timerState.isRunning = false;
  clearInterval(timerState.interval);
  toggleButtons();
}

// Resume Timer
function resumeTimer() {
  startTimer();
}

// Reset Timer
function resetTimer() {
  clearInterval(timerState.interval);
  timerState.isRunning = false;
  timerState.isPaused = false;

  switch (timerState.currentSession) {
    case "work":
      timerState.totalSeconds = timerState.workDuration * 60;
      break;
    case "break":
      timerState.totalSeconds = timerState.breakDuration * 60;
      break;
    case "long-break":
      timerState.totalSeconds = timerState.longBreakDuration * 60;
      break;
  }

  timerState.remainingSeconds = timerState.totalSeconds;
  updateDisplay();
  resetCircle();
  toggleButtons();
}

// Timer Complete
function timerComplete() {
  clearInterval(timerState.interval);
  timerState.isRunning = false;
  timerState.isPaused = false;

  // Play sound
  if (bellSound) {
    bellSound.play().catch(() => {
      console.log("Audio playback failed");
    });
  }

  // Update stats for work sessions
  if (timerState.currentSession === "work") {
    timerState.sessionsCompleted++;
    timerState.totalFocusTime += timerState.workDuration;
  }

  saveSettings();
  updateStatsDisplay();

  // Notify user
  alert(
    `${timerState.currentSession === "work" ? "Work" : "Break"} session complete!`
  );

  // Auto-switch and auto-start next session
  if (timerState.currentSession === "work") {
    const breakSession = document.querySelector('[data-session="break"]');
    breakSession.click(); // Switch to break
    setTimeout(() => {
      startTimer(); // Auto-start the break
    }, 500);
  } else {
    // After break, go back to work
    const workSession = document.querySelector('[data-session="work"]');
    workSession.click(); // Switch back to work
  }

  toggleButtons();
}

// Update Display
function updateDisplay() {
  const minutes = Math.floor(timerState.remainingSeconds / 60);
  const seconds = timerState.remainingSeconds % 60;

  minutesDisplay.textContent = minutes.toString().padStart(2, "0");
  secondsDisplay.textContent = seconds.toString().padStart(2, "0");
}

// Update Circle Progress
function updateCircle() {
  const progressPercent =
    1 - timerState.remainingSeconds / timerState.totalSeconds;
  const rotationDegrees = progressPercent * 360;

  if (rotationDegrees <= 180) {
    // Right semicircle
    rightCircle.style.transform = `rotate(${rotationDegrees}deg)`;
    leftCircle.style.transform = `rotate(0deg)`;
  } else {
    // Both semicircles
    rightCircle.style.transform = `rotate(180deg)`;
    leftCircle.style.transform = `rotate(${rotationDegrees - 180}deg)`;
  }
}

// Reset Circle
function resetCircle() {
  rightCircle.style.transform = "rotate(0deg)";
  leftCircle.style.transform = "rotate(0deg)";
}

// Update Stats Display
function updateStatsDisplay() {
  sessionsCountDisplay.textContent = timerState.sessionsCompleted;
  focusTimeDisplay.textContent = `${timerState.totalFocusTime}m`;
}

// Toggle Button Visibility
function toggleButtons() {
  if (timerState.isRunning) {
    startBtn.style.display = "none";
    pauseBtn.style.display = "inline-block";
  } else if (timerState.isPaused) {
    pauseBtn.textContent = "Resume";
    pauseBtn.style.display = "inline-block";
    startBtn.style.display = "none";
  } else {
    startBtn.style.display = "inline-block";
    pauseBtn.style.display = "none";
    pauseBtn.textContent = "Pause";
  }
}

// Music Player Functions
function toggleMusic() {
  if (timerState.isMusicPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
}

function playMusic() {
  if (timerState.isMusicPlaying) return;

  timerState.isMusicPlaying = true;
  const musicPath = timerState.musicFiles[timerState.currentMusicIndex];
  
  // Only set src if it's not already the current track
  if (backgroundMusic.src !== musicPath && !backgroundMusic.src) {
    backgroundMusic.src = musicPath;
  }
  
  backgroundMusic.play().catch((error) => {
    console.log("Music playback failed:", error);
    timerState.isMusicPlaying = false;
  });

  updateMusicDisplay();
  updateMusicButton();
}

function pauseMusic() {
  backgroundMusic.pause();
  timerState.isMusicPlaying = false;
  updateMusicButton();
  nowPlayingDisplay.textContent = "Music paused";
}

function playNextMusic() {
  // Move to next song
  timerState.currentMusicIndex =
    (timerState.currentMusicIndex + 1) %
    timerState.musicFiles.length;

  // Load next file
  backgroundMusic.src =
    timerState.musicFiles[timerState.currentMusicIndex];

  // Play next song
  backgroundMusic.play()
    .then(() => {
      timerState.isMusicPlaying = true;

      updateMusicDisplay();
      updateMusicButton();
    })
    .catch((error) => {
      console.log("Next song failed:", error);
    });
}

function updateMusicDisplay() {
  const songNumber = timerState.currentMusicIndex + 1;
  nowPlayingDisplay.textContent = "Lo-fi vibes flowing";
}

function updateMusicButton() {
  if (timerState.isMusicPlaying) {
    musicToggleBtn.textContent = "🎵 Stop Music";
    musicToggleBtn.classList.add("active");
  } else {
    musicToggleBtn.textContent = "🎵 Play Music";
    musicToggleBtn.classList.remove("active");
  }
}

// Initialize app
init();