import React from "react";
import { Topic } from "./Topic";

export interface TopicContextData {
    editing: boolean;
    topic: Topic;
}

export const TopicContext = React.createContext<TopicContextData | null>(null);

export function useTopicContext() {
    return React.useContext(TopicContext)!; // !: assume TopicsContext is set to reduce null checks..
}
