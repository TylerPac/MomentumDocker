import { apiRequest } from './http';

export async function getDashboard(): Promise<unknown> {
  return apiRequest<unknown>('/api/dashboard', 'GET');
}
