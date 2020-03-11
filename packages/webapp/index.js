const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

const server = app.listen(PORT, () => {
  console.log(`Webapp is started on http://localhost:${PORT}`);
});
