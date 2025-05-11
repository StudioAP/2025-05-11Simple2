"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchForm() {
  const router = useRouter();
  const [keywords, setKeywords] = useState<string[]>(["", "", ""]);
  const [isSearching, setIsSearching] = useState(false);

  const handleKeywordChange = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // 空のキーワードを除外
    const filteredKeywords = keywords.filter(keyword => keyword.trim() !== "");
    
    if (filteredKeywords.length === 0) {
      setIsSearching(false);
      return;
    }
    
    // URLパラメータを作成
    const queryParams = new URLSearchParams();
    filteredKeywords.forEach((keyword, index) => {
      queryParams.append(`keyword${index + 1}`, keyword);
    });
    
    // 検索結果ページに遷移
    router.push(`/search?${queryParams.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="space-y-3">
        {keywords.map((keyword, index) => (
          <div key={index} className="flex items-center">
            <label className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">
              キーワード {index + 1}:
            </label>
            <Input
              type="text"
              value={keyword}
              onChange={(e) => handleKeywordChange(index, e.target.value)}
              placeholder={`検索キーワード ${index + 1}`}
              className="flex-1"
              maxLength={50}
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-6">
        <Button 
          type="submit" 
          className="w-full sm:w-auto px-8 py-2"
          disabled={isSearching}
        >
          {isSearching ? "検索中..." : "検索する"}
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        ※ 最大3つのキーワードで検索できます。キーワードを複数入力すると、すべてに一致する教室が検索されます。
      </p>
    </form>
  );
}
