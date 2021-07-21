// Preact supports using "class" instead of "classname"
declare namespace React {
  interface HTMLAttributes<T> {
    class?: string;
  }
}
