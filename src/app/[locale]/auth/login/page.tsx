import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LoginForm from "@/components/shared/auth/login-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = (await params).locale;
  const t = await getTranslations({ locale, namespace: "auth.login" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

const LoginPage = async () => {
  const t = await getTranslations("auth.login");

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
