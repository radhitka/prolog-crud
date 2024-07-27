const responseList = (data, surahFavorites) => {
  return data.map((e) => {
    return {
      number: e.nomor,
      name: e.nama,
      englishName: e.namaLatin,
      englishNameTranslation: e.arti,
      numberOfAyahs: e.jumlahAyat,
      revelationType: e.tempatTurun,
      isFavorite: surahFavorites.some((fav) => fav.surah_id == e.nomor),
    };
  });
};

const responseListDetail = (data, ayah) => {
  return {
    number: data.nomor,
    name: data.nama,
    englishName: data.namaLatin,
    englishNameTranslation: data.arti,
    numberOfAyahs: data.jumlahAyat,
    revelationType: data.tempatTurun,
    ayahs: ayah,
  };
};

const responseListAyat = (ayat, favorites, checkpoints) => {
  return ayat.map((e) => {
    e.isFavorite = favorites.some((fav) => fav.ayah_id == e.nomorAyat);
    e.isCheckpoints = checkpoints.some(
      (checks) => checks.ayah_id == e.nomorAyat
    );
    return e;
  });
};

const responseListAyatFavorite = (ayat) => {
  return ayat.map((e) => {
    const data = {
      id: e.id,
    };
    const detail = JSON.parse(e.ayah_json);
    return { ...data, ...detail };
  });
};

export {
  responseList,
  responseListAyat,
  responseListAyatFavorite,
  responseListDetail,
};
