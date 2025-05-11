"use client";

import { useState } from "react";
import { Mail, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type Contact = {
  id: string;
  school_id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

type ContactListProps = {
  contacts: Contact[];
};

export function ContactList({ contacts }: ContactListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // メッセージの展開・折りたたみを切り替え
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (contacts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        問い合わせはまだありません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{contact.name}</h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(contact.created_at)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpand(contact.id)}
                aria-label={expandedId === contact.id ? "折りたたむ" : "展開する"}
              >
                {expandedId === contact.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {expandedId === contact.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  問い合わせ内容
                </h4>
                <p className="whitespace-pre-line text-sm">{contact.message}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
