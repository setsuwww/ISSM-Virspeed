export const metadata = {
  title: "Beefast",
};

export default function AuthLayout({
  children
}) {
  return (
    <main className="antialiased bg-radial-[at_50%_75%] from-sky-300 via-sky-100 to-sky-50">
      <div className="min-h-screen flex items-center justify-center">
        {children}
      </div>
    </main>
  );
}
