export default function SuccessPage() {
  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <svg
            className="h-7 w-7 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="mb-3 text-[19px] text-gray-900">
          Thanks for registering to CMS Prime!
        </h2>
        <p className="text-[19px] text-gray-600 leading-relaxed">
          An activation link has been sent to your email. Please click on it to activate your profile.
        </p>
      </div>
    </div>
  );
}

