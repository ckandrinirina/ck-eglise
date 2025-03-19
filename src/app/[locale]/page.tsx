"use client";

import { useTranslations } from "next-intl";
import { Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import {
  ChevronRight,
  BarChart,
  Users,
  Building,
  Calendar,
  Shield,
  ArrowRight,
  Check,
} from "lucide-react";

function OrganizationManagementContent() {
  const t = useTranslations();
  const pathname = usePathname();
  const [animatedItems, setAnimatedItems] = useState<number[]>([]);

  useEffect(() => {
    // Animate items sequentially
    const interval = setInterval(() => {
      setAnimatedItems((prev) => {
        if (prev.length >= 5) {
          clearInterval(interval);
          return prev;
        }
        return [...prev, prev.length];
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Users className="h-12 w-12 text-primary" />,
      title: t("home.features.members"),
      description: t("home.features.membersDesc"),
    },
    {
      icon: <Building className="h-12 w-12 text-primary" />,
      title: t("home.features.branches"),
      description: t("home.features.branchesDesc"),
    },
    {
      icon: <Calendar className="h-12 w-12 text-primary" />,
      title: t("home.features.events"),
      description: t("home.features.eventsDesc"),
    },
    {
      icon: <BarChart className="h-12 w-12 text-primary" />,
      title: t("home.features.reports"),
      description: t("home.features.reportsDesc"),
    },
    {
      icon: <Shield className="h-12 w-12 text-primary" />,
      title: t("home.features.roles"),
      description: t("home.features.rolesDesc"),
    },
  ];

  // Extract locale from pathname
  const locale = pathname.split("/")[1];
  const loginPath = `/${locale}/auth/login`;
  const registerPath = `/${locale}/auth/register`;

  return (
    <main className="flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-0 right-0 z-50 mt-4 mr-4">
        <LanguageSwitcher variant="inline" />
      </div>

      {/* Hero Section */}
      <section className="w-full py-24 bg-gradient-to-br from-primary/5 via-primary/10 to-background relative">
        <>
          <div className="absolute top-20 right-[20%] w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-[15%] w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float"></div>
          <div className="hidden md:block absolute top-1/3 left-[10%] w-6 h-6 border-2 border-primary/20 rounded-md animate-spin-slow"></div>
          <div className="hidden md:block absolute bottom-1/4 right-[15%] w-8 h-8 border-2 border-primary/30 rounded-full animate-bounce-slow"></div>
        </>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto">
            <div className="relative inline-block mb-4">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium animate-fade-in">
                {t("home.hero.label")}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight animate-fade-in-up">
              {t("home.hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl animate-fade-in-up animation-delay-200">
              {t("home.hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in-up animation-delay-400">
              <Button
                asChild
                size="lg"
                className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all group"
              >
                <Link href={loginPath}>
                  {t("home.hero.loginButton")}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="rounded-xl border-2 hover:bg-primary/5 transition-colors"
              >
                <Link href={registerPath}>{t("home.hero.registerButton")}</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 overflow-hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="absolute bottom-0 w-full h-24 md:h-32 text-background"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              fill="currentColor"
              opacity=".25"
            ></path>
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              fill="currentColor"
              opacity=".5"
            ></path>
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 bg-background relative">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              {t("home.featuresLabel")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              {t("home.featuresTitle")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {t("home.featuresSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex flex-col items-center p-8 rounded-2xl border border-border/50 bg-background/80 backdrop-blur-sm transform transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 ${animatedItems.includes(index) ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
              >
                <div className="mb-6 p-4 rounded-full bg-primary/10 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-24 bg-gradient-to-br from-background to-primary/5 relative">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 inline-block">
                {t("home.benefitsLabel")}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                {t("home.benefits.title")}
              </h2>
              <ul className="space-y-6">
                {[1, 2, 3, 4].map((item) => (
                  <li key={item} className="flex items-start group">
                    <div className="mr-4 mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium mb-1">
                        {t(`home.benefits.itemTitle${item}`)}
                      </p>
                      <p className="text-muted-foreground">
                        {t(`home.benefits.item${item}`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-12">
                <Button
                  asChild
                  size="lg"
                  className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all group"
                >
                  <Link href={loginPath}>
                    {t("home.benefits.cta")}
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="order-1 lg:order-2 bg-gradient-to-br from-background to-primary/5 p-1 rounded-2xl shadow-2xl">
              <div className="bg-background/80 backdrop-blur-sm rounded-xl p-8 h-full flex flex-col justify-center relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/5 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-primary/10 rounded-full blur-lg"></div>

                <div className="flex items-start mb-6">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 bg-primary/10 flex items-center justify-center">
                      <div className="w-full h-full flex items-center justify-center text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="8" r="5"></circle>
                          <path d="M20 21a8 8 0 1 0-16 0"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">
                      {t("home.testimonial.author")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("home.testimonial.role")}
                    </p>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="absolute -top-2 -left-2 text-6xl text-primary/20 leading-none">
                    &ldquo;
                  </div>
                  <blockquote className="text-xl italic pl-6 relative">
                    {t("home.testimonial.quote")}
                  </blockquote>
                  <div className="absolute -bottom-6 -right-2 text-6xl text-primary/20 leading-none">
                    &rdquo;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up">
                {t("home.cta.title")}
              </h2>
              <p className="text-primary-foreground/90 text-lg max-w-xl animate-fade-in-up animation-delay-200">
                {t("home.cta.subtitle")}
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              asChild
              className="rounded-xl shadow-xl bg-white hover:bg-white/90 text-primary font-semibold animate-fade-in-up animation-delay-400"
            >
              <Link
                href={registerPath}
                className="px-8 py-6 text-lg flex items-center"
              >
                {t("home.cta.button")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function OrganizationManagement() {
  return (
    <Suspense
      fallback={
        <main className="container mx-auto p-8">
          <div className="h-12 w-3/4 max-w-3xl mx-auto bg-gray-200 rounded animate-pulse mb-8"></div>
          <div className="h-6 w-2/3 max-w-2xl mx-auto bg-gray-200 rounded animate-pulse mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </main>
      }
    >
      <OrganizationManagementContent />
    </Suspense>
  );
}
