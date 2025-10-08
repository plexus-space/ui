import { Footer } from "@/components/footer";

export default function Docs() {
  return (
    <section className="max-w-5xl mx-auto px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Documentation</h1>
        <p className="text-zinc-600 font-jgs uppercase dark:text-zinc-400 mb-4">
          Install cli and use it to add components to your project - get all the
          code
        </p>
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 mb-2">
          <pre className="text-sm text-emerald-600 dark:text-emerald-400">
            npx @plexusui/cli init
          </pre>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4">
          <pre className="text-sm text-emerald-600 dark:text-emerald-400">
            npx @plexusui/cli add line-chart
          </pre>
        </div>
      </div>
      <Footer />
    </section>
  );
}
