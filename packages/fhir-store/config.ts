export interface EHRConfig {
    patientId: string;
    practitionerId: string | null;
    additionalSagas: ((...args: any[]) => any)[];
}
