import css from "./DocumentTile.module.scss";

interface Props {
    date: string;
    title: string;

}

export function DocumentTile(props: Props) {
    function onClick() {

    }
   return (
       <div className={css.tile}>
            <div className={css.date}>{props.date}</div>
            <a
                onClick={onClick}
                className={css.title}
                href="/123"
            >
                {props.title}
            </a>
       </div>
   )
}