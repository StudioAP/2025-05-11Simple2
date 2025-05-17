"use server";

import { encodedRedirect } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (typeof emailValue !== 'string' || !emailValue) {
    return redirect(encodedRedirect(
      "error",
      "/sign-up",
      "Email is required and must be a string",
    ));
  }
  const email = emailValue;

  if (typeof passwordValue !== 'string' || !passwordValue) {
    return redirect(encodedRedirect(
      "error",
      "/sign-up",
      "Password is required and must be a string",
    ));
  }
  const password = passwordValue;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return redirect(encodedRedirect("error", "/sign-up", error.message));
  } else {
    return redirect(encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    ));
  }
};

export const signInAction = async (formData: FormData) => {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const supabase = await createClient();

  if (typeof emailValue !== 'string' || !emailValue) {
    return redirect(encodedRedirect("error", "/sign-in", "Email is required and must be a string"));
  }
  const email = emailValue;

  if (typeof passwordValue !== 'string' || !passwordValue) {
    return redirect(encodedRedirect("error", "/sign-in", "Password is required and must be a string"));
  }
  const password = passwordValue;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(encodedRedirect("error", "/sign-in", error.message));
  }

  return redirect("/");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const emailValue = formData.get("email");
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrlValue = formData.get("callbackUrl");
  let callbackUrl: string | undefined = undefined;

  if (typeof emailValue !== 'string' || !emailValue) {
    return redirect(encodedRedirect("error", "/forgot-password", "Email is required and must be a string"));
  }
  const email = emailValue;

  if (callbackUrlValue !== null && typeof callbackUrlValue !== 'string') {
    return redirect(encodedRedirect("error", "/forgot-password", "Callback URL must be a string if provided"));
  }
  if (typeof callbackUrlValue === 'string') {
    callbackUrl = callbackUrlValue;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return redirect(encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    ));
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return redirect(encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  ));
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const passwordValue = formData.get("password");
  const confirmPasswordValue = formData.get("confirmPassword");

  if (typeof passwordValue !== 'string' || !passwordValue) {
    redirect(encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password is required and must be a string",
    ));
    return;
  }
  const password = passwordValue;

  if (typeof confirmPasswordValue !== 'string' || !confirmPasswordValue) {
    redirect(encodedRedirect(
      "error",
      "/protected/reset-password",
      "Confirm password is required and must be a string",
    ));
    return;
  }
  const confirmPassword = confirmPasswordValue;

  if (!password || !confirmPassword) {
    redirect(encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    ));
    return;
  }

  if (password !== confirmPassword) {
    redirect(encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    ));
    return;
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    redirect(encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    ));
    return;
  }

  redirect(encodedRedirect("success", "/protected/reset-password", "Password updated"));
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
