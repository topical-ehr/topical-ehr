import css from "./Logo.module.scss";

export function Logo() {
  return (
    <a href="/" class={css.container}>
      <b>Next-EHR</b>
      <span> 0.0.1</span>
    </a>
  );
}
