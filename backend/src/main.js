const express = require('express');
const cors = require('cors');
const ytService = require('./yt/yt.service');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/api/:id', ytService.urlToStream);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});