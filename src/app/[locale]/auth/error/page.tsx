import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = (await params).locale;
  const t = await getTranslations({ locale, namespace: "auth.error" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

const AuthErrorPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const t = await getTranslations("auth.error");

  const resolvedSearchParams = await searchParams;
  // Get error message from URL query parameter
  const errorType = (resolvedSearchParams?.error as string) || "default";

  // Map error code to a more user-friendly message
  const errorMessages: Record<string, string> = {
    default: t("errors.default"),
    configuration: t("errors.configuration"),
    accessdenied: t("errors.accessdenied"),
    verification: t("errors.verification"),
    signin: t("errors.signin"),
    oauthsignin: t("errors.oauthsignin"),
    oauthcallback: t("errors.oauthcallback"),
    oauthcreateaccount: t("errors.oauthcreateaccount"),
    emailcreateaccount: t("errors.emailcreateaccount"),
    callback: t("errors.callback"),
    oauthaccountnotlinked: t("errors.oauthaccountnotlinked"),
    sessionrequired: t("errors.sessionrequired"),
  };

  const errorMessage = errorMessages[errorType] || errorMessages.default;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("title")}</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">{t("instructions")}</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/" passHref>
              <Button variant="outline">{t("buttons.home")}</Button>
            </Link>
            <Link href="/auth/login" passHref>
              <Button>{t("buttons.tryAgain")}</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthErrorPage;
