import axios from 'axios';
import cors from 'cors';
import express from 'express';
import { responseList, responseListDetail } from './response/index.js';

import 'dotenv/config';
import db from './database/index.js';

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

app.get('/surah', async function (req, res) {
  const response = await httpAxios.get('/surat');

  const body = response?.data;

  res.json({
    code: body.code,
    message: body.message,
    data: responseList(body.data),
  });
});

app.get('/surah/:nomor', async function (req, res) {
  const nomor = req.params.nomor;
  const response = await httpAxios.get(`/surat/${nomor}`);

  const body = response?.data;

  res.json({
    code: body.code,
    message: body.message,
    data: responseListDetail(body.data),
  });
});

app.post('/surah/favorite/:nomor', async function (req, res) {
  const { nomor } = req.params;
  const { ayah } = req.body;

  try {
    const sqlDetail =
      'SELECT * FROM ayah_favorites WHERE user_id = ? and surah_id = ? and ayah_id = ? LIMIT 1';

    const [resultsDetail] = await db.query(sqlDetail, [1, nomor, ayah]);

    if (resultsDetail.length > 0) {
      const sqlDelete = 'DELETE FROM ayah_favorites WHERE id = ?';

      await db.query(sqlDelete, [resultsDetail[0].id]);
    } else {
      const sqlInsert =
        'INSERT INTO ayah_favorites (user_id, surah_id, ayah_id) VALUES (?, ? , ?)';

      await db.query(sqlInsert, [1, nomor, ayah]);
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

app.post('/surah/checkpoints/:nomor', async function (req, res) {
  const { nomor } = req.params;
  const { ayah } = req.body;

  try {
    const sqlDetail =
      'SELECT * FROM ayah_checkpoints WHERE user_id = ? and surah_id = ? and ayah_id = ? LIMIT 1';

    const [resultsDetail] = await db.query(sqlDetail, [1, nomor, ayah]);

    if (resultsDetail.length > 0) {
      const sqlDelete = 'DELETE FROM ayah_checkpoints WHERE id = ?';

      await db.query(sqlDelete, [resultsDetail[0].id]);
    } else {
      const sqlInsert =
        'INSERT INTO ayah_checkpoints (user_id, surah_id, ayah_id) VALUES (?, ? , ?)';

      await db.query(sqlInsert, [1, nomor, ayah]);
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

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
