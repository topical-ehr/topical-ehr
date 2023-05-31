import DOMPurify from "dompurify";
import { HoverButtonEdit, HoverButtons } from "../editing/HoverButtons";
import { Topic } from "../../utils/TopicGroup";
import { useAppDispatch } from "../../redux/store";
import { actions } from "../../redux/FhirState";
import css from "./TopicDisplay.module.scss";

import cubesIcon from "/icons/cubes-Gnome-fs-blockdev.svg";
import heartIcon from "/icons/anatomical-heart-noto-emoji.svg";
import { PrescriptionDisplay } from "./PrescriptionDisplay";
import { ChartDisplay } from "./ChartDisplay";

interface Props {
    topic: Topic;
}

export function TopicDisplay(props: Props) {
    const dispatch = useAppDispatch();

    function onContainerClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.ctrlKey) {
            alert(JSON.stringify(props.topic, null, 2));
        }
    }

    function onEdit() {
        dispatch(actions.editTopic(props.topic));
    }

    function chooseIcon() {
        if (composition?.title.match(/heart|cardio/i)) {
            return heartIcon;
        } else {
            return cubesIcon;
        }
    }

    const { composition } = props.topic;
    const html = composition?.section?.[0].text?.div ?? "";

    return (
        <div className={css.container} onClick={onContainerClick} onDoubleClick={onEdit}>
            <HoverButtons>
                <HoverButtonEdit onClick={onEdit} />
            </HoverButtons>

            {composition?.title && (
                <div className={css.title} title={`Topic: ${composition.title}`}>
                    <img src={chooseIcon()} />
                    <h2>{composition.title}</h2>
                </div>
            )}

            <div
                className={css.summary}
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }),
                }}
            />

            Not on ACE inhibitor

            {/* {props.topic.conditions.map((c) => (
                <ConditionDisplay key={c.id} condition={c} />
            ))} */}
            {props.topic.prescriptions.map((p) => (
                <PrescriptionDisplay key={p.id} prescription={p} />
            ))}
            
            {composition?.title.match(/diabetes|T[12]DM/i) && 
                <ChartDisplay loincCode="4548-4" />
            }
        </div>
    );
}
