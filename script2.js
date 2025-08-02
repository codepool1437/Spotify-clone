let songs = [], names = [], duration = [], artist = [], audio = null, currentSongUrl = null, currentPlayingBtn = null;

async function getSongs() {
  const baseUrl = "https://codepool143.github.io/Spotify-Songs/";
  const response = await fetch(baseUrl + "songs.json");
  const files = await response.json();
  return files.map(song => ({
    url: baseUrl + encodeURIComponent(song.file),
    file: song.file,
    duration: song.duration
  }));
}

async function localSongs() {
  const loadedSongs = await getSongs();
  songs = loadedSongs.map(s => s.url);

  for (let s of loadedSongs) {
    const decoded = decodeURIComponent(s.file.replace(".mp3", ""));
    const splitIndex = decoded.indexOf(" - ");
    if (splitIndex !== -1) {
      const artistName = decoded.slice(0, splitIndex).trim();
      const songName = decoded.slice(splitIndex + 3).trim();
      artist.push(artistName || "Unknown Artist");
      names.push(songName || "Unknown Song");
    } else {
      names.push("Unknown Song");
      artist.push("Unknown Artist");
    }
    duration.push(s.duration);
  }
}

function updateSongList() {
  const left = document.querySelector(".left");
  left.innerHTML = `
    <div class="library-head">
      <div class="library-head-text">
        <div class="library-icon"><img src="./svgs/library.svg"></div>
        <span>Your Library</span>
      </div>
      <div class="library-plus"><span>&#9166;</span></div>
    </div>`;

  const ul = document.createElement("ul");
  ul.classList.add("songList");

  names.forEach((name, index) => {
    ul.innerHTML += `
      <li class="song">
        <div class="song-info">
          <span class="song-number">${index + 1}.</span>
          <img src="./svgs/music.svg">
          <div class="song-name">
            <span>${name}</span>
            <span>${artist[index]}</span>
          </div>
        </div>
        <div class="play">
          <span class="duration">${duration[index]}</span>
          <div class="play_song" data-song-url="${songs[index]}">
            <img src="./svgs/play.svg">
          </div>
        </div>
      </li>`;
  });

  left.appendChild(ul);

  document.querySelectorAll(".play_song").forEach(btn => {
    btn.addEventListener("click", (e) => {
      play(e.currentTarget.dataset.songUrl, e.currentTarget);
    });
  });

  document.querySelector(".library-plus").addEventListener("click", () => {
    const leftPanel = document.querySelector(".left");
    leftPanel.classList.remove("fade-in");
    leftPanel.classList.add("fade-out");

    setTimeout(() => {
      returntolocal();
      leftPanel.classList.remove("fade-out");
      leftPanel.classList.add("fade-in");
    }, 500);
  });
}

function returntolocal() {
  const left = document.querySelector(".left");
  left.innerHTML = `
    <div class="library-head">
      <div class="library-head-text">
        <div class="library-icon"><img src="./svgs/library.svg" alt=""></div>
        <span>Your Library</span>
      </div>
    </div>
    <div class="library-card">
      <span>Explore your own playlist</span>
      <span>Dive into your local playlist</span>
      <span class="local">Play local songs</span>
    </div>
    <div class="library-card">
      <span>Let's find some podcasts to follow</span>
      <span>We'll keep you updated on new episodes</span>
      <a href="https://open.spotify.com/genre/podcasts-web">Browse podcasts</a>
    </div>
    <div class="left-footer">
      <div><a href="https://www.spotify.com/in-en/legal/">Legal</a></div>
      <div><a href="https://www.spotify.com/in-en/safetyandprivacy/">Safety & Privacy Center</a></div>
      <div><a href="https://www.spotify.com/in-en/legal/privacy-policy/">Privacy Policy</a></div>
      <div><a href="https://www.spotify.com/in-en/legal/cookies-policy/">Cookies</a></div>
      <div><a href="https://www.spotify.com/in-en/legal/privacy-policy/#s3">About Ads</a></div>
      <div><a href="https://www.spotify.com/in-en/accessibility/">Accessibility</a></div>
      <div><a href="https://www.spotify.com/legal/cookies-policy/" target="_blank" rel="noopener">Cookies</a></div>
    </div>
    <div class="footer-eng">
      <img src="./svgs/english.svg" alt="Earth-logo">
      <button>English</button>
    </div>`;

  gotosongList();
}

function updateMediaPlayer(songUrl) {
  const decoded = decodeURIComponent(songUrl.split("/Spotify-Songs/")[1].replace(".mp3", ""));
  const splitIndex = decoded.indexOf(" - ");
  const artistName = splitIndex !== -1 ? decoded.slice(0, splitIndex).trim() : "Unknown Artist";
  const songName = splitIndex !== -1 ? decoded.slice(splitIndex + 3).trim() : "Unknown Song";

  document.querySelector(".playing_song").innerHTML = songName;
  document.querySelector(".playing_artist").innerHTML = artistName;
  document.querySelector(".music_player").classList.add("show");
  document.querySelector(".play-btn img").src = "./svgs/pause.svg";
}

function toggleAudio() {
  const imgElement = document.querySelector(".play-btn img");
  if (audio.paused) {
    audio.play();
    imgElement.src = "./svgs/pause.svg";
    if (currentPlayingBtn) currentPlayingBtn.src = "./svgs/pause.svg";
  } else {
    audio.pause();
    imgElement.src = "./svgs/play.svg";
    if (currentPlayingBtn) currentPlayingBtn.src = "./svgs/play.svg";
  }
}

async function play(songUrl, btn) {
  if (audio && currentSongUrl === songUrl) {
    toggleAudio();
    return;
  }

  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    if (currentPlayingBtn) currentPlayingBtn.src = "./svgs/play.svg";
  }

  audio = new Audio(songUrl);
  currentSongUrl = songUrl;
  currentPlayingBtn = btn.querySelector("img");
  updateMediaPlayer(songUrl);

  audio.play();
  currentPlayingBtn.src = "./svgs/pause.svg";
  document.querySelector(".play-btn img").src = "./svgs/pause.svg";

  document.querySelectorAll(".play_song img").forEach(img => {
    if (img !== currentPlayingBtn) img.src = "./svgs/play.svg";
    if (audio.paused) img.src = "./svgs/play.svg";
  });

  document.querySelector(".play-btn").addEventListener("click", toggleAudio);
  audio.addEventListener("timeupdate", updateProgressBar);
}

function gotosongList() {
  document.querySelector(".local").addEventListener("click", () => {
    const leftPanel = document.querySelector(".left");
    leftPanel.classList.add("fade-out");

    setTimeout(() => {
      updateSongList();
      if (audio && currentSongUrl) {
        const currentBtn = [...document.querySelectorAll(".play_song")].find(btn => btn.dataset.songUrl === currentSongUrl);
        if (currentBtn) currentBtn.querySelector("img").src = "./svgs/pause.svg";
      }
      leftPanel.classList.remove("fade-out");
      leftPanel.classList.add("fade-in");
    }, 500);
  });
}

function updateProgressBar() {
  if (audio && audio.duration) {
    let percent = (audio.currentTime / audio.duration) * 100;
    document.querySelector(".current-bar").style.width = `${percent}%`;
  }
}

async function main() {
  await localSongs();
  gotosongList();

  document.querySelectorAll(".play_song img").forEach((img) => {
    const songUrl = img.closest(".play_song").dataset.songUrl;
    if (audio && currentSongUrl === songUrl) {
      img.src = "./svgs/pause.svg";
    } else {
      img.src = "./svgs/play.svg";
    }
  });
}

main();
