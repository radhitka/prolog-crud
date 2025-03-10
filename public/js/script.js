// Global variables
const loader = document.getElementById('loader');

let currentAudio = null;
let headers = {
  'Content-Type': 'application/json',
};

// Fetch list of surah
async function fetchSurahList() {
  const surahList = document.getElementById('surah-list');

  try {
    const response = await fetch('http://localhost:3000/surah');
    const data = await response.json();

    data.data.forEach((surah) => {
      surahList.insertAdjacentHTML(
        'beforeend',
        `
            <li class="py-4 px-2">
                <a href="/detail-surah?number=${surah.number}" class="flex justify-between items-center">
                    <div class="flex justify-between items-center">
                        <p class="text-lg font-bold mr-5">${surah.number}.</p>
                        <div class="text-gray-700">
                            <span class="block text-lg font-semibold font-arabic">${surah.englishName}</span>
                            <span class="block text-sm font-semibold">${surah.englishNameTranslation}</span> 
                        </div>
                    </div>
                    <div class="">
                        <span class="block text-3xl text-right font-arabic">${surah.name}</span>
                        <span class="block text-sm text-right font-semibold">${surah.numberOfAyahs} Ayat</span> 
                    </div>
                </a>
            </li>
        `
      );
    });
  } catch (error) {
    console.error('Error fetching surah list:', error);
  }
}

// Load detail of surah
async function fetchSurahDetails() {
  const user = JSON.parse(localStorage.getItem('user'));
  const ayahListContainer = document.getElementById('ayah-list');
  ayahListContainer.classList.add('hidden');

  loader.style.display = 'block';

  try {
    let surah;

    const urlParams = new URLSearchParams(window.location.search);
    const number = urlParams.get('number');

    if (user?.token) {
      headers['Authorization'] = user?.token;
    }

    // console.log(headers);

    // Fetch data from API
    const responseSurah = await fetch(`http://localhost:3000/surah/${number}`, {
      method: 'GET',
      headers: headers,
    });

    surah = await responseSurah.json();

    // console.log(surah);

    const surahTitle = document.getElementById('surah-title');
    surahTitle.textContent = `${surah.data.number}. ${surah.data.englishName}`;

    const ayahListContainer = document.getElementById('ayah-list');
    const ayahList = document.createElement('ul');
    ayahList.classList.add('divide-y', 'divide-gray-300');

    surah.data.ayahs.forEach((ayah) => {
      // console.log({
      //   surahNumber: surah.data.number,
      //   isCheckpoints: ayah.isCheckpoints,
      //   isFavorite: ayah.isFavorite,
      // });

      ayahList.insertAdjacentHTML(
        'beforeend',
        `
          <li class="py-4" id="nomorAyat-${ayah.nomorAyat}">
              <div class="flex justify-between items-center py-4">
                  <div class="font-bold pr-5">${ayah.nomorAyat}.</div>
                  <div class="text-3xl text-right font-semibold font-arabic">${
                    ayah.teksArab
                  }</div>
              </div>
              <div class="text-sm font-normal">
                  <p class="mb-2 font-semibold">
                      ${ayah.teksLatin}
                  </p>
                  <p class="">
                      ${ayah.teksIndonesia}
                  </p>
                  <div class="flex items-center gap-2 mt-5">
                      <span class="play-icon" title="Play audio" onclick="toggleAudio('${
                        ayah.audio['01']
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
    console.error('Error fetching surah details:', error);
  } finally {
    loader.style.display = 'none';
    ayahListContainer.classList.remove('hidden');
  }
}

// Load favorite ayahs
async function fetchFavoriteAyahs() {
  const user = JSON.parse(localStorage.getItem('user'));
  const favoriteListContainer = document.getElementById('favorite-list');
  let favoriteAyahs = [];

  try {
    // const response = await fetch("http://localhost:3000/surah");
    const response = await fetch(
      'http://localhost:3000/surah/favorites/ayah/list',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: user?.token,
        },
      }
    );

    const data = await response.json();
    favoriteAyahs = data?.data || [];

    // console.log(data);
  } catch (error) {
    console.error(error);
  } finally {
    if (favoriteAyahs.length === 0) {
      favoriteListContainer.innerHTML =
        '<p class="text-center font-semibold text-gray-700">Tidak ada ayat favorit yang disimpan.</p>';
      return;
    }

    const favoriteList = document.createElement('ul');
    favoriteList.classList.add('divide-y', 'divide-gray-300');

    favoriteAyahs.forEach((ayah) => {
      console.log(ayah);
      favoriteList.insertAdjacentHTML(
        'beforeend',
        `
          <li class="py-4">
              <div class="flex justify-between items-center py-4">
                  <div class="font-bold pr-5">${ayah.surah}:${ayah.nomorAyat}</div>
                  <div class="text-4xl text-right font-arabic">${ayah.teksArab}</div>
              </div>
              <div class="text-sm font-semibold mt-2 mb-2">
                  ${ayah.teksLatin}
              </div>
              <div class="text-sm font-normal">
                  ${ayah.teksIndonesia}
              </div>
              <div class="flex items-center mt-4 mb-4 gap-2">
                <svg class="h-6 w-6 cursor-pointer" onclick="pinFavoriteAyah('${ayah.surah}', '${ayah.nomorAyat}');" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000" height="800px" width="800px" version="1.1" id="Capa_1" viewBox="0 0 297 297" xml:space="preserve">
                  <path d="M234.067,85.715C234.067,38.451,195.682,0,148.5,0S62.933,38.451,62.933,85.715c0,34.744,20.755,64.703,50.486,78.15  l24.91,124.794c0.968,4.851,5.225,8.342,10.171,8.342c4.944,0,9.203-3.492,10.171-8.341l24.911-124.795  C213.313,150.417,234.067,120.459,234.067,85.715z M148.5,233.643l-12.605-63.149c4.115,0.611,8.323,0.938,12.605,0.938  s8.49-0.326,12.605-0.938L148.5,233.643z M148.5,150.686c-35.744,0-64.823-29.146-64.823-64.972s29.079-64.972,64.823-64.972  s64.823,29.146,64.823,64.972S184.244,150.686,148.5,150.686z"/>
                </svg>  
                <span class="text-sm hover:underline text-red-500 cursor-pointer" onclick="deleteFavoriteAyah('${ayah.id}');">
                  Hapus dari favorit
                </span>
              </div>
          </li>
      `
      );
    });

    favoriteListContainer.appendChild(favoriteList);
  }
}

// Load top favorite ayahs
async function fetchTopFavoriteAyahs() {
  const user = JSON.parse(localStorage.getItem('user'));
  const topFavoriteListContainer = document.getElementById('favorite-list-top');
  let topFavoriteAyahs = [];

  try {
    const response = await fetch(
      'http://localhost:3000/surah/favorites/ayah/priority/list',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: user?.token,
        },
      }
    );

    const data = await response.json();
    topFavoriteAyahs = data?.data || [];

  } catch (error) {
    console.error(error);
  } finally {
    if (topFavoriteAyahs.length === 0) {
      topFavoriteListContainer.innerHTML =
        '<p class="text-center font-semibold text-gray-700">Tidak ada ayat favorit yang disimpan.</p>';
      return;
    }

    const favoriteList = document.createElement('ul');
    favoriteList.classList.add('divide-y', 'divide-gray-300');

    topFavoriteAyahs.forEach((ayah) => {
      favoriteList.insertAdjacentHTML(
        'beforeend',
        `
          <li class="py-4">
              <div class="flex justify-between items-center py-4">
                  <div class="font-bold pr-5">${ayah.surah}:${ayah.nomorAyat}</div>
                  <div class="text-4xl text-right font-arabic">${ayah.teksArab}</div>
              </div>
              <div class="text-sm font-semibold mt-2 mb-2">
                  ${ayah.teksLatin}
              </div>
              <div class="text-sm font-normal">
                  ${ayah.teksIndonesia}
              </div>
              <div class="flex items-center mt-4 mb-4 gap-2">
                  <svg class="h-6 w-6 cursor-pointer" onclick="pinFavoriteAyah('${ayah.surah}', '${ayah.nomorAyat}');" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000" height="800px" width="800px" version="1.1" id="Capa_1" viewBox="0 0 297 297" xml:space="preserve">
                    <path d="M234.067,85.715C234.067,38.451,195.682,0,148.5,0S62.933,38.451,62.933,85.715c0,34.744,20.755,64.703,50.486,78.15  l24.91,124.794c0.968,4.851,5.225,8.342,10.171,8.342c4.944,0,9.203-3.492,10.171-8.341l24.911-124.795  C213.313,150.417,234.067,120.459,234.067,85.715z M148.5,233.643l-12.605-63.149c4.115,0.611,8.323,0.938,12.605,0.938  s8.49-0.326,12.605-0.938L148.5,233.643z M148.5,150.686c-35.744,0-64.823-29.146-64.823-64.972s29.079-64.972,64.823-64.972  s64.823,29.146,64.823,64.972S184.244,150.686,148.5,150.686z"/>
                  </svg>  
                <a href="#" class="" onclick="deleteFavoriteAyah('${ayah.id}');">
                  <span class="text-sm hover:underline text-red-500">Hapus dari favorit</span>
                <a/>
              </div>
          </li>
      `
      );
    });

    topFavoriteListContainer.appendChild(favoriteList);
  }
}

// Save to favorite
async function deleteFavoriteAyah(ayahNumber) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    window.location.href = '/login';
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/surah/favorites/ayah/delete/${ayahNumber}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: user?.token,
        },
      }
    );

    // const data = await response.json();
    // console.log(data);

    if (response.ok) {
      document.getElementById('favorite-list').innerHTML = ''
      document.getElementById('favorite-list-top').innerHTML = ''
    }else{
      console.log(response.error);
    }
  } catch (error) {
    console.error(error);
  } finally {
    await fetchFavoriteAyahs()
    await fetchTopFavoriteAyahs()
  }
}

// Pin favorite
async function pinFavoriteAyah(surahNumber, ayahNumber) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    window.location.href = '/login';
    return;
  }

  try {
    const response = await fetch(  
      `http://localhost:3000/surah/favorite/ayah/priority/${surahNumber}`,
      {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: user?.token,
          },
          body: JSON.stringify({ ayah: ayahNumber }), 
      }
    );

    if (response.ok) {
      document.getElementById('favorite-list').innerHTML = ''
      document.getElementById('favorite-list-top').innerHTML = ''
    }else{
      console.log(response.error);
    }

    // const data = await response.json();
    // console.log(data);
  } catch (error) {
    console.error(error);
  } finally {
    await fetchFavoriteAyahs()
    await fetchTopFavoriteAyahs()
  }
}

// Trigger audio
function toggleAudio(audioUrl, iconElement) {
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    document.querySelector('.pause-icon').innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 cursor-pointer text-green-500" viewBox="0 0 20 20" fill="currentColor">
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

    currentAudio.addEventListener('ended', function () {
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
  if (!user) {
    window.location.href = '/login';
    return;
  }

  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await fetch(
      `http://localhost:3000/surah/favorite/ayah/${surahNumber}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    window.location.href = '/login';
    return;
  }

  // Remove checkpoint
  checkpoints.surahNumber = surahNumber;
  checkpoints.ayahNumber = ayahNumber;

  const response = await fetch(
    `http://localhost:3000/surah/checkpoints/ayah/${surahNumber}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    element.setAttribute('stroke', 'grey');
  });

  iconElement.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 cursor-pointer" viewBox="0 0 27 27" fill="none">
          <path d="M16 3.93552C14.795 3.33671 13.4368 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 11.662 20.9814 11.3283 20.9451 11M21 5L12 14L9 11" stroke="#16a74a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
  `;
}

// Get authenticated profile
async function fetchProfile() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    window.location.href = '/login';
    return;
  }

  try {
    const username = document.getElementById('username');
    const checkpointInfo = document.getElementById('checkpointInfo');
    const totalFavAyah = document.getElementById('totalFavAyah');
    const goToCheckpoint = document.getElementById('goToCheckpoint');

    const response = await fetch('http://localhost:3000/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: user?.token,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile data');
    }

    const data = await response.json();
    const checkpointSurah = data?.data?.checkpoint?.surah;
    const checkpointAyah = data?.data?.checkpoint?.ayah;

    // Update profil dengan data user
    if (data?.data?.username) {
      username.innerText = data?.data?.username;
    }

    if (checkpointSurah || checkpointAyah) {
      checkpointInfo.innerHTML = `Surat ${checkpointSurah}, Ayat ${checkpointAyah}`;
      goToCheckpoint.classList.remove('hidden');
      goToCheckpoint.href = `/detail-surah?number=${checkpointSurah}&checkpointAyahNumber=${checkpointAyah}`;
    } else {
      goToCheckpoint.classList.add('hidden');
    }

    if (data?.data?.favAyah) {
      totalFavAyah.innerText = data?.data?.favAyah;
    }
  } catch (error) {
    console.error('Error fetching profile data:', error);
  }
}

async function getData() {
  return Promise.resolve('data');
}

async function getMoreData(data) {
  return Promise.resolve(data + 'more data');
}

function logout() {
  localStorage.removeItem('user');
  window.location.href = '/login';
}
