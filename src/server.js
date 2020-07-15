import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { withDB } from './withDB';

// store data in memory on our server
// const articlesInfo = [
//   'learn-react': { upvotes: 0, comments: [] },
//   'learn-node': { upvotes: 0, comments: [] },
//   'my-thoughts-on-resumes': { upvotes: 0, comments: [] },
// ];

const app = express();

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '/build')));

app.get('/api/articles/:name', async (req, res) => {
  const { name } = req.params;
  
  const results = await withDB(async db => {
    return await db.collection('articles').findOne({ name });
  });
  res.status(200).json(results);
});

app.post('/api/articles/:name/upvote', async (req, res) => {
  const { name } = req.params;
    
  const results = await withDB(async db => {
    const articleInfo = await db.collection('articles').findOne({ name });
    await db.collection('articles').updateOne({ name }, {
      '$set': { upvotes: articleInfo.upvotes + 1 }
    });
    return await db.collection('articles').findOne({ name });
  });
  res.status(200).json(results);
});

app.post('/api/articles/:name/add-comment', async (req, res) => {
  const { name } = req.params;
  const { postedBy, text } = req.body;

  //articlesInfo[articleName].comments.push({ postedBy, text });
  const results = await withDB(async db => {
    const articleInfo = await db.collection('articles').findOne({ name });
    await db.collection('articles').updateOne({ name }, {
      '$set': { comments: articleInfo.comments.concat({ postedBy, text })}
    });
    return await db.collection('articles').findOne({ name });
  });
  res.status(200).json(results);
});

app.get('/hello', (req, res) => res.send('Hello!'));

app.get('/hello/:name', (req, res) => {
  const { name } = req.params;
  res.send(`Hello ${name}!`);
});

app.post('/hello', (req, res) => {
  const { name } = req.body;
  res.send(`Hello ${name}!`);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/build/index.tml'));
})

app.listen(8000, () => console.log('Server is listening on port 8000'));
