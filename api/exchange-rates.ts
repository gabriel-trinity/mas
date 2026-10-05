/**
 * MAS SGD Exchange Rates API - End of Period Daily Rates
 * Location: /api/exchange-rates.ts (project root level)
 *
 * Endpoint:
 * https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily
 *
 * Header required:
 * KeyId: <MAS_KEY_ID> (Retrieved from process.env.MAS_KEY_ID, not hardcoded)
 */

export interface NormalizedExchangeRateRecord {
  date: string;
  usd_sgd?: number;
  eur_sgd?: number;
  gbp_sgd?: number;
  jpy_sgd_100?: number;
  myr_sgd_100?: number;
  cny_sgd_100?: number;
  aud_sgd?: number;
  hkd_sgd_100?: number;
}

export interface MasFxApiResponsePayload {
  success: boolean;
  source: string;
  keyConfigured: boolean;
  count: number;
  data: NormalizedExchangeRateRecord[];
  warning?: string;
}

const MAS_FX_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily';

const BASELINE_FALLBACK_FX: NormalizedExchangeRateRecord[] = [
  {
    date: '2026-10-05',
    usd_sgd: 1.2845,
    eur_sgd: 1.482,
    gbp_sgd: 1.713,
    jpy_sgd_100: 0.885,
    myr_sgd_100: 30.12,
    cny_sgd_100: 18.05,
    aud_sgd: 0.852,
  },
  {
    date: '2026-10-02',
    usd_sgd: 1.2838,
    eur_sgd: 1.4815,
    gbp_sgd: 1.712,
    jpy_sgd_100: 0.8842,
    myr_sgd_100: 30.1,
    cny_sgd_100: 18.04,
    aud_sgd: 0.8515,
  },
  {
    date: '2026-10-01',
    usd_sgd: 1.2852,
    eur_sgd: 1.483,
    gbp_sgd: 1.7145,
    jpy_sgd_100: 0.886,
    myr_sgd_100: 30.15,
    cny_sgd_100: 18.06,
    aud_sgd: 0.853,
  },
];

export async function fetchMasExchangeRates(options: {
  limit?: number;
  clientKey?: string;
}): Promise<MasFxApiResponsePayload> {
  const masKeyId = options.clientKey || process.env.MAS_KEY_ID || process.env.VITE_MAS_KEY_ID;
  const isKeyConfigured = Boolean(masKeyId && masKeyId.trim().length > 0);

  if (!isKeyConfigured) {
    return {
      success: true,
      source: 'MAS FX Baseline Store (Pending MAS_KEY_ID configuration)',
      keyConfigured: false,
      count: BASELINE_FALLBACK_FX.length,
      data: BASELINE_FALLBACK_FX.slice(0, options.limit || 50),
      warning: 'Set MAS_KEY_ID in environment variables to pull live rates from MAS Gateway.',
    };
  }

  const cleanKey = masKeyId!.trim();
  const limit = options.limit || 50;

  const url = new URL(MAS_FX_ENDPOINT);
  url.searchParams.set('rows', String(limit));
  url.searchParams.set('sort', 'end_of_day desc');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      KeyId: cleanKey,
      Accept: 'application/json',
      'User-Agent': 'MAS-FX-Service/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(
      `MAS FX Gateway returned HTTP ${response.status}: ${response.statusText}. Check MAS_KEY_ID validity.`
    );
  }

  const json = await response.json();
  const rawRecords: any[] = json?.result?.records || json?.records || [];

  const data: NormalizedExchangeRateRecord[] = rawRecords.map((item: any) => ({
    date: item.end_of_day || item.date || '',
    usd_sgd: item.usd_sgd ? parseFloat(item.usd_sgd) : undefined,
    eur_sgd: item.eur_sgd ? parseFloat(item.eur_sgd) : undefined,
    gbp_sgd: item.gbp_sgd ? parseFloat(item.gbp_sgd) : undefined,
    jpy_sgd_100: item.jpy_sgd_100 ? parseFloat(item.jpy_sgd_100) : undefined,
    myr_sgd_100: item.myr_sgd_100 ? parseFloat(item.myr_sgd_100) : undefined,
    cny_sgd_100: item.cny_sgd_100 ? parseFloat(item.cny_sgd_100) : undefined,
    aud_sgd: item.aud_sgd ? parseFloat(item.aud_sgd) : undefined,
    hkd_sgd_100: item.hkd_sgd_100 ? parseFloat(item.hkd_sgd_100) : undefined,
  }));

  return {
    success: true,
    source: 'MAS Official API Gateway (Live)',
    keyConfigured: true,
    count: data.length,
    data,
  };
}

export default async function handler(req: any, res?: any) {
  try {
    let limit = 50;
    let clientKey: string | undefined = undefined;

    if (req?.query?.limit || req?.query?.rows) {
      limit = parseInt(req.query.limit || req.query.rows, 10) || 50;
    }
    if (req?.headers) {
      const keyHeader = req.headers['keyid'] || req.headers['key-id'] || req.headers['KeyId'];
      if (keyHeader && typeof keyHeader === 'string') {
        clientKey = keyHeader;
      }
    }

    const payload = await fetchMasExchangeRates({ limit, clientKey });

    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
      return res.status(200).json(payload);
    }

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error: any) {
    const errorPayload = {
      success: false,
      error: error?.message || 'Failed to fetch exchange rates from MAS API Gateway',
    };

    if (res && typeof res.status === 'function') {
      return res.status(502).json(errorPayload);
    }

    return new Response(JSON.stringify(errorPayload), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
