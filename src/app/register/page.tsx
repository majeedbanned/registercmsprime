'use client';

import { Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { countries } from '@/lib/countries';
import {
  getFormDirection,
  normalizeFormLanguage,
  type FormLanguage,
} from '@/lib/form-language';
import registerTranslations from '@/locales/forms/register.json';

type RegisterCopy = (typeof registerTranslations)['en'];

interface CountryDropdownProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  placeholder: string;
  searchPlaceholder: string;
  noResultsText: string;
  label: string;
  fieldName: string;
  direction: 'ltr' | 'rtl';
  formErrors?: {
    message?: string;
  };
  apiErrors?: string[];
}

function CountryDropdown({
  value,
  onChange,
  error,
  placeholder,
  searchPlaceholder,
  noResultsText,
  label,
  fieldName,
  direction,
  formErrors,
  apiErrors = [],
}: CountryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = countries.find((country) => country.code === value);

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      dir={direction}
      className="relative"
      data-field-name={fieldName}
    >
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className={`w-full rounded-md border bg-white px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-1 ${
            direction === 'rtl' ? 'pl-10 text-right' : 'pr-10 text-left'
          } ${
            error || apiErrors.length > 0
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
          }`}
        >
          <span className={selectedCountry ? 'text-gray-900' : 'text-gray-500'}>
            {selectedCountry
              ? `${selectedCountry.code} - ${selectedCountry.name}`
              : placeholder}
          </span>
        </button>
        <svg
          className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-transform ${
            direction === 'rtl' ? 'left-3' : 'right-3'
          } ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-100 p-2">
            <input
              type="text"
              dir={direction}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className={`w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs transition-all duration-200 focus:border-[#ce7a55] focus:outline-none focus:ring-1 focus:ring-[#ce7a55] ${
                direction === 'rtl' ? 'text-right' : 'text-left'
              }`}
              onClick={(event) => event.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onChange(country.code);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full px-4 py-2.5 text-xs transition-colors duration-150 ${
                    direction === 'rtl' ? 'text-right' : 'text-left'
                  } ${value === country.code ? 'font-medium' : ''}`}
                  style={
                    value === country.code
                      ? { backgroundColor: '#f5e8e0', color: '#ce7a55' }
                      : { color: '#374151' }
                  }
                  onMouseEnter={(event) => {
                    if (value !== country.code) {
                      event.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(event) => {
                    if (value !== country.code) {
                      event.currentTarget.style.backgroundColor = '';
                    }
                  }}
                >
                  <span className="font-medium">{country.code}</span> - {country.name}
                </button>
              ))
            ) : (
              <div
                className={`px-4 py-2 text-xs text-gray-400 ${
                  direction === 'rtl' ? 'text-right' : 'text-left'
                }`}
              >
                {noResultsText}
              </div>
            )}
          </div>
        </div>
      )}

      {(formErrors || apiErrors.length > 0) && (
        <div className="mt-1">
          {formErrors && <p className="text-sm text-red-600">{formErrors.message}</p>}
          {apiErrors.map((errorMessage, index) => (
            <p key={index} className="text-sm text-red-600">
              {errorMessage}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function createStep1Schema(copy: RegisterCopy) {
  return z.object({
    firstName: z.string().min(1, copy.validation.firstNameRequired),
    lastName: z.string().min(1, copy.validation.lastNameRequired),
    email: z.string().email(copy.validation.emailInvalid),
    phone: z.string().min(1, copy.validation.phoneRequired),
  });
}

function createStep2Schema(copy: RegisterCopy) {
  return z
    .object({
      password: z.string().min(6, copy.validation.passwordMin),
      confirmPassword: z.string().min(1, copy.validation.confirmPasswordRequired),
      nationality: z.string().length(2, copy.validation.nationalityRequired),
      country: z.string().length(2, copy.validation.countryRequired),
      tin: z.enum(['1', '2'], {
        message: copy.validation.platformRequired,
      }),
      lead: z.boolean(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: copy.validation.passwordsMismatch,
      path: ['confirmPassword'],
    });
}

type Step1FormData = z.infer<ReturnType<typeof createStep1Schema>>;
type Step2FormData = z.infer<ReturnType<typeof createStep2Schema>>;

interface ApiError {
  code?: number;
  message?: string;
  errors?: {
    children?: {
      [key: string]: {
        errors?: string[];
      } | string[];
    };
  };
}

function RegisterPageContent({ language }: { language: FormLanguage }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState<ApiError | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const direction = getFormDirection(language);
  const copy = registerTranslations[language];
  const step1Schema = createStep1Schema(copy);
  const step2Schema = createStep2Schema(copy);

  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
  });

  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
    defaultValues: {
      lead: true,
      tin: undefined,
      confirmPassword: '',
    },
  });

  const nationalityValue = useWatch({
    control: step2Form.control,
    name: 'nationality',
  });

  const countryValue = useWatch({
    control: step2Form.control,
    name: 'country',
  });

  const tinValue = useWatch({
    control: step2Form.control,
    name: 'tin',
  });

  const onStep1Submit = () => {
    setApiErrors(null);
    setStep(2);
  };

  const onStep2Submit = async (data: Step2FormData) => {
    setIsSubmitting(true);
    setApiErrors(null);

    try {
      const step1Data = step1Form.getValues();
      const payload = {
        firstName: step1Data.firstName,
        lastName: step1Data.lastName,
        email: step1Data.email,
        phone: step1Data.phone,
        password: data.password,
        nationality: data.nationality.toUpperCase(),
        country: data.country.toUpperCase(),
        tin: data.tin,
        lead: true,
      };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as ApiError & { success?: boolean };

      if (!result.success) {
        setApiErrors(result);
        setShowErrorPopup(true);
        setIsSubmitting(false);
        return;
      }

      router.push('/register/success');
    } catch {
      setApiErrors({
        message: copy.messages.unexpectedError,
      });
      setShowErrorPopup(true);
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string): string[] => {
    if (!apiErrors?.errors?.children) {
      return [];
    }

    const field = apiErrors.errors.children[fieldName];

    if (!field) {
      return [];
    }

    if (Array.isArray(field)) {
      return field.filter((error): error is string => typeof error === 'string');
    }

    if (typeof field === 'object' && 'errors' in field) {
      return field.errors || [];
    }

    return [];
  };

  const formatFieldName = (fieldName: string): string => {
    const fieldMap = copy.fieldNames as Record<string, string>;

    return (
      fieldMap[fieldName] ||
      fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase()).trim()
    );
  };

  const getAllFieldErrors = (): Array<{
    field: string;
    displayName: string;
    errors: string[];
  }> => {
    if (!apiErrors?.errors?.children) {
      return [];
    }

    const fieldErrors: Array<{
      field: string;
      displayName: string;
      errors: string[];
    }> = [];

    Object.entries(apiErrors.errors.children).forEach(([fieldName, field]) => {
      let errors: string[] = [];

      if (Array.isArray(field)) {
        errors = field.filter((error): error is string => typeof error === 'string');
      } else if (typeof field === 'object' && 'errors' in field) {
        errors = field.errors || [];
      }

      if (errors.length > 0) {
        fieldErrors.push({
          field: fieldName,
          displayName: formatFieldName(fieldName),
          errors,
        });
      }
    });

    return fieldErrors;
  };

  const getUserFriendlyErrors = (): string[] => {
    const allErrors = getAllFieldErrors();
    const errorMessages: string[] = [];

    allErrors.forEach(({ displayName, errors }) => {
      errors.forEach((error) => {
        const cleanError = error
          .replace(/This value should not be blank\.?/gi, copy.messages.fieldRequired)
          .replace(/This value is not valid\.?/gi, copy.messages.invalidValue)
          .replace(
            /You are not allowed to create user with country: ".*"/gi,
            copy.messages.countryNotAllowed
          )
          .replace(/This value should not be null\.?/gi, copy.messages.fieldRequired)
          .replace(/Validation Failed/gi, '')
          .trim();

        if (cleanError) {
          errorMessages.push(`${displayName}: ${cleanError}`);
        }
      });
    });

    if (errorMessages.length === 0 && apiErrors?.message) {
      const cleanMessage = apiErrors.message.replace(/Validation Failed/gi, '').trim();

      if (cleanMessage) {
        errorMessages.push(cleanMessage);
      }
    }

    return errorMessages.length > 0 ? errorMessages : [copy.messages.formCheck];
  };

  const closeButtonSide = direction === 'rtl' ? 'left-4' : 'right-4';
  const popupIconSpacing = direction === 'rtl' ? 'ml-2' : 'mr-2';
  const backArrow = direction === 'rtl' ? '→' : '←';
  const platformCheckSide = direction === 'rtl' ? 'left-1.5' : 'right-1.5';

  return (
    <div dir={direction} lang={language} className="mx-auto w-full max-w-2xl p-6">
      <div className="mb-7">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
                step >= 1 ? 'scale-110 text-white' : 'bg-gray-100 text-gray-400'
              }`}
              style={step >= 1 ? { backgroundColor: '#ce7a55' } : {}}
            >
              1
            </div>
            {step >= 1 && (
              <span
                className="text-sm font-medium text-gray-700 transition-opacity duration-300"
                style={{ color: '#ce7a55' }}
              >
                {copy.steps.personalInfo}
              </span>
            )}
          </div>
          <div className="relative h-px w-12 overflow-hidden bg-gray-200">
            <div
              className="absolute left-0 top-0 h-full transition-all duration-500 ease-out"
              style={
                step >= 2
                  ? { backgroundColor: '#ce7a55', width: '100%' }
                  : { backgroundColor: '#e5e7eb', width: '0%' }
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
                step >= 2 ? 'scale-110 text-white' : 'bg-gray-100 text-gray-400'
              }`}
              style={step >= 2 ? { backgroundColor: '#ce7a55' } : {}}
            >
              2
            </div>
            {step >= 2 && (
              <span
                className="text-sm font-medium text-gray-700 transition-opacity duration-300"
                style={{ color: '#ce7a55' }}
              >
                {copy.steps.additionalDetails}
              </span>
            )}
          </div>
        </div>
      </div>

      {showErrorPopup && apiErrors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-lg bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowErrorPopup(false)}
              className={`absolute top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 ${closeButtonSide}`}
              aria-label={copy.buttons.close}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="flex flex-col items-center px-6 pb-4 pt-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h3 className="mb-1 text-lg font-semibold text-gray-900">
                {copy.messages.registrationFailed}
              </h3>
              <p className="mb-4 text-center text-xs text-gray-500">
                {copy.messages.correctErrors}
              </p>
            </div>

            <div className="max-h-80 overflow-y-auto px-6 pb-4">
              <div className="space-y-2">
                {getUserFriendlyErrors().map((error, index) => (
                  <div
                    key={index}
                    className="flex items-start rounded-md border-l-2 border-red-400 bg-red-50/50 p-2.5"
                  >
                    <svg
                      className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-500 ${popupIconSpacing}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-xs leading-relaxed text-red-700">{error}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setShowErrorPopup(false)}
                className="w-full rounded-md px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={
                  {
                    backgroundColor: '#ce7a55',
                    '--tw-ring-color': '#ce7a55',
                  } as CSSProperties
                }
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor = '#b86945';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor = '#ce7a55';
                }}
              >
                {copy.buttons.gotIt}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden">
        <div
          dir="ltr"
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
        >
          <div className="w-full flex-shrink-0" dir={direction}>
            <form
              onSubmit={step1Form.handleSubmit(onStep1Submit)}
              className="flex min-h-[400px] flex-col space-y-5"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600">
                    {copy.labels.firstName}
                  </label>
                  <input
                    {...step1Form.register('firstName')}
                    type="text"
                    className={`w-full rounded-md border bg-white px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-1 ${
                      step1Form.formState.errors.firstName ||
                      getFieldError('firstName').length > 0
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                    }`}
                    placeholder={copy.placeholders.firstName}
                  />
                  {step1Form.formState.errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {step1Form.formState.errors.firstName.message}
                    </p>
                  )}
                  {getFieldError('firstName').map((error, index) => (
                    <p key={index} className="mt-1 text-sm text-red-600">
                      {error}
                    </p>
                  ))}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600">
                    {copy.labels.lastName}
                  </label>
                  <input
                    {...step1Form.register('lastName')}
                    type="text"
                    className={`w-full rounded-md border bg-white px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none focus:ring-1 ${
                      step1Form.formState.errors.lastName ||
                      getFieldError('lastName').length > 0
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                    }`}
                    placeholder={copy.placeholders.lastName}
                  />
                  {step1Form.formState.errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {step1Form.formState.errors.lastName.message}
                    </p>
                  )}
                  {getFieldError('lastName').map((error, index) => (
                    <p key={index} className="mt-1 text-sm text-red-600">
                      {error}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600">
                  {copy.labels.email}
                </label>
                <input
                  {...step1Form.register('email')}
                  dir="ltr"
                  type="email"
                  className={`w-full rounded-md border bg-white px-4 py-2.5 text-left text-sm transition-all duration-200 focus:outline-none focus:ring-1 ${
                    step1Form.formState.errors.email || getFieldError('email').length > 0
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                  }`}
                  placeholder={copy.placeholders.email}
                />
                {step1Form.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {step1Form.formState.errors.email.message}
                  </p>
                )}
                {getFieldError('email').map((error, index) => (
                  <p key={index} className="mt-1 text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600">
                  {copy.labels.phone}
                </label>
                <input
                  {...step1Form.register('phone')}
                  dir="ltr"
                  type="tel"
                  className={`w-full rounded-md border bg-white px-4 py-2.5 text-left text-sm transition-all duration-200 focus:outline-none focus:ring-1 ${
                    step1Form.formState.errors.phone || getFieldError('phone').length > 0
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                  }`}
                  placeholder={copy.placeholders.phone}
                />
                {step1Form.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {step1Form.formState.errors.phone.message}
                  </p>
                )}
                {getFieldError('phone').map((error, index) => (
                  <p key={index} className="mt-1 text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>

              <div className="mt-auto pt-4">
                <button
                  type="submit"
                  className="w-full rounded-md px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={
                    {
                      backgroundColor: '#ce7a55',
                      '--tw-ring-color': '#ce7a55',
                    } as CSSProperties
                  }
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor = '#b86945';
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = '#ce7a55';
                  }}
                >
                  {copy.buttons.continue}
                </button>
              </div>
            </form>
          </div>

          <div className="w-full flex-shrink-0" dir={direction}>
            <form
              onSubmit={step2Form.handleSubmit(onStep2Submit)}
              className="flex min-h-[400px] flex-col space-y-5"
            >
              <div className="mb-2 -mt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-2 text-xs font-medium text-gray-500 transition-colors duration-200 hover:text-gray-700"
                >
                  {`${backArrow} ${copy.buttons.back}`}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600">
                    {copy.labels.password}
                  </label>
                  <input
                    {...step2Form.register('password')}
                    dir="ltr"
                    type="password"
                    className={`w-full rounded-md border bg-white px-4 py-2.5 text-left text-sm transition-all duration-200 focus:outline-none focus:ring-1 ${
                      step2Form.formState.errors.password ||
                      getFieldError('password').length > 0
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                    }`}
                    placeholder={copy.placeholders.password}
                  />
                  {step2Form.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {step2Form.formState.errors.password.message}
                    </p>
                  )}
                  {getFieldError('password').map((error, index) => (
                    <p key={index} className="mt-1 text-sm text-red-600">
                      {error}
                    </p>
                  ))}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-600">
                    {copy.labels.confirmPassword}
                  </label>
                  <input
                    {...step2Form.register('confirmPassword')}
                    dir="ltr"
                    type="password"
                    className={`w-full rounded-md border bg-white px-4 py-2.5 text-left text-sm transition-all duration-200 focus:outline-none focus:ring-1 ${
                      step2Form.formState.errors.confirmPassword ||
                      getFieldError('confirmPassword').length > 0
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                    }`}
                    placeholder={copy.placeholders.confirmPassword}
                  />
                  {step2Form.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {step2Form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                  {getFieldError('confirmPassword').map((error, index) => (
                    <p key={index} className="mt-1 text-sm text-red-600">
                      {error}
                    </p>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <CountryDropdown
                  value={nationalityValue || ''}
                  onChange={(value) => {
                    step2Form.setValue('nationality', value, { shouldValidate: true });
                  }}
                  error={
                    !!step2Form.formState.errors.nationality ||
                    getFieldError('nationality').length > 0
                  }
                  placeholder={copy.placeholders.selectNationality}
                  searchPlaceholder={copy.placeholders.searchCountry}
                  noResultsText={copy.messages.noCountriesFound}
                  label={copy.labels.nationality}
                  fieldName="nationality"
                  direction={direction}
                  formErrors={step2Form.formState.errors.nationality}
                  apiErrors={getFieldError('nationality')}
                />

                <CountryDropdown
                  value={countryValue || ''}
                  onChange={(value) => {
                    step2Form.setValue('country', value, { shouldValidate: true });
                  }}
                  error={
                    !!step2Form.formState.errors.country ||
                    getFieldError('country').length > 0
                  }
                  placeholder={copy.placeholders.selectCountry}
                  searchPlaceholder={copy.placeholders.searchCountry}
                  noResultsText={copy.messages.noCountriesFound}
                  label={copy.labels.country}
                  fieldName="country"
                  direction={direction}
                  formErrors={step2Form.formState.errors.country}
                  apiErrors={getFieldError('country')}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-600">
                  {copy.labels.selectPlatform}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      step2Form.setValue('tin', '1', { shouldValidate: true });
                    }}
                    className={`relative rounded-md border p-3 transition-all duration-200 ${
                      tinValue === '1'
                        ? 'shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    style={
                      tinValue === '1'
                        ? {
                            borderColor: '#ce7a55',
                            backgroundColor: '#fef5f0',
                            borderWidth: '2px',
                          }
                        : {}
                    }
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          tinValue === '1'
                            ? 'text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                        style={tinValue === '1' ? { backgroundColor: '#ce7a55' } : {}}
                      >
                        <span className="text-xs font-bold">MT4</span>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          tinValue === '1' ? '' : 'text-gray-600'
                        }`}
                        style={tinValue === '1' ? { color: '#ce7a55' } : {}}
                      >
                        MT4
                      </span>
                    </div>
                    {tinValue === '1' && (
                      <div className={`absolute top-1.5 ${platformCheckSide}`}>
                        <svg
                          className="h-4 w-4"
                          style={{ color: '#ce7a55' }}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      step2Form.setValue('tin', '2', { shouldValidate: true });
                    }}
                    className={`relative rounded-md border p-3 transition-all duration-200 ${
                      tinValue === '2'
                        ? 'shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    style={
                      tinValue === '2'
                        ? {
                            borderColor: '#ce7a55',
                            backgroundColor: '#fef5f0',
                            borderWidth: '2px',
                          }
                        : {}
                    }
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          tinValue === '2'
                            ? 'text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                        style={tinValue === '2' ? { backgroundColor: '#ce7a55' } : {}}
                      >
                        <span className="text-xs font-bold">MT5</span>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          tinValue === '2' ? '' : 'text-gray-600'
                        }`}
                        style={tinValue === '2' ? { color: '#ce7a55' } : {}}
                      >
                        MT5
                      </span>
                    </div>
                    {tinValue === '2' && (
                      <div className={`absolute top-1.5 ${platformCheckSide}`}>
                        <svg
                          className="h-4 w-4"
                          style={{ color: '#ce7a55' }}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
                {step2Form.formState.errors.tin && (
                  <p className="mt-2 text-sm text-red-600">
                    {step2Form.formState.errors.tin.message}
                  </p>
                )}
                {getFieldError('tin').map((error, index) => (
                  <p key={index} className="mt-2 text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>

              <div className="mt-auto">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-md px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  style={
                    {
                      backgroundColor: isSubmitting ? '#a0a0a0' : '#ce7a55',
                      '--tw-ring-color': '#ce7a55',
                    } as CSSProperties
                  }
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
                  {isSubmitting
                    ? copy.buttons.registering
                    : copy.buttons.completeRegistration}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterPageWithSearchParams() {
  const searchParams = useSearchParams();
  const language = normalizeFormLanguage(searchParams.get('lang'));

  return <RegisterPageContent key={language} language={language} />;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterPageContent language="en" />}>
      <RegisterPageWithSearchParams />
    </Suspense>
  );
}
