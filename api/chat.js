export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  try {
    const { system, messages } = req.body;
    const prompt = (system ? system + '\n\n' : '') + messages[messages.length - 1].content;
 
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 5000 }
        }),
      }
    );
 
    const data = await geminiRes.json();
 
    if (data.error) {
      return res.status(200).json({
        content: [{ type: 'text', text: '오류: ' + data.error.message }]
      });
    }
 
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      '응답을 받지 못했어요. (빈 응답)';
 
    return res.status(200).json({
      content: [{ type: 'text', text }]
    });
 
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
