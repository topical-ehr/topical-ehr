export interface EHRConfig {
    patientId: string;
    additionalSagas: ((...args: any[]) => any)[];
}
