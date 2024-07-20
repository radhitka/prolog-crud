import axios from 'axios';
import cors from 'cors';
import express from 'express';
import { responseList, responseListDetail } from './response/index.js';

import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

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

app.get('/surah', async function name(req, res) {
  const response = await httpAxios.get('/surat');

  const body = response?.data;

  res.json({
    code: body.code,
    message: body.message,
    data: responseList(body.data),
  });
});

app.get('/surah/:nomor', async function name(req, res) {
  const nomor = req.params.nomor;
  const response = await httpAxios.get(`/surat/${nomor}`);

  const body = response?.data;

  res.json({
    code: body.code,
    message: body.message,
    data: responseListDetail(body.data),
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
