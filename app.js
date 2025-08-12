const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// STEP 1: Exchange refresh_token for access_token
async function getAccessToken() {
  const response = await axios.post('https://oauth2.googleapis.com/token', null, {
    params: {
      client_id: "1003232675090-vsol82rj6vca3995isq3srlpkcif3mge.apps.googleusercontent.com",
      client_secret: "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",
      refresh_token: "1//04FMik5XPfatJCgYIARAAGAQSNwF-L9Ir22KW8evh8CCwSTsXXkEvDml1rnBB5FxLLrvVm4fK-hcgO_oAY5evKo4uYLlEf1A9Yqg",
      grant_type: 'refresh_token',
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data.access_token;
}

// STEP 2: Blogger POST Insert
async function postToBlogger(title, contentHtml) {
  const accessToken = await getAccessToken();
  const url = `https://blogger.googleapis.com/v3/blogs/${process.env.BLOG_ID}/posts`;

  const response = await axios.post(
    url,
    {
      kind: 'blogger#post',
      title,
      content: contentHtml,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

// Endpoint: GET /post-blog?title=...&content=...
app.post('/post-blog', async (req, res) => {
  const { title, content } = req.body;
  console.log('Received request to post blog:', req.body);
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  try {
    const result = await postToBlogger(title, content);
    res.json({ status: 'success', postUrl: result.url, id: result.id });
  } catch (error) {
    console.error('Error posting to Blogger:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to post to Blogger', details: error.response?.data || error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Blogger API server running at http://localhost:\${PORT}`);
});
