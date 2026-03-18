import { getGenerativeModel } from 'firebase/ai';
import { ai, firebaseAiModel, isFirebaseConfigured } from '../firebase/config';

const stripCodeFence = (text) => text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
const fallbackRecommendations = {
  recommendations: [
    {
      title: 'Awaiting AI recommendation',
      topic: 'Tutor-completed Mathematics topic',
      reason: 'Firebase AI Logic is temporarily unavailable, so Examify is showing a safe fallback recommendation state.',
      sourceLabel: 'Retry after confirming Firebase AI Logic is enabled for this project.',
    },
  ],
  source: 'fallback',
};

const buildPrompt = ({
  grade,
  region,
  completedTopics = [],
  tutorReports = [],
  pastMarks = [],
  questionPaperMetadata = [],
  tutorNotes = '',
}) => `
You are Examify's Mathematics exercise recommendation assistant for South African grades.

Business rules:
- Recommend Mathematics only.
- Recommend exercises only from tutor-completed topics.
- Prefer references to question papers and question numbers instead of rewriting full question text.
- Consider grade, region, tutor reports, tutor notes, question paper metadata, and past marks.
- Return strict JSON with a top-level key called "recommendations".
- Each recommendation must include: title, topic, reason, sourceLabel.

Student grade: ${grade ?? 'Unknown'}
Region: ${region ?? 'Unknown'}
Completed topics: ${JSON.stringify(completedTopics)}
Tutor reports: ${JSON.stringify(tutorReports)}
Tutor notes: ${tutorNotes}
Past marks: ${JSON.stringify(pastMarks)}
Question paper metadata: ${JSON.stringify(questionPaperMetadata)}
`;

export const recommendExercises = async (payload) => {
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
      return fallbackRecommendations;
    }

    const model = getGenerativeModel(ai, {
      model: firebaseAiModel,
    });

    const result = await model.generateContent(buildPrompt(payload));
    const text = stripCodeFence(result.response.text());
    const parsed = JSON.parse(text);

    return {
      ...parsed,
      source: 'firebase-ai-logic',
    };
  } catch (error) {
    console.error('Examify AI recommendation error:', error);
    return fallbackRecommendations;
  }
};
