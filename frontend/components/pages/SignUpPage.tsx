import { SignUp } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";

export function SignUpPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {t('auth.signUp.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.signUp.subtitle')}
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp 
            routing="path" 
            path="/sign-up"
            redirectUrl="/"
            signInUrl="/sign-in"
          />
        </div>
      </div>
    </div>
  );
}
