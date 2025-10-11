import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 pt-8 mt-12">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Made with care by{" "}
        <Link href="https://annschulte.me" className="underline">
          Ann
        </Link>{" "}
        {/* at{" "}
        <Link href="https://plexusaero.space" className="underline">
          Plexus
        </Link> */}
        . Open source and customizable.
      </p>
    </footer>
  );
};
