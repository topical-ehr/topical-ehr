module NextEHR.FHIR.Codes

open System

open Hl7.Fhir.Model

open NextEHR.FHIR.Urls

module ConditionCodes =
    module ClinicalStatus =
        let Active =
            CodeableConcept("http://terminology.hl7.org/CodeSystem/condition-clinical", "active")

    module VerificationStatus =
        let Confirmed =
            CodeableConcept("http://terminology.hl7.org/CodeSystem/condition-ver-status", "confirmed")

module KnownCodes =

    module OccupationsSNOMED =
        let snomedSystemURI = "http://snomed.info/sct"

        let Nurse =
            CodeableConcept(snomedSystemURI, "106292003", "Nurse", "Nurse")

        let MedicalDoctor =
            CodeableConcept(snomedSystemURI, "112247003", "Medical doctor", "Doctor")
        //        let GP = CodeableConcept(snomedSystemURI, "62247001", "General practitioner", null)
//        let RN = CodeableConcept(snomedSystemURI, "2544", "Registered Nurses", "Registered Nurse")
//        let EN = CodeableConcept(snomedSystemURI, "411411", "Enrolled Nurse", null)
        let Receptionist =
            CodeableConcept(snomedSystemURI, "159561009", "Receptionist", "Receptionist")

        let Pharmacist =
            CodeableConcept(snomedSystemURI, "46255001", "Pharmacist", "Pharmacist")

    //let HealthcareWorker = CodeableConcept(snomedSystemURI, "223366009", "Healthcare worker", null)



    module Australia =

        let IndigenousStatus =
            "http://meteor.aihw.gov.au/content/index.phtml/itemId/602543#Codes"

        module IdentifierSystems =
            let Medicare =
                "http://ns.electronichealth.net.au/id/hi/mc"

        module OccupationsANZSCO =
            let anzscoSystemUri =
                "http://www.abs.gov.au/ausstats/abs@.nsf/mf/1220.0"

            let GP =
                CodeableConcept(anzscoSystemUri, "253111", "General Medical Practitioner", null)

            // TODO: check if ANZSCO allows coding a whole group like RNs 2544..
            let MedicalPractitioner =
                CodeableConcept(anzscoSystemUri, "253", "Medical Practitioners", "Medical Practitioner")

            let RN =
                CodeableConcept(anzscoSystemUri, "2544", "Registered Nurses", "Registered Nurse")

            let EN =
                CodeableConcept(anzscoSystemUri, "411411", "Enrolled Nurse", null)

            let MedicalReceptionist =
                CodeableConcept(anzscoSystemUri, "542114", "Medical Receptionist", null)
