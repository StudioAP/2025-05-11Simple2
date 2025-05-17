import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | ピアノ・リトミック教室検索',
  description: 'ピアノ・リトミック教室検索サービスのプライバシーポリシーです。当サイトにおける個人情報の取り扱いについて説明しています。',
};

export default function PrivacyPolicyPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">プライバシーポリシー</h1>
      <p className="text-sm text-muted-foreground mb-8">最終更新日: 2025年5月15日</p>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. はじめに</h2>
        <p>
          ピアノ・リトミック教室検索サービス（以下「当社」または「当サービス」といいます）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。
          本プライバシーポリシーは、当サービスにおける個人情報の収集、使用、保護に関する方針を説明するものです。
          当サービスをご利用いただくことにより、本プライバシーポリシーに同意いただいたものとみなします。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. 収集する情報</h2>
        <p>
          当サービスでは、以下の情報を収集することがあります：
        </p>
        <h3 className="text-xl font-medium my-3">2.1 アカウント情報</h3>
        <p>
          当サービスにアカウントを作成する際に、氏名、メールアドレス、パスワードなどの情報をお尋ねすることがあります。
        </p>
        <h3 className="text-xl font-medium my-3">2.2 教室情報</h3>
        <p>
          教室運営者は、教室名、所在地、連絡先情報、サービス内容等の教室に関する情報を提供していただくことがあります。
        </p>
        <h3 className="text-xl font-medium my-3">2.3 支払い情報</h3>
        <p>
          教室情報の掲載のためには、クレジットカード情報等の支払い情報を提供していただく必要があります。
          クレジットカード情報は、Stripeを通じて安全に処理され、当社のサーバーには保存されません。
        </p>
        <h3 className="text-xl font-medium my-3">2.4 利用情報</h3>
        <p>
          当サービスでは、ユーザーの行動や利用パターンに関する情報を収集することがあります。
          これには、アクセスしたページ、検索したキーワード、サービスの利用時間等が含まれます。
        </p>
        <h3 className="text-xl font-medium my-3">2.5 デバイス情報</h3>
        <p>
          当サービスにアクセスする際に使用しているデバイスの情報（IPアドレス、ブラウザの種類、言語設定等）を収集することがあります。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. 情報の利用目的</h2>
        <p>
          収集した情報は、以下の目的で利用します：
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>アカウントの作成・管理</li>
          <li>サービスの提供・維持・改善</li>
          <li>ユーザーからの問い合わせへの対応</li>
          <li>サービスに関する重要なお知らせの送信</li>
          <li>不正行為の防止・検出</li>
          <li>法的義務の遵守</li>
          <li>マーケティングや統計的分析（ただし、個人を特定しない形で行います）</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. 情報の共有</h2>
        <p>
          当社は、以下の場合を除き、ユーザーの個人情報を第三者と共有することはありません：
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>ユーザーの同意がある場合</li>
          <li>サービス提供のために必要なパートナー（Stripe等の決済サービス提供者）との共有</li>
          <li>法的要請に応じる必要がある場合</li>
          <li>当社の権利、財産、安全を保護するために必要な場合</li>
          <li>事業の合併、買収、資産の売却があった場合（ただし、個人情報の取り扱いに変更がある場合は通知します）</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Cookieの使用</h2>
        <p>
          当サービスでは、ユーザー体験の向上や統計情報の収集のためにCookieを使用しています。
          Cookieとは、ウェブサイトがユーザーのコンピュータに保存する小さなテキストファイルです。
          ほとんどのブラウザではCookieを無効にすることができますが、その場合、当サービスの一部の機能が正常に動作しなくなる可能性があります。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. 情報の保護</h2>
        <p>
          当社は、ユーザーの個人情報を不正アクセス、改ざん、漏洩、破損から保護するために、適切な物理的、技術的、管理的措置を講じています。
          ただし、インターネット上のデータ送信は完全に安全であることを保証することはできません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. 情報の保持期間</h2>
        <p>
          当社は、サービス提供に必要な期間、または法的義務を遵守するために必要な期間、ユーザーの個人情報を保持します。
          不要となった個人情報は、適切に削除または匿名化されます。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. ユーザーの権利</h2>
        <p>
          ユーザーには、以下の権利があります：
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>個人情報へのアクセス権</li>
          <li>個人情報の訂正・更新権</li>
          <li>個人情報の削除権（一部の例外あり）</li>
          <li>個人情報の処理の制限権</li>
          <li>個人情報の可搬性の権利</li>
          <li>同意を撤回する権利</li>
        </ul>
        <p className="mt-4">
          これらの権利を行使したい場合は、下記のお問い合わせ先までご連絡ください。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. 子どものプライバシー</h2>
        <p>
          当サービスは、16歳未満の子どもを対象としていません。
          当社が16歳未満の子どもから個人情報を収集していることが判明した場合、できるだけ速やかにその情報を削除します。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. 国際データ転送</h2>
        <p>
          当社は日本を拠点としていますが、収集した情報が国外に転送、処理、保存される場合があります。
          その場合でも、本プライバシーポリシーに従って適切な保護措置を講じます。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. プライバシーポリシーの変更</h2>
        <p>
          当社は、必要に応じて本プライバシーポリシーを変更することがあります。
          重要な変更がある場合は、サービス上での通知やメールでお知らせします。
          ポリシー変更後も当サービスを継続して利用することにより、変更後のポリシーに同意したものとみなします。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. お問い合わせ</h2>
        <p>
          本プライバシーポリシーに関するご質問、ご意見、お問い合わせは、以下の連絡先までお願いいたします。
        </p>
        <p className="mt-4">
          メールアドレス：info@piano-ritomikku-search.example.com
        </p>
      </section>

      <div className="border-t pt-8 mt-12">
        <p className="text-sm text-muted-foreground">
          本プライバシーポリシーは、日本の法律に準拠するものとします。
        </p>
      </div>
    </div>
  );
} 