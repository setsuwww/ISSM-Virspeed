import PageTransition from "../(content)/admin/dashboard/page-transition";

export const metadata = {
  title: "Virspeed | Auth",
  description: "Authentication form",
};

export default function AuthLayout({
  children
}) {
  return (
    <main className="antialiased bg-radial-[at_50%_75%] from-violet-400 via-violet-100 to-violet-50">
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          {children}
        </div>
      </PageTransition>
    </main>
  );
}
