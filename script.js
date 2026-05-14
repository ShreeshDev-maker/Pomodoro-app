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
const volumeSlider = document.getElementById("volume-slider");
const volumeDisplay = document.getElementById("volume-display");
const motivationalQuoteDisplay = document.getElementById("motivational-quote");

// State Variables
let timerState = {
  isRunning: false,
  isPaused: false,
  currentSession: "work", // work, break, long-break
  sessionType: "work",
  totalSeconds: 50 * 60,
  remainingSeconds: 50 * 60,
  workRemaining: 50 * 60,
  breakRemaining: 10 * 60,
  longBreakRemaining: 15 * 60,
  interval: null,
  quoteInterval: null,
  currentQuoteIndex: 0,
  sessionsCompleted: 0,
  totalFocusTime: 0,
  sessionElapsedTime: 0,
  workDuration: 50,
  breakDuration: 10,
  longBreakDuration: 15,
  musicFiles: [
    "./music/lofi1.mp3",
    "./music/lofi2.mp3",
    "./music/lofi3.mp3",
    "./music/lofi4.mp3",
    "./music/lofi5.mp3",
    "./music/lofi6.mp3",
    "./music/lofi7.mp3",
    "./music/lofi8.mp3",
    "./music/lofi9.mp3",
    "./music/lofi10.mp3",
    "./music/lofi11.mp3",
    "./music/lofi12.mp3",
    "./music/lofi13.mp3",
    "./music/lofi14.mp3",
    "./music/lofi15.mp3",
  ],
  currentMusicIndex: 0,
  isMusicPlaying: false,
  volume: 0.7,
  quotes: [
    "Focus is the gateway to success! 🎯",
    "You've got this! Push through! 💪",
    "Every minute counts, make it matter! ⏰",
    "Stay focused, stay determined! 🔥",
    "Progress over perfection! 📈",
    "You are stronger than your distractions! 🛡️",
    "One step at a time, you're doing great! 👣",
    "Your future self will thank you! 🙏",
    "Keep calm and pomodoro on! 🍅",
    "Consistency is key to success! 🔑",
    "Great things take time and effort! ⭐",
    "Don't break the chain! 🔗",
    "You're building momentum! 🚀",
    "Small focused sessions = Big results! 📊",
    "Stay in the zone! 🎪",
    "Mind over matter! 🧠",
    "You're closer to your goals! 🎊",
    "Embrace the grind! 💎",
    "Success starts with focus! 🌟",
    "Keep pushing, you're almost there! ⛰️"
  ]
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
  volumeSlider.addEventListener("input", updateVolume);
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
    // Check if we have outdated values - if so, reset to new defaults
    if (data.workDuration === 25 || data.breakDuration === 5 || data.breakDuration === 7) {
      // Clear old data and use new defaults
      localStorage.removeItem("pomodoroSettings");
      timerState.workDuration = parseInt(workDurationInput.value) || 50;
      timerState.breakDuration = parseInt(breakDurationInput.value) || 10;
      timerState.longBreakDuration = parseInt(longBreakDurationInput.value) || 15;
      timerState.sessionsCompleted = 0;
      timerState.totalFocusTime = 0;
    } else {
      // Validate work duration is between 5-60 minutes (reasonable pomodoro range)
      const workDur = parseInt(data.workDuration);
      timerState.workDuration = (workDur >= 5 && workDur <= 60) ? workDur : 50;
      
      // Validate break duration is between 1-30 minutes
      const breakDur = parseInt(data.breakDuration);
      timerState.breakDuration = (breakDur >= 1 && breakDur <= 30) ? breakDur : 10;
      
      // Validate long break is between 5-60 minutes
      const longBreakDur = parseInt(data.longBreakDuration);
      timerState.longBreakDuration = (longBreakDur >= 5 && longBreakDur <= 60) ? longBreakDur : 15;
      
      timerState.sessionsCompleted = data.sessionsCompleted || 0;
      timerState.totalFocusTime = data.totalFocusTime || 0;
    }
  } else {
    // No saved data - use values from HTML inputs (50, 10, 15)
    timerState.workDuration = parseInt(workDurationInput.value) || 50;
    timerState.breakDuration = parseInt(breakDurationInput.value) || 10;
    timerState.longBreakDuration = parseInt(longBreakDurationInput.value) || 15;
  }

  workDurationInput.value = timerState.workDuration;
  breakDurationInput.value = timerState.breakDuration;
  longBreakDurationInput.value = timerState.longBreakDuration;
  
  // Update session-specific remaining times
  timerState.workRemaining = timerState.workDuration * 60;
  timerState.breakRemaining = timerState.breakDuration * 60;
  timerState.longBreakRemaining = timerState.longBreakDuration * 60;
  
  // Update display to reflect loaded durations
  if (timerState.currentSession === "work") {
    timerState.totalSeconds = timerState.workDuration * 60;
    timerState.remainingSeconds = timerState.totalSeconds;
  } else if (timerState.currentSession === "break") {
    timerState.totalSeconds = timerState.breakDuration * 60;
    timerState.remainingSeconds = timerState.totalSeconds;
  } else if (timerState.currentSession === "long-break") {
    timerState.totalSeconds = timerState.longBreakDuration * 60;
    timerState.remainingSeconds = timerState.totalSeconds;
  }
  
  updateDisplay();
  updateStatsDisplay();
}

// Change Session Type
function changeSession(e) {
  const sessionType = e.target.dataset.session;
  
  // If clicking the same session, just return
  if (timerState.currentSession === sessionType && !timerState.isRunning && !timerState.isPaused) {
    return;
  }
  
  // Save current remaining seconds before switching (only if actively running/paused)
  if (timerState.isRunning || timerState.isPaused) {
    switch (timerState.currentSession) {
      case "work":
        timerState.workRemaining = timerState.remainingSeconds;
        break;
      case "break":
        timerState.breakRemaining = timerState.remainingSeconds;
        break;
      case "long-break":
        timerState.longBreakRemaining = timerState.remainingSeconds;
        break;
    }
  }
  
  timerState.currentSession = sessionType;

  // Update active button
  sessionBtns.forEach((btn) => btn.classList.remove("active"));
  e.target.classList.add("active");

  // Stop running or paused timer and quote rotation
  if (timerState.isRunning || timerState.isPaused) {
    clearInterval(timerState.interval);
    clearInterval(timerState.quoteInterval);
    timerState.isRunning = false;
    timerState.isPaused = false;
  }

  // Set session type and restore remaining time
  switch (sessionType) {
    case "work":
      timerState.totalSeconds = timerState.workDuration * 60;
      timerState.remainingSeconds = timerState.workRemaining || timerState.totalSeconds;
      currentSessionDisplay.textContent = "Work Session";
      break;
    case "break":
      timerState.totalSeconds = timerState.breakDuration * 60;
      timerState.remainingSeconds = timerState.breakRemaining || timerState.totalSeconds;
      currentSessionDisplay.textContent = "Short Break";
      break;
    case "long-break":
      timerState.totalSeconds = timerState.longBreakDuration * 60;
      timerState.remainingSeconds = timerState.longBreakRemaining || timerState.totalSeconds;
      currentSessionDisplay.textContent = "Long Break";
      break;
  }

  timerState.currentQuoteIndex = 0;
  resetCircle();
  updateDisplay();
  motivationalQuoteDisplay.textContent = "Let's get started! 💪";
  toggleButtons();
}

// Update Work Duration
function updateWorkDuration(e) {
  const value = parseInt(e.target.value) || 25;
  const validValue = Math.max(1, Math.min(60, value));
  timerState.workDuration = validValue;
  e.target.value = validValue;
  
  if (timerState.currentSession === "work" && !timerState.isRunning && !timerState.isPaused) {
    timerState.totalSeconds = timerState.workDuration * 60;
    timerState.workRemaining = timerState.totalSeconds;
    timerState.remainingSeconds = timerState.totalSeconds;
    updateDisplay();
  }
  saveSettings();
}

// Update Break Duration
function updateBreakDuration(e) {
  const value = parseInt(e.target.value) || 5;
  const validValue = Math.max(1, Math.min(30, value));
  timerState.breakDuration = validValue;
  e.target.value = validValue;
  
  if (timerState.currentSession === "break" && !timerState.isRunning && !timerState.isPaused) {
    timerState.totalSeconds = timerState.breakDuration * 60;
    timerState.breakRemaining = timerState.totalSeconds;
    timerState.remainingSeconds = timerState.totalSeconds;
    updateDisplay();
  }
  saveSettings();
}

// Update Long Break Duration
function updateLongBreakDuration(e) {
  const value = parseInt(e.target.value) || 15;
  const validValue = Math.max(1, Math.min(60, value));
  timerState.longBreakDuration = validValue;
  e.target.value = validValue;
  
  if (timerState.currentSession === "long-break" && !timerState.isRunning && !timerState.isPaused) {
    timerState.totalSeconds = timerState.longBreakDuration * 60;
    timerState.longBreakRemaining = timerState.totalSeconds;
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
  
  // Auto-play music when work session starts
  if (timerState.currentSession === "work" && !timerState.isMusicPlaying) {
    playMusic();
  }
  
  // Start quote rotation every 6 minutes (360000ms)
  displayRandomQuote();
  timerState.quoteInterval = setInterval(displayRandomQuote, 360000);

  let secondsCounter = 0;
  timerState.interval = setInterval(() => {
    timerState.remainingSeconds--;
    secondsCounter++;

    // Update display and circle
    updateDisplay();
    updateCircle();

    // Update focus time every minute for work sessions
    if (timerState.currentSession === "work" && secondsCounter % 60 === 0) {
      timerState.sessionElapsedTime = Math.floor(
        (timerState.totalSeconds - timerState.remainingSeconds) / 60
      );
      timerState.totalFocusTime = 
        (timerState.sessionsCompleted * timerState.workDuration) + 
        timerState.sessionElapsedTime;
      updateStatsDisplay();
    }

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
  clearInterval(timerState.quoteInterval);
  toggleButtons();
}

// Resume Timer
function resumeTimer() {
  startTimer();
}

// Reset Timer
function resetTimer() {
  clearInterval(timerState.interval);
  clearInterval(timerState.quoteInterval);
  timerState.isRunning = false;
  timerState.isPaused = false;

  switch (timerState.currentSession) {
    case "work":
      timerState.totalSeconds = timerState.workDuration * 60;
      timerState.workRemaining = timerState.totalSeconds;
      break;
    case "break":
      timerState.totalSeconds = timerState.breakDuration * 60;
      timerState.breakRemaining = timerState.totalSeconds;
      break;
    case "long-break":
      timerState.totalSeconds = timerState.longBreakDuration * 60;
      timerState.longBreakRemaining = timerState.totalSeconds;
      break;
  }

  timerState.remainingSeconds = timerState.totalSeconds;
  updateDisplay();
  resetCircle();
  toggleButtons();
  motivationalQuoteDisplay.textContent = "Let's get started! 💪";
}

// Timer Complete
function timerComplete() {
  clearInterval(timerState.interval);
  clearInterval(timerState.quoteInterval);
  timerState.isRunning = false;
  timerState.isPaused = false;

  // Update stats for work sessions
  if (timerState.currentSession === "work") {
    timerState.sessionsCompleted++;
  }

  saveSettings();
  updateStatsDisplay();

  // Notify user
  alert(
    `${timerState.currentSession === "work" ? "Work" : "Break"} session complete!`
  );

  // Auto-switch and auto-start next session
  if (timerState.currentSession === "work") {
    // Before switching, reset work remaining to full duration
    timerState.workRemaining = timerState.workDuration * 60;
    // Play bell sound
    if (bellSound) {
      bellSound.play().catch(() => {
        console.log("Audio playback failed");
      });
    }
    // Stop music when break starts
    if (timerState.isMusicPlaying) {
      pauseMusic();
    }
    const breakSession = document.querySelector('[data-session="break"]');
    breakSession.click(); // Switch to break
    setTimeout(() => {
      startTimer(); // Auto-start the break
    }, 500);
  } else {
    // Before switching, reset break remaining to full duration
    timerState.breakRemaining = timerState.breakDuration * 60;
    // Reset elapsed time for next work session
    timerState.sessionElapsedTime = 0;
    const workSession = document.querySelector('[data-session="work"]');
    workSession.click(); // Switch back to work
    // Auto-start the next work session
    setTimeout(() => {
      startTimer();
    }, 500);
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
    pauseBtn.textContent = "Pause";
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

// Display Random Motivational Quote
function displayRandomQuote() {
  const randomIndex = Math.floor(Math.random() * timerState.quotes.length);
  motivationalQuoteDisplay.textContent = timerState.quotes[randomIndex];
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
  
  // Always set the src to ensure correct music file is loaded
  backgroundMusic.src = musicPath;
  backgroundMusic.volume = timerState.volume;
  
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

  backgroundMusic.volume = timerState.volume;

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
  const totalSongs = timerState.musicFiles.length;
  nowPlayingDisplay.textContent = `Track ${songNumber} of ${totalSongs}`;
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

// Update Volume
function updateVolume(e) {
  const volumeValue = parseInt(e.target.value);
  timerState.volume = volumeValue / 100;
  backgroundMusic.volume = timerState.volume;
  volumeDisplay.textContent = `${volumeValue}%`;
}

// Initialize app
init();