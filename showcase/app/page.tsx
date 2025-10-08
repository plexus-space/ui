"use client";

export default function Home() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-5xl mx-auto p-8 flex flex-col items-center text-center">
          <h1 className="text-4xl pt-24 font-bold text-foreground">
            Physics and aerospace component library for any project
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            A set of purposefully designed components that you can customize,
            extend, and build on. Start here then make it your own. Open Source.
            Open Code.
          </p>

          {/* <Image src="/main.png" alt="Plexus UI" width={500} height={500} /> */}

          <section className="mb-12">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Install cli and use it to add components to your project - get all
              the code
            </p>
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4 mb-2">
              <pre className="text-sm text-emerald-600 dark:text-emerald-400">
                npx @plexusui/cli init
              </pre>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-4">
              <pre className="text-sm text-emerald-600 dark:text-emerald-400">
                npx @plexusui/cli add earth
              </pre>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
