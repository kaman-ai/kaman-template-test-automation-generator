// A conversation with the template's agent, as the signed-in user.
import { AgentChat } from "../../components/AgentChat";
import { wiring } from "../../lib/kaman";

export default function ChatPage() {
  return <AgentChat title={wiring.chatTitle} tagline={wiring.tagline} suggestions={wiring.suggestions} />;
}
