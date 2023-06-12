import css from "./WarningTile.module.scss";

interface Props {
    text: string;

}

export function WarningTile(props: Props) {
   return (
       <div className={css.tile}>
            {props.text}
       </div>
   )
}