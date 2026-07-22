import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { FILE_STORAGE, type FileStorage } from '../storage/file-storage';

const IMAGE_MIME_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'image/heic': '.heic',
  'image/heif': '.heif',
  'image/bmp': '.bmp',
};

const MAX_AVATAR_UPLOAD_SIZE = 5 * 1024 * 1024;

const CYRILLIC_TRANSLITERATION: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
  і: 'i',
  ї: 'yi',
  є: 'ye',
  ґ: 'g',
};

type CreateRegisteredUserParams = {
  email?: string;
  phone?: string;
  passwordHash?: string;
  nickname: string;
  inviterReferralCode?: string;
};

type CreateOAuthUserParams = {
  email: string;
  nickname: string;
  firstName?: string;
  lastName?: string;
  oauthProvider: string;
  oauthProviderId: string;
  inviterReferralCode?: string;
};

type UploadedFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(FILE_STORAGE) private readonly fileStorage: FileStorage,
  ) {}

  async findByEmail(email: string) {
    return this.prismaService.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: {
        avatar: true,
        balance: true,
      },
    });
  }

  async findByPhone(phone: string) {
    return this.prismaService.user.findFirst({
      where: {
        phone,
        deletedAt: null,
      },
      include: {
        avatar: true,
        balance: true,
      },
    });
  }

  async findByLogin(login: string) {
    if (login.includes('@')) {
      return this.findByEmail(login);
    }

    return this.findByPhone(login);
  }

  async findById(userId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        avatar: true,
        balance: true,
      },
    });

    return user ? this.mapPublicUser(user) : undefined;
  }

  async findByOAuthProviderId(provider: string, providerId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        oauthProvider: provider,
        oauthProviderId: providerId,
        deletedAt: null,
      },
      include: {
        avatar: true,
        balance: true,
      },
    });

    return user ? this.mapPublicUser(user) : undefined;
  }

  async createRegisteredUser(params: CreateRegisteredUserParams) {
    if (params.email) {
      const existingActiveUser = await this.findByEmail(params.email);

      if (existingActiveUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    if (params.phone) {
      const existingActiveUser = await this.findByPhone(params.phone);

      if (existingActiveUser) {
        throw new ConflictException('User with this phone already exists');
      }
    }

    const identity = await this.generateUserIdentity(params.nickname);

    return this.createUser({
      ...params,
      ...identity,
    });
  }

  async createOAuthUser(params: CreateOAuthUserParams) {
    const existingOAuthUser = await this.findByOAuthProviderId(
      params.oauthProvider,
      params.oauthProviderId,
    );

    if (existingOAuthUser) {
      return existingOAuthUser;
    }

    const identity = await this.generateUserIdentity(params.nickname);

    return this.createUser({
      ...params,
      ...identity,
    });
  }

  private async createUser(params: {
    email?: string;
    nickname: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    patronymic?: string;
    passwordHash?: string;
    oauthProvider?: string;
    oauthProviderId?: string;
    nicknameSuffix: string;
    referralCode: string;
    inviterReferralCode?: string;
  }) {
    const inviter = await this.getInviterByReferralCode(
      params.inviterReferralCode,
    );

    try {
      const user = await this.prismaService.user.create({
        data: {
          email: params.email,
          passwordHash: params.passwordHash,
          nickname: params.nickname,
          nicknameSuffix: params.nicknameSuffix,
          firstName: params.firstName,
          lastName: params.lastName,
          patronymic: params.patronymic,
          phone: params.phone,
          oauthProvider: params.oauthProvider,
          oauthProviderId: params.oauthProviderId,
          referralCode: params.referralCode,
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

      if (inviter) {
        await this.createReferral({
          invitedUserId: user.id,
          inviterUserId: inviter.id,
        });
      }

      return this.mapPublicUser(user);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        if (params.oauthProvider && params.oauthProviderId) {
          const existing = await this.findByOAuthProviderId(
            params.oauthProvider,
            params.oauthProviderId,
          );

          if (existing) {
            return existing;
          }

          throw new ConflictException(
            'User with this OAuth account already exists',
          );
        }

        throw new ConflictException('User with this email already exists');
      }

      throw error;
    }
  }

  async updateCurrentUser(
    userId: string,
    data: {
      nickname?: string;
      firstName?: string;
      lastName?: string;
      patronymic?: string;
      phone?: string;
      avatarId?: string | null;
    },
  ) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found or deleted');
    }

    const updatedUser = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        nickname: data.nickname,
        firstName: data.firstName,
        lastName: data.lastName,
        patronymic: data.patronymic,
        phone: data.phone,
        avatarId: data.avatarId,
      },
      include: {
        avatar: true,
        balance: true,
      },
    });

    return this.mapPublicUser(updatedUser);
  }

  async uploadAvatar(file: UploadedFile) {
    if (!file?.buffer) {
      throw new BadRequestException('Avatar file is required');
    }

    const extension = IMAGE_MIME_EXTENSION[file.mimetype];

    if (!extension) {
      throw new BadRequestException('Unsupported avatar file type');
    }

    if (file.size > MAX_AVATAR_UPLOAD_SIZE) {
      throw new BadRequestException('Avatar file is too large');
    }

    const fileName = `${randomUUID()}${extension}`;
    const storedFile = await this.fileStorage.upload({
      key: `avatars/${fileName}`,
      body: file.buffer,
      contentType: file.mimetype,
    });

    const image = await this.prismaService.image.create({
      data: {
        url: storedFile.url,
        sortOrder: 0,
        alt: file.originalname,
      },
    });

    return {
      id: image.id,
      url: image.url,
      fileName,
    };
  }

  async softDeleteById(userId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found or already deleted');
    }

    await this.prismaService.$transaction([
      this.prismaService.cartItem.deleteMany({
        where: {
          userId,
        },
      }),

      this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          firstName: 'Удалённый',
          lastName: 'Пользователь',
          patronymic: null,
          phone: null,
          passwordHash: null,
          avatarId: null,
          role: UserRole.DEFAULT,
          deletedAt: new Date(),
        },
      }),
    ]);
  }

  mapPublicUser(user: any) {
    return {
      id: user.id,
      email: user.email ?? undefined,
      nickname: user.nickname,
      nicknameSuffix: user.nicknameSuffix,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
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

  private async getInviterByReferralCode(inviterReferralCode?: string) {
    const normalizedReferralCode = inviterReferralCode?.trim();

    if (!normalizedReferralCode) {
      return undefined;
    }

    const inviter = await this.prismaService.user.findFirst({
      where: {
        referralCode: normalizedReferralCode,
        deletedAt: null,
      },
    });

    if (!inviter) {
      throw new BadRequestException('Inviter referral code is invalid');
    }

    return inviter;
  }

  private async createReferral(params: {
    invitedUserId: string;
    inviterUserId: string;
  }) {
    if (params.inviterUserId === params.invitedUserId) {
      throw new BadRequestException('User cannot invite himself');
    }

    const existingReferral = await this.prismaService.referral.findUnique({
      where: {
        invitedUserId: params.invitedUserId,
      },
    });

    if (existingReferral) {
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
        inviterUserId: params.inviterUserId,
        invitedUserId: params.invitedUserId,
        levelId: referralLevel.id,
      },
    });
  }

  private async generateUserIdentity(nickname: string) {
    const transliteratedNickname = Array.from(nickname.normalize('NFKC'))
      .map(
        (character) =>
          CYRILLIC_TRANSLITERATION[character.toLowerCase()] ?? character,
      )
      .join('');

    const nicknamePart =
      transliteratedNickname
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .slice(0, 16) || 'DNA';

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const nicknameSuffix = randomUUID();
      const shortSuffix = nicknameSuffix
        .replaceAll('-', '')
        .slice(0, 8)
        .toUpperCase();
      const referralCode = `${nicknamePart}-${shortSuffix}`;

      const existingUser = await this.prismaService.user.findFirst({
        where: {
          referralCode,
        },
      });

      if (!existingUser) {
        return { nicknameSuffix, referralCode };
      }
    }

    const nicknameSuffix = randomUUID();

    return {
      nicknameSuffix,
      referralCode: `${nicknamePart}-${nicknameSuffix.replaceAll('-', '').toUpperCase()}`,
    };
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
