import { SignIn } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";

export function SignInPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {t('auth.signIn.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.signIn.subtitle')}
          </p>
        </div>
        <div className="flex justify-center">
          <SignIn 
            routing="path" 
            path="/sign-in"
            redirectUrl="/"
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </div>
  );
}
