// script.js (robust version)
console.log("lets write JavaScript");

let currentSong = new Audio();

// Helper - format time
function formatTime(seconds) {
  if (isNaN(seconds) || seconds === Infinity) return "00:00";
  seconds = Math.floor(seconds);
  let minutes = Math.floor(seconds / 60);
  let secs = seconds % 60;
  return `${minutes < 10 ? "0" + minutes : minutes}:${secs < 10 ? "0" + secs : secs}`;
}

// Robust getSongs: parse returned HTML safely and extract mp3 filenames
// The NEW getSongs function (no server needed)
async function getSongs() {
  console.log("Loading songs manually from the list.");
  let songs = [
    "410.mp3",
    "Aaj Ki Raat_ Shree 2 _ Tamannaah Bhatia _ Neeti Mohan.mp3",
    "Aam Jahe Munde_ Parmish Verma _ Pardhaan.mp3",
    "Aaye Haaye_ Karan Aujla _ Nora Fatehi.mp3",
    "Akhiyaan Gulaab_ Shahid Kapoor _ Kriti Sanon.mp3",
    "ANIMAL_ ARJAN VAILLY _ Ranbir Kapoor.mp3",
    "ANIMAL_ SATRANGA Ranbir Kapoor.mp3",
    "THAA - Varinder Brar_ Punjabi Hit.mp3",
    "THE LAST RIDE - Offical Video _ Sidhu Moose Wala.mp3"
  ];
  return songs;
}
function playMusic(track, pause = false) {
  if (!track) {
    console.warn("playMusic called with invalid track:", track);
    return;
  }
  currentSong.src = "/songs/" + track;
  if (!pause) {
    currentSong.play().catch(e => console.error("Play failed:", e));
    const playImg = document.getElementById("play");
    if (playImg) playImg.src = "img/pause.svg";
  }
  const info = document.querySelector(".song-info");
  const timeEl = document.querySelector(".song-time");
  if (info) info.textContent = decodeURI(track);
  if (timeEl) timeEl.textContent = "00:00 / 00:00";
}

async function main() {
  const playImg = document.getElementById("play");
  if (!playImg) {
    console.error("No play image with id='play' found in DOM.");
    return;
  }

  const songs = await getSongs();
  if (!songs || songs.length === 0) {
    console.error("❌ No songs found. Check your /songs/ folder or server.");
    return;
  }

  // Play first song metadata only (pause param true)
  playMusic(songs[0], true);

  // Populate song list
  const songUl = document.querySelector(".song-list ul");
  if (!songUl) {
    console.error("No .song-list ul element found.");
    return;
  }

  songUl.innerHTML = ""; // clear
  for (const song of songs) {
    // defensive
    if (!song) continue;
    const safeName = song.replaceAll ? song.replaceAll("%20", " ") : decodeURIComponent(song);
    songUl.insertAdjacentHTML("beforeend", `
      <li class="flex song-item">
        <img class="invert" src="/img/music.svg" alt="">
        <div class="info">
          <div class="title">${safeName}</div>
          <div class="artist">Ankit</div>
        </div>
        <div class="play-now flex justify-center item-center">
          <span>Play Now</span>
          <img class="invert small-play" src="img/play.svg" alt="">
        </div>
      </li>`);
  }

  // Attach click to each li (or use event delegation)
  Array.from(songUl.querySelectorAll("li.song-item")).forEach(li => {
    li.addEventListener("click", () => {
      const titleNode = li.querySelector(".info .title");
      const title = titleNode ? titleNode.textContent.trim() : null;
      if (title) playMusic(title);
    });
  });

  // Play/pause toggle for play image
  playImg.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play().catch(e => console.error("Play failed:", e));
      playImg.src = "img/pause.svg";
    } else {
      currentSong.pause();
      playImg.src = "img/play.svg";
    }
  });

  // timeupdate -> update time text and seek circle
  const songTimeElement = document.querySelector(".song-time");
  const circleEl = document.querySelector(".circle");
  const seekBarEl = document.querySelector(".seek-bar");

  currentSong.addEventListener("timeupdate", () => {
    let current = formatTime(currentSong.currentTime);
    let total = formatTime(currentSong.duration);
    if (songTimeElement) songTimeElement.textContent = `${current} / ${total}`;

    // update seek handle only if duration is valid
    if (circleEl && currentSong.duration && isFinite(currentSong.duration) && currentSong.duration > 0) {
      const percent = (currentSong.currentTime / currentSong.duration) * 100;
      circleEl.style.left = `${Math.min(Math.max(percent, 0), 100)}%`;
    }
  });

  // seekbar click - use currentTarget (the seek-bar) to get width
  if (seekBarEl) {
    seekBarEl.addEventListener("click", (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percent = (offsetX / rect.width) * 100;
      if (circleEl) circleEl.style.left = `${Math.min(Math.max(percent, 0), 100)}%`;
      if (currentSong.duration && isFinite(currentSong.duration) && currentSong.duration > 0) {
        currentSong.currentTime = (currentSong.duration * percent) / 100;
      }
    });
  }
}

main();
