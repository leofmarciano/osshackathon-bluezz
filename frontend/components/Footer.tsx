import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const linkClass =
    "text-muted-foreground hover:text-foreground transition-colors";

  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link to="/" className="text-base font-semibold text-foreground">
              {t("footer.brand")}
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("footer.description")}
            </p>
          </div>

          <nav
            aria-label={t("footer.navAriaLabel")}
            className="grid grid-cols-2 gap-4 md:justify-self-center"
          >
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className={linkClass}>
                  {t("navigation.home")}
                </Link>
              </li>
              <li>
                <Link to="/how-to-help" className={linkClass}>
                  {t("navigation.howToHelp")}
                </Link>
              </li>
              <li>
                <Link to="/discover" className={linkClass}>
                  {t("navigation.discover")}
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className={linkClass}>
                  {t("navigation.howItWorks")}
                </Link>
              </li>
            </ul>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/search" className={linkClass}>
                  {t("navigation.search")}
                </Link>
              </li>
              <li>
                <Link to="/my-account" className={linkClass}>
                  {t("navigation.myAccount")}
                </Link>
              </li>
              <li>
                <Link to="/sign-in" className={linkClass}>
                  {t("navigation.signIn")}
                </Link>
              </li>
              <li>
                <Link to="/sign-up" className={linkClass}>
                  {t("navigation.signUp")}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="md:justify-self-end">
            <p className="text-sm text-muted-foreground">
              {t("footer.copyright", {
                year,
                app: t("footer.brand"),
              })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
