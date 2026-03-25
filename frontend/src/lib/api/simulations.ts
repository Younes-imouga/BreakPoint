import { get, post, patch, remove } from './api';

export interface SimulationDto {
	_id: string;
	name: string;
	slug: string;
	description: string;
	difficulty: 'Easy' | 'Normal' | 'Hard' | 'Insane';
	token_count: number;
	minimum_exp: number;
	status: 'Active' | 'Locked';
	hint?: string[];
	score: number;
	createdBy: string;
	metadata?: Record<string, unknown>;
	components?: Array<{
		fileName: string;
		language: string;
		content: string;
	}>;
	createdAt?: string;
	updatedAt?: string;
}

export interface SimulationPayload {
	name: string;
	description: string;
	difficulty: 'Easy' | 'Normal' | 'Hard' | 'Insane';
	token_count?: number;
	minimum_exp?: number;
	status?: 'Active' | 'Locked';
	hint?: string[];
	score?: number;
	components?: Array<{
		fileName: string;
		language?: string;
		content: string;
	}>;
}

export interface PaginatedSimulationsResponse {
	data: SimulationDto[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export const simulationsApi = {
	getAll(
		page: number = 1,
		limit: number = 20,
		filters?: {
			difficulty?: SimulationDto['difficulty'];
			status?: SimulationDto['status'];
		},
	) {
		const queryParams = new URLSearchParams({
			page: String(page),
			limit: String(limit),
		});

		if (filters?.difficulty) {
			queryParams.set('difficulty', filters.difficulty);
		}

		if (filters?.status) {
			queryParams.set('status', filters.status);
		}

		return get<PaginatedSimulationsResponse>(
			`/simulations?${queryParams.toString()}`,
		);
	},

	getById(id: string) {
		return get<SimulationDto>(`/simulations/${id}`);
	},

	create(data: SimulationPayload) {
		return post<SimulationDto>('/simulations', data);
	},

	update(id: string, data: Partial<SimulationPayload>) {
		return patch<SimulationDto>(`/simulations/${id}`, data);
	},

	delete(id: string) {
		return remove<SimulationDto>(`/simulations/${id}`);
	},

	start(id: string) {
		return post<Record<string, unknown>>(`/simulations/${id}/start`);
	},

	getAttempts(simulationId: string) {
		return get<unknown[]>(`/simulations/${simulationId}/attempts`);
	},
};
