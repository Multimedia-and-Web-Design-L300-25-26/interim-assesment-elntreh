const axios = require('axios');

// GET /api/news — fetch latest crypto news from CryptoCompare
const getNews = async (req, res) => {
  try {
    const { data } = await axios.get('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest', {
      timeout: 8000,
    });
    const articles = (data.Data || []).slice(0, 20).map(a => ({
      id: a.id,
      title: a.title,
      body: a.body?.slice(0, 200) + '...',
      imageUrl: a.imageurl,
      url: a.url,
      source: a.source_info?.name || a.source,
      publishedAt: new Date(a.published_on * 1000).toISOString(),
      categories: a.categories,
    }));
    res.json({ success: true, data: articles });
  } catch (err) {
    console.error('News fetch error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch news.' });
  }
};

module.exports = { getNews };
