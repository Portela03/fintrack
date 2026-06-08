"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluggyConnection = void 0;
const domain_1 = require("../../../../shared/domain");
class PluggyConnection extends domain_1.AggregateRoot {
    get userId() { return this.props.userId; }
    get itemId() { return this.props.itemId; }
    get status() { return this.props.status; }
    get lastSyncAt() { return this.props.lastSyncAt; }
    get createdAt() { return this.props.createdAt; }
    markSynced() {
        this.props = { ...this.props, status: 'UPDATED', lastSyncAt: new Date() };
    }
    markError() {
        this.props = { ...this.props, status: 'LOGIN_ERROR' };
    }
    static create(props) {
        return new PluggyConnection({
            ...props,
            status: 'UPDATING',
            lastSyncAt: null,
            createdAt: new Date(),
        });
    }
    static reconstitute(props) {
        return new PluggyConnection({
            userId: props.userId,
            itemId: props.itemId,
            status: props.status,
            lastSyncAt: props.lastSyncAt,
            createdAt: props.createdAt,
        }, props.id);
    }
}
exports.PluggyConnection = PluggyConnection;
//# sourceMappingURL=pluggy-connection.entity.js.map