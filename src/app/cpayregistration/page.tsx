'use client';

import { Suspense, startTransition, useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { countries } from '@/lib/countries';
import TurnstileWidget from '@/components/turnstile-widget';
import {
  getFormDirection,
  normalizeFormLanguage,
  type FormLanguage,
} from '@/lib/form-language';
import cpayRegistrationTranslations from '@/locales/forms/cpayregistration.json';

const TURNSTILE_SITE_KEY = '0x4AAAAAAA0Zk0rGqldjkug7';

type CpayRegistrationCopy = (typeof cpayRegistrationTranslations)['en'];

interface ApiError {
  message?: string;
  errors?: {
    children?: {
      [key: string]: {
        errors?: string[];
      } | string[];
    };
  };
}

function createCpayRegistrationSchema(copy: CpayRegistrationCopy) {
  return z.object({
    fullName: z.string().trim().min(1, copy.messages.fullNameRequired),
    phone: z.string().trim().min(1, copy.messages.phoneRequired),
    email: z.string().trim().email(copy.messages.emailInvalid),
    country: z.string().trim().length(2, copy.messages.countryRequired),
    turnstileToken: z.string().trim().optional(),
  });
}

type CpayRegistrationFormData = z.infer<
  ReturnType<typeof createCpayRegistrationSchema>
>;

function CpayRegistrationPageContent({
  language,
}: {
  language: FormLanguage;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const direction = getFormDirection(language);
  const copy = cpayRegistrationTranslations[language];
  const cpayRegistrationSchema = createCpayRegistrationSchema(copy);

  const form = useForm<CpayRegistrationFormData>({
    resolver: zodResolver(cpayRegistrationSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      country: '',
      turnstileToken: '',
    },
  });

  const selectedCountry = useWatch({
    control: form.control,
    name: 'country',
  });

  const turnstileToken = useWatch({
    control: form.control,
    name: 'turnstileToken',
  });

  useEffect(() => {
    const hostname = window.location.hostname;
    const runningOnLocalhost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1';

    startTransition(() => {
      setIsLocalhost(runningOnLocalhost);
    });

    if (runningOnLocalhost) {
      form.clearErrors('turnstileToken');
      form.setValue('turnstileToken', '', { shouldValidate: false });
    }
  }, [form]);

  const dedupeErrors = (errors: string[]) => [...new Set(errors)];

  const getApiFieldErrors = (
    fieldName: keyof CpayRegistrationFormData
  ): string[] => {
    const field = apiError?.errors?.children?.[fieldName];

    if (!field) {
      return [];
    }

    if (Array.isArray(field)) {
      return dedupeErrors(
        field.filter((value): value is string => typeof value === 'string')
      );
    }

    return dedupeErrors(field.errors || []);
  };

  const hasApiFieldErrors =
    getApiFieldErrors('fullName').length > 0 ||
    getApiFieldErrors('phone').length > 0 ||
    getApiFieldErrors('email').length > 0 ||
    getApiFieldErrors('country').length > 0 ||
    getApiFieldErrors('turnstileToken').length > 0;

  const onSubmit = async (data: CpayRegistrationFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch('/api/cpayregistration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as ApiError & { success?: boolean };

      if (!response.ok || !result.success) {
        setApiError(result);
        setCaptchaResetSignal((value) => value + 1);
        setIsSubmitting(false);
        return;
      }

      router.push('/cpayregistration/success');
    } catch {
      setApiError({
        message: copy.messages.unexpectedError,
      });
      setCaptchaResetSignal((value) => value + 1);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      dir={direction}
      lang={language}
      className="mx-auto w-full max-w-2xl p-6"
    >
      {apiError?.message && !hasApiFieldErrors && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError.message}
        </div>
      )}

      <div className="relative overflow-hidden">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex min-h-[400px] flex-col space-y-5"
        >
          <input type="hidden" {...form.register('turnstileToken')} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600"
              >
                {copy.labels.fullName}
              </label>
              <input
                id="fullName"
                {...form.register('fullName')}
                type="text"
                placeholder={copy.placeholders.fullName}
                className={`w-full rounded-md border bg-white px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-1 ${
                  form.formState.errors.fullName ||
                  getApiFieldErrors('fullName').length > 0
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                }`}
              />
              {form.formState.errors.fullName && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.fullName.message}
                </p>
              )}
              {getApiFieldErrors('fullName').map((error, index) => (
                <p key={index} className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600"
              >
                {copy.labels.email}
              </label>
              <input
                id="email"
                {...form.register('email')}
                dir="ltr"
                type="email"
                placeholder={copy.placeholders.email}
                className={`w-full rounded-md border bg-white px-4 py-2.5 text-left text-sm transition-all duration-200 focus:outline-none focus:ring-1 ${
                  form.formState.errors.email || getApiFieldErrors('email').length > 0
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                }`}
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.email.message}
                </p>
              )}
              {getApiFieldErrors('email').map((error, index) => (
                <p key={index} className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600"
              >
                {copy.labels.phone}
              </label>
              <input
                id="phone"
                {...form.register('phone')}
                dir="ltr"
                type="tel"
                placeholder={copy.placeholders.phone}
                className={`w-full rounded-md border bg-white px-4 py-2.5 text-left text-sm transition-all duration-200 focus:outline-none focus:ring-1 ${
                  form.formState.errors.phone || getApiFieldErrors('phone').length > 0
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                }`}
              />
              {form.formState.errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.phone.message}
                </p>
              )}
              {getApiFieldErrors('phone').map((error, index) => (
                <p key={index} className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>

            <div>
              <label
                htmlFor="country"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600"
              >
                {copy.labels.country}
              </label>
              <select
                id="country"
                {...form.register('country')}
                className={`w-full rounded-md border bg-white px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-1 ${
                  form.formState.errors.country || getApiFieldErrors('country').length > 0
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                } ${selectedCountry ? 'text-gray-900' : 'text-gray-500'}`}
              >
                <option value="">{copy.placeholders.country}</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code} - {country.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.country && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.country.message}
                </p>
              )}
              {getApiFieldErrors('country').map((error, index) => (
                <p key={index} className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-600">
              {copy.labels.securityCheck}
            </label>
            {isLocalhost ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {copy.messages.captchaDisabled}
              </div>
            ) : TURNSTILE_SITE_KEY ? (
              <div className="rounded-md border border-gray-200 bg-white p-3">
                <TurnstileWidget
                  siteKey={TURNSTILE_SITE_KEY}
                  resetSignal={captchaResetSignal}
                  messages={{
                    loadFailed: copy.messages.captchaLoadFailed,
                    expired: copy.messages.captchaExpired,
                    scriptFailed: copy.messages.captchaScriptFailed,
                  }}
                  onVerify={(token) => {
                    form.setValue('turnstileToken', token, { shouldValidate: true });
                    if (token) {
                      form.clearErrors('turnstileToken');
                    }
                  }}
                  onError={(message) => {
                    form.setValue('turnstileToken', '', { shouldValidate: true });
                    form.setError('turnstileToken', {
                      type: 'manual',
                      message,
                    });
                  }}
                />
              </div>
            ) : (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {copy.messages.captchaNotConfigured}
              </div>
            )}
            {form.formState.errors.turnstileToken && (
              <p className="text-sm text-red-600">
                {form.formState.errors.turnstileToken.message}
              </p>
            )}
            {getApiFieldErrors('turnstileToken').map((error, index) => (
              <p key={index} className="text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>

          <div className="mt-auto pt-4">
            <button
              type="submit"
              disabled={
                isSubmitting ||
                (!isLocalhost && (!TURNSTILE_SITE_KEY || !turnstileToken))
              }
              className="w-full rounded-md px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: isSubmitting ? '#a0a0a0' : '#ce7a55' }}
              onMouseEnter={(event) => {
                if (!event.currentTarget.disabled) {
                  event.currentTarget.style.backgroundColor = '#b86945';
                }
              }}
              onMouseLeave={(event) => {
                if (!event.currentTarget.disabled) {
                  event.currentTarget.style.backgroundColor = '#ce7a55';
                }
              }}
            >
              {isSubmitting ? copy.messages.submitting : copy.messages.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CpayRegistrationPageWithSearchParams() {
  const searchParams = useSearchParams();
  const language = normalizeFormLanguage(searchParams.get('lang'));

  return <CpayRegistrationPageContent key={language} language={language} />;
}

export default function CpayRegistrationPage() {
  return (
    <Suspense fallback={<CpayRegistrationPageContent language="en" />}>
      <CpayRegistrationPageWithSearchParams />
    </Suspense>
  );
}
