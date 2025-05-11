"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Profile = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  phone: string | null;
  updated_at: string;
};

type ProfileFormProps = {
  userId: string;
  email: string;
  initialData: Profile | null;
};

export function ProfileForm({ userId, email, initialData }: ProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialData?.full_name || "");
  const [displayName, setDisplayName] = useState(initialData?.display_name || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClient();

  // プロフィールの保存処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // バリデーション
      if (!fullName.trim()) {
        throw new Error("氏名を入力してください");
      }

      const profileData = {
        id: userId,
        full_name: fullName,
        display_name: displayName || null,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      };

      if (initialData) {
        // 更新
        const { error } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", userId);

        if (error) throw error;
      } else {
        // 新規作成
        const { error } = await supabase
          .from("profiles")
          .insert(profileData);

        if (error) throw error;
      }

      setSuccess("プロフィールが保存されました");
      router.refresh();
    } catch (err: any) {
      console.error("プロフィール保存エラー:", err);
      setError(err.message || "プロフィールの保存に失敗しました。もう一度お試しください。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
          className="bg-gray-50"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          メールアドレスは変更できません
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">氏名 <span className="text-red-500">*</span></Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="山田 太郎"
          required
          disabled={isSaving}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">表示名</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="サイト上で表示される名前（未入力の場合は氏名が使用されます）"
          disabled={isSaving}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">電話番号</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="090-1234-5678"
          disabled={isSaving}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={isSaving}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "保存中..." : "保存する"}
        </Button>
      </div>
    </form>
  );
}
