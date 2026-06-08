"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateRoot = exports.Entity = void 0;
const uuid_1 = require("uuid");
class Entity {
    _id;
    props;
    constructor(props, id) {
        this._id = id ?? (0, uuid_1.v4)();
        this.props = props;
    }
    get id() {
        return this._id;
    }
    equals(entity) {
        if (entity === null || entity === undefined)
            return false;
        if (!(entity instanceof Entity))
            return false;
        return this._id === entity._id;
    }
}
exports.Entity = Entity;
class AggregateRoot extends Entity {
    _domainEvents = [];
    get domainEvents() {
        return this._domainEvents;
    }
    addDomainEvent(event) {
        this._domainEvents.push(event);
    }
    clearEvents() {
        this._domainEvents = [];
    }
}
exports.AggregateRoot = AggregateRoot;
//# sourceMappingURL=entity.base.js.map