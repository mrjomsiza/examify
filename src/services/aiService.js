import { getGenerativeModel } from 'firebase/ai';
import { ai, firebaseAiModel, isFirebaseConfigured } from '../firebase/config';

const stripCodeFence = (text = '') =>
  String(text)
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

const extractJsonObject = (text = '') => {
  const trimmed = String(text).trim();

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return trimmed;
  }

  return trimmed.slice(firstBrace, lastBrace + 1);
};

const getFallbackRecommendations = () => ({
  recommendations: [
    {
      title: 'Awaiting AI recommendation',
      topic: 'Tutor-completed Mathematics topic',
      reason: 'AI recommendations are temporarily unavailable, so Examify is showing a safe fallback recommendation state.',
      sourceLabel: 'Retry after confirming AI recommendations are enabled for this project.',
    },
  ],
  source: 'fallback',
});

const normalizeRecommendations = (parsed) => {
  const recommendations = Array.isArray(parsed?.recommendations)
    ? parsed.recommendations
    : [];

  return {
    recommendations: recommendations.map((item, index) => ({
      title: item?.title || `Recommendation ${index + 1}`,
      topic: item?.topic || 'Mathematics topic',
      reason: item?.reason || 'No reason provided.',
      sourceLabel: item?.sourceLabel || 'AI recommendation',
    })),
    source: 'firebase-ai-logic',
  };
};

const buildPrompt = ({
  grade,
  region,
  completedTopics = [],
  tutorReports = [],
  pastMarks = [],
  questionPaperMetadata = [],
  tutorNotes = '',
} = {}) => `
You are Examify's Mathematics exercise recommendation assistant for South African grades.

Business rules:
- Recommend Mathematics only.
- Recommend exercises only from tutor-completed topics.
- Prefer references to question papers and question numbers instead of rewriting full question text.
- Consider grade, region, tutor reports, tutor notes, question paper metadata, and past marks.
- Return strict JSON with a top-level key called "recommendations".
- Each recommendation must include: title, topic, reason, sourceLabel.
- Return only valid JSON.
- Use double quotes for all property names and string values.
- Do not include markdown.
- Do not include code fences.
- Do not include comments.
- Do not include trailing commas.
- Do not include any explanation before or after the JSON.

Example format:
{
  "recommendations": [
    {
      "title": "Factorisation drill",
      "topic": "Factorisation of trinomials",
      "reason": "Tutor completed this topic and the learner needs reinforcement.",
      "sourceLabel": "2023 Gauteng June Paper, Q4.2"
    }
  ]
}

Student grade: ${grade ?? 'Unknown'}
Region: ${region ?? 'Unknown'}
Completed topics: ${JSON.stringify(completedTopics)}
Tutor reports: ${JSON.stringify(tutorReports)}
Tutor notes: ${tutorNotes}
Past marks: ${JSON.stringify(pastMarks)}
Question paper metadata: ${JSON.stringify(questionPaperMetadata)}
`;

export const recommendExercises = async (payload = {}) => {
  console.log('[Examify][AI] recommendExercises:start', payload);

  if (!isFirebaseConfigured) {
    return {
      recommendations: [
        {
          title: 'Factorisation drill',
          topic: 'Factorisation of trinomials',
          reason: 'Tutor completed this topic and marks show some instability with sign changes.',
          sourceLabel: '2023 Gauteng June Paper, Q4.2',
        },
      ],
      source: 'demo',
    };
  }

  try {
    if (!ai) {
      console.log('[Examify][AI] recommendExercises:fallback:no-ai-instance');
      return getFallbackRecommendations();
    }

    const model = getGenerativeModel(ai, {
      model: firebaseAiModel,
    });

    const result = await model.generateContent(buildPrompt(payload));
    const rawText = result?.response?.text?.() ?? '';
    const strippedText = stripCodeFence(rawText);
    const jsonText = extractJsonObject(strippedText);

    console.log('[Examify][AI] recommendExercises:rawText', rawText);
    console.log('[Examify][AI] recommendExercises:jsonText', jsonText);

    const parsed = JSON.parse(jsonText);

    if (!parsed || !Array.isArray(parsed.recommendations)) {
      throw new Error('Invalid AI response format: recommendations array missing.');
    }

    const response = normalizeRecommendations(parsed);
    console.log('[Examify][AI] recommendExercises:success', response);
    return response;
  } catch (error) {
    console.error('[Examify][AI] recommendExercises:error', error);
    return getFallbackRecommendations();
  }
};