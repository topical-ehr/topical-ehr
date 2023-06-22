import { DefaultButton, PrimaryButton, Stack } from "@fluentui/react";
import { actions, useFHIR, useDispatch } from "@topical-ehr/fhir-store";
import { ChangesPanel } from "./ChangesPanel";

import { RichTextEditor } from "@topical-ehr/rich-text-editor";

interface Props {}

export function EditsPanel(props: Props) {
  const dispatch = useDispatch();
  const saveState = useFHIR((s) => s.fhir.saveState);

  function onSave() {
    dispatch(actions.setSaveState({ state: "save-requested" }));
  }
  function onUndoAll() {
    dispatch(actions.undoAll());
  }

  return (
    <div style={{ marginLeft: "1em" }}>
      <Stack horizontal tokens={{ childrenGap: 10 }}>
        <DefaultButton text="🗄️ Template" onClick={() => {}} />
      </Stack>

      <div style={{ marginTop: "1em", marginBottom: "1em" }}>
        <RichTextEditor
          initialHTML="Summary"
          placeholder={<p>Progress note</p>}
        />
      </div>
      <ChangesPanel />
      <Stack horizontal tokens={{ childrenGap: 10 }}>
        <PrimaryButton
          disabled={saveState !== null}
          text="Save"
          onClick={onSave}
        />
        {/* <DefaultButton disabled={saveState !== null} text="Undo all" onClick={onUndoAll} /> */}
      </Stack>
    </div>
  );
}
