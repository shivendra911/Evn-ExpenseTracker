import { prisma } from '@/lib/prisma';

export type AuditAction = 
  | 'USER_LOGIN'
  | 'EXPENSE_CREATED'
  | 'EXPENSE_EDITED'
  | 'GROUP_CREATED'
  | 'SETTLEMENT_RECORDED';

export async function logAudit(userId: string, action: AuditAction, metadata: any = {}, groupId?: string) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        metadata,
        ...(groupId ? { groupId } : {})
      }
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // Non-blocking, so we just log the error and continue
  }
}
