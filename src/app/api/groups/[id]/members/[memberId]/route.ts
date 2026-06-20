import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withGroupAdmin } from '@/middleware/withGroupAdmin';
import type { GroupMemberRequest } from '@/middleware/withGroupMember';
import { successResponse, errorResponse, NotFoundError, AuthorizationError } from '@/middleware/errors';

export const PATCH = withGroupAdmin(async (request: GroupMemberRequest, context: { params: Promise<{ id: string; memberId: string }> }) => {
  try {
    const { id: groupId, memberId } = await context.params;
    const body = await request.json();
    const { role } = body;

    if (role !== 'ADMIN' && role !== 'MEMBER') {
      return NextResponse.json({ success: false, error: { message: 'Invalid role' } }, { status: 400 });
    }

    const memberToUpdate = await prisma.groupMember.findUnique({
      where: { id: memberId },
    });

    if (!memberToUpdate || memberToUpdate.groupId !== groupId) {
      throw new NotFoundError('Member');
    }

    // Don't let someone demote themselves if they are the last admin, but let's keep it simple for now.
    
    const updated = await prisma.groupMember.update({
      where: { id: memberId },
      data: { role },
    });

    return successResponse({ id: updated.id, role: updated.role });
  } catch (error) {
    return errorResponse(error);
  }
});

export const DELETE = withGroupAdmin(async (request: GroupMemberRequest, context: { params: Promise<{ id: string; memberId: string }> }) => {
  try {
    const { id: groupId, memberId } = await context.params;

    const memberToDelete = await prisma.groupMember.findUnique({
      where: { id: memberId },
    });

    if (!memberToDelete || memberToDelete.groupId !== groupId) {
      throw new NotFoundError('Member');
    }

    if (memberToDelete.userId === request.user.userId) {
      throw new AuthorizationError("You cannot remove yourself. Use the leave group option.");
    }

    await prisma.groupMember.delete({
      where: { id: memberId },
    });

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
});
