import { invoke } from '@tauri-apps/api/core';
import type { Account, CreateAccountInput, UpdateAccountInput, Currency } from '../types';

export const accountApi = {
  list: (): Promise<Account[]> =>
    invoke('list_accounts'),

  get: (id: string): Promise<Account> =>
    invoke('get_account', { id }),

  create: (input: CreateAccountInput): Promise<Account> =>
    invoke('create_account', {
      name: input.name,
      accountType: input.accountType,
      currencyId: input.currencyId,
      creditLimit: input.creditLimit ?? null,
      billingDay: input.billingDay ?? null,
    }),

  update: (id: string, input: UpdateAccountInput): Promise<Account> =>
    invoke('update_account', { id, ...input }),

  archive: (id: string): Promise<void> =>
    invoke('archive_account', { id }),

  delete: (id: string): Promise<void> =>
    invoke('delete_account', { id }),
};

export const currencyApi = {
  list: (): Promise<Currency[]> =>
    invoke('list_currencies'),
};
