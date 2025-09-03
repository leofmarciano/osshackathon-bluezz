import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./Header";
import { HomePage } from "./pages/HomePage";
import { HowToHelpPage } from "./pages/HowToHelpPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { SearchPage } from "./pages/SearchPage";
import { AccountPage } from "./pages/AccountPage";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { Footer } from "./Footer";
import { AnnouncementPage } from "./pages/AnnouncementPage";

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
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/announcements/:slug" element={<AnnouncementPage />} />
            <Route path="/my-account" element={<AccountPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
