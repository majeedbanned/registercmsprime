import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://mycms.cmsprime.com/rest/users/new?version=1.0.0';
const COMMENT_API_URL =
  'https://mycms.cmsprime.com/rest/user/comments/new?version=1.0.0';
const API_TOKEN =
  process.env.API_TOKEN ||
  '805e6648071ff54087a78d1f5e0a5508a3ed4fd92f692c704b4e3120991fcf3df3d2eab8d57ffb782d6e4d4fba12648fb04cc76c807ff684c96e5d24';
const TURNSTILE_SECRET_KEY = '0x4AAAAAAA0Zk-LXoYb97vNrED5jRLCUgu4';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email address'),
  country: z.string().trim().length(2, 'Country is required'),
  phoneCountryCode: z.string().trim().min(1, 'Country code is required'),
  phone: z.string().trim().min(1, 'Phone number is required'),
  subject: z.string().trim().min(1, 'Subject is required'),
  message: z.string().trim().min(1, 'Message is required'),
  turnstileToken: z.string().trim().optional(),
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

function remapContactErrors(errors: unknown) {
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

function isLocalhostRequest(request: NextRequest) {
  const hostname =
    request.nextUrl.hostname ||
    request.headers.get('host')?.split(':')[0] ||
    '';

  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1'
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

function extractRegisteredUserId(data: unknown): number | string | null {
  if (Array.isArray(data)) {
    for (const item of data) {
      const id = extractRegisteredUserId(item);

      if (id !== null) {
        return id;
      }
    }

    return null;
  }

  if (!data || typeof data !== 'object') {
    return null;
  }

  const record = data as Record<string, unknown>;

  if (typeof record.id === 'number' || typeof record.id === 'string') {
    return record.id;
  }

  if ('user' in record) {
    const nestedId = extractRegisteredUserId(record.user);

    if (nestedId !== null) {
      return nestedId;
    }
  }

  if ('data' in record) {
    const nestedId = extractRegisteredUserId(record.data);

    if (nestedId !== null) {
      return nestedId;
    }
  }

  return null;
}

async function createContactComment(
  userId: number | string,
  subject: string,
  message: string
) {
  const response = await fetch(COMMENT_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user: userId,
      manager: 1,
      text: `subject: ${subject} , message: ${message}`,
    }),
  });

  const contentType = response.headers.get('content-type');

  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();

    throw new Error(
      `Comment API returned non-JSON response (${response.status}): ${text}`
    );
  }

  const data = (await response.json()) as ApiFailure;

  if (!response.ok) {
    throw new Error(
      data.message ||
        `Comment API request failed with status ${response.status}`
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedBody = contactSchema.safeParse(body);

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

    if (!isLocalhostRequest(request)) {
      if (!parsedBody.data.turnstileToken) {
        return NextResponse.json(
          {
            success: false,
            code: 400,
            message: 'Please complete the captcha.',
            errors: {
              children: {
                turnstileToken: {
                  errors: ['Please complete the captcha.'],
                },
              },
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
    }

    const payload = {
      firstName: parsedBody.data.name,
      email: parsedBody.data.email,
      country: parsedBody.data.country.toUpperCase(),
      phone: `${parsedBody.data.phoneCountryCode} ${parsedBody.data.phone}`.trim(),
      tags: ['Contact Us Form'],
      lead: true,
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
        message: data.message || 'Contact request failed',
        errors: remapContactErrors(data.errors),
      };

      if (data.error) {
        failureResponse.serverError = data.error;
      }

      return NextResponse.json(failureResponse, { status: response.status });
    }

    const registeredUserId = extractRegisteredUserId(data);
    let commentSaved = true;
    let warning: string | undefined;

    if (registeredUserId === null) {
      commentSaved = false;
      warning =
        'Contact user was created, but no user id was returned for saving the comment.';
      console.error('Contact comment skipped: missing user id in response', data);
    } else {
      try {
        await createContactComment(
          registeredUserId,
          parsedBody.data.subject,
          parsedBody.data.message
        );
      } catch (commentError) {
        commentSaved = false;
        warning =
          'Contact user was created, but the subject and message could not be saved as a comment.';
        console.error('Contact comment creation failed:', commentError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data,
        commentSaved,
        ...(warning ? { warning } : {}),
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
