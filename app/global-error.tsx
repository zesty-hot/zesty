'use client' // Error boundaries must be Client Components
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    // global-error must include html and body tags
    <html>
      <body>
        <div className={`m-auto h-screen align-middle text-center justify-center flex flex-col w-full`}>
          {error.name}
          <br />
          {error.message}
          <br />
          {error.cause !== "undefined" && <div>Cause: {String(error.cause)}</div>}
        </div>
      </body>
    </html>
  );
}