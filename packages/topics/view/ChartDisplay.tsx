import css from "./ChartDisplay.module.scss";

interface Props {
    loincCode: string;
}

export function ChartDisplay(props: Props) {
    return (
        <div className={css.item}>
            <ObservationDisplay
                item={items[0]}
                observationsByCode={observationsByCode}
            />
        </div>
    );
}
