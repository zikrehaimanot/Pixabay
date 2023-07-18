const express = require('express');
const app = express();
const axios = require('axios');
const port = 3000;

app.set('view engine', 'ejs');

app.use(express.static('public'));

// Create an in-memory cache
const imageCache = new Map();

app.get('/', (req, res) => {
  res.render('index'); 
});

app.get('/search', async (req, res) => {
  console.log(req.query.page);
  try {
    const cacheKey = `${req.query.term}_${req.query.page}_${req.query.lang}`;

    if (imageCache.has(cacheKey)) {
      console.log('cache is indeed working')
      const cachedData = imageCache.get(cacheKey);
      res.json(cachedData);
      return;
    }

    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '38313297-0251fd09df47623d4d840ebec',
        q: req.query.term,
        image_type: 'photo',
        page: req.query.page,
        lang: req.query.lang
      },
    });

    if (response.status === 200) {
      const imageData = response.data;

      imageCache.set(cacheKey, imageData);

      res.json(imageData);
    } else {
      const errorMessage = 'Try a different word/API response issues';
      res.status(response.status).json({ error: errorMessage });
    }
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = 'Failed to perform the search/Issue could stem from our system or theirs';
    res.status(500).json({ error: errorMessage });
  }
});

app.get('/imageDetails', (req, res) => {
  const imageDetails = {
    id: req.query.id,
    imageUrl: req.query.imageUrl,
    imagePoster: req.query.imagePoster,
    imageTags: req.query.imageTags
  };
  // console.log(`${imageDetails} ImageDetails`)

  res.render('imageDetails', { image: imageDetails });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
