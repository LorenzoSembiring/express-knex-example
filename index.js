const express = require('express');
const userRoute = require('./src/routes/userRoute');
require('dotenv').config();
const app = express();
const port = process.env.PORT

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use('/api/user', userRoute)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
