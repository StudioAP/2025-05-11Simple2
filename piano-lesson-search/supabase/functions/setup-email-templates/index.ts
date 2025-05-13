import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// メールテンプレート設定用のEdge Function
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // CORSプリフライトリクエストの処理
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // リクエストからAPIキーを取得
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "認証ヘッダーがありません" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // APIキーの検証
    const apiKey = req.headers.get("Authorization")?.replace("Bearer ", "");
    // @ts-ignore Deno global is not recognized in local TS check
    if (apiKey !== Deno.env.get("CRON_SECRET_TOKEN")) {
      return new Response(
        JSON.stringify({ error: "無効なAPIキーです" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Supabaseクライアントの初期化
    const supabaseAdmin = createClient(
      // @ts-ignore Deno global is not recognized in local TS check
      Deno.env.get("SUPABASE_URL") ?? "",
      // @ts-ignore Deno global is not recognized in local TS check
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // メール確認テンプレート
    const confirmationTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>メールアドレス確認 | ピアノ・リトミック教室検索サイト</title>
  <style type="text/css">
    html,
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      color: #333;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      background-color: #f0f9ff;
      border-radius: 8px 8px 0 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .content {
      background-color: #fff;
      padding: 30px;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    .button {
      background-color: #4f46e5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      display: inline-block;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .logo {
      font-weight: bold;
      font-size: 24px;
      color: #333;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="logo">ピアノ・リトミック教室検索サイト</span>
    </div>
    <div class="content">
      <h2>メールアドレスの確認</h2>
      <p>こんにちは、</p>
      <p>ピアノ・リトミック教室検索サイトのご登録ありがとうございます。以下のボタンをクリックして、メールアドレスの確認を完了してください。</p>
      <p style="text-align: center;">
        <a class="button" href="{{ .ConfirmationURL }}">メールアドレスを確認する</a>
      </p>
      <p>もし上記のボタンがクリックできない場合は、以下のURLをブラウザにコピー＆ペーストしてください。</p>
      <p style="word-break: break-all;">{{ .ConfirmationURL }}</p>
      <p>このメールに心当たりがない場合は、無視していただいて問題ありません。</p>
      <p>よろしくお願いいたします。</p>
      <p>ピアノ・リトミック教室検索サイト 運営チーム</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 ピアノ・リトミック教室検索サイト All rights reserved.</p>
      <p>このメールは自動送信されています。返信しないでください。</p>
    </div>
  </div>
</body>
</html>
    `;

    // パスワードリセットテンプレート
    const resetPasswordTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>パスワードリセット | ピアノ・リトミック教室検索サイト</title>
  <style type="text/css">
    html,
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      color: #333;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      background-color: #f0f9ff;
      border-radius: 8px 8px 0 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .content {
      background-color: #fff;
      padding: 30px;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    .button {
      background-color: #4f46e5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      display: inline-block;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .logo {
      font-weight: bold;
      font-size: 24px;
      color: #333;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="logo">ピアノ・リトミック教室検索サイト</span>
    </div>
    <div class="content">
      <h2>パスワードのリセット</h2>
      <p>こんにちは、</p>
      <p>ピアノ・リトミック教室検索サイトのパスワードリセットのリクエストを受け付けました。以下のボタンをクリックして、新しいパスワードを設定してください。</p>
      <p style="text-align: center;">
        <a class="button" href="{{ .ConfirmationURL }}">パスワードをリセット</a>
      </p>
      <p>もし上記のボタンがクリックできない場合は、以下のURLをブラウザにコピー＆ペーストしてください。</p>
      <p style="word-break: break-all;">{{ .ConfirmationURL }}</p>
      <p>このメールに心当たりがない場合は、無視していただいて問題ありません。あなたのアカウントは安全です。</p>
      <p>よろしくお願いいたします。</p>
      <p>ピアノ・リトミック教室検索サイト 運営チーム</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 ピアノ・リトミック教室検索サイト All rights reserved.</p>
      <p>このメールは自動送信されています。返信しないでください。</p>
    </div>
  </div>
</body>
</html>
    `;

    // メール設定の更新
    const authConfig = {
      email_template_confirmation: confirmationTemplate,
      email_template_reset_password: resetPasswordTemplate,
      email_confirm_change_email: true,
      email_confirm_delete: true,
      mailer_autoconfirm: false,
      sms_autoconfirm: false,
    };

    // @ts-ignore supabase-js v2 の型定義と実際のAPIの間に不一致がある可能性があるため、一時的に無視
    const { error: updateError } = await supabaseAdmin.auth.admin.update({ config: authConfig });

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, message: "メールテンプレートが正常に設定されました" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("エラー:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "メールテンプレート設定中に不明なエラーが発生しました" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
