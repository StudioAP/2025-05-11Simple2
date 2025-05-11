"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SchoolType = {
  id: number;
  name: string;
};

type Area = string;

type SortOption = {
  label: string;
  value: string;
};

const sortOptions: SortOption[] = [
  { label: "関連度順", value: "relevance" },
  { label: "新着順", value: "newest" },
  { label: "名前順 (A-Z)", value: "name_asc" },
  { label: "名前順 (Z-A)", value: "name_desc" },
];

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [schoolTypes, setSchoolTypes] = useState<SchoolType[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [isLoading, setIsLoading] = useState(true);

  // 現在のキーワードを取得
  const keywords: string[] = [];
  for (let i = 1; i <= 3; i++) {
    const keyword = searchParams.get(`keyword${i}`);
    if (keyword && keyword.trim() !== "") {
      keywords.push(keyword.trim());
    }
  }

  // URLパラメータから初期値を設定
  useEffect(() => {
    const typesParam = searchParams.get("types");
    const areasParam = searchParams.get("areas");
    const sortParam = searchParams.get("sort");

    if (typesParam) {
      setSelectedTypes(typesParam.split(",").map(Number));
    }
    
    if (areasParam) {
      setSelectedAreas(areasParam.split(","));
    }
    
    if (sortParam) {
      setSortBy(sortParam);
    }
  }, [searchParams]);

  // 教室タイプとエリアの選択肢を取得
  useEffect(() => {
    async function fetchFilterOptions() {
      setIsLoading(true);
      
      try {
        // 教室タイプを取得
        const { data: typeData } = await supabase
          .from("school_types")
          .select("id, name")
          .order("id");
          
        if (typeData) {
          setSchoolTypes(typeData);
        }
        
        // エリアの一覧を取得（公開されている教室から）
        const { data: schoolData } = await supabase
          .from("schools")
          .select("area")
          .eq("is_published", true)
          .order("area");
          
        if (schoolData) {
          // 重複を除去してユニークなエリアのリストを作成
          const uniqueAreas = Array.from(new Set(schoolData.map(s => s.area)));
          setAreas(uniqueAreas);
        }
      } catch (error) {
        console.error("フィルターオプション取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchFilterOptions();
  }, []);

  // フィルターを適用して検索
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    // キーワードを維持
    keywords.forEach((keyword, index) => {
      params.set(`keyword${index + 1}`, keyword);
    });
    
    // 選択された教室タイプがあれば追加
    if (selectedTypes.length > 0) {
      params.set("types", selectedTypes.join(","));
    }
    
    // 選択されたエリアがあれば追加
    if (selectedAreas.length > 0) {
      params.set("areas", selectedAreas.join(","));
    }
    
    // ソート順を追加
    params.set("sort", sortBy);
    
    // 検索ページに遷移
    router.push(`/search?${params.toString()}`);
  };

  // 教室タイプの選択を切り替え
  const toggleSchoolType = (typeId: number) => {
    setSelectedTypes(prev => 
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  // エリアの選択を切り替え
  const toggleArea = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  // フィルターをリセット
  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedAreas([]);
    setSortBy("relevance");
  };

  if (isLoading) {
    return <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">フィルターを読み込み中...</div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-6">
      <div>
        <h3 className="font-medium mb-3">教室タイプ</h3>
        <div className="space-y-2">
          {schoolTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`type-${type.id}`} 
                checked={selectedTypes.includes(type.id)}
                onCheckedChange={() => toggleSchoolType(type.id)}
              />
              <Label htmlFor={`type-${type.id}`} className="cursor-pointer">
                {type.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">エリア</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
          {areas.map((area) => (
            <div key={area} className="flex items-center space-x-2">
              <Checkbox 
                id={`area-${area}`} 
                checked={selectedAreas.includes(area)}
                onCheckedChange={() => toggleArea(area)}
              />
              <Label htmlFor={`area-${area}`} className="cursor-pointer">
                {area}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">並び替え</h3>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="並び替え" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button onClick={applyFilters} className="flex-1">
          フィルターを適用
        </Button>
        <Button variant="outline" onClick={resetFilters}>
          リセット
        </Button>
      </div>
    </div>
  );
}
