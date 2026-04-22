const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected ✅'))
  .catch(err => console.log('MongoDB error:', err));

app.use('/api/merchant', require('./src/routes/merchant'));
app.use('/api/store', require('./src/routes/store'));
app.use('/api/ai', require('./src/routes/ai'));
app.use('/api/upload', require('./src/routes/upload'));

app.get('/', (req, res) => res.json({ message: 'DAYEM API ✅' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`DAYEM server running on port ${process.env.PORT || 5000} 🚀`);
});