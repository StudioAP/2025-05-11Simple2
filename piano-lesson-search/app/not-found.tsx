import { PageError } from "@/components/ui/error/page-error";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto py-16 px-4">
      <PageError
        title="ページが見つかりません"
        message="お探しのページは存在しないか、削除された可能性があります。"
      />
      <div className="flex justify-center mt-6">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
        >
          トップページに戻る
        </Link>
      </div>
    </div>
  );
} 