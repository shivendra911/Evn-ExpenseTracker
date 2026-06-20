'use client';

import { apiGet, apiPost, apiPut, apiDelete } from '../client';
import type {
  PersonalExpenseResponse,
  PaginatedResponse,
  CreatePersonalExpenseInput,
  UpdatePersonalExpenseInput,
  PersonalExpenseFilters,
  PersonalStatsResponse,
} from '@/shared/types';

export async function getPersonalExpenses(
  filters?: PersonalExpenseFilters
): Promise<PaginatedResponse<PersonalExpenseResponse>> {
  const query = new URLSearchParams();
  
  if (filters) {
    if (filters.category) query.set('category', filters.category);
    if (filters.dateFrom) query.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) query.set('dateTo', filters.dateTo);
    if (filters.tags) query.set('tags', filters.tags);
    if (filters.groupId) query.set('groupId', filters.groupId);
    if (filters.cursor) query.set('cursor', filters.cursor);
    if (filters.limit) query.set('limit', filters.limit.toString());
  }

  const queryString = query.toString();
  return apiGet<PaginatedResponse<PersonalExpenseResponse>>(
    `/api/personal-expenses${queryString ? `?${queryString}` : ''}`
  );
}

export async function getPersonalExpense(id: string): Promise<PersonalExpenseResponse> {
  return apiGet<PersonalExpenseResponse>(`/api/personal-expenses/${id}`);
}

export async function createPersonalExpense(
  data: CreatePersonalExpenseInput
): Promise<PersonalExpenseResponse> {
  return apiPost<PersonalExpenseResponse>('/api/personal-expenses', data);
}

export async function updatePersonalExpense(
  id: string,
  data: UpdatePersonalExpenseInput
): Promise<PersonalExpenseResponse> {
  return apiPut<PersonalExpenseResponse>(`/api/personal-expenses/${id}`, data);
}

export async function deletePersonalExpense(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/api/personal-expenses/${id}`);
}

export async function getPersonalStats(
  dateFrom?: string,
  dateTo?: string
): Promise<PersonalStatsResponse> {
  const query = new URLSearchParams();
  if (dateFrom) query.set('dateFrom', dateFrom);
  if (dateTo) query.set('dateTo', dateTo);
  
  const queryString = query.toString();
  return apiGet<PersonalStatsResponse>(
    `/api/personal-expenses/stats${queryString ? `?${queryString}` : ''}`
  );
}
