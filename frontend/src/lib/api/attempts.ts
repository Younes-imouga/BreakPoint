import { get, post } from './api';

export interface AttemptDto {
  _id: string;
  user_id: string;
  simulation_id: string;
  token: string;
  component?: {
    fileName: string;
    language: string;
    content: string;
  };
  attempts: string[];
  hints_used: number;
  success: boolean | null;
  final_score: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TokenSubmitResponse {
  success: boolean;
  attempts: number;
  attempt: AttemptDto;
}

export interface HintResponse {
  hint: string | null;
  remaining: number;
  message?: string;
}

export const attemptsApi = {
  create(simulationId: string) {
    return post<AttemptDto>('/attempts', {
      simulation_id: simulationId,
    });
  },

  getById(attemptId: string) {
    return get<AttemptDto>(`/attempts/${attemptId}`);
  },

  submitToken(attemptId: string, token: string) {
    return post<TokenSubmitResponse>(`/attempts/${attemptId}/submit`, { token });
  },

  getHint() {
    return get<HintResponse>('/attempts/hint/active');
  },

  getHintForAttempt(attemptId: string) {
    return get<HintResponse>(`/attempts/${attemptId}/hints`);
  },

  giveUp(attemptId: string) {
    return post<{ message: string; attempt: AttemptDto }>(
      `/attempts/${attemptId}/give-up`,
    );
  },

  getMyAttempts() {
    return get<AttemptDto[]>('/users/me/attempts');
  },
};
