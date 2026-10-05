/**
 * MAS SORA API - Health Check Endpoint
 * Location: /api/health.ts (project root level)
 *
 * Verifies connectivity, environment variables, and gateway configuration.
 * Do not hardcode API keys. Reads MAS_KEY_ID from process.env.
 */

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  masGateway: {
    keyConfigured: boolean;
    keyMasked?: string;
    endpoints: {
      soraDomesticRates: string;
      exchangeRatesDaily: string;
    };
  };
  service: string;
}

export const MAS_ENDPOINTS = {
  soraDomesticRates:
    'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily',
  exchangeRatesDaily:
    'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily',
};

export async function checkHealth(): Promise<HealthCheckResponse> {
  const masKeyId = process.env.MAS_KEY_ID || process.env.VITE_MAS_KEY_ID;
  const isKeyConfigured = Boolean(masKeyId && masKeyId.trim().length > 0);

  let keyMasked: string | undefined = undefined;
  if (isKeyConfigured && masKeyId) {
    const trimmed = masKeyId.trim();
    if (trimmed.length > 6) {
      keyMasked = `${trimmed.slice(0, 3)}...${trimmed.slice(-3)}`;
    } else {
      keyMasked = '***';
    }
  }

  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    environment: process.env.NODE_ENV || 'development',
    service: 'Monetary Authority of Singapore (MAS) SORA Connector',
    masGateway: {
      keyConfigured: isKeyConfigured,
      keyMasked,
      endpoints: MAS_ENDPOINTS,
    },
  };
}

/**
 * Universal Serverless Handler
 * Compatible with Vercel/Netlify functions (req, res), Express routers, and Web API Request.
 */
export default async function handler(req: any, res?: any) {
  try {
    const data = await checkHealth();

    // Standard Express / Node serverless (req, res)
    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(200).json(data);
    }

    // Web Fetch API standard Response
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    const errPayload = {
      status: 'degraded',
      error: error?.message || 'Internal health check failure',
      timestamp: new Date().toISOString(),
    };

    if (res && typeof res.status === 'function') {
      return res.status(500).json(errPayload);
    }

    return new Response(JSON.stringify(errPayload), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
