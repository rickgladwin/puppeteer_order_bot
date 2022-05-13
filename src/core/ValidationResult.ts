// validation result object

export interface ValidationResult {
    isValid: boolean,
    message: string|null,
    data?: any,
}
