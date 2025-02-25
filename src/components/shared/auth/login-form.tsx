"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const LoginForm = () => {
  const t = useTranslations("auth.login");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);

  // Parse error from search params on component mount
  useEffect(() => {
    const error = searchParams?.get("error");
    if (error) {
      let errorMessage = t("error.generic");

      // Map error codes to localized messages
      if (error === "CredentialsSignin") {
        errorMessage = t("error.invalidCredentials");
      }

      setAuthError(errorMessage);
      toast.error(errorMessage);
    }
  }, [searchParams, t]);

  const formSchema = z.object({
    email: z.string().email(t("validation.emailRequired")),
    password: z.string().min(8, t("validation.passwordRequired")),
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const authenticateUser = async (email: string, password: string) => {
    // Make an explicit AJAX call to the NextAuth API
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return result;
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const callbackUrl = searchParams?.get("callbackUrl") || "/admin";
      const locale = window.location.pathname.split("/")[1] || "fr";

      // Explicitly call the authentication function
      const result = await authenticateUser(data.email, data.password);

      if (result?.error) {
        const errorMessage = t("error.invalidCredentials");
        setAuthError(errorMessage);
        toast.error(errorMessage);

        // Log authentication failure for debugging (not sensitive data)
        console.log("Authentication failed:", result.error);
        return;
      }

      if (result?.ok) {
        // Construct proper localized redirect URL
        const redirectUrl =
          callbackUrl.startsWith("/") && !callbackUrl.startsWith(`/${locale}`)
            ? `/${locale}${callbackUrl}`
            : callbackUrl;

        toast.success(t("success.loggedIn"));

        // Redirect to the admin page on successful login
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (error) {
      console.error("Authentication error:", error);
      const errorMessage = t("error.generic");
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {authError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("error.title")}</AlertTitle>
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("password")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("passwordPlaceholder")}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("submitting") : t("submit")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
