import DOMPurify from "dompurify";

import { useTopicContext } from "../TopicContext";
import css from "./SummaryView.module.scss";

interface Props {}

export function SummaryView(props: Props) {
    const context = useTopicContext();

    if (context.editing) {
        return null;
    }

    const { composition } = context.topic;
    const html = composition?.section?.[0].text?.div ?? "";

    return (
        <div
            className={css.summary}
            dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }),
            }}
        />
    );
}
