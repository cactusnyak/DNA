import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/shared/api/http-client';
import { ADMIN_DELIVERY_QUOTES_QUERY_KEY, EMPTY_ADMIN_QUOTE_DRAFT } from '../data/admin-delivery-quotes';
import type { AdminQuote, AdminQuoteDraft, AdminQuoteDrafts, UpdateAdminQuoteVariables } from '../types/admin-delivery-quotes';
import { getAdminQuoteDraft } from './get-admin-quote-draft';

export function useAdminDeliveryQuotes(accessToken: string) {
  const client = useQueryClient();
  const [drafts, setDrafts] = useState<AdminQuoteDrafts>({});
  const headers = { Authorization: `Bearer ${accessToken}` };
  const query = useQuery({
    queryKey: ADMIN_DELIVERY_QUOTES_QUERY_KEY,
    queryFn: () => httpClient<AdminQuote[]>('/admin/delivery-quotes', { headers }),
  });
  const mutation = useMutation({
    mutationFn: ({ id, status }: UpdateAdminQuoteVariables) => {
      const draft = drafts[id] ?? EMPTY_ADMIN_QUOTE_DRAFT;
      return httpClient(`/admin/delivery-quotes/${id}`, {
        method: 'PATCH',
        headers,
        body: {
          status,
          confirmedDeliveryPrice: draft.price === '' ? undefined : Number(draft.price),
          managerComment: draft.comment,
          expiresAt: draft.expiresAt || undefined,
        },
      });
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ADMIN_DELIVERY_QUOTES_QUERY_KEY }),
  });

  const updateDraft = (quote: AdminQuote, nextDraft: Partial<AdminQuoteDraft>) => {
    setDrafts((current) => ({
      ...current,
      [quote.id]: { ...(current[quote.id] ?? getAdminQuoteDraft(quote)), ...nextDraft },
    }));
  };

  return { drafts, query, updateDraft, updateQuote: mutation.mutate };
}
