import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://mycms.cmsprime.com/rest/users/new?version=1.0.0';
const API_TOKEN =
  process.env.API_TOKEN ||
  '805e6648071ff54087a78d1f5e0a5508a3ed4fd92f692c704b4e3120991fcf3df3d2eab8d57ffb782d6e4d4fba12648fb04cc76c807ff684c96e5d24';
const TURNSTILE_TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';
const TURNSTILE_SECRET_KEY =
  process.env.TURNSTILE_SECRET_KEY ||
  (process.env.NODE_ENV === 'production' ? '' : TURNSTILE_TEST_SECRET_KEY);

const leadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email address'),
  country: z.string().trim().length(2, 'Country is required'),
  marketingConsent: z.boolean().optional(),
  turnstileToken: z.string().trim().min(1, 'Please complete the captcha'),
});

interface ApiFailure {
  code?: number;
  message?: string;
  errors?: unknown;
  error?: unknown;
}

interface TurnstileVerificationResponse {
  success: boolean;
  'error-codes'?: string[];
}

function buildValidationErrors(error: z.ZodError) {
  const children: Record<string, { errors: string[] }> = {};

  for (const issue of error.issues) {
    const fieldName = String(issue.path[0] ?? 'form');
    children[fieldName] ??= { errors: [] };
    children[fieldName].errors.push(issue.message);
  }

  return children;
}

function remapLeadErrors(errors: unknown) {
  if (!errors || typeof errors !== 'object') {
    return {};
  }

  const typedErrors = errors as { children?: Record<string, unknown> };

  if (!typedErrors.children || typeof typedErrors.children !== 'object') {
    return typedErrors;
  }

  const children = { ...typedErrors.children };

  if (children.firstName && !children.name) {
    children.name = children.firstName;
    delete children.firstName;
  }

  return {
    ...typedErrors,
    children,
  };
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim();
  }

  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    undefined
  );
}

async function verifyTurnstileToken(request: NextRequest, token: string) {
  if (!TURNSTILE_SECRET_KEY) {
    return {
      success: false,
      message: 'Captcha is not configured on the server.',
    };
  }

  const formData = new FormData();
  formData.append('secret', TURNSTILE_SECRET_KEY);
  formData.append('response', token);

  const remoteIp = getClientIp(request);

  if (remoteIp) {
    formData.append('remoteip', remoteIp);
  }

  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    return {
      success: false,
      message: 'Captcha verification failed. Please try again.',
    };
  }

  const data = (await response.json()) as TurnstileVerificationResponse;

  if (!data.success) {
    return {
      success: false,
      message: 'Please complete the captcha and try again.',
      codes: data['error-codes'] || [],
    };
  }

  return {
    success: true,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedBody = leadSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          code: 400,
          message: 'Validation failed',
          errors: {
            children: buildValidationErrors(parsedBody.error),
          },
        },
        { status: 400 }
      );
    }

    const turnstileResult = await verifyTurnstileToken(
      request,
      parsedBody.data.turnstileToken
    );

    if (!turnstileResult.success) {
      return NextResponse.json(
        {
          success: false,
          code: 400,
          message: turnstileResult.message,
          errors: {
            children: {
              turnstileToken: {
                errors: [turnstileResult.message],
              },
            },
          },
          ...(turnstileResult.codes
            ? {
                turnstile: {
                  codes: turnstileResult.codes,
                },
              }
            : {}),
        },
        { status: 400 }
      );
    }

    const payload = {
      firstName: parsedBody.data.name,
      email: parsedBody.data.email,
      lead: true,
      country: parsedBody.data.country.toUpperCase(),
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();

      return NextResponse.json(
        {
          success: false,
          code: response.status,
          message: `Server error: ${response.statusText}`,
          errors: {},
          rawResponse: text,
        },
        { status: response.status }
      );
    }

    const data = (await response.json()) as ApiFailure;

    if (!response.ok) {
      const failureResponse: {
        success: false;
        code: number;
        message: string;
        errors: unknown;
        serverError?: unknown;
      } = {
        success: false,
        code: data.code || response.status,
        message: data.message || 'Lead registration failed',
        errors: remapLeadErrors(data.errors),
      };

      if (data.error) {
        failureResponse.serverError = data.error;
      }

      return NextResponse.json(
        failureResponse,
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        code: 500,
        message: 'An unexpected error occurred',
        errors: {},
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
