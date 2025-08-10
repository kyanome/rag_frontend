/**
 * チャットページ
 */

'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { ChatContainer } from '@/components/chat/ChatContainer';

export default function ChatPage() {
  return (
    <AuthGuard>
      <div className="h-screen flex flex-col">
        <ChatContainer className="flex-1" />
      </div>
    </AuthGuard>
  );
}