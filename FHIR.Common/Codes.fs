module PAT.FHIR.Codes

open System
open Hl7.Fhir.Model
open PAT.FHIR.Urls

module PatCodes =
    type private L<'T> = ResizeArray<'T>

    module CarePlan =
        module Category =
            let PatChronicDiseaseManagement =
                CodeableConcept(
                                Text="PAT Chronic Disease Management",
                                Coding =
                                    L [Coding(System = patFhirUrl "carePlanCategories",
                                              Code = "ChronicDiseaseManagement",
                                              Display = "Chronic Disease Management")])
            let PatChronicDiseaseManagementNoText = // sample data so code-gen makes Text nullable
                CodeableConcept(
                                Coding =
                                    L [Coding(System = patFhirUrl "carePlanCategories",
                                              Code = "ChronicDiseaseManagement",
                                              Display = "Chronic Disease Management")])


    module List =
        module Infrastructure =
            let ImportedResourcesList =
                CodeableConcept(Coding =
                    L [Coding(System = patFhirUrl "infrastructureLists",
                              Code = "ImportedResources")])

            let ClinicsPackage repositoryUuid =
                Identifier(System = patFhirUrl "infrastructureLists/ClinicsPackage", Value = repositoryUuid)

    module Task =
        module Code =
            let private system = patFhirUrl "requestToPracticeSoftware/code"
            let CareplanRtfImport =
                CodeableConcept(system, "careplan-document-import", "a careplan document is to be added to a patient's record")

        module Input =
            let private system = patFhirUrl "requestToPracticeSoftware/input/type"
            let HL7RTF =
                CodeableConcept(system, "hl7-rtf", "an RTF document in an HL7 container (compatible with Best Practice)")

            
        module BusinessStatus =
            let private system = patFhirUrl "requestToPracticeSoftware/status"
            let FileAdded =
                CodeableConcept(system, "file-added", "The document has been added to a folder and is awaiting import", "")

            let FileAddFailed =
                CodeableConcept(system, "file-add-failed", "e.g. error - folder does not exist or is not writable", "IOException: import folder does not exist")

            let FileRemoved =
                CodeableConcept(system, "completed", "file has been removed from the import folder - presumably by the practice software", "")


    module Observation =
        // For Time Range observation components
        let TimeRangeFrom =
            CodeableConcept(
                Text="from",
                Coding = L [Coding(
                                System = patFhirUrl "timeRange",
                                Code = "from",
                                Display = "Time From")])
        let TimeRangeTo  =
            CodeableConcept(
                Text="to",
                Coding = L [Coding(
                                System = patFhirUrl "timeRange",
                                Code = "to",
                                Display = "Time To")])

        let NoText  =
            CodeableConcept(
                Coding = L [Coding(
                                System = patFhirUrl "sample-data",
                                Code = "NoText",
                                Display = "No tex field for code generation to include nulls")])


    module PlanDefinition =
        module ActionType =
            let SubClinic =
                CodeableConcept(Coding =
                    L [Coding(System = patFhirUrl "actionType",
                              Code = "SubClinic",
                              Display = "Sub-clinic")])

            let Questionnaire =
                CodeableConcept(Coding =
                    L [Coding(System = patFhirUrl "actionType",
                              Code = "Questionnaire",
                              Display = "Questionnaire")])

            let Goal =
                CodeableConcept(Coding =
                    L [Coding(System = patFhirUrl "actionType",
                              Code = "Goal",
                              Display = "Goal")])

            let Education =
                CodeableConcept(Coding =
                    L [Coding(System = patFhirUrl "actionType",
                              Code = "Education",
                              Display = "Education")])

            let EducationalQuestionnaire =
                CodeableConcept(Coding =
                    L [Coding(System = patFhirUrl "actionType",
                              Code = "EducationalQuestionnaire",
                              Display = "Educational questionnaire")])

    module Tags =
        let PatVersion = Coding(System = patFhirUrl "tags/Version", Code = "3.0.0")
        let PatSampleData = Coding(System = patFhirUrl "tags/SampleData", Code = "true")
        let ClinicsGitCommit hash = Coding(System = patFhirUrl "tags/GitCommit", Code = hash)
        let ImportJob id = Coding(System = patFhirUrl "tags/ImportJob", Code = id)
    
    module CareTeam =
        module Identifiers =
            let MultiPatientCareTeam value =
                Identifier(patFhirUrl "careteam/multi-patient", value)

        module Categories =
            let LongitudinalCareCoordination =
                CodeableConcept(
                    Text="Longitudinal Care",
                    Coding=L[Coding("http://hl7.org/fhir/care-team-category", "longitudinal", "Longitudinal Care Coordination")])

            let LongitudinalCareCoordinationNoText = // for code-gen to make Text nullable..
                CodeableConcept(
                    Coding=L[Coding("http://hl7.org/fhir/care-team-category", "longitudinal", "Longitudinal Care Coordination")])


    module ActivityDefinition =
        module Identifiers =
            let CustomGoal uuid = Identifier(patFhirUrl "custom-goal", uuid)

        module Extensions =
            let UseAutomaticallyFor (r: #Resource) = Extension(patFhirUrl "use-automatically-for", ResourceReference(sprintf "%s/%s" r.TypeName r.Id))
            let Private b = Extension(patFhirUrl "private", FhirBoolean(Nullable b))

        module UsageContext =
            let UseWithClinicCode = Coding(patFhirUrl "activity-usage-context", "use-with-clinic")
            let UseWithClinic name uuid = CodeableConcept(patFhirUrl "pat-clinic", uuid, Text = name)
        
        module Contributor =
            module Extension =
                let Practitioner (p: Practitioner) = Extension(patFhirUrl "contributor-ref", ResourceReference("Practitioner/" + p.Id))

    module EncounterTypes =
        let SystemUrl = "https://metadata.patsoftware.com.au/v3.0/FHIR/encounterTypes"

        let OnSiteClinic = CodeableConcept(Coding = L [Coding(
                                                        System = SystemUrl,
                                                        Code = "OnSiteClinic",
                                                        Display = "Patient is on-site, will appear in the PAT 'Waiting Room' and go through the PAT structured questionnaire & care-plan generation process. In Australia this may happen 1-2 times a year as part of a 'special' consultation, e.g. GP Management Plan, Diabetes Cycle of Care")])
        let OnSiteClinicWithText
            = CodeableConcept(
                Text = "on-site clinic",
                Coding = L [Coding(
                                System = SystemUrl,
                                Code = "OnSiteClinic",
                                Display = "Patient is on-site, will appear in the PAT 'Waiting Room' and go through the PAT structured questionnaire & care-plan generation process. In Australia this may happen 1-2 times a year as part of a 'special' consultation, e.g. GP Management Plan, Diabetes Cycle of Care")])

        let CarePlanReview = CodeableConcept(Coding = L [Coding(
                                                            System = SystemUrl,
                                                            Code = "CarePlanReview",
                                                            Display = "Patient's Care Plan is being updated in this encounter - can be during any short consultation or even without the patient present.")])

        let AdHocEducation = CodeableConcept(Coding = L [Coding(
                                                            System = SystemUrl,
                                                            Code = "AdHocEducation",
                                                            Display = "The patient may just be viewing an educational questionnaire, perhaps opportunistically rather than in a 'special' chronic disease management consultation. Their responses are recorded but the Care Plan might not be updated.")])


module KnownCodes =

    module OccupationsSNOMED =
        let snomedSystemURI = "http://snomed.info/sct"

        let Nurse = CodeableConcept(snomedSystemURI, "106292003", "Nurse", "Nurse")
        let MedicalDoctor = CodeableConcept(snomedSystemURI, "112247003", "Medical doctor", "Doctor")
//        let GP = CodeableConcept(snomedSystemURI, "62247001", "General practitioner", null)
//        let RN = CodeableConcept(snomedSystemURI, "2544", "Registered Nurses", "Registered Nurse")
//        let EN = CodeableConcept(snomedSystemURI, "411411", "Enrolled Nurse", null)
        let Receptionist = CodeableConcept(snomedSystemURI, "159561009", "Receptionist", "Receptionist")

        let Pharmacist = CodeableConcept(snomedSystemURI, "46255001", "Pharmacist", "Pharmacist")

        //let HealthcareWorker = CodeableConcept(snomedSystemURI, "223366009", "Healthcare worker", null)

        

    module Australia =

        let IndigenousStatus = "http://meteor.aihw.gov.au/content/index.phtml/itemId/602543#Codes"

        module IdentifierSystems =
            let Medicare = "http://ns.electronichealth.net.au/id/hi/mc"

        module OccupationsANZSCO = // ANZSCO http://confluence.hl7australia.com/display/AFR/Coding+and+Identifier+Systems
            let anzscoSystemUri = "http://www.abs.gov.au/ausstats/abs@.nsf/mf/1220.0"

            let GP = CodeableConcept(anzscoSystemUri, "253111", "General Medical Practitioner", null)

            // TODO: check if ANZSCO allows coding a whole group like RNs 2544..
            let MedicalPractitioner = CodeableConcept(anzscoSystemUri, "253", "Medical Practitioners", "Medical Practitioner")
            let RN = CodeableConcept(anzscoSystemUri, "2544", "Registered Nurses", "Registered Nurse")
            let EN = CodeableConcept(anzscoSystemUri, "411411", "Enrolled Nurse", null)
            let MedicalReceptionist = CodeableConcept(anzscoSystemUri, "542114", "Medical Receptionist", null)
