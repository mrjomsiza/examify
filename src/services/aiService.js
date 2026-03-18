import { httpsCallable } from 'firebase/functions';
import { functions, isFirebaseConfigured } from '../firebase/config';

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

  const callable = httpsCallable(functions, 'generateExerciseRecommendations');
  const response = await callable(payload);
  return response.data;
};
