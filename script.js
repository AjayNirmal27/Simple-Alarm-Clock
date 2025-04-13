const alarmSound = document.getElementById("alarmSound");
const clock = document.getElementById("clock");
const alarmInput = document.getElementById("alarmTimePicker");
const labelInput = document.getElementById("alarmLabel");

const statusText = document.getElementById("status");
const stopBtn = document.getElementById("stopBtn");
const snoozeBtn = document.getElementById("snoozeBtn");

let alarmTime = null;
let alarmLabel = "";
let isRinging = false;
let isRepeating = false;
let isRepeatOnce = false;

// Setup Flatpickr with 12hr format
flatpickr("#alarmTimePicker", {
  enableTime: true,
  noCalendar: true,
  dateFormat: "h:i K",
  time_24hr: false
});

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const paddedHours = String((hours % 12) || 12).padStart(2, "0");

  const fullDisplay = `${paddedHours}:${minutes}:${seconds} ${ampm}`;
  const compareTime = `${paddedHours}:${minutes} ${ampm}`;

  clock.textContent = fullDisplay;

  if (alarmTime === compareTime && !isRinging) {
    triggerAlarm();
  }
}

function setAlarm() {
  const inputValue = alarmInput.value.trim();
  if (!inputValue) {
    statusText.textContent = "❌ Please select a valid time.";
    return;
  }

  const tempDate = new Date(`1970-01-01T${convertTo24Hour(inputValue)}:00`);
  const hours = tempDate.getHours();
  const minutes = tempDate.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const paddedHours = String((hours % 12) || 12).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");

  alarmTime = `${paddedHours}:${paddedMinutes} ${ampm}`;
  alarmLabel = labelInput.value.trim() || "Alarm";
  isRinging = false;

  isRepeating = document.getElementById("repeatDaily").checked;
  isRepeatOnce = document.getElementById("repeatOnce").checked;

  statusText.textContent = `🔔 Alarm set for ${alarmTime} (${alarmLabel})`;
  stopBtn.disabled = true;
  snoozeBtn.disabled = true;
  showToast("✅ Alarm Set Successfully!");
}

function triggerAlarm() {
  isRinging = true;
  statusText.textContent = `⏰ ${alarmLabel} is ringing!`;
  stopBtn.disabled = false;
  snoozeBtn.disabled = false;
  document.querySelector(".container").classList.add("ringing");

  try {
    alarmSound.currentTime = 0;

    // Delay play slightly to avoid interrupt error
    requestAnimationFrame(() => {
      const playPromise = alarmSound.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log("✅ Alarm sound playing."))
          .catch(error => {
            console.error("🚫 Alarm sound failed to play:", error);
            showToast("⚠️ Tap the screen to enable sound playback.");
          });
      }
    });
  } catch (err) {
    console.error("🚫 Error triggering alarm:", err);
  }
}


function stopAlarm() {
  alarmSound.pause();
  alarmSound.currentTime = 0;
  isRinging = false;
  stopBtn.disabled = true;
  snoozeBtn.disabled = true;
  document.querySelector(".container").classList.remove("ringing");

  if (!isRepeating && !isRepeatOnce) {
    alarmTime = null;
    statusText.textContent = "✅ Alarm stopped.";
  }

  if (isRepeatOnce) {
    alarmTime = null;
    document.getElementById("repeatOnce").checked = false;
    statusText.textContent = "✅ One-time alarm completed.";
  }

  setTimeout(() => {
    statusText.textContent = "";
  }, 3000);
}

function snoozeAlarm() {
  const [time, period] = alarmTime.split(" ");
  const [hourStr, minuteStr] = time.split(":");
  let hours = parseInt(hourStr);
  let minutes = parseInt(minuteStr);

  minutes += 10;
  if (minutes >= 60) {
    minutes -= 60;
    hours += 1;
    if (hours > 12) hours = 1;
  }

  const newHour = String(hours).padStart(2, "0");
  const newMinute = String(minutes).padStart(2, "0");
  alarmTime = `${newHour}:${newMinute} ${period}`;

  alarmSound.pause();
  alarmSound.currentTime = 0;
  isRinging = false;
  stopBtn.disabled = true;
  snoozeBtn.disabled = true;
  statusText.textContent = `😴 Snoozed to ${alarmTime}`;
  document.querySelector(".container").classList.remove("ringing");
}

function convertTo24Hour(timeStr) {
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

document.getElementById("repeatDaily").addEventListener("change", function () {
  if (this.checked) document.getElementById("repeatOnce").checked = false;
});

document.getElementById("repeatOnce").addEventListener("change", function () {
  if (this.checked) document.getElementById("repeatDaily").checked = false;
});

setInterval(updateClock, 1000);
updateClock();
