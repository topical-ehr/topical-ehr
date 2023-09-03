import { Record, Union } from "../fable_modules/fable-library.4.0.0-theta-018/Types.js";
import { tuple_type, obj_type, list_type, bool_type, record_type, int32_type, union_type, string_type } from "../fable_modules/fable-library.4.0.0-theta-018/Reflection.js";
import { empty, singleton, ofArray } from "../fable_modules/fable-library.4.0.0-theta-018/List.js";
import { map, delay, toList } from "../fable_modules/fable-library.4.0.0-theta-018/Seq.js";
import { defaultOf } from "../fable_modules/fable-library.4.0.0-theta-018/Util.js";

export class Table_T extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["T"];
    }
}

export function Table_T$reflection() {
    return union_type("CandleLite.Core.SQL.Table.T", [], Table_T, () => [[["Item", string_type]]]);
}

export function Table_toString(_arg) {
    return _arg.fields[0];
}

export const Table_Versions = new Table_T(0, ["versions"]);

export const Table_indexes = new Table_T(0, ["indexes"]);

export const Table_Sequences = new Table_T(0, ["sequences"]);

export class Value extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["StringValue", "IntValue"];
    }
}

export function Value$reflection() {
    return union_type("CandleLite.Core.SQL.Value", [], Value, () => [[["Item", string_type]], [["Item", int32_type]]]);
}

export function valueToObj(_arg) {
    if (_arg.tag === 1) {
        return _arg.fields[0];
    }
    else {
        return _arg.fields[0];
    }
}

export class UpdateValue extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Value", "Increment"];
    }
}

export function UpdateValue$reflection() {
    return union_type("CandleLite.Core.SQL.UpdateValue", [], UpdateValue, () => [[["Item", Value$reflection()]], [["Item", int32_type]]]);
}

export class ColumnValue extends Record {
    constructor(Column, Value) {
        super();
        this.Column = Column;
        this.Value = Value;
    }
}

export function ColumnValue$reflection() {
    return record_type("CandleLite.Core.SQL.ColumnValue", [], ColumnValue, () => [["Column", string_type], ["Value", Value$reflection()]]);
}

export class ColumnUpdateValue extends Record {
    constructor(Column, Value) {
        super();
        this.Column = Column;
        this.Value = Value;
    }
}

export function ColumnUpdateValue$reflection() {
    return record_type("CandleLite.Core.SQL.ColumnUpdateValue", [], ColumnUpdateValue, () => [["Column", string_type], ["Value", UpdateValue$reflection()]]);
}

export class Condition extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Equal", "InSubquery"];
    }
}

export function Condition$reflection() {
    return union_type("CandleLite.Core.SQL.Condition", [], Condition, () => [[["Item", Value$reflection()]], [["Item", Select$reflection()]]]);
}

export class WhereCondition extends Record {
    constructor(Column, Condition) {
        super();
        this.Column = Column;
        this.Condition = Condition;
    }
}

export function WhereCondition$reflection() {
    return record_type("CandleLite.Core.SQL.WhereCondition", [], WhereCondition, () => [["Column", string_type], ["Condition", Condition$reflection()]]);
}

export class Order extends Record {
    constructor(Column, Ascending) {
        super();
        this.Column = Column;
        this.Ascending = Ascending;
    }
}

export function Order$reflection() {
    return record_type("CandleLite.Core.SQL.Order", [], Order, () => [["Column", string_type], ["Ascending", bool_type]]);
}

export class Select extends Record {
    constructor(Columns, From, Where, Order) {
        super();
        this.Columns = Columns;
        this.From = From;
        this.Where = Where;
        this.Order = Order;
    }
}

export function Select$reflection() {
    return record_type("CandleLite.Core.SQL.Select", [], Select, () => [["Columns", list_type(string_type)], ["From", Table_T$reflection()], ["Where", list_type(WhereCondition$reflection())], ["Order", list_type(Order$reflection())]]);
}

export class Insert extends Record {
    constructor(Table, Columns, Values, Returning) {
        super();
        this.Table = Table;
        this.Columns = Columns;
        this.Values = Values;
        this.Returning = Returning;
    }
}

export function Insert$reflection() {
    return record_type("CandleLite.Core.SQL.Insert", [], Insert, () => [["Table", Table_T$reflection()], ["Columns", list_type(string_type)], ["Values", list_type(list_type(obj_type))], ["Returning", list_type(string_type)]]);
}

export class Update extends Record {
    constructor(Table, Update, Where, Returning) {
        super();
        this.Table = Table;
        this.Update = Update;
        this.Where = Where;
        this.Returning = Returning;
    }
}

export function Update$reflection() {
    return record_type("CandleLite.Core.SQL.Update", [], Update, () => [["Table", Table_T$reflection()], ["Update", list_type(ColumnUpdateValue$reflection())], ["Where", list_type(WhereCondition$reflection())], ["Returning", list_type(string_type)]]);
}

export class Delete extends Record {
    constructor(Table, Where) {
        super();
        this.Table = Table;
        this.Where = Where;
    }
}

export function Delete$reflection() {
    return record_type("CandleLite.Core.SQL.Delete", [], Delete, () => [["Table", Table_T$reflection()], ["Where", list_type(WhereCondition$reflection())]]);
}

export class Statement extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Select", "Insert", "Update", "Delete", "Savepoint", "SavepointRelease", "SavepointRollback", "TransactionBeginImmediate", "TransactionCommit", "TransactionRollback"];
    }
}

export function Statement$reflection() {
    return union_type("CandleLite.Core.SQL.Statement", [], Statement, () => [[["Item", Select$reflection()]], [["Item", Insert$reflection()]], [["Item", Update$reflection()]], [["Item", Delete$reflection()]], [["Item", string_type]], [["Item", string_type]], [["Item", string_type]], [], [], []]);
}

export class GeneratedSQL extends Record {
    constructor(SQL, Parameters) {
        super();
        this.SQL = SQL;
        this.Parameters = Parameters;
    }
}

export function GeneratedSQL$reflection() {
    return record_type("CandleLite.Core.SQL.GeneratedSQL", [], GeneratedSQL, () => [["SQL", string_type], ["Parameters", list_type(tuple_type(string_type, obj_type))]]);
}

function IndexConditions_nameColumn(_type, name) {
    return new WhereCondition("name", new Condition(0, [new Value(0, [(_type + ".") + name])]));
}

function IndexConditions_columnEqual(column, _type, name, value) {
    return ofArray([IndexConditions_nameColumn(_type, name), new WhereCondition(column, new Condition(0, [new Value(0, [value])]))]);
}

export const IndexConditions_valueEqual = (_type) => ((name) => ((value) => IndexConditions_columnEqual("value", _type, name, value)));

export const IndexConditions_systemEqual = (_type) => ((name) => ((value) => IndexConditions_columnEqual("system", _type, name, value)));

export function IndexConditions__id(id) {
    return IndexConditions_valueEqual(id.Type)("_id")(id.Id);
}

export function IndexConditions__type(_type) {
    return singleton(IndexConditions_nameColumn(_type, "_id"));
}

export function indexSubquery(condition) {
    return new Condition(1, [new Select(singleton("versionId"), Table_indexes, condition, empty())]);
}

export function indexQuery(conditions) {
    return new Statement(0, [new Select(singleton("versionId"), Table_indexes, conditions, empty())]);
}

export function readVersionsViaIndex(columns, conditions) {
    return new Statement(0, [new Select(columns, Table_Versions, toList(delay(() => map((condition) => (new WhereCondition("versionId", indexSubquery(condition))), conditions))), empty())]);
}

export function readResourcesViaIndex(conditions) {
    return readVersionsViaIndex(ofArray(["json", "deleted"]), conditions);
}

export function readIsDeletedViaIndex(conditions) {
    return readVersionsViaIndex(singleton("deleted"), conditions);
}

export function readVersion(versionId) {
    return new Statement(0, [new Select(ofArray(["json", "deleted"]), Table_Versions, singleton(new WhereCondition("versionId", new Condition(0, [new Value(0, [versionId])]))), empty())]);
}

export function readResourceHistory(id) {
    return new Statement(0, [new Select(ofArray(["versionId", "lastUpdated", "deleted", "json"]), Table_Versions, ofArray([new WhereCondition("type", new Condition(0, [new Value(0, [id.Type])])), new WhereCondition("id", new Condition(0, [new Value(0, [id.Id])]))]), singleton(new Order("versionId", true)))]);
}

export function updateCounter(name) {
    return new Statement(2, [new Update(Table_Sequences, singleton(new ColumnUpdateValue("value", new UpdateValue(1, [1]))), singleton(new WhereCondition("name", new Condition(0, [new Value(0, [name])]))), singleton("value"))]);
}

export function insertCounter(name) {
    return new Statement(1, [new Insert(Table_Sequences, ofArray(["name", "value"]), singleton(ofArray([name, 1])), singleton("value"))]);
}

export function insertResourceVersion(id, meta, json) {
    if (json.length === 0) {
        throw new Error("json is empty\\nParameter name: json");
    }
    return new Statement(1, [new Insert(Table_Versions, ofArray(["versionId", "type", "id", "lastUpdated", "deleted", "json"]), singleton(ofArray([meta.VersionId, id.Type, id.Id, meta.LastUpdated, 0, json])), empty())]);
}

export function insertDeletion(id, meta) {
    return new Statement(1, [new Insert(Table_Versions, ofArray(["versionId", "type", "id", "lastUpdated", "deleted", "json"]), singleton(ofArray([meta.VersionId, id.Type, id.Id, meta.LastUpdated, 1, defaultOf()])), empty())]);
}

