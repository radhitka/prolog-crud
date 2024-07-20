import axios from 'axios';
import bcrypt from 'bcrypt';
import cors from 'cors';
import express from 'express';
import {
  responseList,
  responseListAyat,
  responseListAyatFavorite,
  responseListDetail,
} from './response/index.js';

import 'dotenv/config';
import generateAuthToken from './config/jwt.js';
import db from './database/index.js';
import { loginMiddleware, requiredMiddleware } from './middleware/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// For parsing application/json
app.use(express.json());

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const httpAxios = axios.create({
  baseURL: 'https://equran.id/api/v2/',
});

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  })
);

app.post('/register', async function (req, res) {
  const { name, username, password } = req.body;

  try {
    const sqlUser = 'SELECT * FROM users WHERE username = ?';

    const [resultUsers] = await db.query(sqlUser, username);

    if (resultUsers.length > 0) {
      res.status(422).json({
        code: 422,
        message: `Username ${username} sudah digunakan!`,
      });
      return;
    }

    const sqlRegister =
      'INSERT INTO users (name, username, password) VALUES (?, ?, ?)';

    const newPassword = await bcrypt.hash(password, 10);

    await db.query(sqlRegister, [name, username, newPassword]);

    res.status(201).json({
      code: 201,
      message: 'Success',
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message,
    });
  }
});

app.post('/login', async function (req, res) {
  const { username, password } = req.body;

  try {
    const sqlUser = 'SELECT * FROM users WHERE username = ? LIMIT 1';

    const [resultUsers] = await db.query(sqlUser, username);

    if (resultUsers.length == 0) {
      res.status(422).json({
        code: 422,
        message: `Username dan Password Salah!`,
      });
      return;
    }

    const validPassword = await bcrypt.compare(
      password,
      resultUsers[0].password
    );

    if (!validPassword) {
      res.status(422).json({
        code: 422,
        message: `Username dan Password Salah!`,
      });
      return;
    }

    const token = generateAuthToken(resultUsers[0].id);

    res.status(201).json({
      code: 201,
      message: 'Success',
      token: token,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message,
    });
  }
});

app.use(loginMiddleware);

app.get('/surah', async function (req, res) {
  try {
    const { user_id } = req.user;

    const sqlFavorite = 'SELECT * FROM surah_favorites WHERE user_id = ? ';

    const [resultsFavorite] = await db.query(sqlFavorite, [user_id]);

    const response = await httpAxios.get('/surat');

    const body = response?.data;

    res.status(body.code).json({
      code: body.code,
      message: body.message,
      data: responseList(body.data, resultsFavorite),
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message,
    });
  }
});

app.get('/surah/:nomor', async function (req, res) {
  const nomor = req.params.nomor;
  const { user_id } = req.user;

  try {
    const sqlFavorite =
      'SELECT * FROM ayah_favorites WHERE user_id = ? and surah_id = ? ';

    const [resultsFavorite] = await db.query(sqlFavorite, [user_id, nomor]);

    const sqlCheckpoint =
      'SELECT * FROM ayah_checkpoints WHERE user_id = ? and surah_id = ? ';

    const [resultsCheckpoints] = await db.query(sqlCheckpoint, [
      user_id,
      nomor,
    ]);

    const response = await httpAxios.get(`/surat/${nomor}`);

    const body = response?.data;

    const newAyah = responseListAyat(
      body.data.ayat,
      resultsFavorite,
      resultsCheckpoints
    );

    res.status(body.code).json({
      code: body.code,
      message: body.message,
      data: responseListDetail(body.data, newAyah),
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message,
    });
  }
});

app.use(requiredMiddleware);

app.get('/me', async function (req, res) {
  try {
    const { user_id } = req.user;

    const sqlUser = 'SELECT * FROM users WHERE id = ? LIMIT 1';

    const [resultUser] = await db.query(sqlUser, [user_id]);

    const sqlFavoriteSurah =
      'SELECT count(*) total FROM surah_favorites WHERE user_id = ? LIMIT 1';
    const sqlFavoriteAyat =
      'SELECT count(*) total FROM ayah_favorites WHERE user_id = ? LIMIT 1';
    const sqlCheckpointsAyat =
      'SELECT * FROM ayah_checkpoints WHERE user_id = ? LIMIT 1';

    const [totalFavSurah] = await db.query(sqlFavoriteSurah, [user_id]);
    const [totalFavAyah] = await db.query(sqlFavoriteAyat, [user_id]);
    const [totalFavCheckAyah] = await db.query(sqlCheckpointsAyat, [user_id]);

    const data = resultUser.map((e) => {
      return {
        id: e.id,
        name: e.name,
        username: e.username,
        favSurah: totalFavSurah[0].total,
        favAyah: totalFavAyah[0].total,
        checkpoint: {
          surah: totalFavCheckAyah[0].surah_id,
          ayah: totalFavCheckAyah[0].ayah_id,
        },
      };
    });

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: data[0],
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message,
    });
  }
});

app.get('/surah/favorites/list', async function (req, res) {
  const { user_id } = req.user;

  try {
    const sqlFavorite = 'SELECT * FROM surah_favorites WHERE user_id = ?';

    const [resultsFavorite] = await db.query(sqlFavorite, [user_id]);

    const response = await httpAxios.get('/surat');

    const body = response?.data;

    const newData = responseList(body.data, resultsFavorite).filter((e) => {
      return e.isFavorite;
    });

    res.status(body.code).json({
      code: body.code,
      message: body.message,
      data: newData,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message,
    });
  }
});

app.post('/surah/favorite/:nomor', async function (req, res) {
  const { nomor } = req.params;
  const { user_id } = req.user;

  try {
    const sqlDetail =
      'SELECT * FROM surah_favorites WHERE user_id = ? and surah_id = ? LIMIT 1';

    const [resultsDetail] = await db.query(sqlDetail, [user_id, nomor]);

    var isAdd = 1;

    if (resultsDetail.length > 0) {
      const sqlDelete = 'DELETE FROM surah_favorites WHERE id = ?';

      await db.query(sqlDelete, [resultsDetail[0].id]);
      isAdd = 0;
    } else {
      const sqlInsert =
        'INSERT INTO surah_favorites (user_id, surah_id) VALUES (?, ?)';

      await db.query(sqlInsert, [user_id, nomor]);
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
      isAdd,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message,
    });
  }
});

app.post('/surah/favorite/ayah/:nomor', async function (req, res) {
  const { nomor } = req.params;
  const { ayah } = req.body;
  const { user_id } = req.user;

  try {
    const sqlDetail =
      'SELECT * FROM ayah_favorites WHERE user_id = ? and surah_id = ? and ayah_id = ? LIMIT 1';

    const [resultsDetail] = await db.query(sqlDetail, [user_id, nomor, ayah]);

    var isAdd = 1;

    if (resultsDetail.length > 0) {
      const sqlDelete = 'DELETE FROM ayah_favorites WHERE id = ?';

      await db.query(sqlDelete, [resultsDetail[0].id]);
      isAdd = 0;
    } else {
      const response = await httpAxios.get(`/surat/${nomor}`);

      const body = response?.data;

      const listAyah = body.data.ayat.filter((e) => e.nomorAyat == ayah)[0];

      const sqlInsert =
        'INSERT INTO ayah_favorites (user_id, surah_id, ayah_id, ayah_json) VALUES (?, ?, ?, ?)';

      await db.query(sqlInsert, [
        user_id,
        nomor,
        ayah,
        JSON.stringify(listAyah),
      ]);
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
      isAdd,
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message,
    });
  }
});

app.post('/surah/checkpoints/ayah/:nomor', async function (req, res) {
  const { nomor } = req.params;
  const { ayah } = req.body;
  const { user_id } = req.user;

  try {
    const sqlDetail =
      'SELECT * FROM ayah_checkpoints WHERE user_id = ? and surah_id = ? and ayah_id = ? LIMIT 1';

    const [resultsDetail] = await db.query(sqlDetail, [user_id, nomor, ayah]);

    if (resultsDetail.length > 0) {
      const sqlUpdate =
        'UPDATE ayah_checkpoints SET surah_id = ?, ayah_id = ? WHERE id = ?';
      // const sqlDelete = 'DELETE FROM ayah_checkpoints WHERE id = ?';

      await db.query(sqlUpdate, [nomor, ayah, resultsDetail[0].id]);
    } else {
      const sqlInsert =
        'INSERT INTO ayah_checkpoints (user_id, surah_id, ayah_id) VALUES (?, ? , ?)';

      await db.query(sqlInsert, [user_id, nomor, ayah]);
    }

    res.status(200).json({
      code: 200,
      message: 'Success',
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message,
    });
  }
});

app.get('/surah/favorites/ayah/list', async function (req, res) {
  const { user_id } = req.user;

  try {
    const sqlFavorite = 'SELECT * FROM ayah_favorites WHERE user_id = ?';

    const [resultsFavorite] = await db.query(sqlFavorite, [user_id]);

    res.status(200).json({
      code: 200,
      message: 'Success',
      data: responseListAyatFavorite(resultsFavorite),
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
