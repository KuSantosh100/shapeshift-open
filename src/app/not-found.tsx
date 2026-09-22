import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex w-full max-w-[560px] flex-col items-start gap-3 px-4 pt-[22vh]">
      <h1 className="text-[17px] leading-6 font-[550]">This page doesn’t exist</h1>
      <p className="text-[15px] leading-[22px] text-ink-2">Shapeshift is a single page.</p>
      <Link
        href="/"
        className="inline-flex h-8 items-center rounded-full bg-primary px-4 text-[14px] font-medium text-primary-foreground transition-[scale] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.96]"
      >
        Go to Shapeshift
      </Link>
    </main>
  );
}
