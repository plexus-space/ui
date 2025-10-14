import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 pt-8 mt-12">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Made with care by{" "}
        <Link href="https://annschulte.me" className="underline">
          Ann
        </Link>{" "}
        . Open source <span className="font-mono text-xs">(mostly)</span> and
        customizable.
      </p>
    </footer>
  );
};
