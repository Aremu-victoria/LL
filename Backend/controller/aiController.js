const axios = require('axios');

// Simple AI chat controller. Replace with real LLM integration if needed.
exports.chat = async (req, res) => {
  try {
    const { prompt, context } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    // Very basic, deterministic placeholder response so frontend can function.
    const title = context?.title ? String(context.title) : undefined;
    const subject = context?.subject ? String(context.subject) : undefined;
    const classLevel = context?.classLevel ? String(context.classLevel) : undefined;

    let reply = '';
    const p = prompt.toLowerCase();
    const parts = [];
    if (title) parts.push(`Title: ${title}`);
    if (subject) parts.push(`Subject: ${subject}`);
    if (classLevel) parts.push(`Class: ${classLevel}`);

    if (p.includes('summar') || p.includes('summary') || p.includes('outline')) {
      reply = `Here is a concise study summary${title ? ` for "${title}"` : ''}${subject ? ` (${subject})` : ''}${classLevel ? `, ${classLevel}` : ''}:

- Key Ideas: 3–5 core concepts and definitions.
- Important Facts: dates, formulas, terms.
- Examples: at least two worked examples.
- Quick Quiz: 3 short questions to self‑test.

Tip: Ask me to expand any bullet and I’ll go deeper.`;
    } else if (p.includes('question') || p.includes('quiz') || p.includes('test')) {
      reply = `Here are practice questions${subject ? ` in ${subject}` : ''}:

1) Define the main concept and provide a simple example.
2) Explain why it works. Include 1–2 counterexamples.
3) Solve a short problem step‑by‑step.

Ask me for answers to reveal detailed solutions.`;
    } else if (p.includes('explain') || p.includes('what is') || p.includes('why')) {
      reply = `Explanation${title ? ` for "${title}"` : ''}:
- Intuition: a plain‑language intuition first.
- Formal idea: the precise definition/rule.
- Application: where it’s used and why it matters.
- Common mistakes: what to avoid.

Ask me to expand any bullet.`;
    } else {
      reply = `I received your question${title ? ` about "${title}"` : ''}. Tell me to "summarize", "generate quiz", or "explain" to get a structured response.\n\nContext: ${parts.length ? parts.join(' • ') : 'none provided'}`;
    }

    return res.json({ reply });
  } catch (err) {
    return res.status(500).json({ error: 'AI chat failed', details: err.message });
  }
};
