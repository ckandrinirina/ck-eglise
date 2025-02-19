import { LanguageSwitcher } from "@/components/shared/language-switcher";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <LanguageSwitcher />

      {/* Auth content side */}
      <div className="relative flex items-center justify-center p-8">
        {children}
      </div>

      {/* Image side */}
      <div className="hidden lg:block relative">
        <div className="absolute inset-0 bg-zinc-900/90" />
        <div className="relative h-full flex items-center justify-center p-8">
          <div className="text-white space-y-6 max-w-lg">
            <h1 className="text-3xl font-bold">Welcome to CK Eglise</h1>
            <p className="text-zinc-400">
              Sign in to access your account and manage your church community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
