export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt?: number;
};

export interface AttachConversationFieldProps {
  attachConversation: boolean;
  onAttachChange: (checked: boolean) => void;
  conversation: ConversationMessage[];
}
