/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="next/image-types/global" />

declare module "*.svg" {
    const content: any;
    export default content;
}

// Preact supports "class" instead of "className"
declare namespace React {
    interface HTMLAttributes<T> {
        class?: string;
    }
}
