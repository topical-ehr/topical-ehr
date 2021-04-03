module PAT.Samples.Generator.FHIR.QuestionnaireResponses

open System

open Hl7.Fhir.Model

open PAT.FHIR.DotNetUtils
open PAT.FHIR.Codes
open PAT.FHIR.Questions
open PAT.FHIR.Extensions

open PAT.Samples.Generator.Utils


let getAnswer
    answerFraction
    (qi: Questionnaire.ItemComponent)
    (patient: Patient)
    (encounter: Encounter)
    (performer: Resource)
    (qr: QuestionnaireResponse)
    =

    // make Observation's month & day the same as the patient's date of birth for some randomisation
    let patientDOB = DateTime.Parse(patient.BirthDate)

    let datetime =
        DateTimeOffset(2017, patientDOB.Month, patientDOB.Day, 10, 0, 0, (TimeSpan(10, 0, 0)))

    let questionId = qi.LinkId

    let questionSummary =
        qi.Code
        |> Seq.map (fun c -> c.Display)
        |> Seq.head

    let makeObservation _ valueElement =
        Observation(
            Status = N ObservationStatus.Preliminary,
            Category = L [ CodeableConcept(Text = "PAT Questionnaire response") ],
            Code =
                CodeableConcept(
                    Coding = L [ makeQuestionCode (Guid(questionId)) questionSummary ],
                    Text = questionSummary
                ),
            Value = valueElement,
            DerivedFrom = L [ referenceToResource qr ],
            Subject = referenceToResource patient,
            Encounter = referenceToResource encounter,
            Effective = FhirDateTime(datetime),
            Performer = L [ referenceToResource performer ],
            Note =
                L [ Annotation(
                        Text =
                            Markdown(
                                if answerFraction > 0.5f then
                                    "some comment"
                                else
                                    null
                            )
                    ) ]
        )

    let makeObservationWithComponents questionSummary (components: seq<Observation.ComponentComponent>) =
        let ob = makeObservation questionSummary null
        ob.Component <- L components
        ob

    let makeObservationWithDataAbsent questionSummary =
        let ob = makeObservation questionSummary null
        ob.DataAbsentReason <- CodeableConcept("http://hl7.org/fhir/data-absent-reason", "asked", "left blank by user")
        ob

    let random = Bogus.Randomizer()
    let faker = Bogus.Faker()

    match questionId with
    | "c07bbee5-6103-4a4e-83d3-83ff03e1db06" ->
        // text answer
        makeObservation "Main concerns" (FhirString("frustrated when can't fall asleep, tired and irritable all day"))

    | "2e708e2-14b9-40bf-9c72-0e757f7e2c41" ->
        // YesNo answer
        makeObservation
            "Have you ever had a CPAP sleep study"
            (CodeableConcept(Coding = L [ Coding("http://hl7.org/fhir/v2/0136", "Y") ]))

    | "611d7b2f-3cce-4f33-8940-d684c1a910d9" ->
        // Month
        makeObservation "When" (FhirDateTime(2017, 3))

    | "4dbabfb0-e1f7-43d8-8393-a2d5555947d0" ->
        // Selection answer
        makeObservation
            "Mornings with headache per week"
            (CodeableConcept(
                Text = "1 to 3",
                Coding =
                    L [ Coding(
                            "https://metadata.patsoftware.com.au/v3.0/FHIR/codeSystem/uuid/4dbabfb0-e1f7-43d8-8393-a2d5555947d0",
                            "1to3"
                        ) ]
            ))

    | "748b2fd3-d440-4183-8985-d5ff7a6f785f" ->
        // Quantity
        makeObservation "TimesAwoken" (Hl7.Fhir.Model.Quantity(Value = (N 3m)))

    | "24778e1c-0e6c-4c17-86a0-2a9decd0289f" ->
        // Time range
        let components =
            [
                Observation.ComponentComponent(Code = PatCodes.Observation.TimeRangeFrom, Value = Time("21:00:00"))
                Observation.ComponentComponent(Code = PatCodes.Observation.TimeRangeTo, Value = Time("01:00:00"))
                Observation.ComponentComponent(Code = PatCodes.Observation.NoText, Value = Time("01:00:00"))
            ]

        makeObservationWithComponents "UsualBedTime" components

    | "a75d1ed2-56c7-4b3d-b9cc-8f7ae3f62ab8" ->
        // value unset
        makeObservationWithDataAbsent "ActedOutDreams"

    | _ ->
        let shouldAnswer =
            faker.Random.Float(0.0f, 1.0f) < answerFraction

        if shouldAnswer = false then
            null
        else
            let value : Element =
                match qi.Type |> Option.ofNullable with
                | None -> failwithf "null Type on questionnaire"
                | Some _type ->
                    match _type with
                    | Questionnaire.QuestionnaireItemType.Text ->
                        upcast FhirString(sprintf "this is just some test data for %s" questionSummary)

                    | Questionnaire.QuestionnaireItemType.Choice ->
                        upcast CodeableConcept(Coding = L [ Coding("http://hl7.org/fhir/v2/0136", "Y") ])

                    | Questionnaire.QuestionnaireItemType.Quantity
                    | Questionnaire.QuestionnaireItemType.Integer -> upcast Hl7.Fhir.Model.Quantity(Value = (N 8m))

                    | Questionnaire.QuestionnaireItemType.Date -> upcast FhirDateTime(2018, 6)

                    | Questionnaire.QuestionnaireItemType.Display
                    | Questionnaire.QuestionnaireItemType.Group -> null

                    | _ -> failwithf "unhandled question type %A" _type

            if value <> null then
                makeObservation "" value
            else
                null



let create
    (createResource: CreateResource)
    answerFraction
    ((patient: Patient), conditions)
    (nurse: Practitioner)
    (doctor: Practitioner)
    (encounter: Encounter)
    (questionnaire: Questionnaire)
    =

    let time =
        N(DateTimeOffset(2017, 5, 1, 10, 0, 0, (TimeSpan(10, 0, 0))))

    let section =
        QuestionSectionType.GetQuestionnaireIdentifierSectionType(questionnaire.Identifier |> Seq.exactlyOne)

    let source : Resource =
        match section with
        | Some PatientConsent -> upcast patient
        | Some PatientQuestionnaire -> upcast patient
        | Some PatientEducation -> upcast patient
        | Some StaffChecklist -> upcast nurse
        | Some StaffConsultation -> upcast doctor
        | None -> failwithf "unknown questionnaire identifier system: %A" section

    let author = source // TODO can have author a nurse/doctor if they enter data for the patient
    let performer = source

    let someCondition : Resource = conditions |> Seq.head

    let qr =
        let items = // TODO
            if answerFraction = 0.0f then
                []
            else
                [
                    QuestionnaireResponse.ItemComponent(
                        LinkId = "c07bbee5-6103-4a4e-83d3-83ff03e1db06", // Main concerns
                        Answer =
                            L [ QuestionnaireResponse.AnswerComponent(
                                    Value = FhirString("frustrated when can't fall asleep, tired and irritable all day")
                                ) ]
                    )
                    QuestionnaireResponse.ItemComponent(
                        LinkId = "2e708e2-14b9-40bf-9c72-0e757f7e2c41", // Have you ever had a CPAP sleep study
                        Answer =
                            L [ QuestionnaireResponse.AnswerComponent(
                                    Value = Coding("http://hl7.org/fhir/v2/0136", "N")
                                )
                                QuestionnaireResponse.AnswerComponent(Value = ResourceReference("Observation/")) ]
                    )
                ]

        QuestionnaireResponse(
            Subject = referenceToResource patient,
            Author = referenceToResource author,
            Source = referenceToResource source,
            Encounter = referenceToResource encounter,
            Questionnaire = canonicalUrlForResource questionnaire,
            Status = N QuestionnaireResponse.QuestionnaireResponseStatus.InProgress,
            AuthoredElement = FhirDateTime(DateTime(2017, 2, 1, 9, 30, 0)),
            Item = L items,
            Extension =
                L [ Extension(PatExtensions.Urls.QuestionnaireResponse.SortKey, FhirString("sortkey"))
                    Extension(
                        PatExtensions.Urls.QuestionnaireResponse.AutomatchedReason,
                        ResourceReference(sprintf "Condition/%s" someCondition.Id)
                    ) ]
        )
        |> createResource
        :?> QuestionnaireResponse

    let observations =
        seq {
            for item in questionnaire.Item do
                let observation =
                    getAnswer answerFraction item patient encounter performer qr

                yield observation
        }


    for r in observations do
        if r <> null then
            createResource r |> ignore
