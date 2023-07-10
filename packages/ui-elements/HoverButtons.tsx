import React from "react";
import css from "./HoverButtons.module.scss";
import { FhirSVG } from "./FhirSVG";

interface ContainerProps {
    children: (JSX.Element | null | false)[] | JSX.Element | null | false;
}
interface ButtonProps {
    onClick: () => void;
}

export function HoverButtons(props: ContainerProps) {
    return (
        <div
            className={"hover-buttons " + css.grid}
            style={{ float: "right" }}
        >
            {props.children}
        </div>
    );
}

function IconButton(props: ButtonProps & { children: JSX.Element; title: string }) {
    function onClick(ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        props.onClick();
        ev.preventDefault();
        return false;
    }

    return (
        <a
            href="#"
            onClick={onClick}
            title={props.title}
            className={css.iconButton}
        >
            {props.children}
        </a>
    );
}

export function HoverButtonEdit(props: ButtonProps) {
    // THANKS TO https://uxwing.com/edit-round-line-icon/
    // https://react-svgr.com/playground/?expandProps=none
    return (
        <IconButton
            {...props}
            title="Edit (or double-click)"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 122.88 122.88"
                style={{ height: "1.5em", fill: "unset" }}
                xmlSpace="preserve"
            >
                <path d="M61.44 0c16.97 0 32.33 6.88 43.44 18 11.12 11.12 18 26.48 18 43.44 0 16.97-6.88 32.33-18 43.44-11.12 11.12-26.48 18-43.44 18S29.11 116 18 104.88C6.88 93.77 0 78.41 0 61.44S6.88 29.11 18 18C29.11 6.88 44.47 0 61.44 0zm15.61 36.16c-.6-.56-1.28-.85-2.05-.81-.77 0-1.45.3-2.01.9l-4.53 4.7L81.15 53.2l4.57-4.78c.56-.55.77-1.28.77-2.05 0-.77-.3-1.49-.85-2.01l-8.59-8.2zM53.31 82.11c-1.67.56-3.37 1.07-5.04 1.62-1.67.56-3.33 1.11-5.04 1.67-3.97 1.28-6.15 2.01-6.62 2.14-.47.13-.17-1.71.81-5.55l3.16-12.09.26-.27 12.47 12.48zm-7.86-17.28L65.04 44.5l12.68 12.21-19.8 20.59-12.47-12.47zm55.63-43.03C90.93 11.66 76.92 5.39 61.44 5.39S31.95 11.66 21.8 21.8C11.66 31.95 5.39 45.96 5.39 61.44s6.27 29.49 16.42 39.64c10.14 10.14 24.16 16.42 39.64 16.42s29.49-6.27 39.64-16.42c10.14-10.14 16.42-24.16 16.42-39.64-.02-15.48-6.29-29.49-16.43-39.64z" />
            </svg>
        </IconButton>
    );
}

export function HoverButtonDelete(props: ButtonProps) {
    // THANKS TO Google Noto Emoji wastebasket
    // https://icon-sets.iconify.design/noto/wastebasket/

    return (
        <IconButton
            {...props}
            title="Delete"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.5em"
                height="1.5em"
                viewBox="0 0 128 128"
            >
                <ellipse
                    cx="63.94"
                    cy="104.89"
                    fill="#B9E4EA"
                    rx="35"
                    ry="13.61"
                />
                <path
                    fill="#94D1E0"
                    d="M29.98 110.19c0-7.13 15.2-12.04 33.96-12.04s33.96 4.91 33.96 12.04s-15.2 13.53-33.96 13.53s-33.96-6.4-33.96-13.53z"
                />
                <linearGradient
                    id="notoWastebasket0"
                    x1="64.111"
                    x2="64.111"
                    y1="89.966"
                    y2="147.628"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop
                        offset="0"
                        stopColor="#82AFC1"
                    />
                    <stop
                        offset="1"
                        stopColor="#2F7889"
                    />
                </linearGradient>
                <path
                    fill="url(#notoWastebasket0)"
                    d="m108.51 32.83l-2.26 12.33l-6.61-6.61l3.44-3.44l-9.75 2.84l.6.6l-8.09 8.09l-6.54-6.54l-9.63.82l-5.72 5.72l-6.2-6.2l-8.96-.52l-6.72 6.72l-8.09-8.09l.83-.83l-9.36-1.98l2.81 2.81l-6.39 6.39l-2.24-12.34l-4.56-2.58l14.51 80.37C30.7 118.02 45.29 124 64.05 124s33.08-5.98 34.51-13.61l14.6-80.45l-4.65 2.89zm-24.45 77.7l-6.32-6.32l8.09-8.09l8.09 8.09l-4.72 4.72c-1.62.58-3.34 1.11-5.14 1.6zm-44.85-1.07l-5.25-5.25l8.09-8.09l8.09 8.09l-6.51 6.51c-1.54-.38-3.02-.81-4.42-1.26zm32.82-5.24l-8.09 8.09l-8.09-8.09l8.09-8.09l8.09 8.09zM66.8 93.27l8.09-8.09l8.09 8.09l-8.09 8.09l-8.09-8.09zm-13.81 8.09l-8.09-8.09l8.09-8.09l8.09 8.09l-8.09 8.09zm0 5.71l6.13 6.13c-3.65-.25-7.33-.75-10.84-1.43l4.71-4.7zm15.77 6.13l6.13-6.13l4.58 4.58c-3.48.74-7.11 1.29-10.71 1.55zm27.31-12.55l-7.38-7.38l8.09-8.09l1.8 1.8l-2.51 13.67zm4.6-25.08l-3.89 3.89l-8.09-8.09l8.09-8.09l5.19 5.19l-1.3 7.1zm-6.75 6.75l-8.09 8.09l-8.09-8.09l8.09-8.09l8.09 8.09zm-19.04-2.85l-8.09-8.09l8.09-8.09l8.09 8.09l-8.09 8.09zm-2.85 2.85l-8.09 8.09l-8.09-8.09l8.09-8.09l8.09 8.09zm-19.04-2.85l-8.09-8.09l8.09-8.09l8.09 8.09l-8.09 8.09zm-2.86 2.85l-8.09 8.09l-8.09-8.09l8.09-8.09l8.09 8.09zM31.1 79.47l-3.72-3.72l-1.33-7.4l5.05-5.05l8.09 8.09l-8.09 8.08zm0 5.71l8.09 8.09l-7.35 7.35l-2.46-13.72l1.72-1.72zm71.75-21.53l-3.22-3.22l4.67-4.67l-1.45 7.89zM96.78 41.4l8.09 8.09l-8.09 8.09l-8.09-8.09l8.09-8.09zM85.83 52.34l8.09 8.09l-8.09 8.09l-8.09-8.09l8.09-8.09zM74.88 41.4l8.09 8.09l-8.09 8.09l-8.09-8.09l8.09-8.09zm-2.85 19.03l-8.09 8.09l-8.09-8.09l8.09-8.09l8.09 8.09zM52.99 41.4l8.09 8.09l-8.09 8.09l-8.09-8.09l8.09-8.09zm-2.86 19.03l-8.09 8.09l-8.09-8.09l8.09-8.09l8.09 8.09zM31.1 41.4l8.09 8.09l-8.09 8.09l-8.09-8.09l8.09-8.09zm-2.86 19.03l-3.06 3.06l-1.34-7.47l4.4 4.41z"
                />
                <radialGradient
                    id="notoWastebasket1"
                    cx="65.53"
                    cy="12.998"
                    r="52.279"
                    gradientTransform="matrix(1 0 0 .4505 0 7.142)"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop
                        offset=".722"
                        stopColor="#94D1E0"
                    />
                    <stop
                        offset="1"
                        stopColor="#94D1E0"
                        stopOpacity="0"
                    />
                </radialGradient>
                <path
                    fill="url(#notoWastebasket1)"
                    d="m107.47 24.48l-8.06-8.06l2.29-2.29c-1.08-.97-3.87-1.84-3.87-1.84l-1.27 1.27l-2.07-2.07c-4.25-1.51-7.07-1.35-7.07-1.35l6.28 6.28l-8.09 8.09l-8.09-8.09l6.66-6.66c-2.61-.8-5.06-.66-5.06-.66l-4.46 4.46l-5.16-5.15l-5.57.15l7.86 7.86l-8.09 8.09l-8.09-8.09l7.88-7.88l-5.94.22l-4.8 4.8l-4.72-4.72l-5.03.67l6.91 6.91l-8.09 8.09l-8.09-8.09l6.31-6.31s-5.64.76-7.28 1.56l-1.89 1.89l-1.18-1.18s-2.25.34-4.09 1.63l2.41 2.41l-7.24 7.24s.42 1.65 2.81 2.9l7.29-7.29l8.09 8.09l-4.22 4.22s2.74 1.55 4.75.97l2.33-2.33l5.87 5.87l9.87.29l6.15-6.15l5.98 5.98l10.29-.36l5.62-5.62l2.5 2.5c2.67.26 4.81-.9 4.81-.9l-4.45-4.45l8.09-8.09l8.09 8.09c0-.01 2.48-1.52 2.83-2.9zm-54.7 10.98l-8.09-8.09l8.09-8.09l8.09 8.09l-8.09 8.09zm21.89 0l-8.09-8.09l8.09-8.09l8.09 8.09l-8.09 8.09z"
                />
                <path
                    fill="#84B0C1"
                    d="M64 4C34.17 4 9.99 9.9 9.99 22.74c0 10.24 24.18 18.74 54.01 18.74s54.01-8.5 54.01-18.74C118.01 11.29 93.83 4 64 4zm0 30.36c-24.01 0-43.47-5.98-43.47-13.35c0-7.37 19.46-11.69 43.47-11.69c24.01 0 43.47 4.32 43.47 11.69c0 7.37-19.46 13.35-43.47 13.35z"
                />
                <path
                    fill="#A8E3F0"
                    d="M107.47 15.75c2.07 1.65 3.91 4.42 1.7 6.98c-1.95 2.26-1.41 2.81-.24 2.51c2.2-.56 5.84-3.03 4.61-7.19c-1.25-4.2-8.44-7-13.26-7.99c-1.31-.27-3.5-.56-3.89 0c-.38.57 6.38 1.94 11.08 5.69zM37.24 35.27c-4.64-.47-16.02-1.62-22.14-9.69c-2.24-2.96-2.06-7.28.44-9.75c4.34-4.27 10.01-4.41 8.72-3.62c-3.45 2.11-10.3 5.44-4.58 12.31c5.85 7.03 20.26 8.86 22.61 9.22s2.47 2.28-5.05 1.53z"
                />
            </svg>
        </IconButton>
    );
}

export function HoverButtonUndo(props: ButtonProps & { title: string }) {
    // THANKS TO https://uxwing.com/rotate-left-arrow-icon/
    // https://react-svgr.com/playground/?expandProps=none

    return (
        <IconButton {...props}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                shapeRendering="geometricPrecision"
                textRendering="geometricPrecision"
                imageRendering="optimizeQuality"
                fillRule="evenodd"
                clipRule="evenodd"
                viewBox="0 0 512 452.64"
                width="1.5em"
                height="1.5em"
            >
                <path d="M143.65 161.02c33.05-59.34 90.64-98.27 164.75-89.98 69.06 7.72 131.91 57.64 147.19 131.68 12.78 62-10.79 121.11-52.63 161.1-48.87 46.7-122.66 67.32-192.61 36.01-35.84-16.05-60.23-36.5-78.47-62.84-1.86-2.45-4.36-6.41-7.83-8.99-10.07-7.53-23.32 1.41-21.28 12.43.43 2.36 1.49 4.88 3.36 7.53 15 23.71 31.64 41.83 53.38 58.4 49.84 37.98 114.27 55.13 178.92 41.8 60.23-12.41 109.18-48.92 139.51-97.8 53.04-85.46 40.95-188.32-14.26-260.43-34.29-44.79-85.22-77.72-147.5-87.26C211.03-13.44 105.47 44.94 71.66 137.99l-42.51-13.6c-11.78-3.73-24.37 2.79-28.1 14.57a22.326 22.326 0 0 0 .9 15.89l48.64 108.53c5.04 11.3 18.29 16.37 29.59 11.32l1.65-.82.02.03 106.62-58.84c10.86-5.97 14.83-19.61 8.87-30.47-3.15-5.74-8.44-9.55-14.34-11l-39.35-12.58z" />
            </svg>
        </IconButton>
    );
}

export function HoverButtonFHIR(props: { fhirUrl: string }) {
    return (
        <a
            target="_blank"
            style={{ fontSize: "large" }}
            href={`/edit-fhir?fhirUrl=${encodeURIComponent(props.fhirUrl)}`}
            title="FHIR editor"
        >
            <FhirSVG />
        </a>
    );
}
