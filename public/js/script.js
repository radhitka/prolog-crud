// Global variables
let currentAudio = null;
const loader = document.getElementById("loader");

// Fetch list of surah
async function fetchSurahList() {
  const surahList = document.getElementById("surah-list");

  try {
    const response = await fetch("http://localhost:3000/surah");
    const data = await response.json();

    data.data.forEach((surah) => {
      surahList.insertAdjacentHTML(
        "beforeend",
        `
            <li class="py-4 px-2">
                <a href="/detail-surah?number=${surah.number}" class="flex justify-between items-center">
                    <div class="flex justify-between items-center">
                        <p class="text-lg font-bold mr-5">${surah.number}.</p>
                        <div class="text-gray-700">
                            <span class="block text-lg font-bold">${surah.englishName}</span>
                            <span class="block text-sm font-semibold">${surah.englishNameTranslation}</span> 
                        </div>
                    </div>
                    <div class="">
                        <span class="block text-lg text-right font-bold">${surah.name}</span>
                        <span class="block text-sm text-right font-semibold">${surah.numberOfAyahs} Ayat</span> 
                    </div>
                </a>
            </li>
        `
      );
    });
  } catch (error) {
    console.error("Error fetching surah list:", error);
  }
}

// Load detail of surah
async function fetchSurahDetails() {
  const user = JSON.parse(localStorage.getItem("user"));
  const ayahListContainer = document.getElementById("ayah-list");
  ayahListContainer.classList.add("hidden");

  loader.style.display = "block";

  try {
    let surah;

    const urlParams = new URLSearchParams(window.location.search);
    const number = urlParams.get("number");

    // Fetch data from API
    const responseSurah = await fetch(`http://localhost:3000/surah/${number}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: user?.token,
      },
    });

    surah = await responseSurah.json();

    const surahTitle = document.getElementById("surah-title");
    surahTitle.textContent = `${surah.data.number}. ${surah.data.englishName}`;

    const ayahListContainer = document.getElementById("ayah-list");
    const ayahList = document.createElement("ul");
    ayahList.classList.add("divide-y", "divide-gray-300");

    surah.data.ayahs.forEach((ayah) => {
      console.log({
        surahNumber: surah.data.number,
        isCheckpoints: ayah.isCheckpoints,
        isFavorite: ayah.isFavorite,
      });

      ayahList.insertAdjacentHTML(
        "beforeend",
        `
          <li class="py-4">
              <div class="flex justify-between items-center py-4">
                  <div class="font-bold pr-5">${ayah.nomorAyat}.</div>
                  <div class="text-2xl text-right font-bold">${
                    ayah.teksArab
                  }</div>
              </div>
              <div class="text-sm font-normal">
                  <p class="mb-2">
                      ${ayah.teksIndonesia}
                  </p>
                  <div class="flex items-center gap-2">
                      <span class="play-icon" title="Play audio" onclick="toggleAudio('${
                        ayah.audio["01"]
                      }', this)">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 cursor-pointer text-green-500" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M5 4v12l10-6-10-6z" stroke="currentColor" />
                          </svg>
                      </span>
                      <span class="save-icon" title="Save to favorite" 
                        onclick="toggleFavorite(this, ${surah.data.number}, ${
          ayah.nomorAyat
        }, '${ayah.teksArab}', '${ayah.teksIndonesia}')">
                          ${
                            ayah.isFavorite
                              ? `
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 cursor-pointer text-yellow-500" viewBox="0 0 27 27" fill="currentColor">
                                  <path d="M19 21l-7-5.01L5 21V5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v16z"/>
                              </svg>
                          `
                              : `
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 cursor-pointer text-gray-500" viewBox="0 0 27 27" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <path d="M19 21l-7-5.01L5 21V5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v16z"/>
                              </svg>
                          `
                          }
                      </span>
                      <span class="checkpoint-icon" onclick="toggleCheckpoint(this, ${
                        surah.data.number
                      }, ${ayah.nomorAyat})">
                          ${
                            ayah.isCheckpoints
                              ? `
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 cursor-pointer" viewBox="0 0 27 27" fill="none">
                                  <path d="M16 3.93552C14.795 3.33671 13.4368 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 11.662 20.9814 11.3283 20.9451 11M21 5L12 14L9 11" stroke="#16a74a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>

                          `
                              : `
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 cursor-pointer" viewBox="0 0 27 27" fill="none">
                                  <path d="M16 3.93552C14.795 3.33671 13.4368 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 11.662 20.9814 11.3283 20.9451 11M21 5L12 14L9 11" stroke="grey" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>
                          `
                          }
                      </span>
                  </div>
              </div>
          </li>
      `
      );
    });

    ayahListContainer.appendChild(ayahList);
  } catch (error) {
    console.error("Error fetching surah details:", error);
  } finally {
    loader.style.display = "none";
    ayahListContainer.classList.remove("hidden");
  }
}

// Load favorite ayahs
async function fetchFavoriteAyahs() {
  const favoriteListContainer = document.getElementById("favorite-list");
  const user = JSON.parse(localStorage.getItem("user"));
  let favoriteAyahs = [];

  try {
    // const response = await fetch("http://localhost:3000/surah");
    const response = await fetch(
      "http://localhost:3000/surah/favorites/ayah/list",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: user?.token,
        },
      }
    );

    const data = await response.json();
    favoriteAyahs = data?.data || [];

    // console.log(data);
    // console.log(favoriteAyahs);
  } catch (error) {
    console.error(error);
  } finally {
    if (favoriteAyahs.length === 0) {
      favoriteListContainer.innerHTML =
        '<p class="text-center font-semibold text-gray-700">Tidak ada ayat favorit yang disimpan.</p>';
      return;
    }

    const favoriteList = document.createElement("ul");
    favoriteList.classList.add("divide-y", "divide-gray-300");

    favoriteAyahs.forEach((ayah) => {
      favoriteList.insertAdjacentHTML(
        "beforeend",
        `
          <li class="py-4">
              <div class="flex justify-between items-center py-4">
                  <div class="font-bold pr-5">${ayah.surah}:${ayah.nomorAyat}</div>
                  <div class="text-2xl text-right font-bold">${ayah.teksArab}</div>
              </div>
              <div class="text-sm font-normal">
                  ${ayah.teksIndonesia}
              </div>
          </li>
      `
      );
    });

    favoriteListContainer.appendChild(favoriteList);
  }
}

// Trigger audio
function toggleAudio(audioUrl, iconElement) {
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    document.querySelector(".pause-icon").innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 cursor-pointer text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4v12l10-6-10-6z" />
                    </svg>
                `;
    currentAudio = null;
  } else {
    currentAudio = new Audio(audioUrl);
    currentAudio.play();
    iconElement.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 cursor-pointer text-red-500 pause-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6 4h2v12H6zM12 4h2v12h-2z" />
                    </svg>
                `;

    currentAudio.addEventListener("ended", function () {
      iconElement.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 cursor-pointer text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 4v12l10-6-10-6z" />
                        </svg>
                    `;
      currentAudio = null;
    });
  }
}

// Save to favorite
async function toggleFavorite(iconElement, surahNumber, ayahNumber) {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const response = await fetch(
      `http://localhost:3000/surah/favorite/ayah/${surahNumber}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: user?.token,
        },
        body: JSON.stringify({ ayah: ayahNumber }),
      }
    );

    const data = await response.json();

    if (data?.isAdd == false) {
      // Remove from favorites
      // favoriteAyahs.splice(ayahIndex, 1);
      iconElement.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 cursor-pointer text-gray-500" viewBox="0 0 27 27" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21l-7-5.01L5 21V5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v16z"/>
          </svg>
      `;
    } else {
      // Add to favorites
      iconElement.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 cursor-pointer text-yellow-500" viewBox="0 0 27 27" fill="currentColor">
              <path d="M19 21l-7-5.01L5 21V5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v16z"/>
          </svg>
      `;
    }
  } catch (error) {
    console.error(error);
  }
}

// Signed as checkpoint
async function toggleCheckpoint(iconElement, surahNumber, ayahNumber) {
  let checkpoints = {};

  // Remove checkpoint
  checkpoints.surahNumber = surahNumber;
  checkpoints.ayahNumber = ayahNumber;

  const user = JSON.parse(localStorage.getItem("user"));
  const response = await fetch(
    `http://localhost:3000/surah/checkpoints/ayah/${surahNumber}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: user?.token,
      },
      body: JSON.stringify({ ayah: ayahNumber }),
    }
  );

  const data = response.json();

  const elements = document.querySelectorAll('svg path[stroke="#16a74a"]');
  elements.forEach((element) => {
    console.log(element); // Contoh: menampilkan elemen di console
    // Ubah warna outline menjadi abu-abu
    element.setAttribute("stroke", "grey");
  });

  iconElement.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 cursor-pointer" viewBox="0 0 27 27" fill="none">
          <path d="M16 3.93552C14.795 3.33671 13.4368 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 11.662 20.9814 11.3283 20.9451 11M21 5L12 14L9 11" stroke="#16a74a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
  `;
}

// Get authenticated profile
async function fetchProfile() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "/login";
    return;
  }

  try {
    const username = document.getElementById("username");
    const checkpointInfo = document.getElementById("checkpointInfo");
    const totalFavAyah = document.getElementById("totalFavAyah");

    const response = await fetch("http://localhost:3000/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: user.token,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile data");
    }

    const data = await response.json();

    // Update profil dengan data user
    username.innerText = data?.data?.username;
    checkpointInfo.innerHTML = `Surat ${data?.data?.checkpoint.surah}, Ayat ${data?.data?.checkpoint.ayah}`;
    totalFavAyah.innerText = data?.data?.favAyah;
  } catch (error) {
    console.error("Error fetching profile data:", error);
  }
}

async function getData() {
  return Promise.resolve("data");
}

async function getMoreData(data) {
  return Promise.resolve(data + "more data");
}
