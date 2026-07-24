import { UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { UsersService } from './users.service';

describe('UsersService', () => {
  const findFirst = jest.fn();
  const update = jest.fn();
  const deleteMany = jest.fn();
  const transaction = jest.fn();
  const prismaService = {
    user: {
      findFirst,
      update,
    },
    cartItem: {
      deleteMany,
    },
    $transaction: transaction,
  } as unknown as PrismaService;

  const service = new UsersService(
    prismaService,
    {} as ConstructorParameters<typeof UsersService>[1],
  );

  beforeEach(() => {
    jest.clearAllMocks();
    findFirst.mockResolvedValue({ id: 'user-id' });
    deleteMany.mockReturnValue({ operation: 'delete-cart-items' });
    update.mockReturnValue({ operation: 'update-user' });
    transaction.mockResolvedValue([]);
  });

  it('releases the OAuth identity when soft-deleting a user', async () => {
    await service.softDeleteById('user-id');

    expect(update).toHaveBeenCalledWith({
      where: {
        id: 'user-id',
      },
      data: expect.objectContaining({
        oauthProvider: null,
        oauthProviderId: null,
        passwordHash: null,
        role: UserRole.DEFAULT,
        deletedAt: expect.any(Date),
      }),
    });
    expect(transaction).toHaveBeenCalledWith([
      { operation: 'delete-cart-items' },
      { operation: 'update-user' },
    ]);
  });
});
