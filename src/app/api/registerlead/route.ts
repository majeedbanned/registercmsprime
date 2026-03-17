import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://mycms.cmsprime.com/rest/users/new?version=1.0.0';
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';
const API_TOKEN =
  process.env.API_TOKEN ||
  '805e6648071ff54087a78d1f5e0a5508a3ed4fd92f692c704b4e3120991fcf3df3d2eab8d57ffb782d6e4d4fba12648fb04cc76c807ff684c96e5d24';
const TURNSTILE_SECRET_KEY = '0x4AAAAAAA0Zk-LXoYb97vNrED5jRLCUgu4';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = 'noreply@cmsprime.com';
const SENDGRID_FROM_NAME = 'CMS Prime';
const EBOOK_URL = 'https://cmsprime.com/cms/doc/101forextradingebook.pdf';
const EBOOK_SUBJECT = 'Your 101 Forex Trading Guide Is Ready';

const leadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email address'),
  country: z.string().trim().length(2, 'Country is required'),
  marketingConsent: z.boolean().optional(),
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

function getLeadGuideEmailText() {
  return [
    'Hi,',
    '',
    'Thank you for your request.',
    '',
    'Your copy of the 101 Forex Trading Guide is now ready. This guide is designed to help you build a solid understanding of the forex market - from essential concepts to practical trading knowledge you can apply with confidence.',
    '',
    'You can download and start using your eBook immediately by clicking the button below:',
    '',
    'Download Your eBook',
    'If the button does not work, use this link:',
    EBOOK_URL,
    '',
    'We hope this guide provides valuable insights and supports you on your trading journey. If you need any assistance, our team is always here to help.',
    '',
    'Best regards,',
    'CMS Prime',
  ].join('\n');
}

function getLeadGuideEmailHtml() {
  const contentHtml = `
    <table width="100%" style="margin-top: 150px; margin-bottom: 25px;">
      <tbody>
        <tr>
          <td>
            <p style="font-size: 18px; font-weight: bold;">
              Hi,
            </p>

            <p style="font-size: 16px; line-height: 1.5;">
              Thank you for your request.
            </p>

            <p style="font-size: 16px; line-height: 1.5;">
              Your copy of the 101 Forex Trading Guide is now ready. This guide is designed to help you build a solid understanding of the forex market - from essential concepts to practical trading knowledge you can apply with confidence.
            </p>

            <p style="font-size: 16px; line-height: 1.5;">
              You can download and start using your eBook immediately by clicking the button below:
            </p>

            <table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0 25px 0;">
              <tbody>
                <tr>
                  <td>
                    <a href="${EBOOK_URL}" class="app-button" target="_blank">
                      Download Your eBook
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>

            <p style="font-size: 16px; line-height: 1.5;">
              If the button does not work, use this link:
            </p>

            <p style="font-size: 16px; line-height: 1.5; word-break: break-word;">
              <a href="${EBOOK_URL}" target="_blank" style="color: #964d2d; text-decoration: underline;">
                ${EBOOK_URL}
              </a>
            </p>

            <p style="font-size: 16px; line-height: 1.5;">
              We hope this guide provides valuable insights and supports you on your trading journey. If you need any assistance, our team is always here to help.
            </p>

            <p style="font-size: 16px; line-height: 1.5; margin-top: 20px;">
              Best regards,<br>
              CMS Prime
            </p>
          </td>
        </tr>
      </tbody>
    </table>

    <table style="margin-bottom: 30px;" width="100%">
      <tbody>
        <tr>
          <td>
            <hr class="gradient">
            <p style="font-size: 14px; color: #333;">
              If you have any questions or need further assistance, please
              feel free to contact our support team through your Client Portal,
              Live Chat, or speak with your Account Manager.
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  `.trim();

  return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CMS Prime - Account Setup Complete</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
      }
      .container {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
      }
      .content {
        padding: 50px 50px 40px 50px;
      }
      .app-buttons {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
      }
      .app-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: auto;
        min-width: 180px;
        padding: 12px 24px;
        border-radius: 25px;
        border: 2px solid transparent;
        background-image: linear-gradient(#ffffff, #ffffff),
          linear-gradient(140deg, #964d2d, #fb9865, #964d2d);
        background-origin: border-box;
        background-clip: padding-box, border-box;
        text-decoration: none;
        color: #000000;
        font-size: 15px;
        font-weight: bold;
      }
      .app-button img {
        margin-right: 10px;
      }
      h3,
      h4,
      p {
        margin: 0 0 10px 0;
      }
      hr.gradient {
        border: none;
        height: 4px;
        background: linear-gradient(140deg, #964d2d, #fb9865, #964d2d);
        margin: 20px 0;
      }
      .support-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: #cc6d02;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
      }
      @media screen and (max-width: 600px) {
        .content {
          padding: 20px 15px !important;
        }
        .app-buttons {
          flex-wrap: wrap !important;
          justify-content: space-between !important;
        }
        .app-button {
          width: 100% !important;
          justify-content: center;
          margin-bottom: 10px;
          box-sizing: border-box;
        }
      }
    </style>

    <div style="margin:0; padding:0; font-family: Arial, sans-serif;">
      <table style="width:100%; max-width:800px; margin:0 auto;" class="container" cellpadding="0" cellspacing="0" border="0">
        <tbody><tr>
          <td style="background-image:url('https://mycms.cmsprime.com/uploads/public/massmail/2025/07/20/afa2a18a5a3ad97ab6a65807e1c93e35.png'); background-size:contain; background-repeat:no-repeat; background-position:top;padding-top: 0px;">
            <div style="padding:35px 30px 40px 30px;" class="content">
              ${contentHtml}

              <h3 style="font-size:18px; margin:0 0 10px 0;">Get Started:</h3>

              <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:30px;" class="app-buttons">
                <a href="https://apps.apple.com/ae/app/my-cms-hub/id6736906740" style="text-decoration:none ;color:black">
                  <div style="margin-right:10px;display:flex; align-items:center; width:135px; padding:10px; border-radius:25px; border:2px solid transparent; background-image:linear-gradient(#ffffff,#ffffff),linear-gradient(140deg,#964d2d,#fb9865,#964d2d); background-origin:border-box; background-clip:padding-box, border-box;" class="app-button">
                    <img style="margin-right:10px;" height="24" width="24" src="https://mycms.cmsprime.com/uploads/public/massmail/2025/06/22/d87532f1be64fec0556e125f5e1d0be3.png">
                    <div>
                      <div style="font-size:10px;">Download on the</div>
                      <div style="font-size:12px; font-weight:bold;">App Store</div>
                    </div>
                  </div>
                </a>

                <a href="https://play.google.com/store/apps/details?id=com.cmsprime.mobile" style="text-decoration:none ;color:black">
                  <div style="margin-right:10px;display:flex; align-items:center; width:135px; padding:10px; border-radius:25px; border:2px solid transparent; background-image:linear-gradient(#ffffff,#ffffff),linear-gradient(140deg,#964d2d,#fb9865,#964d2d); background-origin:border-box; background-clip:padding-box, border-box;" class="app-button">
                    <img style="margin-right:10px;" height="24" width="24" src="https://mycms.cmsprime.com/uploads/public/massmail/2025/06/22/1d41ffef96edcaff12ff4e360a74cbfd.png">
                    <div>
                      <div style="font-size:10px;">Get it on</div>
                      <div style="font-size:12px; font-weight:bold;">Google Play</div>
                    </div>
                  </div>
                </a>

                <a href="https://download.mql5.com/cdn/web/cms.prime.ltd/mt4/cmsprime4setup.exe" style="text-decoration:none ;color:black">
                  <div style="margin-right:10px;display:flex; align-items:center; width:135px; padding:10px; border-radius:25px; border:2px solid transparent; background-image:linear-gradient(#ffffff,#ffffff),linear-gradient(140deg,#964d2d,#fb9865,#964d2d); background-origin:border-box; background-clip:padding-box, border-box;" class="app-button">
                    <img style="margin-right:10px;" height="24" width="24" src="https://mycms.cmsprime.com/uploads/public/massmail/2025/06/22/0aed4bfc5480e94894f1c5b88d68803f.png">
                    <div>
                      <div style="font-size:10px;">Download for</div>
                      <div style="font-size:12px; font-weight:bold;">Windows</div>
                    </div>
                  </div>
                </a>

                <a href="https://webtrader.cmsprime.com/web/login" style="text-decoration:none ;color:black">
                  <div style="margin-right:10px;display:flex; align-items:center; width:135px; padding:10px; border-radius:25px; border:2px solid transparent; background-image:linear-gradient(#ffffff,#ffffff),linear-gradient(140deg,#964d2d,#fb9865,#964d2d); background-origin:border-box; background-clip:padding-box, border-box;" class="app-button">
                    <img style="margin-right:10px;" height="24" width="24" src="https://mycms.cmsprime.com/uploads/public/massmail/2025/06/22/67f4cac6e57654642a4cff06abbfefe7.png">
                    <div>
                      <div style="font-size:10px;">Access via</div>
                      <div style="font-size:12px; font-weight:bold;">Web Trader</div>
                    </div>
                  </div>
                </a>
              </div>

              <h3 style="display:none;font-size:18px; margin:0 0 10px 0;"><b>Trading Terms &amp; Conditions:</b></h3>
              <p style="display:none;font-size:14px; font-style:italic; margin:0 0 10px 0;">Please review the key trading policies associated with your account:</p><p style="font-size:14px; font-style:italic; margin:0 0 10px 0;"><br></p>

              <h4 style="font-size:16px; margin:0 0 10px 0;"><br></h4>

              <h3 style="font-size:18px; margin:0 0 10px 0;"><b><a href="https://cmsprime.com/terms-conditions/">View Full Trading Terms &amp; Conditions</a></b></h3>
              <p style="font-size:14px; margin:0 0 10px 0;">We wish you a successful trading journey.</p>
              <p style="font-size:14px; margin:0 0 10px 0;">If you need assistance, our team is here:</p>

              <div style="display:flex; flex-wrap:nowrap; gap:15px;" class="support-container">
                <div style="display:flex; align-items:center;" class="support-item">
                  <div style="width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-right:10px;">
                    <img height="36" width="42" src="https://mycms.cmsprime.com/uploads/public/massmail/2025/06/23/5e4fd8ed55de7701b8efb9bb49dc55dc.png">
                  </div>
                  <a style="font-size:14px; text-decoration:underline; color:#000;" href="mailto:support@cmsprime.com">support@cmsprime.com</a>
                </div>

                <div style="display:flex; align-items:center;" class="support-item">
                  <div style="width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-right:10px;">
                    <img height="36" width="42" src="https://mycms.cmsprime.com/uploads/public/massmail/2025/06/23/65f418226f09e64d0faf0523615796e8.png">
                  </div>
                  <a style="font-size:14px; text-decoration:underline; color:#000;" href="tel:+97144516328">+971&nbsp;4&nbsp;451&nbsp;6328</a>
                </div>

                <div style="display:flex; align-items:center;">
                  <div style="width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-right:10px;">
                    <img src="https://mycms.cmsprime.com/uploads/public/massmail/2025/06/23/4cc72ee8db38ced556344d7b9f9f8f09.png" width="42" height="36">
                  </div>
                  <a href="tel:+971524508516" style="font-size:14px; text-decoration:underline; color:#000;">+971&nbsp;52&nbsp;450&nbsp;8516</a>
                </div>
              </div>

              <p style="margin-top:30px; font-size:16px; font-weight:bold; margin:30px 0 10px 0;">Best regards,</p>
              <img style="width:25%;" src="https://mycms.cmsprime.com/uploads/public/massmail/2025/06/22/f29db7acad5603da0d8a14cad98909c0.png">

              <hr style="margin:30px 0; border-top:1px solid #e0e0e0;">
              <p style="font-size:10px; color:#666; margin:0 0 10px 0;"><b>Copyright © 2026 CMS Prime. All rights reserved.</b></p>

              <p style="font-size:9px; color:#999; margin:0 0 10px 0;">
                Trading in financial instruments such as forex, CFDs, and derivatives involves significant risk and may not be suitable for all investors. Past performance is not indicative of future results. Please ensure you fully understand the risks involved and seek independent advice if necessary.
                <br>
                All information on this website (<a href="www.cmsprime.com">www.cmsprime.com</a>) is provided for general informational and marketing purposes only and does not constitute investment advice or a solicitation to trade. CMS Prime, its owners, partners, employees, consultants, affiliates, and group companies expressly disclaim any liability for any loss or damage arising directly or indirectly fr om the use of or reliance on such information.
                <br>
                This website (<a href="www.cmsprime.com">www.cmsprime.com</a>) is dedicated to CMS Prime affiliates. These companies are: CMS PRIME INC, DUBAI REP OFFICE, CMS PRIME Ltd, CMS PRIME SLC INC.
                <br>
                These companies use this website for marketing and promotional purposes only. It acts as a marketing platform for these companies and does not provide any other services. Access to this website is not considered a registration, subscription, or request for services fr om these companies. The customer is bound by the agreement concluded with the specific company chosen upon registration, and its regulations and laws apply to them without responsibility for other companies.
                <br>
                Information on this site is not directed at residents in any country or jurisdiction wh ere such distribution or use would be contrary to local law or regulation. CMS Prime does not provide services to residents of any country or jurisdiction wh ere it is prohibited by local laws or regulations. Please ensure you comply with all local laws and regulations in your jurisdiction before accessing CMS Prime's services.
              </p>
            </div>
          </td>
        </tr></tbody>
      </table>
    </div>
  `.trim();
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

async function sendLeadGuideEmail(recipientEmail: string) {
  if (!SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY is not configured');
  }

  const response = await fetch(SENDGRID_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: recipientEmail }],
          subject: EBOOK_SUBJECT,
        },
      ],
      from: {
        email: SENDGRID_FROM_EMAIL,
        name: SENDGRID_FROM_NAME,
      },
      content: [
        {
          type: 'text/plain',
          value: getLeadGuideEmailText(),
        },
        {
          type: 'text/html',
          value: getLeadGuideEmailHtml(),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `SendGrid request failed with status ${response.status}: ${errorBody}`
    );
  }
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

    if (!SENDGRID_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          code: 500,
          message: 'Email delivery is not configured.',
          errors: {},
        },
        { status: 500 }
      );
    }

    const payload = {
      firstName: parsedBody.data.name,
      email: parsedBody.data.email,
      lead: true,
      country: parsedBody.data.country.toUpperCase(),
      tags: ['Learning Ebook Downloader'],
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

    let emailSent = true;
    let warning: string | undefined;

    try {
      await sendLeadGuideEmail(parsedBody.data.email);
    } catch (emailError) {
      emailSent = false;
      warning =
        'Lead was registered, but the ebook email could not be delivered.';
      console.error('Lead ebook email failed:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        data,
        emailSent,
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
