import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import AuthForm from "./_components/auth-form";

export default async function AuthPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/find");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-b from-pink-50 via-orange-50 to-blue-100">
      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <AuthForm />
      </div>
    </div>
  );
}
