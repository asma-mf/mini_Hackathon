/**
 * LLM wrapper — Google Gemini 2.5 Flash (free tier via Google AI Studio).
 *
 * Requires GEMINI_API_KEY in .env.
 * Get a free key at: https://aistudio.google.com/app/apikey
 *
 * The prompt instructs the model to return ONLY a JSON array — no markdown,
 * no explanation. The caller always intersects the output with real DB names
 * before using it, so hallucinations never reach the database.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const buildPrompt = (distinctNames, query) =>
  `Given this JSON array of known medicine names: ${JSON.stringify(distinctNames)}
and this user search query: '${query}', return ONLY a JSON array of the exact strings from the list that could plausibly match (typos, abbreviations, partial names). If nothing matches, return []. Respond with the JSON array only — no explanation, no markdown.`;

/**
 * @param {string[]} distinctNames - All unique medicine names currently in the DB
 * @param {string} query - Raw user search string
 * @returns {Promise<string[]>} Matched names (caller must intersect with DB names)
 */
async function queryLLM(distinctNames, query) {
  if (!distinctNames.length) return [];

  if (!process.env.GEMINI_API_KEY) {
    console.warn('[LLM] GEMINI_API_KEY is not set. Returning empty match.');
    return [];
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(buildPrompt(distinctNames, query));
    const text = result.response.text().trim();

    // Strip accidental markdown code fences if the model adds them
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error('[LLM] Gemini error:', err.message);
    return [];
  }
}

module.exports = { queryLLM };
