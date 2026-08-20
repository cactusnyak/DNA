import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type DadataSuggestion = {
  value?: string;
  unrestricted_value?: string;
  data?: {
    country?: string;
    city?: string;
    settlement?: string;
    region?: string;
    street_with_type?: string;
    house?: string;
    flat?: string;
    postal_code?: string;
    geo_lat?: string;
    geo_lon?: string;
    fias_id?: string;
  };
};

@Injectable()
export class AddressSuggestionsService {
  constructor(private readonly config: ConfigService) {}

  async suggest(rawQuery: string) {
    const query = rawQuery.trim();
    if (query.length < 3) return [];

    const token = this.config.get<string>('DADATA_API_KEY')?.trim();
    if (!token) {
      throw new ServiceUnavailableException(
        'Address suggestions are not configured',
      );
    }

    const response = await fetch(
      'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, count: 8 }),
        signal: AbortSignal.timeout(5_000),
      },
    );

    if (!response.ok) {
      throw new ServiceUnavailableException(
        'Address suggestions are unavailable',
      );
    }

    const payload = (await response.json()) as {
      suggestions?: DadataSuggestion[];
    };

    return (payload.suggestions ?? []).flatMap((suggestion) => {
      const data = suggestion.data;
      const value = suggestion.value?.trim();
      const country = data?.country?.trim();
      const city = (data?.city ?? data?.settlement)?.trim();
      if (!value || !country || !city) return [];

      return [
        {
          value,
          fullAddress: suggestion.unrestricted_value?.trim() || value,
          country,
          city,
          region: data?.region?.trim() || undefined,
          street: data?.street_with_type?.trim() || undefined,
          building: data?.house?.trim() || undefined,
          apartment: data?.flat?.trim() || undefined,
          postalCode: data?.postal_code?.trim() || undefined,
          latitude: this.number(data?.geo_lat),
          longitude: this.number(data?.geo_lon),
          externalLocationId: data?.fias_id?.trim() || undefined,
        },
      ];
    });
  }

  private number(value?: string) {
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}
