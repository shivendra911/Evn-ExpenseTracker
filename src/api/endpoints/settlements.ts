'use client';

import { apiGet, apiPost } from '../client';
import type {
  GroupBalancesResponse,
  SettlementResponse,
  CreateSettlementInput,
} from '@/shared/types';

export async function getGroupBalances(groupId: string): Promise<GroupBalancesResponse> {
  return apiGet<GroupBalancesResponse>(`/api/groups/${groupId}/balances`);
}

export async function getGroupSettlements(groupId: string): Promise<SettlementResponse[]> {
  return apiGet<SettlementResponse[]>(`/api/groups/${groupId}/settlements`);
}

export async function createSettlement(
  groupId: string,
  data: CreateSettlementInput
): Promise<{ id: string; message: string }> {
  return apiPost<{ id: string; message: string }>(`/api/groups/${groupId}/settlements`, data);
}
