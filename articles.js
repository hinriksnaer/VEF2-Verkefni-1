const fs = require('fs');
const marked = require('marked');
const express = require('express');

const router = express.Router();
const util = require('util');
const fm = require('front-matter');

const errorLog = [];

function getSlugList(data) {
  const slugList = [];
  for (let i = 0; i < data.length; i += 1) {
    slugList.push(data[i].attributes.slug);
  }
  return slugList;
}

const getFilesAsync = async () => {
  const files = await util.promisify(fs.readdir)('./articles');
  return Promise.all(files.map(async (file) => {
    try {
      return fm(await util.promisify(fs.readFile)(`./articles/${file}`, 'utf8'));
    } catch (err) {
      errorLog.push(err);
      return undefined;
    }
  }));
};
router.get('/', async (req, res) => {
  let data = await getFilesAsync();
  data = data.filter(x => x);
  const dataList = [];
  for (let i = 0; i < data.length; i += 1) {
    dataList.push(data[i].attributes);
    dataList[i].date = new Date(dataList[i].date);
  }
  dataList.sort((a, b) => b.date - a.date);
  const articleTitle = [];
  const articleDate = [];
  const articleSlug = [];
  const articleImg = [];

  for (let i = 0; i < data.length; i += 1) {
    articleTitle.push(dataList[i].title);
    articleSlug.push(dataList[i].slug);
    articleDate.push(`${dataList[i].date.getDate()}.${dataList[i].date.getMonth() + 1}.${dataList[i].date.getFullYear()}`);
    articleImg.push(dataList[i].image);
  }
  res.render('index', {
    title: 'Greinasafnið',
    headerText: 'Greinasafnið',
    articleTitle,
    articleSlug,
    articleDate,
    articleImg,
  });
});
router.get('/:data', async (req, res) => {
  let data = await getFilesAsync();
  data = data.filter(x => x);
  const slugList = getSlugList(data);
  const article = req.params.data;
  for (let i = 0; i < slugList.length; i += 1) {
    if (article === slugList[i]) {
      const articleHTML = marked(data[i].body);
      res.render('article', {
        title: 'Article',
        headerText: data[i].attributes.title,
        article: articleHTML,
      });
    }
  }
  res.status(404).render('error', {
    title: 'Villa',
    headerText: 'Fannst ekki',
    errorText: 'Ó nei, efnið fannst ekki',
  });
});

module.exports = router;
