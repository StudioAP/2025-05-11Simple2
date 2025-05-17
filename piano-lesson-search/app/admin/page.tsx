import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreditCard, Users, AlertCircle, CheckCircle, XCircle, ArrowRight } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  // サブスクリプション統計情報を取得
  const { data: subscriptionStats } = await supabase
    .from("subscriptions")
    .select("status")
    .order("updated_at", { ascending: false });
  
  // 教室情報を取得
  const { data: schoolStats } = await supabase
    .from("schools")
    .select("is_published");
  
  // ユーザー数を取得
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  
  // 期限切れサブスクリプション数を取得
  const now = new Date().toISOString();
  const { count: overdueCount } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .in("status", ["past_due", "unpaid"])
    .lt("current_period_end", now);
  
  // 統計情報を計算
  const activeSubscriptions = subscriptionStats?.filter(sub => sub.status === "active").length || 0;
  const pastDueSubscriptions = subscriptionStats?.filter(sub => sub.status === "past_due").length || 0;
  const canceledSubscriptions = subscriptionStats?.filter(sub => sub.status === "canceled").length || 0;
  
  const publishedSchools = schoolStats?.filter(school => school.is_published).length || 0;
  const unpublishedSchools = schoolStats?.filter(school => !school.is_published).length || 0;
  
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">管理者ダッシュボード</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>アクティブなサブスクリプション</CardDescription>
            <CardTitle className="text-3xl">{activeSubscriptions}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">公開中の教室: {publishedSchools}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>支払い遅延</CardDescription>
            <CardTitle className="text-3xl">{pastDueSubscriptions}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center text-amber-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">期限切れ: {overdueCount || 0}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>キャンセル済み</CardDescription>
            <CardTitle className="text-3xl">{canceledSubscriptions}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center text-gray-600">
              <XCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">非公開の教室: {unpublishedSchools}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>登録ユーザー数</CardDescription>
            <CardTitle className="text-3xl">{userCount || 0}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center text-blue-600">
              <Users className="h-4 w-4 mr-2" />
              <span className="text-sm">総ユーザー数</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>サブスクリプション管理</CardTitle>
            <CardDescription>
              サブスクリプションの状態を確認・管理します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  <span>すべてのサブスクリプション</span>
                </div>
                <span className="text-gray-500">{subscriptionStats?.length || 0}件</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
                  <span>期限切れサブスクリプション</span>
                </div>
                <span className="text-gray-500">{overdueCount || 0}件</span>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <Link href="/admin/subscriptions">
                  <Button variant="outline" className="w-full">
                    サブスクリプション管理へ
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>最近の期限切れサブスクリプション</CardTitle>
            <CardDescription>
              支払い遅延または期限切れのサブスクリプション
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overdueCount === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>期限切れのサブスクリプションはありません</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-amber-600 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {overdueCount}件の期限切れサブスクリプションがあります
                </p>
                
                <div className="border-t pt-4 mt-4">
                  <Link href="/admin/subscriptions?tab=overdue">
                    <Button variant="destructive" className="w-full">
                      期限切れサブスクリプションを管理
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
