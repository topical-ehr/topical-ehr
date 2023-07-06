import { ListItemNode, ListNode } from "@lexical/list";
import { MarkNode } from "@lexical/mark";
import { OverflowNode } from "@lexical/overflow";
import { Klass, LexicalNode } from "lexical";
import { HEADING } from "@lexical/markdown";

export const lexicalNodes: Array<Klass<LexicalNode>> = [
    ...HEADING.dependencies, // fixes errorOnTypeKlassMismatch due to Vite/YarnPNP messing up imports
    ListNode,
    ListItemNode,
    OverflowNode,
    MarkNode,
];
