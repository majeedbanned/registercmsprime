export default function ContactUsSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-[#ead8ce] bg-white p-8 text-center shadow-[0_24px_60px_-32px_rgba(86,42,21,0.35)]">
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
        <h1 className="mb-3 text-2xl font-semibold text-gray-900">Thank You</h1>
        <p className="text-sm leading-relaxed text-gray-600">
          Your message has been received. Our team will get back to you shortly.
        </p>
      </div>
    </main>
  );
}
