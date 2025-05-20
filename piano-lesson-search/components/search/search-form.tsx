"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SearchForm() {
  const router = useRouter();
  const [keywords, setKeywords] = useState<string[]>(["", "", ""]);
  const [area, setArea] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleKeywordChange = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const handleReset = () => {
    setKeywords(["", "", ""]);
    setArea("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // 空のキーワードを除外
    const filteredKeywords = keywords.filter(keyword => keyword.trim() !== "");
    
    // URLパラメータを作成
    const queryParams = new URLSearchParams();
    filteredKeywords.forEach((keyword, index) => {
      queryParams.append(`keyword${index + 1}`, keyword);
    });
    
    if (area.trim()) {
      queryParams.append("area", area);
    }
    
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
              placeholder={index === 0 ? "例: ピアノ教室 初心者" : index === 1 ? "例: 子供向け 個人レッスン" : "例: 駅近 グループレッスン"}
              className="flex-1"
              maxLength={50}
              aria-label={`検索キーワード ${index + 1}`}
            />
          </div>
        ))}
        
        <div className="flex items-center">
          <label className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">
            エリア:
          </label>
          <Input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="例: 東京都渋谷区 または 横浜市"
            className="flex-1"
            maxLength={50}
            aria-label="エリア"
          />
        </div>
      </div>
      
      <div className="flex justify-center gap-4 mt-6">
        <Button 
          type="submit" 
          className="w-full sm:w-auto px-8 py-2"
          disabled={isSearching}
        >
          {isSearching ? "検索中..." : "検索する"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="w-full sm:w-auto px-8 py-2"
        >
          リセット
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        ※ キーワードとエリアを組み合わせて検索できます。キーワードを複数入力すると、すべてに一致する教室が検索されます。
      </p>
    </form>
  );
}
