import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./Header";
import { HomePage } from "./pages/HomePage";
import { HowToHelpPage } from "./pages/HowToHelpPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { GovernancePage } from "./pages/GovernancePage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { SearchPage } from "./pages/SearchPage";
import { AccountPage } from "./pages/AccountPage";
import { AnnouncementPage } from "./pages/AnnouncementPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { CompaniesPage } from "./pages/CompaniesPage";
import { CompanyDetailPage } from "./pages/CompanyDetailPage";
import { Footer } from "./Footer";

export function AppInner() {
  return (
    <Router>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/how-to-help" element={<HowToHelpPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/companies/:id" element={<CompanyDetailPage />} />
            <Route path="/governance" element={<GovernancePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/my-account" element={<AccountPage />} />
            <Route path="/announcement/:slug" element={<AnnouncementPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
