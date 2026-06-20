import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';
import { successResponse, errorResponse, NotFoundError, ConflictError } from '@/middleware/errors';

export const DELETE = withAdmin(async (request, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;

    // Prevent deleting the super admin
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User');
    if (user.email === 'promtengineering5@gmail.com') {
      throw new ConflictError('Cannot delete the super admin');
    }

    await prisma.user.delete({
      where: { id }
    });

    return successResponse({ message: 'User deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
});
