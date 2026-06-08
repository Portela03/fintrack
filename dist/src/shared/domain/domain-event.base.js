"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEvent = void 0;
class DomainEvent {
    occurredOn;
    eventName;
    constructor(eventName) {
        this.occurredOn = new Date();
        this.eventName = eventName;
    }
}
exports.DomainEvent = DomainEvent;
//# sourceMappingURL=domain-event.base.js.map