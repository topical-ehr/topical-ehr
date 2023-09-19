import React from "react";

import DiffMatchPatch from "diff-match-patch";

import { Props } from "./DocumentView";
import { useFHIR } from "@topical-ehr/fhir-store";
import * as FHIR from "@topical-ehr/fhir-types";

import css from "./ChangesView.module.scss";
import { fhirUp, useFhirServerConfig } from "@topical-ehr/fhir-store/fhir-server";

export function ChangesView(props: Props) {
    const resources = useFHIR((s) => s.fhir.resourcesFromServer);

    const [showing, setShowing] = React.useState(false);
    function onShow() {
        setShowing(true);
    }
    function onHide() {
        setShowing(false);
    }
    const chevron = !showing ? "►" : "▼";

    const refs = findVersionedReferences(props.document).map((ref) => ({
        ...ref,
        resource: resources[ref.type.toLowerCase() + "s"][ref.id],
    }));
    if (refs.length === 0) {
        return null;
    }

    if (showing) {
        return (
            <div>
                <div
                    className={css.clickable}
                    onClick={onHide}
                >
                    {chevron} Changes:
                </div>
                <div className={css.expanded_container}>
                    {refs.map((r) => (
                        <Changes
                            key={r.ref}
                            r={r.resource}
                            versionId={r.versionId}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            className={css.clickable}
            onClick={onShow}
        >
            {chevron} Changed:{" "}
            {refs.map((r, i) => (
                <span key={r.ref}>
                    <Title r={r.resource} />
                    {refs[i + 1] ? ", " : ""}
                </span>
            ))}
        </div>
    );
}

function Title({ r }: { r: FHIR.Resource }) {
    if (r.resourceType === "Composition") {
        return <>{(r as FHIR.Composition).title} (topic)</>;
    }
    return (
        <>
            {r.resourceType}/{r.id}
        </>
    );
}

function Changes(props: { r: FHIR.Resource; versionId: string }) {
    const config = useFhirServerConfig();

    const [history, setHistory] = React.useState<{ base: FHIR.Resource; modified: FHIR.Resource }>();

    async function getHistory() {
        const fhir = await fhirUp(config);
        const url = `${props.r.resourceType}/${props.r.id}/_history`;
        const historyBundle = await fhir.get(url);
        if (!FHIR.isBundle(historyBundle)) {
            console.error(`Error getting history (not a bundle)`, { url, bundle: historyBundle });
            throw new Error(`Error getting history (${url}) (not a bundle)`);
        }
        if (historyBundle.type !== "history") {
            console.error(`Error getting history (not a history bundle)`, { url, bundle: historyBundle });
            throw new Error(`Error getting history (${url}) (not a history bundle)`);
        }

        const baseIndex = historyBundle.entry?.findIndex((entry) => entry.resource.meta.versionId === props.versionId);
        if (!baseIndex) {
            throw new Error(`Failed to find baseIndex`);
        }

        const modifiedIndex = baseIndex + 1;

        const base = historyBundle?.entry?.[baseIndex].resource;
        const modified = historyBundle?.entry?.[modifiedIndex].resource;

        if (!base) {
            throw new Error(`No base resource`);
        }
        if (!modified) {
            throw new Error(`No modified resource`);
        }

        setHistory({ base, modified });
    }

    React.useEffect(() => {
        getHistory();
    }, []);

    if (!history) {
        return <div>Loading...</div>;
    }

    if (FHIR.isComposition(props.r)) {
        const md1 = FHIR.Composition.getMarkdown(history.base as FHIR.Composition);
        const md2 = FHIR.Composition.getMarkdown(history.modified as FHIR.Composition);

        if (!md1 || !md2) {
            return null;
        }

        const dmp = new DiffMatchPatch();
        const diff = dmp.diff_main(md1, md2);
        dmp.diff_cleanupSemantic(diff);
        console.log({ diff });

        return (
            <div>
                <b>{props.r.title} (topic)</b> <em>by Dr AAAAAAA (yesterday 10:34am)</em>
                <div className={css.diff}>
                    {diff.map(([op, text]) => {
                        const kls = op === 1 ? "add" : op === -1 ? "del" : "same";
                        return <span className={css[kls]}>{text}</span>;
                    })}
                </div>
            </div>
        );
    }

    // big dats in dividers
    // move obs to left
    // save button for topic with note about progrsss noyrs
    // progrss noyrs --> chatlike interface

    return (
        <div>
            Changed {props.r.resourceType}/${props.r.id}{" "}
        </div>
    );
}

interface Ref {
    type: string;
    id: string;
    versionId: string;
    ref: string;
}

function findVersionedReferences(obj: object) {
    const refs: Ref[] = [];

    JSON.stringify(obj, (key, value) => {
        if (key === "reference") {
            if (typeof value === "string" && value.includes("/_history/")) {
                const [type, id, _history, versionId] = value.split("/");
                refs.push({ type, id, versionId, ref: value });
            }
        }

        return value;
    });

    return refs;
}
