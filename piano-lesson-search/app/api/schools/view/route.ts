import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    // リクエストボディからスクールIDを取得
    const { schoolId } = await request.json();

    if (!schoolId) {
      return NextResponse.json(
        { error: '教室IDが必要です' },
        { status: 400 }
      );
    }

    // Supabaseクライアントを初期化
    const supabase = await createClient();

    // IPアドレスとユーザーエージェントを取得
    const headersList = headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // 閲覧データを記録
    const { error } = await supabase
      .from('school_views')
      .insert({
        school_id: schoolId,
        ip_address: ipAddress,
        user_agent: userAgent,
        viewed_at: new Date().toISOString(),
      });

    if (error) {
      console.error('閲覧データ記録エラー:', error);
      return NextResponse.json(
        { error: '閲覧データの記録に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('閲覧データ記録エラー:', error);
    return NextResponse.json(
      { error: error.message || '閲覧データの記録に失敗しました' },
      { status: 500 }
    );
  }
}
