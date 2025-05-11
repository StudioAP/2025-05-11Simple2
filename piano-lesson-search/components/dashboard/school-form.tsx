"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

type SchoolType = {
  id: number;
  name: string;
};

type School = {
  id: string;
  user_id: string;
  school_type_id: number;
  name: string;
  url: string;
  area: string;
  description: string;
  contact_email: string;
  school_types?: {
    id: number;
    name: string;
  };
};

type SchoolFormProps = {
  initialData: School | null;
  schoolTypes: SchoolType[];
  userId: string;
};

export function SchoolForm({ initialData, schoolTypes, userId }: SchoolFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState<Omit<School, "id" | "user_id" | "school_types">>({
    school_type_id: initialData?.school_type_id || schoolTypes[0]?.id || 1,
    name: initialData?.name || "",
    url: initialData?.url || "",
    area: initialData?.area || "",
    description: initialData?.description || "",
    contact_email: initialData?.contact_email || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "教室名を入力してください";
    } else if (formData.name.length > 20) {
      newErrors.name = "教室名は20文字以内で入力してください";
    }
    
    if (!formData.area.trim()) {
      newErrors.area = "教室エリアを入力してください";
    } else if (formData.area.length > 20) {
      newErrors.area = "教室エリアは20文字以内で入力してください";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "教室詳細を入力してください";
    } else if (formData.description.length > 1000) {
      newErrors.description = "教室詳細は1000文字以内で入力してください";
    }
    
    if (!formData.contact_email.trim()) {
      newErrors.contact_email = "問い合わせ用メールアドレスを入力してください";
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = "有効なメールアドレスを入力してください";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (initialData) {
        // 更新
        const { error } = await supabase
          .from("schools")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);
          
        if (error) throw error;
      } else {
        // 新規作成
        const { error } = await supabase
          .from("schools")
          .insert({
            ...formData,
            user_id: userId,
            is_published: false,
            subscription_status: "inactive",
          });
          
        if (error) throw error;
      }
      
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("教室情報の保存エラー:", error);
      alert("教室情報の保存中にエラーが発生しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="school_type_id">
            教室種別 <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.school_type_id.toString()}
            onValueChange={(value) => handleSelectChange("school_type_id", value)}
            disabled={isSubmitting}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="教室種別を選択" />
            </SelectTrigger>
            <SelectContent>
              {schoolTypes.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="name">
            教室名 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            maxLength={20}
            disabled={isSubmitting}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">最大20文字</p>
        </div>

        <div>
          <Label htmlFor="url">
            教室ウェブサイト
          </Label>
          <Input
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://example.com"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="area">
            教室エリア <span className="text-red-500">*</span>
          </Label>
          <Input
            id="area"
            name="area"
            value={formData.area}
            onChange={handleChange}
            placeholder="例：東京都渋谷区〜〜町"
            maxLength={20}
            disabled={isSubmitting}
            className={errors.area ? "border-red-500" : ""}
          />
          {errors.area && (
            <p className="text-red-500 text-sm mt-1">{errors.area}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">最大20文字</p>
        </div>

        <div>
          <Label htmlFor="description">
            教室詳細 <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="教室の特徴や指導方針、レッスン内容などを記入してください。"
            rows={10}
            maxLength={1000}
            disabled={isSubmitting}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            最大1000文字 / 現在: {formData.description.length}文字
          </p>
        </div>

        <div>
          <Label htmlFor="contact_email">
            問い合わせ用メールアドレス <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contact_email"
            name="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={handleChange}
            disabled={isSubmitting}
            className={errors.contact_email ? "border-red-500" : ""}
          />
          {errors.contact_email && (
            <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            このメールアドレスに問い合わせフォームからの内容が送信されます
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={isSubmitting}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "保存中..." : "保存する"}
        </Button>
      </div>
    </form>
  );
}
