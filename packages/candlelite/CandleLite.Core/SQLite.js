import { join, interpolate, toText } from "../fable_modules/fable-library.4.0.0-theta-018/String.js";
import { isEmpty, map } from "../fable_modules/fable-library.4.0.0-theta-018/List.js";
import { GeneratedSQL, Table_toString, valueToObj, Statement } from "./SQL.js";
import { mapIndexed, map as map_1, delay, toList } from "../fable_modules/fable-library.4.0.0-theta-018/Seq.js";

export const schema = "\n\nCREATE TABLE versions (\n    versionId   INTEGER PRIMARY KEY,\n    type        TEXT NOT NULL,\n    id          TEXT NOT NULL,      -- text as can be client-assigned\n    lastUpdated TEXT NOT NULL,\n    deleted     TINYINT NOT NULL,\n    json        TEXT                -- null when deleted\n);\nCREATE INDEX version_history_by_type_id ON versions (type, id);\nCREATE INDEX version_history_by_type    ON versions (type, lastUpdated);\nCREATE INDEX version_history_all        ON versions (lastUpdated);\n\nCREATE TABLE indexes (\n    name      TEXT NOT NULL,    -- index name, e.g. Patient._id\n    \n    value     BLOB NOT NULL,    -- includes numbers, codes, values, references\n    system    BLOB,             -- includes system field for codes (optional)\n    isRef     TINYINT,          -- whether the value is a reference to another resource\n\n    id        TEXT  NOT NULL,   -- resource id for chained searches\n    versionId INTEGER NOT NULL  -- version id for getting the latest JSON\n);\nCREATE INDEX index_value        ON indexes (name, value, versionId); -- versionId included for cover\nCREATE INDEX index_system_value ON indexes (name, system, value, versionId) WHERE system IS NOT NULL; -- for searches including the system\nCREATE INDEX index_references   ON indexes (value) WHERE isRef = 1; -- to prevent deletion of referenced resources\nCREATE INDEX index_versionId    ON indexes (versionId); -- to delete index entries\n\n\nCREATE TABLE sequences (\n    name  TEXT PRIMARY KEY,\n    value INTEGER NOT NULL\n) WITHOUT ROWID;\n\n\n";

export function GenerateSQL(statement) {
    const paramName = (i) => toText(interpolate("$p%d%P()", [i]));
    const parameters = [];
    const newParam = (v) => {
        void (parameters.push(v));
        return paramName(parameters.length - 1);
    };
    const toSQL = (st) => {
        const convertWhere = (where) => join(" AND ", map((cond) => {
            let matchValue;
            return cond.Column + ((matchValue = cond.Condition, (matchValue.tag === 1) ? (` IN (${toSQL(new Statement(0, [matchValue.fields[0]]))})`) : (` = ${newParam(valueToObj(matchValue.fields[0]))}`)));
        }, where));
        const convertOrderBy = (order) => {
            if (isEmpty(order)) {
                return "";
            }
            else {
                return "ORDER BY " + join(", ", map((col) => (col.Column + (col.Ascending ? "" : " DESC")), order));
            }
        };
        const generateReturning = (returning) => {
            if (isEmpty(returning)) {
                return "";
            }
            else {
                return "RETURNING " + join(",", returning);
            }
        };
        switch (st.tag) {
            case 1: {
                const insert = st.fields[0];
                const vals = join(",", map((r) => (`(${r})`), toList(delay(() => map_1((row) => join(",", map(newParam, row)), insert.Values)))));
                const cols_2 = join(", ", insert.Columns);
                return `INSERT INTO ${Table_toString(insert.Table)} (${cols_2}) VALUES ${vals} ${generateReturning(insert.Returning)}`;
            }
            case 3: {
                const delete$ = st.fields[0];
                return `DELETE FROM ${Table_toString(delete$.Table)} WHERE ${convertWhere(delete$.Where)}`;
            }
            case 2: {
                const update = st.fields[0];
                const set$ = join(",", map((ud) => {
                    const matchValue_1 = ud.Value;
                    if (matchValue_1.tag === 1) {
                        return toText(interpolate("%s%P() = %s%P() + %d%P()", [ud.Column, ud.Column, matchValue_1.fields[0]]));
                    }
                    else {
                        return `${ud.Column} = ${newParam(valueToObj(matchValue_1.fields[0]))}`;
                    }
                }, update.Update));
                return `UPDATE ${Table_toString(update.Table)} SET ${set$} WHERE ${convertWhere(update.Where)} ${generateReturning(update.Returning)}`;
            }
            case 4: {
                return `SAVEPOINT "${st.fields[0]}"`;
            }
            case 5: {
                return `RELEASE SAVEPOINT "${st.fields[0]}"`;
            }
            case 6: {
                return `ROLLBACK TO SAVEPOINT "${st.fields[0]}"`;
            }
            case 7: {
                return "BEGIN IMMEDIATE TRANSACTION";
            }
            case 8: {
                return "COMMIT";
            }
            case 9: {
                return "ROLLBACK";
            }
            default: {
                const select = st.fields[0];
                return `SELECT ${join(", ", select.Columns)} FROM ${Table_toString(select.From)} WHERE ${convertWhere(select.Where)} ${convertOrderBy(select.Order)}`;
            }
        }
    };
    return new GeneratedSQL(toSQL(statement), toList(mapIndexed((i_1, v_2) => [paramName(i_1), v_2], parameters)));
}

