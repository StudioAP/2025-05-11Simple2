"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react";

// サブスクリプションステータスに応じたバッジの色を取得
const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return { label: "有効", variant: "success" as const };
    case "past_due":
      return { label: "支払い遅延", variant: "warning" as const };
    case "canceled":
      return { label: "キャンセル済", variant: "destructive" as const };
    case "unpaid":
      return { label: "未払い", variant: "destructive" as const };
    default:
      return { label: status, variant: "default" as const };
  }
};

// 日付フォーマット
const formatDate = (dateString: string | null) => {
  if (!dateString) return "未設定";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 期限切れかどうかを判定
const isExpired = (dateString: string | null) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
};

interface School {
  id: string;
  name: string;
  is_published: boolean;
}

interface Profile {
  email: string;
}

interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
  profiles: Profile;
  schools: School;
}

interface SubscriptionManagementProps {
  initialSubscriptions: Subscription[];
}

export function SubscriptionManagement({ initialSubscriptions }: SubscriptionManagementProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  // フィルタリング
  useEffect(() => {
    let filtered = [...subscriptions];
    
    // 検索語でフィルタリング
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          sub.schools.name.toLowerCase().includes(term) ||
          sub.profiles.email.toLowerCase().includes(term) ||
          sub.stripe_customer_id?.toLowerCase().includes(term) ||
          sub.stripe_subscription_id?.toLowerCase().includes(term)
      );
    }
    
    // ステータスでフィルタリング
    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }
    
    // 公開状態でフィルタリング
    if (publishedFilter !== "all") {
      const isPublished = publishedFilter === "published";
      filtered = filtered.filter((sub) => sub.schools.is_published === isPublished);
    }
    
    setFilteredSubscriptions(filtered);
  }, [subscriptions, searchTerm, statusFilter, publishedFilter]);

  // サブスクリプション情報を更新
  const refreshSubscriptions = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          profiles:user_id (
            email
          ),
          schools!inner (
            id,
            name,
            is_published
          )
        `)
        .order("updated_at", { ascending: false })
        .limit(50);
      
      if (error) {
        throw error;
      }
      
      setSubscriptions(data || []);
      toast({
        title: "更新完了",
        description: "サブスクリプション情報を更新しました",
      });
    } catch (error: any) {
      console.error("サブスクリプション情報更新エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "サブスクリプション情報の更新に失敗しました",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 教室の公開状態を変更
  const updatePublishStatus = async (schoolId: string, isPublished: boolean) => {
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from("schools")
        .update({ is_published: isPublished })
        .eq("id", schoolId);
      
      if (error) {
        throw error;
      }
      
      // 更新成功後、サブスクリプション情報を更新
      setSubscriptions((prev) =>
        prev.map((sub) => {
          if (sub.schools.id === schoolId) {
            return {
              ...sub,
              schools: {
                ...sub.schools,
                is_published: isPublished,
              },
            };
          }
          return sub;
        })
      );
      
      toast({
        title: "更新完了",
        description: `教室を${isPublished ? "公開" : "非公開"}に設定しました`,
      });
      
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("公開状態更新エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "公開状態の更新に失敗しました",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // 未払いサブスクリプションを一括で非公開に設定
  const unpublishOverdueSubscriptions = async () => {
    if (!confirm("期限切れのすべての教室を非公開にしますか？")) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 期限切れのサブスクリプションを取得
      const overdueSubscriptions = subscriptions.filter(
        (sub) => 
          (sub.status === "past_due" || sub.status === "unpaid" || sub.status === "canceled") && 
          isExpired(sub.current_period_end) && 
          sub.schools.is_published
      );
      
      if (overdueSubscriptions.length === 0) {
        toast({
          title: "情報",
          description: "期限切れの公開中教室はありません",
        });
        setIsLoading(false);
        return;
      }
      
      // 各教室を非公開に設定
      const schoolIds = overdueSubscriptions.map((sub) => sub.schools.id);
      
      const { error } = await supabase
        .from("schools")
        .update({ is_published: false })
        .in("id", schoolIds);
      
      if (error) {
        throw error;
      }
      
      // 更新成功後、サブスクリプション情報を更新
      setSubscriptions((prev) =>
        prev.map((sub) => {
          if (schoolIds.includes(sub.schools.id)) {
            return {
              ...sub,
              schools: {
                ...sub.schools,
                is_published: false,
              },
            };
          }
          return sub;
        })
      );
      
      toast({
        title: "一括更新完了",
        description: `${schoolIds.length}件の教室を非公開に設定しました`,
      });
    } catch (error: any) {
      console.error("一括非公開設定エラー:", error);
      toast({
        variant: "destructive",
        title: "エラー",
        description: "一括非公開設定に失敗しました",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="教室名、メールアドレスで検索..."
            className="pl-9 w-full sm:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ステータスで絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのステータス</SelectItem>
              <SelectItem value="active">有効</SelectItem>
              <SelectItem value="past_due">支払い遅延</SelectItem>
              <SelectItem value="canceled">キャンセル済</SelectItem>
              <SelectItem value="unpaid">未払い</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={publishedFilter} onValueChange={setPublishedFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="公開状態で絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての公開状態</SelectItem>
              <SelectItem value="published">公開中</SelectItem>
              <SelectItem value="unpublished">非公開</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={refreshSubscriptions}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="overdue">期限切れ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>サブスクリプション一覧</CardTitle>
              <CardDescription>
                全{filteredSubscriptions.length}件のサブスクリプション
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>教室名</TableHead>
                      <TableHead>メールアドレス</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>次回更新日</TableHead>
                      <TableHead>公開状態</TableHead>
                      <TableHead>最終更新</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          該当するサブスクリプションがありません
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubscriptions.map((subscription) => {
                        const { label, variant } = getStatusBadge(subscription.status);
                        const expired = isExpired(subscription.current_period_end);
                        
                        return (
                          <TableRow key={subscription.id}>
                            <TableCell>{subscription.schools.name}</TableCell>
                            <TableCell>{subscription.profiles.email}</TableCell>
                            <TableCell>
                              <Badge variant={variant}>{label}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {formatDate(subscription.current_period_end)}
                                {expired && subscription.status !== "canceled" && (
                                  <AlertCircle className="h-4 w-4 text-amber-500 ml-2" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {subscription.schools.is_published ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  公開中
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                  非公開
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(subscription.updated_at)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedSubscription(subscription);
                                  setIsDialogOpen(true);
                                }}
                              >
                                詳細
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="overdue" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>期限切れサブスクリプション</CardTitle>
                  <CardDescription>
                    支払い遅延または期限切れのサブスクリプション
                  </CardDescription>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={unpublishOverdueSubscriptions}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  すべて非公開にする
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>教室名</TableHead>
                      <TableHead>メールアドレス</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>次回更新日</TableHead>
                      <TableHead>公開状態</TableHead>
                      <TableHead>最終更新</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const overdueSubscriptions = filteredSubscriptions.filter(
                        (sub) => 
                          (sub.status === "past_due" || sub.status === "unpaid" || sub.status === "canceled") && 
                          isExpired(sub.current_period_end)
                      );
                      
                      if (overdueSubscriptions.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              期限切れのサブスクリプションはありません
                            </TableCell>
                          </TableRow>
                        );
                      }
                      
                      return overdueSubscriptions.map((subscription) => {
                        const { label, variant } = getStatusBadge(subscription.status);
                        
                        return (
                          <TableRow key={subscription.id}>
                            <TableCell>{subscription.schools.name}</TableCell>
                            <TableCell>{subscription.profiles.email}</TableCell>
                            <TableCell>
                              <Badge variant={variant}>{label}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {formatDate(subscription.current_period_end)}
                                <AlertCircle className="h-4 w-4 text-amber-500 ml-2" />
                              </div>
                            </TableCell>
                            <TableCell>
                              {subscription.schools.is_published ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  公開中
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                  非公開
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(subscription.updated_at)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedSubscription(subscription);
                                  setIsDialogOpen(true);
                                }}
                              >
                                詳細
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      });
                    })()}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* 詳細ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>サブスクリプション詳細</DialogTitle>
            <DialogDescription>
              サブスクリプション情報と公開状態の管理
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">教室名</p>
                  <p className="font-medium">{selectedSubscription.schools.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">メールアドレス</p>
                  <p className="font-medium">{selectedSubscription.profiles.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ステータス</p>
                  <Badge variant={getStatusBadge(selectedSubscription.status).variant}>
                    {getStatusBadge(selectedSubscription.status).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">次回更新日</p>
                  <p className="font-medium">
                    {formatDate(selectedSubscription.current_period_end)}
                    {isExpired(selectedSubscription.current_period_end) && selectedSubscription.status !== "canceled" && (
                      <span className="text-amber-500 ml-2">（期限切れ）</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stripe顧客ID</p>
                  <p className="font-medium text-xs truncate">
                    {selectedSubscription.stripe_customer_id || "未設定"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stripeサブスクリプション</p>
                  <p className="font-medium text-xs truncate">
                    {selectedSubscription.stripe_subscription_id || "未設定"}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">公開状態</p>
                <div className="flex items-center justify-between">
                  <div>
                    {selectedSubscription.schools.is_published ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        公開中
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-600">
                        <XCircle className="h-4 w-4 mr-2" />
                        非公開
                      </div>
                    )}
                  </div>
                  <Button
                    variant={selectedSubscription.schools.is_published ? "destructive" : "default"}
                    size="sm"
                    onClick={() => updatePublishStatus(
                      selectedSubscription.schools.id,
                      !selectedSubscription.schools.is_published
                    )}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : selectedSubscription.schools.is_published ? (
                      <XCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {selectedSubscription.schools.is_published ? "非公開にする" : "公開する"}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDialogOpen(false)}
            >
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
