import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

type CreateRegisteredUserParams = {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  inviterReferralCode?: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email,
      },
      include: {
        avatar: true,
        balance: true,
      },
    });
  }

  async findById(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        avatar: true,
        balance: true,
      },
    });

    return user ? this.mapPublicUser(user) : undefined;
  }

  async createRegisteredUser(params: CreateRegisteredUserParams) {
    const existingUser = await this.findByEmail(params.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const referralCode = await this.generateUniqueReferralCode(params.email);

    const user = await this.prismaService.user.create({
      data: {
        email: params.email,
        passwordHash: params.passwordHash,
        firstName: params.firstName,
        lastName: params.lastName,
        phone: params.phone,
        referralCode,
        balance: {
          create: {
            value: 0,
          },
        },
      },
      include: {
        avatar: true,
        balance: true,
      },
    });

    await this.createReferralIfPossible({
      invitedUserId: user.id,
      inviterReferralCode: params.inviterReferralCode,
    });

    return this.mapPublicUser(user);
  }

  mapPublicUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      patronymic: user.patronymic ?? undefined,
      phone: user.phone ?? undefined,
      avatar: user.avatar ?? undefined,
      referralCode: user.referralCode ?? undefined,
      balance: user.balance
        ? {
            value: user.balance.value,
            currency: user.balance.currency,
          }
        : undefined,
    };
  }

  private async createReferralIfPossible(params: {
    invitedUserId: string;
    inviterReferralCode?: string;
  }) {
    const inviterReferralCode = params.inviterReferralCode?.trim();

    if (!inviterReferralCode) {
      return;
    }

    const inviter = await this.prismaService.user.findUnique({
      where: {
        referralCode: inviterReferralCode,
      },
    });

    if (!inviter || inviter.id === params.invitedUserId) {
      return;
    }

    const referralLevel = await this.prismaService.referralLevel.upsert({
      where: {
        grade: 1,
      },
      update: {},
      create: {
        grade: 1,
        name: 'Партнёр',
      },
    });

    await this.prismaService.referral.create({
      data: {
        inviterUserId: inviter.id,
        invitedUserId: params.invitedUserId,
        levelId: referralLevel.id,
      },
    });
  }

  private async generateUniqueReferralCode(email: string) {
    const emailPrefix = email
      .split('@')[0]
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 8);

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
      const referralCode = `${emailPrefix || 'DNA'}${suffix}`;

      const existingUser = await this.prismaService.user.findUnique({
        where: {
          referralCode,
        },
      });

      if (!existingUser) {
        return referralCode;
      }
    }

    return `DNA${Date.now()}`;
  }
}