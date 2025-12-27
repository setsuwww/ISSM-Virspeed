export const metadata = {
  title: "Beefast",
};

export default function AuthLayout({
  children
}) {
  return (
    <main className="antialiased bg-radial-[at_50%_75%] from-yellow-300 via-yellow-100 to-yellow-50">
      <div className="min-h-screen flex items-center justify-center">
        {children}
      </div>
    </main>
  );
}
