import { ClerkProvider } from "@clerk/clerk-react";
import { clerkPublishableKey } from "./config";
import { AppInner } from "./components/AppInner";
import "./i18n";

export default function App() {
  if (!clerkPublishableKey || clerkPublishableKey === "") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Configuração Necessária
          </h1>
          <p className="text-gray-600 mb-6">
            Para usar o sistema de autenticação, você precisa configurar sua chave do Clerk.
          </p>
          <div className="bg-gray-100 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Passos para configurar:</strong>
            </p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Crie uma conta no Clerk.dev</li>
              <li>Copie sua chave pública (Publishable Key)</li>
              <li>Cole a chave no arquivo frontend/config.ts</li>
              <li>Recarregue a página</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <AppInner />
    </ClerkProvider>
  );
}
