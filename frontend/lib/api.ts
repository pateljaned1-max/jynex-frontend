export const API_BASE_URL = 'https://jynex-backend.onrender.com';

export interface DialoguePayload {
  sender: string;
  text: string;
}

export const interviewApi = {
  // 1. Next Adaptive Question Endpoint with History
  async getFollowUpQuestion(
    candidateAnswer: string,
    history: DialoguePayload[] = []
  ) {
    const res = await fetch(`${API_BASE_URL}/api/interview/question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidate_answer: candidateAnswer,
        conversation_history: history,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned status: ${res.status}`);
    }

    return await res.json();
  },

  // 2. Backend Text-to-Speech (gTTS Audio Stream)
  async playQuestionAudio(text: string): Promise<HTMLAudioElement> {
    const res = await fetch(`${API_BASE_URL}/api/interview/speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      throw new Error(`TTS API error status: ${res.status}`);
    }

    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    await audio.play();
    return audio;
  },

  // 3. Complete LLM Session Evaluation
  async evaluateInterview(payload: {
    role: string;
    difficulty: string;
    conversation: DialoguePayload[];
  }) {
    const res = await fetch(`${API_BASE_URL}/api/interview/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Evaluation returned status: ${res.status}`);
    }

    return await res.json();
  },
};