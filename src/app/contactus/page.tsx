'use client';

import { Suspense, startTransition, useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { countries } from '@/lib/countries';
import {
  phoneCountryCodeByCode,
  phoneCountryCodes,
} from '@/lib/phone-country-codes';
import TurnstileWidget from '@/components/turnstile-widget';
import {
  getFormDirection,
  normalizeFormLanguage,
  type FormLanguage,
} from '@/lib/form-language';
import contactUsTranslations from '@/locales/forms/contactus.json';

const TURNSTILE_SITE_KEY = '0x4AAAAAAA0Zk0rGqldjkug7';

type ContactUsCopy = (typeof contactUsTranslations)['en'];

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

function createContactSchema(copy: ContactUsCopy) {
  return z.object({
    name: z.string().trim().min(1, copy.messages.nameRequired),
    email: z.string().trim().email(copy.messages.emailInvalid),
    country: z.string().trim().length(2, copy.messages.countryRequired),
    phoneCountryCode: z.string().trim().min(1, copy.messages.phoneCodeRequired),
    phone: z.string().trim().min(1, copy.messages.phoneRequired),
    subject: z.string().trim().min(1, copy.messages.subjectRequired),
    message: z.string().trim().min(1, copy.messages.messageRequired),
    turnstileToken: z.string().trim().optional(),
  });
}

type ContactFormData = z.infer<ReturnType<typeof createContactSchema>>;

function ContactUsPageContent({ language }: { language: FormLanguage }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const direction = getFormDirection(language);
  const copy = contactUsTranslations[language];
  const contactSchema = createContactSchema(copy);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      country: '',
      phoneCountryCode: '',
      phone: '',
      subject: '',
      message: '',
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

  const selectedPhoneCountryCode = useWatch({
    control: form.control,
    name: 'phoneCountryCode',
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

  useEffect(() => {
    if (!selectedCountry) {
      return;
    }

    const matchingDialCode = phoneCountryCodeByCode.get(selectedCountry);

    if (!matchingDialCode) {
      return;
    }

    form.setValue('phoneCountryCode', matchingDialCode.dialCode, {
      shouldValidate: true,
    });
    form.clearErrors('phoneCountryCode');
  }, [form, selectedCountry]);

  const getApiFieldErrors = (fieldName: keyof ContactFormData): string[] => {
    const field = apiError?.errors?.children?.[fieldName];

    if (!field) {
      return [];
    }

    if (Array.isArray(field)) {
      return field.filter((value): value is string => typeof value === 'string');
    }

    return field.errors || [];
  };

  const hasApiFieldErrors =
    getApiFieldErrors('name').length > 0 ||
    getApiFieldErrors('email').length > 0 ||
    getApiFieldErrors('country').length > 0 ||
    getApiFieldErrors('phoneCountryCode').length > 0 ||
    getApiFieldErrors('phone').length > 0 ||
    getApiFieldErrors('subject').length > 0 ||
    getApiFieldErrors('message').length > 0 ||
    getApiFieldErrors('turnstileToken').length > 0;

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch('/api/contactus', {
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

      router.push('/contactus/success');
    } catch {
      setApiError({
        message: copy.messages.unexpectedError,
      });
      setCaptchaResetSignal((value) => value + 1);
      setIsSubmitting(false);
    }
  };

  const renderFieldErrors = (fieldName: keyof ContactFormData) => (
    <>
      {form.formState.errors[fieldName]?.message && (
        <p className="mt-1 text-sm text-red-600">
          {String(form.formState.errors[fieldName]?.message)}
        </p>
      )}
      {getApiFieldErrors(fieldName).map((error, index) => (
        <p key={index} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ))}
    </>
  );

  return (
    <div
      dir={direction}
      lang={language}
      className="mx-auto w-full max-w-2xl p-6"
    >
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          {copy.heading}
        </h1>
        <p className="mt-3 text-base text-gray-600 sm:text-lg">
          {copy.subheading}
        </p>
      </div>

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
                htmlFor="name"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600"
              >
                {copy.labels.name}
              </label>
              <input
                id="name"
                {...form.register('name')}
                type="text"
                placeholder={copy.placeholders.name}
                className={`w-full rounded-md border bg-white px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-1 ${
                  form.formState.errors.name || getApiFieldErrors('name').length > 0
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                }`}
              />
              {renderFieldErrors('name')}
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
              {renderFieldErrors('email')}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                className={`h-[45px] w-full rounded-md border bg-white px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-1 ${
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
              {renderFieldErrors('country')}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600"
              >
                {copy.labels.phone}
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <select
                  aria-label={copy.labels.phoneCode}
                  {...form.register('phoneCountryCode')}
                  className={`w-full rounded-md border bg-white px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-1 sm:col-span-1 ${
                    form.formState.errors.phoneCountryCode ||
                    getApiFieldErrors('phoneCountryCode').length > 0
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                  } ${selectedPhoneCountryCode ? 'text-gray-900' : 'text-gray-500'}`}
                >
                  <option value="">{copy.placeholders.phoneCode}</option>
                  {phoneCountryCodes.map((country) => (
                    <option key={`${country.code}-${country.dialCode}`} value={country.dialCode}>
                      {country.name} ({country.code}) {country.dialCode}
                    </option>
                  ))}
                </select>

                <input
                  id="phone"
                  {...form.register('phone')}
                  dir="ltr"
                  type="tel"
                  placeholder={copy.placeholders.phone}
                  className={`w-full rounded-md border bg-white px-4 py-2.5 text-left text-sm transition-all duration-200 focus:outline-none focus:ring-1 sm:col-span-2 ${
                    form.formState.errors.phone || getApiFieldErrors('phone').length > 0
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                  }`}
                />
              </div>
              {renderFieldErrors('phoneCountryCode')}
              {renderFieldErrors('phone')}
            </div>
          </div>

          <div>
            <label
              htmlFor="subject"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600"
            >
              {copy.labels.subject}
            </label>
            <input
              id="subject"
              {...form.register('subject')}
              type="text"
              placeholder={copy.placeholders.subject}
              className={`w-full rounded-md border bg-white px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-1 ${
                form.formState.errors.subject || getApiFieldErrors('subject').length > 0
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
              }`}
            />
            {renderFieldErrors('subject')}
          </div>

          <div>
            <label
              htmlFor="message"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600"
            >
              {copy.labels.message}
            </label>
            <textarea
              id="message"
              {...form.register('message')}
              rows={6}
              placeholder={copy.placeholders.message}
              className={`w-full rounded-md border bg-white px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-1 ${
                form.formState.errors.message || getApiFieldErrors('message').length > 0
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
              }`}
            />
            {renderFieldErrors('message')}
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
            {renderFieldErrors('turnstileToken')}
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

function ContactUsPageWithSearchParams() {
  const searchParams = useSearchParams();
  const language = normalizeFormLanguage(searchParams.get('lang'));

  return <ContactUsPageContent key={language} language={language} />;
}

export default function ContactUsPage() {
  return (
    <Suspense fallback={<ContactUsPageContent language="en" />}>
      <ContactUsPageWithSearchParams />
    </Suspense>
  );
}
