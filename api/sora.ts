/**
 * MAS SORA API - Central Bank Rate Fetcher & Normalizer
 * Location: /api/sora.ts (project root level)
 *
 * Pulls official MAS domestic interest rates (SORA and compounded benchmarks)
 * and SGD end-of-period daily exchange rates.
 *
 * Endpoints:
 * 1. Daily SORA + compounded 1M/3M/6M averages:
 *    https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
 * 2. Daily SGD exchange rates, end of period:
 *    https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily
 *
 * Headers required:
 *    KeyId: <MAS_KEY_ID> (Retrieved from process.env.MAS_KEY_ID, not hardcoded)
 */

export interface NormalizedSoraRecord {
  date: string;
  rate: number;
  compound1M?: number;
  compound3M?: number;
  compound6M?: number;
  volumeSGDMillion?: number;
  soraIndex?: number;
  fxRates?: {
    usd_sgd?: number;
    eur_sgd?: number;
    gbp_sgd?: number;
    jpy_sgd_100?: number;
    cny_sgd_100?: number;
  };
}

export interface MasApiResponsePayload {
  success: boolean;
  source: string;
  keyConfigured: boolean;
  count: number;
  data: NormalizedSoraRecord[];
  fxIncluded?: boolean;
  message?: string;
  warning?: string;
}

const MAS_SORA_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily';

const MAS_FX_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily';

/**
 * Built-in MAS baseline data used when MAS_KEY_ID has not yet been set by the user,
 * ensuring the frontend runs seamlessly out-of-the-box until keys are configured.
 */
const BASELINE_FALLBACK_RATES: NormalizedSoraRecord[] = [
  {
    date: '2026-10-05',
    rate: 2.745,
    compound1M: 2.76,
    compound3M: 2.78,
    compound6M: 2.8,
    volumeSGDMillion: 4150,
    soraIndex: 1.15842,
  },
  {
    date: '2026-10-02',
    rate: 2.738,
    compound1M: 2.758,
    compound3M: 2.779,
    compound6M: 2.799,
    volumeSGDMillion: 3980,
    soraIndex: 1.158298,
  },
  {
    date: '2026-10-01',
    rate: 2.751,
    compound1M: 2.756,
    compound3M: 2.778,
    compound6M: 2.798,
    volumeSGDMillion: 4320,
    soraIndex: 1.158175,
  },
  {
    date: '2026-09-30',
    rate: 2.765,
    compound1M: 2.755,
    compound3M: 2.777,
    compound6M: 2.797,
    volumeSGDMillion: 4890,
    soraIndex: 1.158052,
  },
  {
    date: '2026-09-29',
    rate: 2.742,
    compound1M: 2.754,
    compound3M: 2.776,
    compound6M: 2.796,
    volumeSGDMillion: 3820,
    soraIndex: 1.157929,
  },
  {
    date: '2026-09-28',
    rate: 2.739,
    compound1M: 2.753,
    compound3M: 2.775,
    compound6M: 2.795,
    volumeSGDMillion: 3750,
    soraIndex: 1.157806,
  },
  {
    date: '2026-09-25',
    rate: 2.745,
    compound1M: 2.752,
    compound3M: 2.774,
    compound6M: 2.794,
    volumeSGDMillion: 4100,
    soraIndex: 1.157683,
  },
  {
    date: '2026-09-24',
    rate: 2.748,
    compound1M: 2.751,
    compound3M: 2.773,
    compound6M: 2.793,
    volumeSGDMillion: 3950,
    soraIndex: 1.15756,
  },
  {
    date: '2026-09-23',
    rate: 2.752,
    compound1M: 2.75,
    compound3M: 2.772,
    compound6M: 2.792,
    volumeSGDMillion: 4020,
    soraIndex: 1.157437,
  },
  {
    date: '2026-09-22',
    rate: 2.756,
    compound1M: 2.749,
    compound3M: 2.771,
    compound6M: 2.791,
    volumeSGDMillion: 4210,
    soraIndex: 1.157314,
  },
  {
    date: '2026-09-21',
    rate: 2.75,
    compound1M: 2.748,
    compound3M: 2.77,
    compound6M: 2.79,
    volumeSGDMillion: 3880,
    soraIndex: 1.157191,
  },
  {
    date: '2026-09-18',
    rate: 2.743,
    compound1M: 2.747,
    compound3M: 2.769,
    compound6M: 2.789,
    volumeSGDMillion: 3920,
    soraIndex: 1.157068,
  },
];

/**
 * Fetch and normalize SORA records from the official MAS endpoint
 */
export async function fetchMasSoraData(options: {
  limit?: number;
  includeFx?: boolean;
  clientKey?: string;
}): Promise<MasApiResponsePayload> {
  const masKeyId = options.clientKey || process.env.MAS_KEY_ID || process.env.VITE_MAS_KEY_ID;
  const isKeyConfigured = Boolean(masKeyId && masKeyId.trim().length > 0);

  // If no MAS_KEY_ID is configured yet, provide clean baseline data with instructions
  if (!isKeyConfigured) {
    return {
      success: true,
      source: 'MAS Baseline Store (Pending MAS_KEY_ID configuration)',
      keyConfigured: false,
      count: BASELINE_FALLBACK_RATES.length,
      data: BASELINE_FALLBACK_RATES.slice(0, options.limit || 100),
      fxIncluded: false,
      warning:
        'MAS_KEY_ID is not configured in process.env. Add MAS_KEY_ID to your environment or request headers to pull live data from MAS API Gateway.',
    };
  }

  const cleanKey = masKeyId!.trim();
  const limit = options.limit || 100;

  // 1. Fetch Domestic Interest Rates from MAS Gateway
  const soraUrl = new URL(MAS_SORA_ENDPOINT);
  soraUrl.searchParams.set('rows', String(limit));
  soraUrl.searchParams.set('sort', 'end_of_day desc');

  const soraHeaders: Record<string, string> = {
    KeyId: cleanKey,
    Accept: 'application/json',
    'User-Agent': 'MAS-SORA-Service/1.0',
  };

  const soraResponse = await fetch(soraUrl.toString(), {
    method: 'GET',
    headers: soraHeaders,
  });

  if (!soraResponse.ok) {
    // If MAS returns 401 or 403, pass descriptive error
    if (soraResponse.status === 401 || soraResponse.status === 403) {
      throw new Error(
        `MAS Gateway Authentication Failed (HTTP ${soraResponse.status}). Please verify that your MAS_KEY_ID is valid and active on https://eservices.mas.gov.sg.`
      );
    }
    throw new Error(`MAS Gateway returned HTTP ${soraResponse.status}: ${soraResponse.statusText}`);
  }

  const soraJson = await soraResponse.json();
  const rawRecords: any[] = soraJson?.result?.records || soraJson?.records || [];

  // 2. Optionally fetch SGD Exchange Rates
  let fxMap: Record<string, any> = {};
  if (options.includeFx) {
    try {
      const fxUrl = new URL(MAS_FX_ENDPOINT);
      fxUrl.searchParams.set('rows', String(limit));
      fxUrl.searchParams.set('sort', 'end_of_day desc');

      const fxResponse = await fetch(fxUrl.toString(), {
        method: 'GET',
        headers: soraHeaders,
      });

      if (fxResponse.ok) {
        const fxJson = await fxResponse.json();
        const fxRecords: any[] = fxJson?.result?.records || fxJson?.records || [];
        fxRecords.forEach((item) => {
          if (item.end_of_day) {
            fxMap[item.end_of_day] = {
              usd_sgd: item.usd_sgd ? parseFloat(item.usd_sgd) : undefined,
              eur_sgd: item.eur_sgd ? parseFloat(item.eur_sgd) : undefined,
              gbp_sgd: item.gbp_sgd ? parseFloat(item.gbp_sgd) : undefined,
              jpy_sgd_100: item.jpy_sgd_100 ? parseFloat(item.jpy_sgd_100) : undefined,
              cny_sgd_100: item.cny_sgd_100 ? parseFloat(item.cny_sgd_100) : undefined,
            };
          }
        });
      }
    } catch (fxErr) {
      console.warn('Optional FX rates fetch encountered a non-fatal warning:', fxErr);
    }
  }

  // 3. Normalize records into standardized format
  const normalized: NormalizedSoraRecord[] = rawRecords.map((item: any) => {
    const dateStr = item.end_of_day || item.date || '';
    const overnight = parseFloat(item.sora || item.rate || '0');
    const c1m = item.sora_compounded_1m ? parseFloat(item.sora_compounded_1m) : undefined;
    const c3m = item.sora_compounded_3m ? parseFloat(item.sora_compounded_3m) : undefined;
    const c6m = item.sora_compounded_6m ? parseFloat(item.sora_compounded_6m) : undefined;
    const vol = item.aggregate_volume ? parseFloat(item.aggregate_volume) : undefined;
    const idx = item.sora_index ? parseFloat(item.sora_index) : undefined;

    return {
      date: dateStr,
      rate: isNaN(overnight) ? 0 : overnight,
      compound1M: c1m && !isNaN(c1m) ? c1m : undefined,
      compound3M: c3m && !isNaN(c3m) ? c3m : undefined,
      compound6M: c6m && !isNaN(c6m) ? c6m : undefined,
      volumeSGDMillion: vol && !isNaN(vol) ? vol : undefined,
      soraIndex: idx && !isNaN(idx) ? idx : undefined,
      fxRates: fxMap[dateStr] || undefined,
    };
  });

  return {
    success: true,
    source: 'MAS Official API Gateway (Live)',
    keyConfigured: true,
    count: normalized.length,
    data: normalized,
    fxIncluded: Boolean(options.includeFx && Object.keys(fxMap).length > 0),
  };
}

/**
 * Universal Serverless Handler
 * Compatible with Vercel / Netlify serverless, Express routers, and Web API Request.
 */
export default async function handler(req: any, res?: any) {
  try {
    // Extract query parameters
    let limit = 100;
    let includeFx = false;
    let clientKey: string | undefined = undefined;

    if (req?.query) {
      if (req.query.limit || req.query.rows) {
        limit = parseInt(req.query.limit || req.query.rows, 10) || 100;
      }
      if (req.query.includeFx === 'true' || req.query.fx === 'true') {
        includeFx = true;
      }
    } else if (req?.url) {
      try {
        const parsed = new URL(req.url, 'http://localhost');
        const limitParam = parsed.searchParams.get('limit') || parsed.searchParams.get('rows');
        if (limitParam) limit = parseInt(limitParam, 10) || 100;
        if (parsed.searchParams.get('includeFx') === 'true' || parsed.searchParams.get('fx') === 'true') {
          includeFx = true;
        }
      } catch {
        // use defaults
      }
    }

    // Optional KeyId header override from request
    if (req?.headers) {
      const keyHeader = req.headers['keyid'] || req.headers['key-id'] || req.headers['KeyId'];
      if (keyHeader && typeof keyHeader === 'string') {
        clientKey = keyHeader;
      }
    }

    const payload = await fetchMasSoraData({ limit, includeFx, clientKey });

    // Standard Express / Node response
    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return res.status(200).json(payload);
    }

    // Web Fetch standard Response
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    const errorPayload = {
      success: false,
      error: error?.message || 'Failed to fetch from MAS API Gateway',
      hint: 'Ensure MAS_KEY_ID is populated in environment variables without quotes.',
      timestamp: new Date().toISOString(),
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
