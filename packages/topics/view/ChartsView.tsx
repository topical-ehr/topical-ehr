import { useTopicContext } from "../TopicContext";
import { ChartDisplay } from "./ChartDisplay";

interface Props {}

export function ChartsView(props: Props) {
    const context = useTopicContext();
    const { composition } = context.topic;

    return (
        <div title="Relevant graphs">
            {composition?.title.match(/diabetes|T[12]DM/i) && <ChartDisplay loincCode="4548-4" />}
        </div>
    );
}
