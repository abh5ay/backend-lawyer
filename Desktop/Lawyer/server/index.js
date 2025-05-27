require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  console.log('GET /test called');
  res.json({ message: 'Backend is working!' });
});

app.post('/api/ask', async (req, res) => {
  console.log('POST /api/ask called');
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Invalid input: legal query is required as a string.' });
  }

  const prompt = `
You are an AI assistant with deep knowledge of Indian law.  
Provide clear, detailed, and legally accurate answers to the user's questions.  
Avoid generic disclaimers and do not mention that you are not a lawyer.

Question: ${query}
Answer:
`;

  try {
    console.log('Calling Together AI...');
    const response = await axios.post(
      'https://api.together.xyz/v1/completions',
      {
        model: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
        prompt,
        max_tokens: 1200,
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('Full AI response:', JSON.stringify(response.data, null, 2));

    const aiText = response.data?.choices?.[0]?.text?.trim();

    if (!aiText) {
      throw new Error('Empty response from AI');
    }

    console.log('AI response received.');
    res.json({ answer: aiText });

  } catch (err) {
    console.error('AI error:', err.response?.data || err.message || err);
    res.status(500).json({
      error: 'Failed to get AI response',
      details: err.response?.data || err.message || String(err)
    });
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Legal Assistant backend running at http://localhost:${PORT}`);
});
