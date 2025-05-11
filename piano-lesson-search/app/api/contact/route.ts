import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import nodemailer from 'nodemailer';

// メール送信用のトランスポーター設定
// 本番環境では環境変数から設定を読み込む
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASSWORD || 'password',
  },
});

export async function POST(request: Request) {
  try {
    // リクエストボディを取得
    const { schoolId, schoolName, contactEmail, name, email, message } = await request.json();

    // 必須パラメータのバリデーション
    if (!schoolId || !schoolName || !contactEmail || !name || !email || !message) {
      return NextResponse.json(
        { error: '必須パラメータが不足しています' },
        { status: 400 }
      );
    }

    // Supabaseクライアントを初期化
    const supabase = await createClient();

    // 問い合わせ記録をデータベースに保存
    const { error: contactError } = await supabase
      .from('school_contacts')
      .insert({
        school_id: schoolId,
        name,
        email,
        message,
        created_at: new Date().toISOString(),
      });

    if (contactError) {
      console.error('問い合わせ記録保存エラー:', contactError);
      // メール送信は続行
    }

    // 教室運営者向けメール本文
    const ownerMailText = `
${schoolName} 様

ウェブサイトからお問い合わせがありました。

■ お問い合わせ内容
お名前: ${name}
メールアドレス: ${email}
メッセージ:
${message}

※ このメールは自動送信されています。このメールに返信されても届きません。
お客様へは直接 ${email} 宛にご連絡ください。
    `;

    // 問い合わせ者向けメール本文
    const userMailText = `
${name} 様

${schoolName} へのお問い合わせありがとうございます。
以下の内容でお問い合わせを受け付けました。

■ お問い合わせ内容
お名前: ${name}
メールアドレス: ${email}
メッセージ:
${message}

教室の担当者から ${email} 宛にご連絡いたします。
しばらくお待ちください。

※ このメールは自動送信されています。このメールに返信されても届きません。
    `;

    // 教室運営者へメール送信
    await transporter.sendMail({
      from: `"ピアノ・リトミック教室検索サイト" <${process.env.SMTP_FROM || 'noreply@example.com'}>`,
      to: contactEmail,
      subject: `【お問い合わせ】${name}様からのお問い合わせ`,
      text: ownerMailText,
    });

    // 問い合わせ者へ自動返信
    await transporter.sendMail({
      from: `"ピアノ・リトミック教室検索サイト" <${process.env.SMTP_FROM || 'noreply@example.com'}>`,
      to: email,
      subject: `【自動返信】${schoolName}へのお問い合わせを受け付けました`,
      text: userMailText,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('メール送信エラー:', error);
    return NextResponse.json(
      { error: error.message || 'メール送信に失敗しました' },
      { status: 500 }
    );
  }
}
