// 音声プレイヤー本体
const audio = new Audio();
let currentObjectUrl = null;

// HTML側で用意する要素
const fileInput = document.getElementById("fileInput");
const playPauseButton = document.getElementById("playPauseButton");
const stopButton = document.getElementById("stopButton");
const loopCheckbox = document.getElementById("loopCheckbox");
const volumeSlider = document.getElementById("volumeSlider");

// ファイル選択
fileInput?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (currentObjectUrl) {
    alert("現在の音源を停止してから別の音源を選択してください");
    event.target.value = "";
    return;
  }

  currentObjectUrl = URL.createObjectURL(file);
  audio.src = currentObjectUrl;
  audio.load();

  audio.loop = true;
  setupMediaSession(file);
});

playPauseButton?.addEventListener("click", async () => {
  try {
    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
  } catch (error) {
    console.error("再生に失敗しました", error);
  }
});

audio.addEventListener("play", () => {
  if (playPauseButton) {
    playPauseButton.textContent = "||";
  }
});

audio.addEventListener("pause", () => {
  if (playPauseButton) {
    playPauseButton.textContent = "▶";
  }
});

// 停止
stopButton?.addEventListener("click", () => {
  audio.pause();
  audio.currentTime = 0;

  if (playPauseButton) {
    playPauseButton.textContent = "▶";
  }

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }

  audio.removeAttribute("src");
  audio.load();

  if (fileInput) {
    fileInput.value = "";
  }
});

// 音量調整
volumeSlider?.addEventListener("input", (event) => {
  audio.volume = Number(event.target.value);
});

// Media Session API
function setupMediaSession(file) {
  if (!("mediaSession" in navigator)) {
    return;
  }

  navigator.mediaSession.metadata = new MediaMetadata({
    title: file.name,
    artist: "Local Audio",
    album: "Uploaded File",
  });

  navigator.mediaSession.setActionHandler("play", async () => {
    await audio.play();
  });

  navigator.mediaSession.setActionHandler("pause", () => {
    audio.pause();
  });

  navigator.mediaSession.setActionHandler("stop", () => {
    audio.pause();
    audio.currentTime = 0;
  });

  navigator.mediaSession.setActionHandler("seekbackward", () => {
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  });

  navigator.mediaSession.setActionHandler("seekforward", () => {
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
  });
}

// 再生位置をロック画面へ反映
setInterval(() => {
  if (
    "mediaSession" in navigator &&
    "setPositionState" in navigator.mediaSession &&
    Number.isFinite(audio.duration)
  ) {
    navigator.mediaSession.setPositionState({
      duration: audio.duration,
      playbackRate: audio.playbackRate,
      position: audio.currentTime,
    });
  }
}, 1000);
