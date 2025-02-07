const verificationCodes = new Map<string, number>();

export function storeVerificationCode(email: string, code: number) {
    verificationCodes.set(email, code);
}

export function getVerificationCode(email: string): number | undefined {
    return verificationCodes.get(email);
}

export function deleteVerificationCode(email: string) {
    verificationCodes.delete(email);
}
