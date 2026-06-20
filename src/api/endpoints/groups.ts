'use client';

import { apiGet, apiPost, apiPut } from '../client';
import type {
  GroupResponse,
  GroupDetailResponse,
  CreateGroupInput,
  UpdateGroupInput,
  JoinGroupInput,
} from '@/shared/types';

export async function getGroups(): Promise<GroupResponse[]> {
  return apiGet<GroupResponse[]>('/api/groups');
}

export async function getGroup(id: string): Promise<GroupDetailResponse> {
  return apiGet<GroupDetailResponse>(`/api/groups/${id}`);
}

export async function createGroup(data: CreateGroupInput): Promise<GroupResponse> {
  return apiPost<GroupResponse>('/api/groups', data);
}

export async function updateGroup(id: string, data: UpdateGroupInput): Promise<GroupResponse> {
  return apiPut<GroupResponse>(`/api/groups/${id}`, data);
}

export async function joinGroup(data: JoinGroupInput): Promise<GroupResponse & { message: string }> {
  return apiPost<GroupResponse & { message: string }>('/api/groups/join', data);
}
