"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const savingsController_1 = require("../controllers/savingsController");
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = express_1.default.Router();
router.use(verifyToken_1.default);
router.get('/', (0, asyncHandler_1.default)(savingsController_1.getAllSavings));
router.post('/', (0, asyncHandler_1.default)(savingsController_1.createSaving));
router.get('/summary', (0, asyncHandler_1.default)(savingsController_1.getSavingsSummary));
router.delete('/:id', (0, asyncHandler_1.default)(savingsController_1.deleteSaving));
router.put('/:id', (0, asyncHandler_1.default)(savingsController_1.updateSaving));
exports.default = router;
