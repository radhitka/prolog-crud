// Global variables
let currentAudio = null;
const loader = document.getElementById("loader");

// Fetch list of surah
async function fetchSurahList() {
  try {
    const response = await fetch("http://localhost:3000/surah");
    const data = await response.json();
    const surahList = document.getElementById("surah-list");

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

// Load favorite ayahs
function loadFavoriteAyahs() {
  const favoriteListContainer = document.getElementById("favorite-list");
  const favoriteAyahs = JSON.parse(localStorage.getItem("favoriteAyahs")) || [];

  if (favoriteAyahs.length === 0) {
    favoriteListContainer.innerHTML =
      '<p class="text-center text-gray-700">Tidak ada ayat favorit yang disimpan.</p>';
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
                        <div class="font-bold pr-5">${ayah.surahNumber}:${ayah.ayahNumber}</div>
                        <div class="text-2xl text-right font-bold">${ayah.arabicText}</div>
                    </div>
                    <div class="text-sm font-normal">
                        ${ayah.translationText}
                    </div>
                </li>
            `
    );
  });

  favoriteListContainer.appendChild(favoriteList);
}

// Load detail of surah
async function fetchSurahDetails() {
  const ayahListContainer = document.getElementById("ayah-list");
  ayahListContainer.classList.add("hidden");

  loader.style.display = "block";

  try {
    let surah;
    let surahTranslation;

    const urlParams = new URLSearchParams(window.location.search);
    const number = urlParams.get("number");

    // Check if data is in local storage
    const cachedSurah = localStorage.getItem(`surah_${number}`);
    const cachedSurahTranslation = localStorage.getItem(
      `surah_translation_${number}`
    );

    if (cachedSurah && cachedSurahTranslation) {
      // Parse the cached data
      surah = JSON.parse(cachedSurah);
      surahTranslation = JSON.parse(cachedSurahTranslation);

      // console.log('get from cache');
    } else {
      // Fetch data from API if not in cache
      const responseSurah = await fetch(
        `http://localhost:3000/surah/${number}`
      );

      // const responseSurah = await fetch(`https://api.alquran.cloud/v1/surah/${number}/ar.alafasy`);
      surah = await responseSurah.json();
      // const responseSurahTranslation = await fetch(
      //   `https://api.alquran.cloud/v1/surah/${number}/en.asad`
      // );

      // surahTranslation = await responseSurahTranslation.json();

      // Save the fetched data to local storage
      localStorage.setItem(`surah_${number}`, JSON.stringify(surah));
      // localStorage.setItem(
      //   `surah_translation_${number}`,
      //   JSON.stringify(surahTranslation)
      // );
      // console.log('get from api, save to local');
    }

    const surahTitle = document.getElementById("surah-title");
    surahTitle.textContent = `${surah.data.number}. ${surah.data.englishName}`;

    const ayahListContainer = document.getElementById("ayah-list");
    const ayahList = document.createElement("ul");
    ayahList.classList.add("divide-y", "divide-gray-300");

    const favoriteAyahs =
      JSON.parse(localStorage.getItem("favoriteAyahs")) || [];
    const checkpoints = JSON.parse(localStorage.getItem("checkpoints")) || [];

    surah.data.ayahs.forEach((ayah) => {
      const isFavorite = favoriteAyahs.some(
        (fav) =>
          fav.surahNumber === surah.data.number &&
          fav.ayahNumber === ayah.nomorAyat
      );
      const isCheckpointed =
        surah.data.number == checkpoints.surahNumber &&
        ayah.nomorAyat == checkpoints.ayahNumber
          ? true
          : false;

      console.log({
        test: surah.data.number,
        data: favoriteAyahs,
      });

      ayahList.insertAdjacentHTML(
        "beforeend",
        `
                        <li class="py-4">
                            <div class="flex justify-between items-center py-4">
                                <div class="font-bold pr-5">${
                                  ayah.nomorAyat
                                }.</div>
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
                                    <span class="save-icon" title="Save to favorite" onclick="toggleFavorite(this, ${
                                      surah.data.number
                                    }, ${ayah.nomorAyat}, '${
          ayah.teksArab
        }', '${ayah.teksIndonesia}')">
                                        ${
                                          isFavorite
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
                                          isCheckpointed
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

function toggleFavorite(
  iconElement,
  surahNumber,
  ayahNumber,
  arabicText,
  translationText
) {
  let favoriteAyahs = JSON.parse(localStorage.getItem("favoriteAyahs")) || [];
  const ayahIndex = favoriteAyahs.findIndex(
    (fav) => fav.surahNumber === surahNumber && fav.ayahNumber === ayahNumber
  );

  if (ayahIndex > -1) {
    // Remove from favorites
    favoriteAyahs.splice(ayahIndex, 1);
    iconElement.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 cursor-pointer text-gray-500" viewBox="0 0 27 27" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21l-7-5.01L5 21V5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v16z"/>
                    </svg>
                `;
  } else {
    // Add to favorites
    favoriteAyahs.push({
      surahNumber,
      ayahNumber,
      arabicText,
      translationText,
    });
    iconElement.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 cursor-pointer text-yellow-500" viewBox="0 0 27 27" fill="currentColor">
                        <path d="M19 21l-7-5.01L5 21V5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v16z"/>
                    </svg>
                `;
  }

  localStorage.setItem("favoriteAyahs", JSON.stringify(favoriteAyahs));
}

function toggleCheckpoint(iconElement, surahNumber, ayahNumber) {
  let checkpoints = {};

  // Remove checkpoint
  checkpoints.surahNumber = surahNumber;
  checkpoints.ayahNumber = ayahNumber;

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

  localStorage.setItem("checkpoints", JSON.stringify(checkpoints));
}

async function fetchProfile() {
  // Placeholder for fetching and displaying user profile information
  // Implementation can vary based on backend or user authentication system
  // For simplicity, this function can retrieve data from localStorage or another API
  // to display user's last read checkpoint and favorite ayahs
}
