'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

// Countries data
const countries = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AX', name: 'Aland Islands' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AS', name: 'American Samoa' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AI', name: 'Anguilla' },
  { code: 'AQ', name: 'Antarctica' },
  { code: 'AG', name: 'Antigua Barbuda' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AW', name: 'Aruba' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BM', name: 'Bermuda' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BV', name: 'Bouvet Island' },
  { code: 'BR', name: 'Brazil' },
  { code: 'IO', name: 'British Indian Ocean Territory' },
  { code: 'VG', name: 'British Virgin Islands' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'BQ', name: 'Caribbean Netherlands' },
  { code: 'KY', name: 'Cayman Islands' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CX', name: 'Christmas Island' },
  { code: 'CC', name: 'Cocos Keeling Islands' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo Brazzaville' },
  { code: 'CD', name: 'Congo Kinshasa' },
  { code: 'CK', name: 'Cook Islands' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CI', name: 'Cote d Ivoire' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CW', name: 'Curacao' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FK', name: 'Falkland Islands' },
  { code: 'FO', name: 'Faroe Islands' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GF', name: 'French Guiana' },
  { code: 'PF', name: 'French Polynesia' },
  { code: 'TF', name: 'French Southern Territories' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GI', name: 'Gibraltar' },
  { code: 'GR', name: 'Greece' },
  { code: 'GL', name: 'Greenland' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GP', name: 'Guadeloupe' },
  { code: 'GU', name: 'Guam' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GG', name: 'Guernsey' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HM', name: 'Heard McDonald Islands' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HK', name: 'Hong Kong SAR China' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IM', name: 'Isle of Man' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JE', name: 'Jersey' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MO', name: 'Macao SAR China' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MQ', name: 'Martinique' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'YT', name: 'Mayotte' },
  { code: 'MX', name: 'Mexico' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MS', name: 'Montserrat' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar Burma' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NC', name: 'New Caledonia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NU', name: 'Niue' },
  { code: 'NF', name: 'Norfolk Island' },
  { code: 'KP', name: 'North Korea' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'MP', name: 'Northern Mariana Islands' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' },
  { code: 'PS', name: 'Palestinian Territories' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PN', name: 'Pitcairn Islands' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RE', name: 'Reunion' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'Sao Tome Principe' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SX', name: 'Sint Maarten' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'BL', name: 'St Barthelemy' },
  { code: 'SH', name: 'St Helena' },
  { code: 'KN', name: 'St Kitts Nevis' },
  { code: 'LC', name: 'St Lucia' },
  { code: 'MF', name: 'St Martin' },
  { code: 'PM', name: 'St Pierre Miquelon' },
  { code: 'VC', name: 'St Vincent Grenadines' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SJ', name: 'Svalbard Jan Mayen' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TK', name: 'Tokelau' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkiye' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TC', name: 'Turks Caicos Islands' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'UM', name: 'U S Outlying Islands' },
  { code: 'VI', name: 'U S Virgin Islands' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'WF', name: 'Wallis Futuna' },
  { code: 'EH', name: 'Western Sahara' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
];

// Searchable Country Dropdown Component
interface CountryDropdownProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  placeholder?: string;
  label: string;
  fieldName: string;
  formErrors?: any;
  apiErrors?: string[];
}

function CountryDropdown({
  value,
  onChange,
  error,
  placeholder = 'Select country',
  label,
  fieldName,
  formErrors,
  apiErrors = [],
}: CountryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = countries.find((c) => c.code === value);

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
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[19px] text-gray-600 mb-1.5 uppercase tracking-wide">{label.replace(' *', '')}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full rounded-md border px-4 py-2.5 text-[19px] text-left transition-all duration-200 focus:outline-none focus:ring-1 pr-10 ${
            error || apiErrors.length > 0
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
          }`}
        >
          <span className={selectedCountry ? 'text-gray-900' : 'text-gray-500'}>
            {selectedCountry ? `${selectedCountry.code} - ${selectedCountry.name}` : placeholder}
          </span>
        </button>
        <svg
          className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform pointer-events-none ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-xl max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-[19px] focus:outline-none focus:ring-1 focus:border-[#ce7a55] focus:ring-[#ce7a55] transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto max-h-48">
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
                  className={`w-full px-4 py-2.5 text-left text-[19px] transition-colors duration-150 ${
                    value === country.code ? '' : ''
                  }`}
                  style={value === country.code ? { backgroundColor: '#f5e8e0', color: '#ce7a55' } : { color: '#374151' }}
                  onMouseEnter={(e) => {
                    if (value !== country.code) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value !== country.code) {
                      e.currentTarget.style.backgroundColor = '';
                    }
                  }}
                >
                  <span>{country.code}</span> - {country.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-xs text-gray-400">No countries found</div>
            )}
          </div>
        </div>
      )}

      {(formErrors || apiErrors.length > 0) && (
        <div className="mt-1">
          {formErrors && (
            <p className="text-sm text-red-600">{formErrors.message}</p>
          )}
          {apiErrors.map((error, idx) => (
            <p key={idx} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// Step 1 Schema
const step1Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
});

// Step 2 Schema
const step2Schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    nationality: z.string().length(2, 'Nationality must be a 2-letter country code'),
    country: z.string().length(2, 'Country must be a 2-letter country code'),
    tin: z.enum(['1', '2']).refine((val) => val === '1' || val === '2', {
      message: 'Please select your platform',
    }),
    lead: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type Step1FormData = z.infer<typeof step1Schema>;
type Step2FormData = z.infer<typeof step2Schema>;

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

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState<ApiError | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

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

  const onStep1Submit = (data: Step1FormData) => {
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
        lead: true, // Always true, hidden from user
      };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        setApiErrors(result);
        setShowErrorPopup(true);
        setIsSubmitting(false);
        return;
      }

      // Redirect to success page
      router.push('/register/success');
    } catch (error) {
      setApiErrors({
        message: 'An unexpected error occurred. Please try again.',
      });
      setShowErrorPopup(true);
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string): string[] => {
    if (!apiErrors?.errors?.children) return [];

    const field = apiErrors.errors.children[fieldName];
    if (!field) return [];

    if (Array.isArray(field)) {
      return field.filter((e): e is string => typeof e === 'string');
    }

    if (typeof field === 'object' && 'errors' in field) {
      return field.errors || [];
    }

    return [];
  };

  const formatFieldName = (fieldName: string): string => {
    // Convert camelCase to Title Case with friendly names
    const fieldMap: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      middleName: 'Middle Name',
      email: 'Email',
      phone: 'Phone',
      password: 'Password',
      birthDate: 'Birth Date',
      nationality: 'Nationality',
      country: 'Country',
      tin: 'Platform',
      lead: 'Lead Status',
    };
    
    return fieldMap[fieldName] || fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const getUserFriendlyErrors = (): string[] => {
    const allErrors = getAllFieldErrors();
    const errorMessages: string[] = [];

    allErrors.forEach(({ displayName, errors }) => {
      errors.forEach((error) => {
        // Clean up error messages - remove technical jargon
        let cleanError = error
          .replace(/This value should not be blank\.?/gi, 'This field is required')
          .replace(/This value is not valid\.?/gi, 'Invalid value')
          .replace(/You are not allowed to create user with country: ".*"/gi, 'This country is not allowed')
          .replace(/This value should not be null\.?/gi, 'This field is required')
          .replace(/Validation Failed/gi, '')
          .trim();

        if (cleanError) {
          errorMessages.push(`${displayName}: ${cleanError}`);
        }
      });
    });

    // If no field errors but there's a general message, use that
    if (errorMessages.length === 0 && apiErrors?.message) {
      const cleanMessage = apiErrors.message
        .replace(/Validation Failed/gi, '')
        .trim();
      if (cleanMessage) {
        errorMessages.push(cleanMessage);
      }
    }

    return errorMessages.length > 0 ? errorMessages : ['Please check the form and try again.'];
  };

  const getAllFieldErrors = (): Array<{ field: string; displayName: string; errors: string[] }> => {
    if (!apiErrors?.errors?.children) return [];

    const fieldErrors: Array<{ field: string; displayName: string; errors: string[] }> = [];

    Object.entries(apiErrors.errors.children).forEach(([fieldName, field]) => {
      let errors: string[] = [];

      if (Array.isArray(field)) {
        errors = field.filter((e): e is string => typeof e === 'string');
      } else if (typeof field === 'object' && 'errors' in field) {
        errors = field.errors || [];
      }

      if (errors.length > 0) {
        fieldErrors.push({ 
          field: fieldName, 
          displayName: formatFieldName(fieldName),
          errors 
        });
      }
    });

    return fieldErrors;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
        {/* Minimal Progress Indicator */}
        <div className="mb-7">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[19px] transition-all duration-300 ${
                  step >= 1 ? 'text-white scale-110' : 'bg-gray-100 text-gray-400'
                }`}
                style={step >= 1 ? { backgroundColor: '#ce7a55' } : {}}
              >
                1
              </div>
              {step >= 1 && (
                <span className="text-[19px] text-gray-700 transition-opacity duration-300" style={{ color: '#ce7a55' }}>
                  Personal Info
                </span>
              )}
            </div>
            <div className="w-12 h-px bg-gray-200 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full transition-all duration-500 ease-out"
                style={step >= 2 ? { backgroundColor: '#ce7a55', width: '100%' } : { backgroundColor: '#e5e7eb', width: '0%' }}
              />
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[19px] transition-all duration-300 ${
                  step >= 2 ? 'text-white scale-110' : 'bg-gray-100 text-gray-400'
                }`}
                style={step >= 2 ? { backgroundColor: '#ce7a55' } : {}}
              >
                2
              </div>
              {step >= 2 && (
                <span className="text-[19px] text-gray-700 transition-opacity duration-300" style={{ color: '#ce7a55' }}>
                  Additional Details
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error Popup Modal */}
        {showErrorPopup && apiErrors && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-lg bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
              {/* Close Button */}
              <button
                onClick={() => setShowErrorPopup(false)}
                className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Close"
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

              {/* Error Icon */}
              <div className="flex flex-col items-center px-6 pt-6 pb-4">
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

                <h3 className="mb-1 text-[19px] text-gray-900">
                  Registration Failed
                </h3>
                <p className="mb-4 text-center text-xs text-gray-500">
                  Please correct the errors below
                </p>
              </div>

              {/* Error Messages */}
              <div className="max-h-80 overflow-y-auto px-6 pb-4">
                <div className="space-y-2">
                  {getUserFriendlyErrors().map((error, idx) => (
                    <div
                      key={idx}
                      className="flex items-start rounded-md bg-red-50/50 p-2.5 border-l-2 border-red-400"
                    >
                      <svg
                        className="mr-2 mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-xs text-red-700 leading-relaxed">{error}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="border-t border-gray-100 px-6 py-4">
                <button
                  onClick={() => setShowErrorPopup(false)}
                  className="w-full rounded-md px-4 py-2.5 text-[19px] text-white shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ backgroundColor: '#ce7a55', '--tw-ring-color': '#ce7a55' } as React.CSSProperties}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b86945'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ce7a55'}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Forms Container with Slide Animation */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
          >
            {/* Step 1 Form */}
            <div className="w-full flex-shrink-0">
              <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-5 min-h-[400px] flex flex-col">

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[19px] text-gray-600 mb-1.5 uppercase tracking-wide">
                  First Name
                </label>
                <input
                  {...step1Form.register('firstName')}
                  type="text"
                  className={`w-full rounded-md border px-4 py-2.5 text-[19px] transition-all duration-200 focus:outline-none focus:ring-1 ${
                    step1Form.formState.errors.firstName || getFieldError('firstName').length > 0
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                  }`}
                  placeholder="Enter your first name"
                />
                {step1Form.formState.errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {step1Form.formState.errors.firstName.message}
                  </p>
                )}
                {getFieldError('firstName').map((error, idx) => (
                  <p key={idx} className="mt-1 text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>

              <div>
                <label className="block text-[19px] text-gray-600 mb-1.5 uppercase tracking-wide">
                  Last Name
                </label>
                <input
                  {...step1Form.register('lastName')}
                  type="text"
                  className={`w-full rounded-md border px-4 py-2.5 text-[19px] transition-all duration-200 focus:outline-none focus:ring-1 ${
                    step1Form.formState.errors.lastName || getFieldError('lastName').length > 0
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                  }`}
                  placeholder="Enter your last name"
                />
                {step1Form.formState.errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {step1Form.formState.errors.lastName.message}
                  </p>
                )}
                {getFieldError('lastName').map((error, idx) => (
                  <p key={idx} className="mt-1 text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[19px] text-gray-600 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <input
                {...step1Form.register('email')}
                type="email"
                className={`w-full rounded-md border px-4 py-2.5 text-[19px] transition-all duration-200 focus:outline-none focus:ring-1 ${
                  step1Form.formState.errors.email || getFieldError('email').length > 0
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                }`}
                placeholder="your.email@example.com"
              />
              {step1Form.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {step1Form.formState.errors.email.message}
                </p>
              )}
              {getFieldError('email').map((error, idx) => (
                <p key={idx} className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>

            <div>
              <label className="block text-[19px] text-gray-600 mb-1.5 uppercase tracking-wide">
                Phone Number
              </label>
              <input
                {...step1Form.register('phone')}
                type="tel"
                className={`w-full rounded-md border px-4 py-2.5 text-[19px] transition-all duration-200 focus:outline-none focus:ring-1 ${
                  step1Form.formState.errors.phone || getFieldError('phone').length > 0
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                }`}
                placeholder="+1234567890"
              />
              {step1Form.formState.errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {step1Form.formState.errors.phone.message}
                </p>
              )}
              {getFieldError('phone').map((error, idx) => (
                <p key={idx} className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>

            <div className="mt-auto pt-4">
              <button
                type="submit"
                className="w-full rounded-md px-6 py-3 text-[19px] text-white shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundColor: '#ce7a55', '--tw-ring-color': '#ce7a55' } as React.CSSProperties}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b86945'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ce7a55'}
              >
                Continue
              </button>
            </div>
          </form>
            </div>

            {/* Step 2 Form */}
            <div className="w-full flex-shrink-0">
              <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-5 min-h-[400px] flex flex-col">
            <div className="flex items-center justify-end -mt-2 mb-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                ← Back
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[19px] text-gray-600 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <input
                  {...step2Form.register('password')}
                  type="password"
                  className={`w-full rounded-md border px-4 py-2.5 text-[19px] transition-all duration-200 focus:outline-none focus:ring-1 ${
                    step2Form.formState.errors.password || getFieldError('password').length > 0
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                  }`}
                  placeholder="Enter your password"
                />
                {step2Form.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {step2Form.formState.errors.password.message}
                  </p>
                )}
                {getFieldError('password').map((error, idx) => (
                  <p key={idx} className="mt-1 text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>

              <div>
                <label className="block text-[19px] text-gray-600 mb-1.5 uppercase tracking-wide">
                  Confirm Password
                </label>
                <input
                  {...step2Form.register('confirmPassword')}
                  type="password"
                  className={`w-full rounded-md border px-4 py-2.5 text-[19px] transition-all duration-200 focus:outline-none focus:ring-1 ${
                    step2Form.formState.errors.confirmPassword || getFieldError('confirmPassword').length > 0
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-[#ce7a55] focus:ring-[#ce7a55]'
                  }`}
                  placeholder="Re-enter your password"
                />
                {step2Form.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {step2Form.formState.errors.confirmPassword.message}
                  </p>
                )}
                {getFieldError('confirmPassword').map((error, idx) => (
                  <p key={idx} className="mt-1 text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CountryDropdown
                value={step2Form.watch('nationality') || ''}
                onChange={(value) => step2Form.setValue('nationality', value, { shouldValidate: true })}
                error={!!step2Form.formState.errors.nationality || getFieldError('nationality').length > 0}
                placeholder="Select nationality"
                label="Nationality *"
                fieldName="nationality"
                formErrors={step2Form.formState.errors.nationality}
                apiErrors={getFieldError('nationality')}
              />

              <CountryDropdown
                value={step2Form.watch('country') || ''}
                onChange={(value) => step2Form.setValue('country', value, { shouldValidate: true })}
                error={!!step2Form.formState.errors.country || getFieldError('country').length > 0}
                placeholder="Select country"
                label="Country *"
                fieldName="country"
                formErrors={step2Form.formState.errors.country}
                apiErrors={getFieldError('country')}
              />
            </div>

            <div>
              <label className="block text-[19px] text-gray-600 mb-2 uppercase tracking-wide">
                Select Platform
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    step2Form.setValue('tin', '1', { shouldValidate: true });
                  }}
                  className={`relative rounded-md border p-3 transition-all duration-200 ${
                    step2Form.watch('tin') === '1'
                      ? 'shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  style={step2Form.watch('tin') === '1' ? { borderColor: '#ce7a55', backgroundColor: '#fef5f0', borderWidth: '2px' } : {}}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        step2Form.watch('tin') === '1'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                      style={step2Form.watch('tin') === '1' ? { backgroundColor: '#ce7a55' } : {}}
                    >
                      <span className="text-[19px]">MT4</span>
                    </div>
                    <span
                      className={`text-[19px] ${
                        step2Form.watch('tin') === '1'
                          ? ''
                          : 'text-gray-600'
                      }`}
                      style={step2Form.watch('tin') === '1' ? { color: '#ce7a55' } : {}}
                    >
                      MT4
                    </span>
                  </div>
                  {step2Form.watch('tin') === '1' && (
                    <div className="absolute right-1.5 top-1.5">
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
                    step2Form.watch('tin') === '2'
                      ? 'shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  style={step2Form.watch('tin') === '2' ? { borderColor: '#ce7a55', backgroundColor: '#fef5f0', borderWidth: '2px' } : {}}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        step2Form.watch('tin') === '2'
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                      style={step2Form.watch('tin') === '2' ? { backgroundColor: '#ce7a55' } : {}}
                    >
                      <span className="text-[19px]">MT5</span>
                    </div>
                    <span
                      className={`text-[19px] ${
                        step2Form.watch('tin') === '2'
                          ? ''
                          : 'text-gray-600'
                      }`}
                      style={step2Form.watch('tin') === '2' ? { color: '#ce7a55' } : {}}
                    >
                      MT5
                    </span>
                  </div>
                  {step2Form.watch('tin') === '2' && (
                    <div className="absolute right-1.5 top-1.5">
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
              {getFieldError('tin').map((error, idx) => (
                <p key={idx} className="mt-2 text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>

            <div className="mt-auto">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md px-6 py-3 text-[19px] text-white shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: isSubmitting ? '#a0a0a0' : '#ce7a55', '--tw-ring-color': '#ce7a55' } as React.CSSProperties}
                onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#b86945')}
                onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#ce7a55')}
              >
                {isSubmitting ? 'Registering...' : 'Complete Registration'}
              </button>
            </div>
          </form>
            </div>
          </div>
        </div>
    </div>
  );
}

