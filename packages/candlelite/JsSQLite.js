import { schema, GenerateSQL } from "./CandleLite.Core/SQLite.js";
import { toArray } from "./fable_modules/fable-library.4.0.0-theta-018/List.js";
import { Logger__Debug_Z16373198, Logger__Info_Z16373198, Logger_$ctor_Z721C83C5, Logger__Debug_DED112C } from "./LMLogger.Client/LMLogger.js";
import { toList } from "./fable_modules/fable-library.4.0.0-theta-018/Seq.js";
import { class_type } from "./fable_modules/fable-library.4.0.0-theta-018/Reflection.js";

export class JsSQLiteImpl {
    constructor(db, sqlite3) {
        this.db = db;
        this.log = Logger_$ctor_Z721C83C5("/home/eug/candlelite/CandleLite.JS/JsSQLite.fs");
        Logger__Info_Z16373198(this.log, "Opening sqlite db");
        JsSQLiteImpl__createDB(this);
    }
    RunSqlLazily(statement) {
        const this$ = this;
        const sql = GenerateSQL(statement);
        let _params;
        const entries = toArray(sql.Parameters);
        _params = (Object.fromEntries(entries));
        const resultRows = [];
        try {
            this$.db.exec({
                sql: sql.SQL,
                rowMode: "array",
                bind: _params,
                resultRows: resultRows,
            });
            Logger__Debug_DED112C(this$.log, "query results", [["sql", sql], ["rows", resultRows]]);
        }
        catch (exn) {
            Logger__Debug_DED112C(this$.log, "query error", [["sql", sql], ["error", exn]]);
            debugger;
        }
        return resultRows;
    }
    RunSql(statement) {
        const this$ = this;
        return toList(this$.RunSqlLazily(statement));
    }
}

export function JsSQLiteImpl$reflection() {
    return class_type("CandleLite.JS.SQLite.JsSQLiteImpl", void 0, JsSQLiteImpl);
}

export function JsSQLiteImpl_$ctor_153526A6(db, sqlite3) {
    return new JsSQLiteImpl(db, sqlite3);
}

export function JsSQLiteImpl__createDB(this$) {
    const resultRows = [];
    this$.db.exec({
        sql: "PRAGMA table_info(\'versions\');",
        resultRows: resultRows,
    });
    if (resultRows.length === 0) {
        Logger__Debug_Z16373198(this$.log, "creating schema");
        this$.db.exec(schema);
    }
}

