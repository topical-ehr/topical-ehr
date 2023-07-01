import { Topic } from "./Topic";

export interface TopicContext {
    editing: boolean;
    topic: Topic;
}

export const TopicContext = React.createContext<TopicContext | null>(null);

export function useTopicContext() {
    return React.useContext(TopicContext)!; // !: assume TopicsContext is set to reduce null checks..
}
