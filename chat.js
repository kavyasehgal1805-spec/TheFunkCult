// Runs on Vercel's servers. Your API key stays here and never reaches the browser.
const MODES = {
  doubt: "MODE: Doubt solver. Explain the concept simply first, then show a small worked example. For numericals, show every step with working notes and a clear final answer. For theory, give the rule, the reasoning and a one-line exam tip.",
  eval: "MODE: Answer evaluator. The student will paste a question and their answer. Give: (1) a marks estimate out of the marks stated (or out of 10 if not stated), (2) what is correct, (3) what is missing or wrong, citing the relevant section, standard or case law, (4) a model answer in ICAI exam format: short headings, point-wise, with provisions cited. Be honest and specific, not flattering.",
  practice: "MODE: Practice generator. Create exam-style questions on the topic asked: MCQs with four options, or case-study and descriptive questions as requested (default: 5 MCQs). Do NOT reveal answers in the same message. Put the answer key and explanations only after the student replies with their answers or asks for the key.",
  notes: "MODE: Notes summariser. Turn the pasted notes into: a short summary, key points, formulas or provisions to memorise, 5 flashcards (Q and A), and a memory trick where it helps.",
  plan: "MODE: Revision planner. Ask for any missing detail (exam date, hours per day, weak subjects) in a single short message. Then build a day-wise or week-wise plan with revision cycles and mock tests. Keep it realistic.",
};

function systemPrompt(level, subject, mode) {
  return `You are CA Tutor, a patient, accurate study mentor for Indian Chartered Accountancy (ICAI) students.
Student level: CA ${level}. Subject focus: ${subject || "any subject for this level"}.
${MODES[mode] || MODES.doubt}

Rules:
- Teach, don't just answer. Keep language simple; use short steps. Match the depth to the ${level} level.
- Cite the exact section, Ind AS/AS, SA, or case law only when you are sure. If you are not sure, say so instead of guessing a number.
- Tax, law and standards change with each Finance Act and exam attempt. State which assessment year or provisions you are assuming, and remind the student to verify against the latest ICAI study material, RTP/MTP and amendments for their attempt.
- Use plain text, simple lists and markdown tables for working notes. No long preambles.
- Stay on CA studies and exam preparation. Politely redirect anything else.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: "The server has no API key yet. Add GEMINI_API_KEY in Vercel settings and redeploy." });

  const { level = "Inter", subject = "", mode = "doubt", messages = [] } = req.body || {};
  const recent = messages.slice(-10).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: String(m.text || "").slice(0, 6000) }],
  }));
  if (!recent.length || recent[recent.length - 1].role !== "user")
    return res.status(400).json({ error: "Send a question first." });

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt(level, subject, mode) }] },
        contents: recent,
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      const msg = r.status === 429
        ? "Free daily limit reached. Try again later."
        : r.status === 404
        ? "Model name not found. Set GEMINI_MODEL in Vercel to a current model from Google AI Studio."
        : data?.error?.message || "The AI service returned an error.";
      return res.status(r.status).json({ error: msg });
    }
    const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
    return res.status(200).json({ reply: text || "I couldn't produce an answer. Try rephrasing." });
  } catch (e) {
    return res.status(500).json({ error: "Could not reach the AI service. Check your connection and try again." });
  }
}
