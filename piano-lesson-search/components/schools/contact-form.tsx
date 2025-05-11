"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ContactFormProps = {
  schoolId: string;
  schoolName: string;
  contactEmail: string;
};

export function ContactForm({ schoolId, schoolName, contactEmail }: ContactFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // バリデーション
      if (!formData.name.trim()) {
        throw new Error("お名前を入力してください");
      }
      if (!formData.email.trim()) {
        throw new Error("メールアドレスを入力してください");
      }
      if (!formData.message.trim()) {
        throw new Error("お問い合わせ内容を入力してください");
      }

      // APIを呼び出してメール送信
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schoolId,
          schoolName,
          contactEmail,
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "メール送信に失敗しました");
      }
      
      // 成功
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("問い合わせ送信中にエラーが発生しました。もう一度お試しください。");
      }
      console.error("問い合わせ送信エラー:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="mb-6 text-green-600 dark:text-green-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">お問い合わせを送信しました</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {schoolName}へのお問い合わせありがとうございます。<br />
          教室の担当者からの返信をお待ちください。
        </p>
        <Button onClick={() => setSuccess(false)}>別のお問い合わせをする</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">お名前 <span className="text-red-500">*</span></Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="山田 太郎"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス <span className="text-red-500">*</span></Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@example.com"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">お問い合わせ内容 <span className="text-red-500">*</span></Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="教室についての質問や体験レッスンの申し込みなど、お気軽にお問い合わせください。"
          rows={5}
          disabled={isSubmitting}
        />
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        <p>
          ※ 送信いただいた内容は、{schoolName}の担当者に直接送信されます。<br />
          ※ 返信は教室の担当者から、入力いただいたメールアドレス宛に送信されます。
        </p>
      </div>

      <div className="flex justify-center">
        <Button type="submit" disabled={isSubmitting} className="px-8">
          {isSubmitting ? "送信中..." : "送信する"}
        </Button>
      </div>
    </form>
  );
}
