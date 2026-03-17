"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
/**
 * Request validation middleware using Zod.
 * Validates body, query, or params depending on the `source` param.
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const data = schema.parse(req[source]);
            req[source] = data; // Replace with parsed/cleaned data
            next();
        }
        catch (err) {
            if (err?.issues) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: err.issues.map((e) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
                return;
            }
            next(err);
        }
    };
};
exports.validate = validate;
