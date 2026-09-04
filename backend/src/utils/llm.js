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
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const result = await model.generateContent(buildPrompt(distinctNames, query));
    const text = result.response.text().trim();

    // Strip accidental markdown code fences if the model adds them
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error('[LLM] Gemini error:', err.message);
    // Graceful fallback: substring, token, or edit-distance fuzzy match so search never breaks
    const qLower = query.toLowerCase().trim();
    const tokens = qLower.split(/\s+/).filter((t) => t.length > 1);

    const isFuzzyMatch = (target, term) => {
      if (target.includes(term)) return true;
      // Allow single/two-character typos for words longer than 3 characters
      if (term.length >= 4) {
        let diff = Math.abs(target.length - term.length);
        if (diff <= 2) {
          let mismatches = 0;
          let i = 0, j = 0;
          while (i < target.length && j < term.length) {
            if (target[i] !== term[j]) {
              mismatches++;
              if (mismatches > 2) break;
              if (target.length > term.length) i++;
              else if (term.length > target.length) j++;
              else { i++; j++; }
            } else {
              i++; j++;
            }
          }
          if (mismatches <= 2) return true;
        }
      }
      return false;
    };

    return distinctNames.filter((name) => {
      const nLower = name.toLowerCase();
      if (isFuzzyMatch(nLower, qLower)) return true;
      const nameWords = nLower.split(/\s+/);
      return tokens.some((t) => nameWords.some((w) => isFuzzyMatch(w, t)));
    });
  }
}

module.exports = { queryLLM };
