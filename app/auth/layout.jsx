import PageTransition from "../admin/dashboard/page-transition";

export const metadata = {
  title: "Beefast | Auth",
};

export default function AuthLayout({
  children
}) {
  return (
    <main className="antialiased bg-radial-[at_50%_75%] from-yellow-300 via-yellow-100 to-yellow-50">
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          {children}
        </div>
      </PageTransition>
    </main>
  );
}
