"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asyncHandler = (fn) => (req, res, next) => {
    console.log("asyncHandler: fn type is", typeof fn, "fn is", fn);
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.default = asyncHandler;
