const express = require('express');
const router = require('./articles');

const app = express();
const path = require('path');

const hostname = '127.0.0.1';
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.use('/img', express.static(path.join(__dirname, 'articles/img/')));
app.set('view engine', 'ejs');

function notFoundHandler(req, res) {
  res.status(404).render('error', {
    title: 'Villa',
    headerText: 'Fannst ekki',
    errorText: 'Ó nei, efnið fannst ekki',
  });
}

function errorHandler(req, res) {
  res.status(500).render('error', {
    title: 'Villa',
    headerText: 'Villa kom upp',
    errorText: '',
  });
}

app.use('/', router);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, hostname, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});
