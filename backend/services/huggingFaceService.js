import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
dotenv.config();

const hf = new HfInference(process.env.HF_TOKEN);

/**
 * Generates an array of mixed-type flashcard objects using Hugging Face chatCompletion.
 * Returns a mix of "Memorize" (key terms) and "QA" (analytical) flashcard types.
 * 
 * @param {string} textChunk - The extracted text segment to analyze.
 * @param {number} numCards - How many cards to extract from this chunk.
 * @returns {Promise<Array>} Array of { type, front, back } objects
 */
export const generateFlashcardsFromChunk = async (textChunk, numCards) => {
  if (!process.env.HF_TOKEN) {
    throw new Error('HF_TOKEN is not defined in environment variables.');
  }

  // Safety Truncation: Ensure chunk doesn't exceed 4000 chars to protect memory
  const sanitizedText = textChunk.slice(0, 4000);

  const prompt = `You are an expert educator creating study flashcards. Extract exactly ${numCards} flashcards from the text below.

You MUST produce a MIXED set of exactly two types:
- "Memorize": For key terms, definitions, facts, or formulas a student should drill.
  - "front": The technical term, formula name, or concept label.
  - "back": Its precise definition, value, or explanation.
- "QA": For analytical comprehension and application.
  - "front": A challenging exam-style question about the concept.
  - "back": A complete, teacher-quality answer with reasoning.

STRICT RULES:
- Return ONLY a raw JSON array. No markdown fences, no commentary.
- Every object must have exactly three keys: "type", "front", "back".
- "type" must be exactly "Memorize" or "QA" (case-sensitive).
- Aim for roughly 50/50 split between types. Vary based on content density.

Example output:
[
  {
    "type": "Memorize",
    "front": "Quadratic Formula",
    "back": "x = (-b ± √(b²-4ac)) / 2a — used to solve any quadratic equation ax²+bx+c=0"
  },
  {
    "type": "QA",
    "front": "Why does the quadratic formula have a ± sign?",
    "back": "Because a parabola intersects the x-axis at two points. The ± gives both roots — one using addition, one subtraction — representing both solutions."
  }
]

Text to analyze:
"""
${sanitizedText}
"""`;

  try {
    const response = await hf.chatCompletion({
      model: 'meta-llama/Meta-Llama-3-8B-Instruct',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2500,
      temperature: 0.3,
    });

    let generatedText = response.choices[0].message.content.trim();

    // Strip any accidental markdown fences (```json ... ```)
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      generatedText = jsonMatch[0];
    }

    const cards = JSON.parse(generatedText);
    return Array.isArray(cards) ? cards : [];
  } catch (error) {
    console.error('HuggingFace generation error:', error?.message || error);
    return []; // Fail gracefully — controller will handle empty result per chunk
  }
};
/**
 * Generates a comprehensive, structured study guide from a text chunk.
 * 
 * @param {string} textChunk - The extracted text segment to analyze.
 * @returns {Promise<string>} The generated Markdown/structured text guide.
 */
export const generateComprehensiveNotes = async (textChunk) => {
  if (!process.env.HF_TOKEN) {
    throw new Error('HF_TOKEN is not defined in environment variables.');
  }

  // Safety Truncation: Ensure chunk doesn't exceed 4000 chars to protect memory
  const sanitizedText = textChunk.slice(0, 4000);

  const prompt = `You are an expert tutor. Create a comprehensive, detailed, and clear study guide based on the text below.
  
STRICT RULES:
- Use H1 for the overall title at the start.
- Use H2 for major sections.
- Use bold for key terms and definitions.
- Use bullet points for lists of facts or steps.
- Provide DETAILED explanations, ensuring that complex concepts are broken down into simpler terms.
- The tone should be helpful, educational, and professionally academic.
- Return ONLY the structured content. No conversational prefix or suffix.

Text to analyze:
"""
${sanitizedText}
"""`;

  try {
    const response = await hf.chatCompletion({
      model: 'meta-llama/Meta-Llama-3-8B-Instruct',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000, // Balanced limit for speed and detail
      temperature: 0.3,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('HuggingFace notes generation error:', error?.message || error);
    return ""; 
  }
};
