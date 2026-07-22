import type { ServiceStatus } from './types';

export const legalOwner = {
  legalForm: 'Индивидуальный предприниматель',
  fullName: 'ИП Филатов Денис Романович',
  personName: 'Филатов Денис Романович',
  inn: '773773149141',
  ogrnip: '325774600509142',
  registrationAuthority: 'Межрайонная инспекция Федеральной налоговой службы № 46 по г. Москве',
  legalAddress: null,
  email: 'dna.platform.shop@gmail.com',
  phone: '+7 977 883-40-48',
  phoneHref: '+79778834048',
  electronicRequestsHours: 'круглосуточно',
  domain: 'dna-platform.shop',
} as const;

export const externalServices = {
  hosting: { name: 'Selectel', status: 'active' as ServiceStatus, country: 'Россия' },
  payment: { name: 'ЮKassa', status: 'active' as ServiceStatus },
  sms: { name: null, status: 'notConfigured' as ServiceStatus },
  systemEmail: { name: null, status: 'notConfigured' as ServiceStatus },
  analytics: { name: null, status: 'notConfigured' as ServiceStatus },
  advertising: { name: null, status: 'notConfigured' as ServiceStatus },
  push: { name: null, status: 'notConfigured' as ServiceStatus },
  delivery: { name: null, status: 'notConfigured' as ServiceStatus },
} as const;

export const legalOperations = {
  accountRetention: null,
  orderRetention: null,
  legalAccountingRetention: null,
  technicalLogsRetention: null,
  deletedAccountRetention: null,
  consentRetention: null,
  crossBorderTransferStatus: 'requiresReview' as ServiceStatus,
  returnAddress: null,
  returnDeliveryCost: null,
} as const;

export const referralProgram = {
  levels: 2,
  binding: 'Бессрочно, пока правила программы или законные основания не предусматривают прекращения',
  minimumWithdrawalAmount: null,
  withdrawalFee: null,
  withdrawalPeriodBusinessDays: null,
  withdrawalProvider: null,
  withdrawalMethods: [] as string[],
  withdrawalStatus: 'notConfigured' as ServiceStatus,
} as const;

// TODO: LEGAL_REVIEW_MINIMUM_AGE
// TODO: LEGAL_REVIEW_LIFETIME_REFERRAL_BINDING
// TODO: LEGAL_REVIEW — заполнить неизвестные сроки хранения, адрес возврата и параметры доставки.

