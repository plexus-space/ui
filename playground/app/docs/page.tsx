import { CopyButton } from "@/components/copy-button";
import { Footer } from "@/components/footer";

export default function Docs() {
  return (
    <section className="max-w-5xl mx-auto px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Documentation</h1>
        <p className="text-zinc-600  dark:text-zinc-400 mb-4">
          Install cli and use it to add components to your project - get all the
          code
        </p>
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md p-2">
          <div className="flex items-center justify-between gap-2">
            <pre className="text-sm font-geist-mono text-emerald-600 dark:text-emerald-400">
              npx @plexusui/cli init
            </pre>
            <CopyButton hideText copyText={`npx @plexusui/cli init`} />
          </div>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md p-2">
          <div className="flex items-center justify-between gap-2">
            <pre className="text-sm font-geist-mono text-emerald-600 dark:text-emerald-400">
              npx @plexusui/cli add earth
            </pre>
            <CopyButton hideText copyText={`npx @plexusui/cli earth`} />
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}
