import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/auth-options";
import { MessagesClient } from "@/components/messages/messages-client";
import { getConversations, getMessageableUsers } from "@/actions/messages";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect("/signin");
  }

  const [conversationsResult, messageableUsersResult] = await Promise.all([
    getConversations(),
    getMessageableUsers(),
  ]);

  const conversations = conversationsResult.success && conversationsResult.data 
    ? conversationsResult.data.conversations 
    : [];

  const messageableUsers = messageableUsersResult.success && messageableUsersResult.data
    ? messageableUsersResult.data.users
    : [];

  return (
    <MessagesClient
      initialConversations={conversations}
      currentUserId={session.user.id}
      messageableUsers={messageableUsers}
      currentUserRole={session.user.role || 'STUDENT'}
    />
  );
}
