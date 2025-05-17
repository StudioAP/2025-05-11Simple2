import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    // リクエストボディからデータを取得
    const body = await request.json();
    const { name, email, phone, message, schoolId, schoolName, recipientEmail } = body;

    // 必須フィールドの検証
    if (!name || !email || !message || !schoolId || !schoolName || !recipientEmail) {
      return NextResponse.json(
        { error: "必須フィールドが不足しています" },
        { status: 400 }
      );
    }

    // Supabaseクライアントを初期化
    const supabase = await createClient();

    // ユーザー認証情報を取得（オプション - 認証済みユーザーのみ問い合わせを許可する場合）
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 問い合わせ履歴をデータベースに保存
    const { error: dbError } = await supabase.from("contact_messages").insert({
      school_id: schoolId,
      name,
      email,
      phone: phone || null,
      message,
      user_id: user?.id || null,
    });

    if (dbError) {
      console.error("問い合わせ保存エラー:", dbError);
      // データベース保存に失敗してもメール送信は続行
    }

    // メール送信設定
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // 教室オーナー宛てのメール
    const ownerMailOptions = {
      from: `"ピアノ・リトミック教室検索" <${process.env.SMTP_FROM}>`,
      to: recipientEmail,
      subject: `【ピアノ・リトミック教室検索】${schoolName}へのお問い合わせ`,
      text: `
${schoolName} 様

ピアノ・リトミック教室検索サイトより、以下のお問い合わせがありました。

■ お名前
${name}

■ メールアドレス
${email}

■ 電話番号
${phone || "未入力"}

■ お問い合わせ内容
${message}

※このメールは自動送信されています。このメールに返信せず、お問い合わせ者のメールアドレスに直接ご返信ください。
`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: sans-serif; padding: 20px; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px; padding: 20px;">
    <h2 style="color: #4a6cf7; margin-top: 0;">ピアノ・リトミック教室検索 - お問い合わせ通知</h2>
    
    <p>${schoolName} 様</p>
    
    <p>ピアノ・リトミック教室検索サイトより、以下のお問い合わせがありました。</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd; width: 30%;">お名前</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${name}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">メールアドレス</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><a href="mailto:${email}" style="color: #4a6cf7;">${email}</a></td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">電話番号</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${phone || "未入力"}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">お問い合わせ内容</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; white-space: pre-line;">${message}</td>
      </tr>
    </table>
    
    <p style="font-size: 12px; color: #666; margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee;">
      ※このメールは自動送信されています。このメールに返信せず、お問い合わせ者のメールアドレスに直接ご返信ください。
    </p>
  </div>
</body>
</html>
`,
    };

    // 問い合わせ者宛ての自動返信メール
    const userMailOptions = {
      from: `"ピアノ・リトミック教室検索" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: `【ピアノ・リトミック教室検索】${schoolName}へのお問い合わせを受け付けました`,
      text: `
${name} 様

ピアノ・リトミック教室検索サイトをご利用いただき、ありがとうございます。
以下の内容でお問い合わせを受け付けました。

■ お問い合わせ先
${schoolName}

■ お問い合わせ内容
${message}

教室からの返信をお待ちください。
なお、しばらく経っても返信がない場合は、教室に直接お問い合わせいただくことをおすすめします。

※このメールは自動送信されています。このメールには返信できません。
`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: sans-serif; padding: 20px; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px; padding: 20px;">
    <h2 style="color: #4a6cf7; margin-top: 0;">ピアノ・リトミック教室検索 - お問い合わせ受付</h2>
    
    <p>${name} 様</p>
    
    <p>ピアノ・リトミック教室検索サイトをご利用いただき、ありがとうございます。<br>
    以下の内容でお問い合わせを受け付けました。</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd; width: 30%;">お問い合わせ先</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${schoolName}</td>
      </tr>
      <tr>
        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">お問い合わせ内容</th>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; white-space: pre-line;">${message}</td>
      </tr>
    </table>
    
    <p>教室からの返信をお待ちください。<br>
    なお、しばらく経っても返信がない場合は、教室に直接お問い合わせいただくことをおすすめします。</p>
    
    <p style="font-size: 12px; color: #666; margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee;">
      ※このメールは自動送信されています。このメールには返信できません。
    </p>
  </div>
</body>
</html>
`,
    };

    // メール送信
    await Promise.all([
      transporter.sendMail(ownerMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("メール送信エラー:", error);
    const errorMessage = error instanceof Error ? error.message : "メール送信中にエラーが発生しました";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
