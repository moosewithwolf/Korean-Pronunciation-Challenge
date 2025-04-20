
// backend/index.js (CommonJS)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/evaluate', async (req, res) => {
  const { request_id, argument } = req.body;
  console.log('🟢 [Backend] script:', argument.script);
  console.log('🟢 [Backend] audioBytes:', argument.audio.length);
  try {
    const apiRes = await axios.post(
      'http://aiopen.etri.re.kr:8000/WiseASR/PronunciationKor',
      { request_id, argument },
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          Authorization: process.env.ETRI_API_KEY
        },
        timeout: 15000
      }
    );
    console.log('✅ [Backend] status:', apiRes.status);
    console.log('✅ [Backend] data:', apiRes.data);
    res.json(apiRes.data);
  } catch (err) {
    console.error('🔴 [Backend] err:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('🚀 Server on 3000'));
