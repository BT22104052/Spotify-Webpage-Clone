console.log('Let\'s write JavaScript');

let currentSong = new Audio();
let songs = [];
let currFolder = "";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    try {
        currFolder = folder;
        let response = await fetch(`/${folder}/`);
        let html = await response.text();
        let div = document.createElement("div");
        div.innerHTML = html;
        let as = div.getElementsByTagName("a");
        songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split(`/${folder}/`)[1]);
            }
        }

        let songUL = document.querySelector(".songList > ul");
        songUL.innerHTML = "";
        songs.forEach(song => {
            songUL.innerHTML += `<li>
                <img class="invert" width="34" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>Harry</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
        });

        // Attach click event listeners to each song
        Array.from(songUL.getElementsByTagName("li")).forEach(li => {
            li.addEventListener("click", () => {
                let songName = li.querySelector(".info > div:first-child").textContent.trim();
                console.log("Playing:", songName);
                playMusic(songName);
            });
        });

        return songs;
    } catch (error) {
        console.error("Failed to fetch songs:", error);
        return [];
    }
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    try {
        console.log("Displaying albums");
        let response = await fetch(`/songs/`);
        let html = await response.text();
        let div = document.createElement("div");
        div.innerHTML = html;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = ""; // Clear existing content

        for (let index = 0; index < anchors.length; index++) {
            const e = anchors[index];
            if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
                let folder = e.href.split("/").slice(-2)[0];
                let infoResponse = await fetch(`/songs/${folder}/info.json`);
                let info = await infoResponse.json();

                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${info.title}</h2>
                        <p>${info.description}</p>
                    </div>`;
            }
        }

        // Attach click event listeners to each album card
        Array.from(document.querySelectorAll(".card")).forEach(card => {
            card.addEventListener("click", async () => {
                console.log("Fetching songs");
                songs = await getSongs(`songs/${card.dataset.folder}`);
                playMusic(songs[0]);
            });
        });

    } catch (error) {
        console.error("Failed to fetch albums:", error);
    }
}

async function main() {
    try {
        // Load initial songs
        await getSongs("songs/ncs");
        playMusic(songs[0], true);

        // Display albums
        await displayAlbums();

        // Event listeners
        play.addEventListener("click", () => {
            if (currentSong.paused) {
                currentSong.play();
                play.src = "img/pause.svg";
            } else {
                currentSong.pause();
                play.src = "img/play.svg";
            }
        });

        currentSong.addEventListener("timeupdate", () => {
            document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        });

        document.querySelector(".seekbar").addEventListener("click", e => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentSong.currentTime = (currentSong.duration * percent) / 100;
        });

        document.querySelector(".hamburger").addEventListener("click", () => {
            document.querySelector(".left").style.left = "0";
        });

        document.querySelector(".close").addEventListener("click", () => {
            document.querySelector(".left").style.left = "-120%";
        });

        previous.addEventListener("click", () => {
            currentSong.pause();
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if ((index - 1) >= 0) {
                playMusic(songs[index - 1]);
            }
        });

        next.addEventListener("click", () => {
            currentSong.pause();
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1]);
            }
        });

        document.querySelector(".range input").addEventListener("input", (e) => {
            currentSong.volume = e.target.value / 100;
            if (currentSong.volume > 0) {
                document.querySelector(".volume img").src = "img/volume.svg";
            } else {
                document.querySelector(".volume img").src = "img/mute.svg";
            }
        });

        document.querySelector(".volume img").addEventListener("click", () => {
            if (currentSong.volume > 0) {
                currentSong.volume = 0;
                document.querySelector(".volume img").src = "img/mute.svg";
                document.querySelector(".range input").value = 0;
            } else {
                currentSong.volume = 0.1;
                document.querySelector(".volume img").src = "img/volume.svg";
                document.querySelector(".range input").value = 10;
            }
        });

    } catch (error) {
        console.error("Error in main function:", error);
    }
}

main();
