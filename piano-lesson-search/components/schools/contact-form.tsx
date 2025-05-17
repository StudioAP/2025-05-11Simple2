"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation"; // 未使用のためコメントアウト
// import { createClient } from "@/utils/supabase/client"; // 未使用のためコメントアウト
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface ContactFormProps {
  schoolId: string;
  schoolName: string;
  contactEmail: string;
}

export function ContactForm({ schoolId, schoolName, contactEmail }: ContactFormProps) {
  // const router = useRouter(); // 未使用のためコメントアウト
  // const supabase = createClient(); // 未使用のためコメントアウト
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
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
      const response = await fetch("/api/contact/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schoolId,
          schoolName,
          recipientEmail: contactEmail,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "メール送信に失敗しました");
      }
      
      // 成功
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });

      toast({
        title: "送信完了",
        description: "お問い合わせが正常に送信されました。",
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("問い合わせ送信中にエラーが発生しました。もう一度お試しください。");
      }
      console.error("問い合わせ送信エラー:", err);
      
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: err instanceof Error && err.message ? err.message : "メール送信中にエラーが発生しました。しばらくしてからもう一度お試しください。",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900 mb-6">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-700 dark:text-green-300 ml-2">
            お問い合わせが送信されました。教室からの返信をお待ちください。
          </AlertDescription>
        </Alert>
        
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
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">{error}</AlertDescription>
        </Alert>
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
        <Label htmlFor="phone">電話番号</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="090-1234-5678"
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
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              送信中...
            </>
          ) : (
            "送信する"
          )}
        </Button>
      </div>
    </form>
  );
}
