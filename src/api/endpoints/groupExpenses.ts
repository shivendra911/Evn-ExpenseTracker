'use client';

import { apiGet, apiPost, apiPut } from '../client';
import type {
  GroupExpenseResponse,
  PaginatedResponse,
  CreateGroupExpenseInput,
} from '@/shared/types';

export async function getGroupExpenses(
  groupId: string,
  limit: number = 20,
  cursor?: string
): Promise<PaginatedResponse<GroupExpenseResponse>> {
  const query = new URLSearchParams();
  query.set('limit', limit.toString());
  if (cursor) query.set('cursor', cursor);

  const queryString = query.toString();
  return apiGet<PaginatedResponse<GroupExpenseResponse>>(
    `/api/groups/${groupId}/expenses?${queryString}`
  );
}

export async function createGroupExpense(
  groupId: string,
  data: CreateGroupExpenseInput
): Promise<{ id: string; message: string }> {
  return apiPost<{ id: string; message: string }>(`/api/groups/${groupId}/expenses`, data);
}

export async function getGroupExpense(
  groupId: string,
  expenseId: string
): Promise<GroupExpenseResponse> {
  return apiGet<GroupExpenseResponse>(`/api/groups/${groupId}/expenses/${expenseId}`);
}

export async function updateGroupExpense(
  groupId: string,
  expenseId: string,
  data: CreateGroupExpenseInput
): Promise<{ id: string; message: string }> {
  return apiPut<{ id: string; message: string }>(`/api/groups/${groupId}/expenses/${expenseId}`, data);
}

