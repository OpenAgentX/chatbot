"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";

import { AuthForm } from "@/components/chat/auth-form";
import { SubmitButton } from "@/components/chat/submit-button";
import { toast } from "@/components/chat/toast";
import { type LoginActionState, login } from "../actions";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    { status: "idle" }
  );

  const { update: updateSession } = useSession();

  // biome-ignore lint/correctness/useExhaustiveDependencies: router and updateSession are stable refs
  useEffect(() => {
    if (state.status === "failed") {
      toast({ type: "error", description: "Invalid credentials!" });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: "Failed validating your submission!",
      });
    } else if (state.status === "success") {
      setIsSuccessful(true);
      updateSession();
      router.refresh();
    }
  }, [state.status]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="text-sm text-muted-foreground">
        Sign in to your account to continue
      </p>
      <AuthForm action={handleSubmit} defaultEmail={email}>
        <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>
        <p className="text-center text-[13px] text-muted-foreground">
          {"No account? "}
          <Link
            className="text-foreground underline-offset-4 hover:underline"
            href="/register"
          >
            Sign up
          </Link>
        </p>
      </AuthForm>
      
      <div className="relative mt-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => signIn("wechat", { callbackUrl: "/" })}
        >
          <svg className="mr-2 h-5 w-5 fill-current text-[#07C160]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.28 12.33c0 .87.82 1.57 1.83 1.57s1.83-.7 1.83-1.57-.82-1.57-1.83-1.57-1.83.7-1.83 1.57zm5.55 0c0 .87.82 1.57 1.83 1.57s1.83-.7 1.83-1.57-.82-1.57-1.83-1.57-1.83.7-1.83 1.57zm4.12-4.04c-.38-.05-.77-.07-1.18-.07-2.3 0-4.17 1.4-4.17 3.12 0 1.72 1.87 3.12 4.17 3.12 1.15 0 2.18-.35 2.95-.91l1.52.8-.4-1.29c.65-.5.98-1.07.98-1.72 0-1.72-1.87-3.12-4.17-3.12l.3-.02zm-6.23-5.26c-3.18 0-5.75 2-5.75 4.47 0 1.34.7 2.5 1.85 3.25l-.57 1.75 2.12-1.05c.75.2 1.52.3 2.35.3 3.18 0 5.75-2 5.75-4.47 0-2.47-2.57-4.47-5.75-4.47l.22.2z" />
          </svg>
          WeChat
        </button>
      </div>
    </>
  );
}
