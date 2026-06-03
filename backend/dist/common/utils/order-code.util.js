"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderCode = generateOrderCode;
exports.calcShippingFee = calcShippingFee;
const dayjs_1 = __importDefault(require("dayjs"));
function generateOrderCode() {
    const date = (0, dayjs_1.default)().format('YYYYMMDD');
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    return `DH${date}${random}`;
}
function calcShippingFee(subtotal) {
    return subtotal >= 500000 ? 0 : 30000;
}
//# sourceMappingURL=order-code.util.js.map