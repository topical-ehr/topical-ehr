module PAT.FHIR.Questions

open System
open FSharp.Data

open Hl7.Fhir.Support
open Hl7.Fhir.Model

open PAT.FHIR.Urls
open PAT.FHIR.Extensions
open PAT.FHIR.DotNetUtils
open Microsoft.FSharp.Reflection

type PlanDefinitionType =
    StandaloneClinic | EducationalQuestionnaire
    with
        member this.ToCode() =
            match this with
            | StandaloneClinic -> "standaloneClinic"
            | EducationalQuestionnaire -> "educationalQuestionnaire"

        member this.ToIdentifierSystem () =
            patFhirUrl (this.ToCode())
            
        member this.ToIdentifier (uuid:Guid) =
            Identifier(System=this.ToIdentifierSystem(), Value=uuid.ToString())

type QuestionSectionType =
    PatientConsent | PatientQuestionnaire | PatientEducation | StaffChecklist | StaffConsultation
    with
        member this.ToCoding() =
            let system = patFhirUrl "codings/QuestionSettingType"
            match this with
            | PatientConsent       -> Coding(Code="PatientConsent", System=system)
            | PatientQuestionnaire -> Coding(Code="PatientQuestionnaire", System=system)
            | PatientEducation     -> Coding(Code="PatientEducation", System=system)
            | StaffChecklist       -> Coding(Code="StaffChecklist", System=system)
            | StaffConsultation    -> Coding(Code="StaffConsultation", System=system)

        member this.ToDisplayName() =
            match this with
            | PatientConsent       -> "Patient Consent"
            | PatientQuestionnaire -> "Patient Questionnaire"
            | PatientEducation     -> "Patient education"
            | StaffChecklist       -> "Staff checklist"
            | StaffConsultation    -> "Staff consultation"

        member this.ToParticipantType() =
            match this with
            | PatientConsent    -> ActionParticipantType.Patient
            | PatientQuestionnaire -> ActionParticipantType.Patient
            | PatientEducation  -> ActionParticipantType.Patient
            | StaffChecklist    -> ActionParticipantType.Practitioner
            | StaffConsultation -> ActionParticipantType.Practitioner

        member this.ToParticipantRole() =
            let system = "http://hl7.org/fhir/practitioner-role"
            match this with
            | PatientConsent | PatientQuestionnaire | PatientEducation -> null
            | StaffChecklist    -> CodeableConcept(system, "nurse")
            | StaffConsultation -> CodeableConcept(system, "doctor")

        member this.ToQuestionnaireIdentifierSystem () =
            patFhirUrl (sprintf "questionnaires/%s" (this.ToCoding().Code))
            
        member this.ToQuestionnaireIdentifier (clinicUUID:Guid) =
            Identifier(System=this.ToQuestionnaireIdentifierSystem(), Value=clinicUUID.ToString())

        static member GetQuestionnaireIdentifierSectionType (ident:Identifier) =
            let (| SystemUrl|_|) (section:QuestionSectionType) (system:string) =
                if system = section.ToQuestionnaireIdentifierSystem() then
                    Some section
                else
                    None
            
            match ident.System with
            | SystemUrl PatientConsent       section -> Some section
            | SystemUrl PatientQuestionnaire section -> Some section
            | SystemUrl PatientEducation     section -> Some section
            | SystemUrl StaffChecklist       section -> Some section
            | SystemUrl StaffConsultation    section -> Some section
            | _                                     -> None

        member this.ToActivityDefinitionIdentifier (clinicUUID:Guid) =
            let system = patFhirUrl (sprintf "activityDefinitions/%s" (this.ToCoding().Code))
            Identifier(System=system, Value=clinicUUID.ToString())



type QuestionAnswerQuantities  = Kilograms | Metres | Steps
type QuestionAnswerTimePeriods = Years | Months | Days | Hours | Minutes | Seconds
type QuestionAnswerDataType =
    YesNo | YesNoNA | Consent |
     Number | Checkbox | Text |
     Month | Year | 
     Selection of Guid |
     SubQuestions |
     Finish |
     Display |
     TimeRange of QuestionAnswerTimePeriods |
     Duration of QuestionAnswerTimePeriods |
     Quantity of QuestionAnswerQuantities

type QuestionAnswerType =
    { Type: QuestionAnswerDataType
      Required: bool
    }
    with
        static member TryParseDslType (strtype:string) (subtype:string) (selectionUuid:Guid option) =

            let tryParseSubtypeQuantities () =
                match subtype.ToUpper() with
                | "KG" -> Some Kilograms
                | "M" -> Some Metres
                | "STEPS" -> Some Steps
                | _ -> None

            let tryParseSubtypeTimePeriod () =
                match subtype.ToUpper() with
                | "YEARS" -> Some Years
                | "MONTHS" -> Some Months
                | "DAYS" -> Some Days
                | "HOURS" -> Some Hours
                | "MINUTES" -> Some Minutes
                | "SECONDS" -> Some Seconds
                | _ -> None

            match strtype.ToUpper() with
            | "YES_NO_UNSURE" | "YES_NO" -> {Type=YesNo; Required=false} |> Some
            | "YES_NO_NA" -> {Type=YesNoNA; Required=false} |> Some
            | "CHECK_OPTIONAL" -> {Type=Checkbox; Required=false } |> Some
            | "CHECK_REQUIRED" -> {Type=Checkbox; Required=true } |> Some
            | "CONSENT_OPTIONAL" -> {Type=Consent; Required=false } |> Some
            | "CONSENT_REQUIRED" -> {Type=Consent; Required=true } |> Some
            | "NUMBER_OPTIONAL" -> {Type=Number; Required=false } |> Some
            | "NUMBER_REQUIRED" -> {Type=Number; Required=true } |> Some
            | "TEXT" -> {Type=Text; Required=false } |> Some
            | "MONTH" -> {Type=Month; Required=false } |> Some
            | "YEAR" -> {Type=Year; Required=false } |> Some
            | "SUBQUESTIONS" -> {Type=SubQuestions; Required=false} |> Some
            | "FINISH" -> {Type=Finish; Required = false} |> Some
            | "DISPLAY" -> {Type=Display; Required = false} |> Some
            | "SELECTION_INLINE" | "SELECTION_REFERENCE" ->
                match selectionUuid with
                | Some uuid -> {Type=Selection uuid ; Required=false} |> Some
                | None -> failwith "no selection specified"

            | "TIME_RANGE" ->
                match tryParseSubtypeTimePeriod() with
                | Some tp -> {Type=TimeRange tp; Required=false } |> Some
                | None -> None
            | "DURATION" ->
                match tryParseSubtypeTimePeriod() with
                | Some tp -> {Type=Duration tp; Required=false } |> Some
                | None -> None
            | "QUANTITY" ->
                match tryParseSubtypeQuantities() with
                | Some q -> {Type=Quantity q; Required=false } |> Some
                | None -> None
            | _ -> None

        static member ParseDslType strType strSubtype selectionUuid (questionUuid:Guid) =
            match QuestionAnswerType.TryParseDslType strType strSubtype selectionUuid with
            | Some s -> s
            | None -> failwithf "unrecognised QuestionAnswerType: %s (subtype %s, question %A)" strType strSubtype questionUuid


        member this.toFhirQuestionType() =
            let choice = Questionnaire.QuestionnaireItemType.Choice
            let integer = Questionnaire.QuestionnaireItemType.Integer
            let text = Questionnaire.QuestionnaireItemType.Text
            let quantity = Questionnaire.QuestionnaireItemType.Quantity
            let time = Questionnaire.QuestionnaireItemType.Time
            let date = Questionnaire.QuestionnaireItemType.Date
            let group = Questionnaire.QuestionnaireItemType.Group
            let display = Questionnaire.QuestionnaireItemType.Display

            match this.Type with
            | YesNo | YesNoNA | Consent -> choice
            | Checkbox -> choice
            | Selection _ -> choice
            | Number -> integer
            | Text -> text
            | Quantity _ -> quantity
            | Month | Year -> date
            | Duration _ -> quantity
            | SubQuestions -> group
            | Display | Finish -> display
            | TimeRange _ -> group // subquestions with start and end times

        member this.toFhirQuestionTypeExtensions() =
            let last = 
                match this.Type with
                | Finish -> true
                | _ -> false

            let toString (x:'a) = (* from http://www.fssnip.net/9l *)
                match FSharpValue.GetUnionFields(x, typeof<'a>) with
                | case, _ -> case.Name
            
            [ Extension(PatExtensions.Urls.LAST_QUESTION, FhirBoolean(N last))
              Extension(PatExtensions.Urls.QUESTION_TYPE, FhirString(toString this.Type))
            ]


        member this.toFhirValueSetReference() =

            let makeRef ident = referenceToBundleIdentifier (makeStaticIdentifier ident) |> Some
            let yesNo         = ValueSets.identifiers.YesNo         |> makeRef
            let yesNoUnsure   = ValueSets.identifiers.YesNoUnsure   |> makeRef
            let yesNoNAUnsure = ValueSets.identifiers.YesNoNaUnsure |> makeRef

            match this.Type with
            | YesNoNA  -> yesNoNAUnsure
            | YesNo    -> yesNoUnsure
            | Checkbox -> yesNo
            | Consent  -> yesNo
            | Selection uuid  ->
                let ident = Identifier(System=KnownUrls.patValueSetIdentifierSystem, Value=uuid.ToString())
                referenceToBundleIdentifier ident |> Some
            | _ -> None

        // creates a questionnaire-unit extension with a unitsofmeasure.org code
        member this.toFhirQuantityExtension() =
            let code = match this.Type with
                        | Duration d ->
                            match d with
                            | Years -> Some "a"
                            | Months -> Some "mo"
                            | Days -> Some "d"
                            | Hours -> Some "h"
                            | Minutes -> Some "min"
                            | Seconds -> Some "s"
                        | Quantity q ->
                            match q with
                            | Kilograms -> Some "kg"
                            | Metres -> Some "m"
                            | Steps -> Some "{steps}"
                        | Month -> Some "mo"
                        | Year -> Some "a"
                        | _ -> None

            match code with
            | Some code' ->
                let extensionUrl = "http://hl7.org/fhir/StructureDefinition/questionnaire-unit"
                let system = "http://unitsofmeasure.org"
                let unitCoding = Coding(system, code')
                Extension(extensionUrl, unitCoding) |> Some
            | None -> None

type Answer =
    Yes | No | NA | Unsure
    with
        static member TryParse (str:string) =
            match str.ToLower() with
            | "yes" | "y" -> Yes |> Some
            | "no" | "n" -> No |> Some
            | "na" -> NA |> Some
            | "unsure" | "unknown" | "unk" -> Unsure |> Some
            | _ -> None

        static member Parse str =
            match Answer.TryParse str with
            | Some s -> s
            | None -> failwithf "unrecognised Answer: %s" str

        static member Parse (j:JsonValue) =
            Answer.Parse (j.AsString())

        member this.ToCoding() =
            // see https://hl7.org/fhir/2017Jan/v2/0532/index.html
            // see http://hl7.org/fhir/v3/NullFlavor/index.html
            match this with
            | Yes -> Coding(Code="Y", System="http://hl7.org/fhir/v2/0136")
            | No  -> Coding(Code="N", System="http://hl7.org/fhir/v2/0136")
            | NA  -> Coding(Code="NA", System="http://hl7.org/fhir/v3/NullFlavor")
            | Unsure -> Coding(Code="UNK", System="http://hl7.org/fhir/v3/NullFlavor")

let makeQuestionCode (guid:Guid) summaryText =
    Coding(
        Code=guid.ToString(),
        System=(patFhirUrl "codings/question"),
        Display= (if (String.IsNullOrEmpty(summaryText) = false) then summaryText else null))
