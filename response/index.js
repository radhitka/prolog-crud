const responseList = (data) => {
  return data.map((e) => {
    return {
      number: e.nomor,
      name: e.nama,
      englishName: e.namaLatin,
      englishNameTranslation: e.arti,
      numberOfAyahs: e.jumlahAyat,
      revelationType: e.tempatTurun,
    };
  });
};

const responseListDetail = (data) => {
  return {
    number: data.nomor,
    name: data.nama,
    englishName: data.namaLatin,
    englishNameTranslation: data.arti,
    numberOfAyahs: data.jumlahAyat,
    revelationType: data.tempatTurun,
    ayahs: data.ayat,
  };
};

export { responseList, responseListDetail };
