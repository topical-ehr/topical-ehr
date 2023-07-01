import { useTopicContext } from "../TopicContext";
import css from "./TitleView.module.scss";

import cubesIcon from "/icons/cubes-Gnome-fs-blockdev.svg";
import heartIcon from "/icons/anatomical-heart-noto-emoji.svg";

interface Props {
    chooseIcon?: (title: string) => string;
}

export function TitleView(props: Props) {
    const context = useTopicContext();
    const { composition } = context.topic;

    if (context.editing) {
        return null;
    }

    const chooseIcon = props.chooseIcon ?? defaultChooseIcon;

    return (
        <div
            className={css.title}
            title={`Topic: ${composition.title}`}
        >
            <img src={chooseIcon(composition.title)} />
            <h2>{composition.title || "(no title)"}</h2>
        </div>
    );
}

function defaultChooseIcon(title: string) {
    if (title.match(/heart|cardio/i)) {
        return heartIcon;
    } else {
        return cubesIcon;
    }
}
