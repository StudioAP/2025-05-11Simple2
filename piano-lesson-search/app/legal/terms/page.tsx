import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '利用規約 | ピアノ・リトミック教室検索',
  description: 'ピアノ・リトミック教室検索サービスの利用規約です。サービスをご利用いただく前にお読みください。',
};

export default function TermsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">利用規約</h1>
      <p className="text-sm text-muted-foreground mb-8">最終更新日: 2025年5月15日</p>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. はじめに</h2>
        <p>
          本利用規約（以下「本規約」といいます）は、当社が提供するピアノ・リトミック教室検索サービス（以下「本サービス」といいます）の利用条件を定めるものです。
          本サービスを利用されるすべてのユーザー（以下「ユーザー」といいます）は、本規約に同意した上で本サービスをご利用いただくものとします。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. サービス内容</h2>
        <p>
          本サービスは、ピアノ教室およびリトミック教室の情報を掲載し、ユーザーが検索・閲覧・問い合わせを行うことができるウェブサイトです。
          教室運営者は教室情報を登録・編集し、月額料金を支払うことで情報を公開することができます。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. アカウント登録</h2>
        <p>
          3.1 教室情報を掲載するためには、アカウント登録が必要です。
        </p>
        <p>
          3.2 ユーザーは、真実、正確かつ完全な情報を当社に提供する必要があります。これらの情報に変更があった場合は、速やかに更新してください。
        </p>
        <p>
          3.3 アカウントの登録情報は、ユーザー自身の責任で管理してください。パスワードの漏洩、不正使用などによって生じた損害について、当社は一切の責任を負いません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. 教室情報の掲載</h2>
        <p>
          4.1 教室運営者は、月額500円（税込）を支払うことで、教室情報を本サービス上に掲載することができます。
        </p>
        <p>
          4.2 掲載される教室情報は、真実、正確かつ最新のものである必要があります。虚偽または誤解を招く情報の掲載は禁止されています。
        </p>
        <p>
          4.3 教室運営者は、自身が掲載する情報に関して、著作権、肖像権等の第三者の権利を侵害していないことを保証する必要があります。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. 料金と支払い</h2>
        <p>
          5.1 教室情報の掲載には、月額500円（税込）の料金が発生します。
        </p>
        <p>
          5.2 支払いはStripeを通じて処理され、クレジットカード決済のみ対応しています。
        </p>
        <p>
          5.3 料金は前払い制であり、サブスクリプションは自動更新されます。解約の意思表示がない限り、翌月も自動的に契約が更新されます。
        </p>
        <p>
          5.4 解約を希望する場合は、次回更新日の前日までに当サイト内のサブスクリプション管理ページから手続きを行ってください。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. 禁止事項</h2>
        <p>
          ユーザーは、以下の行為を行ってはならないものとします：
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>当社のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
          <li>本サービスの運営を妨害する行為</li>
          <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
          <li>他のユーザーに成りすます行為</li>
          <li>当社のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
          <li>その他、当社が不適切と判断する行為</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. サービスの変更・中断・終了</h2>
        <p>
          7.1 当社は、本サービスの内容を予告なく変更、追加または廃止することがあります。
        </p>
        <p>
          7.2 当社は、以下の事由により本サービスの提供を一時的に中断することがあります：
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>本サービスのシステムの保守点検または更新を行う場合</li>
          <li>地震、落雷、火災、停電、天災などの不可抗力により、本サービスの提供が困難となった場合</li>
          <li>コンピュータまたは通信回線等が事故により停止した場合</li>
          <li>その他、当社が本サービスの提供が困難と判断した場合</li>
        </ul>
        <p>
          7.3 当社は、本サービスの提供の終了、変更、中断によってユーザーに生じたいかなる損害についても、一切の責任を負いません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. 免責事項</h2>
        <p>
          8.1 当社は、本サービスに掲載された情報の正確性、完全性、有用性等について、いかなる保証も行いません。
        </p>
        <p>
          8.2 当社は、ユーザー間または教室運営者とその顧客との間で生じた紛争について、一切の責任を負いません。
        </p>
        <p>
          8.3 当社は、本サービスの利用によって生じた損害について、一切の責任を負いません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. 知的財産権</h2>
        <p>
          9.1 本サービスに関する著作権、商標権等の知的財産権は、当社または正当な権利者に帰属します。
        </p>
        <p>
          9.2 ユーザーは、教室運営者が投稿したコンテンツを除き、当社の許可なく本サービスの内容を複製、転載、改変、販売等の二次利用することはできません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. 個人情報の取り扱い</h2>
        <p>
          本サービスにおける個人情報の取り扱いについては、当社のプライバシーポリシーによるものとします。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. 規約の変更</h2>
        <p>
          当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
          なお、本規約の変更後、本サービスの利用を継続した場合には、変更後の規約に同意したものとみなします。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">12. 準拠法・裁判管轄</h2>
        <p>
          本規約の解釈にあたっては、日本法を準拠法とします。
          本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
        </p>
      </section>

      <div className="border-t pt-8 mt-12">
        <p className="text-sm text-muted-foreground">
          お問い合わせ先：info@piano-ritomikku-search.example.com
        </p>
      </div>
    </div>
  );
} 