module NextEHR.Samples.Generator.FHIR.Observations

open Hl7.Fhir.Model
type FhirQuantity = Quantity

open NextEHR.FHIR.Utils
open NextEHR.Samples.Generator.Utils
open System

module ObservationCategory =
    let System =
        "http://terminology.hl7.org/CodeSystem/observation-category"

type NormalResult =
    | Quantity of low: float * high: float * unit: string
    | Detection of bool

type LOINC_Code = string * string /// code * name

type Observation =
    // vital signs
    | HR
    | BP_Systolic
    | BP_Diastolic
    | RR
    | SPO2
    | Temp

    // other nurse collected
    | BSL
    | Pain

    | Height
    | Weight
    | StoolConsistency
    | StoolVolume

    | FluidIntake
    | UrineOutput

    // lab (CHEM20 panel)
    | SerumSodium
    | SerumChloride
    | SerumBicarbonate
    | SerumPotassium
    | SerumPhospate
    | SerumCalcium
    | SerumGlucoseRandom
    | SerumMagnesium
    | Albumin
    | ALP
    | ALT
    | AST
    | GGT
    | LDH
    | BilirubinDirect
    | BilirubinTotal
    | Urea
    | Creatinine
    | UricAcid
    | Protein

    // lab (FBC panel)
    | HB
    | HCT
    | WCC
    | Eosinophils
    | Platelets
    | RCC
    | MCV

    // lab (quantitative microbiology)
    | COVID_RNA

    member this.ReferenceRange =
        match this with
        // vital signs
        | HR -> Quantity(60.00, 100.00, "bpm")
        | BP_Systolic -> Quantity(90.00, 120.00, "mmHg")
        | BP_Diastolic -> Quantity(60.00, 80.00, "mmHg")
        | RR -> Quantity(12.0, 16.0, "bpm")
        | SPO2 -> Quantity(95.0, 100.0, "%")
        | Temp -> Quantity(36.5, 37.5, "°C")

        | BSL -> Quantity(3.0, 7.7, "mmol/L")

        | Height -> Quantity(100.00, 200.00, "cm")
        | Weight -> Quantity(45.00, 100.00, "kg")

        // other nurse collected
        | Pain
        | StoolConsistency
        | StoolVolume

        | FluidIntake
        | UrineOutput

        // lab (CHEM20 panel)
        //   ranges from
        //      https://www.rcpa.edu.au/Manuals/RCPA-Manual/General-Information/IG/Table-6-Reference-intervals-harmonised-chemical
        //   adults, combining gender

        | SerumSodium -> Quantity(135.0, 145.0, "mmol/L")
        | SerumChloride -> Quantity(95.0, 110.0, "mmol/L")
        | SerumBicarbonate -> Quantity(22.0, 32.0, "mmol/L")
        | SerumPotassium -> Quantity(3.5, 5.2, "mmol/L")
        | SerumPhospate -> Quantity(0.75, 1.5, "mmol/L")
        | SerumCalcium -> Quantity(2.10, 2.6, "mmol/L")
        | SerumGlucoseRandom -> Quantity(3.0, 7.7, "mmol/L")
        | SerumMagnesium -> Quantity(0.7, 1.1, "mmol/L")
        | Albumin -> Quantity(32.0, 45.0, "g/L")
        | ALP -> Quantity(30.0, 110.0, "U/L")
        | ALT -> Quantity(0.0, 35.0, "U/L")
        | AST -> Quantity(0.0, 40.0, "U/L")
        | GGT -> Quantity(0.0, 50.0, "U/L")
        | LDH -> Quantity(120.0, 250.0, "U/L")
        | BilirubinDirect -> Quantity(0.0, 7.0, "umol/L")
        | BilirubinTotal -> Quantity(0.0, 20.0, "umol/L")
        | Urea -> Quantity(3.0, 8.0, "mmol/L")
        | Creatinine -> Quantity(45.0, 110.0, "umol/L")
        | UricAcid -> Quantity(0.15, 0.45, "mmol/L")
        | Protein -> Quantity(60.0, 80.0, "g/L")

        // lab (FBC panel))
        | HB -> Quantity(7.5, 10.0, "g/dL")
        | HCT -> Quantity(0.37, 0.54, "%")
        | WCC -> Quantity(4.0, 11.0, "10^9/L")
        | Eosinophils -> Quantity(30.0, 350.0, "10^6/L")
        | Platelets -> Quantity(150.0, 400.0, "10^9/L")
        | RCC -> Quantity(3.8, 6.5, "10^12/L")
        | MCV -> Quantity(80.0, 100.0, "fL")

        // lab (quantitative microbiology)
        | COVID_RNA -> Detection false

    member this.LOINC_Code : LOINC_Code =
        match this with
        // vital signs
        | HR
        | BP_Systolic
        | BP_Diastolic
        | RR
        | SPO2
        | Temp

        | BSL

        | Height
        | Weight

        // other nurse collected
        | Pain -> "64008-6", "Pain severity [Score] [PhenX]"
        | StoolConsistency -> "11029-6", "Consistency of Stool"
        | StoolVolume -> "9217-1", "Output.stool [Volume]"

        | FluidIntake
        | UrineOutput -> "9187-6", "Urine output"

        // lab (CHEM20 panel)
        | SerumSodium
        | SerumChloride
        | SerumBicarbonate
        | SerumPotassium
        | SerumPhospate
        | SerumCalcium
        | SerumGlucoseRandom
        | SerumMagnesium
        | Albumin -> "1751-7", "Albumin [Mass/volume] in Serum or Plasma"
        | ALP -> "6768-6", "Alkaline phosphatase [Enzymatic activity/volume] in Serum or Plasma"
        | ALT -> "1742-6", "Alanine aminotransferase [Enzymatic activity/volume] in Serum or Plasma"
        | AST -> "1920-8", "Aspartate aminotransferase [Enzymatic activity/volume] in Serum or Plasma"
        | GGT
        | LDH
        | BilirubinDirect -> "14629-0", "Bilirubin.direct [Moles/volume] in Serum or Plasma"
        | BilirubinTotal -> "14631-6", "Bilirubin.total [Moles/volume] in Serum or Plasma"
        | Urea
        | Creatinine
        | UricAcid
        | Protein -> "2885-2", "Protein [Mass/volume] in Serum or Plasma"


        // lab (FBC panel)
        | HB -> "718-7", "Hemoglobin [Mass/volume] in Blood"
        | HCT -> "4544-3", "Hematocrit [Volume Fraction] of Blood by Automated count"
        | WCC
        | Eosinophils
        | Platelets -> "777-3", "Platelets [#/volume] in Blood by Automated count"
        | RCC -> "789-8", "Erythrocytes [#/volume] in Blood by Automated count"
        | MCV -> "787-2", "MCV [Entitic volume] by Automated count"

        // lab (quantitative microbiology)
        | COVID_RNA -> "94759-8", "SARS-CoV-2 (COVID-19) RNA [Presence] in Nasopharynx by NAA with probe detection"

    member this.Category =
        match this with
        // vital signs
        | HR
        | BP_Systolic
        | BP_Diastolic
        | RR
        | SPO2
        | Temp

        | BSL

        | Height
        | Weight -> CodeableConcept(ObservationCategory.System, "vital-signs", "Vital Signs")

        // other nurse collected
        | Pain
        | StoolConsistency
        | StoolVolume

        | FluidIntake
        | UrineOutput -> CodeableConcept(ObservationCategory.System, "exam", "Examination")

        // lab (CHEM20 panel)
        | SerumSodium
        | SerumChloride
        | SerumBicarbonate
        | SerumPotassium
        | SerumPhospate
        | SerumCalcium
        | SerumGlucoseRandom
        | SerumMagnesium
        | Albumin
        | ALP
        | ALT
        | AST
        | GGT
        | LDH
        | BilirubinDirect
        | BilirubinTotal
        | Urea
        | Creatinine
        | UricAcid
        | Protein

        // lab (FBC panel)
        | HB
        | HCT
        | WCC
        | Eosinophils
        | Platelets
        | RCC
        | MCV

        // lab (quantitative microbiology)
        | COVID_RNA -> CodeableConcept(ObservationCategory.System, "laboratory", "Lab")

module Panels =
    let FBC =
        [
            HB
            HCT
            WCC
            Eosinophils
            Platelets
            RCC
            MCV
        ]

    let CHEM20 =
        [
            SerumSodium
            SerumChloride
            SerumBicarbonate
            SerumPotassium
            SerumPhospate
            SerumCalcium
            Albumin
            ALP
            ALT
            AST
            GGT
            LDH
            BilirubinDirect
            BilirubinTotal
            Urea
            Creatinine
            UricAcid
            Protein
        ]

    let VitalSigns =
        [
            HR
            BP_Systolic
            BP_Diastolic
            RR
            SPO2
            Temp

            BSL

            Height
            Weight
        ]

type RandomResult =
    | Normal
    | High
    | Low
    | NormalHighNormal

type Period = Days of int

type SimulatedEvent =
    {
        Period: Period
        Panel: Observation list
        Results: Observation -> RandomResult
    }

module Scanarios =
    let highLFTs =
        {
            Period = Days 7
            Panel = Panels.CHEM20
            Results =
                function
                | ALT -> High
                | AST -> NormalHighNormal
                | _ -> Normal
        }

let create (createResource: CreateResource) (patient: Patient) =

    let observations =
        seq {
            yield
                Observation(
                    Status = N ObservationStatus.Final,
                    Category = L [ CodeableConcept("http://hl7.org/fhir/observation-category", "laboratory") ],
                    Code =
                        CodeableConcept(Coding = L [ Coding("http://loinc.org", "14749-6") ], Text = "Glucose, Serum"),
                    Value = FhirQuantity(2.0m, "mmol/L"),
                    ReferenceRange =
                        L [ Observation.ReferenceRangeComponent(Text = "<5.5", High = FhirQuantity(Value = N 5.5m)) ],
                    Subject = referenceToResource patient,
                    Effective = FhirDateTime("2015-01-21")
                )

            yield
                Observation(
                    Status = N ObservationStatus.Final,
                    Category = L [ CodeableConcept("http://hl7.org/fhir/observation-category", "laboratory") ],
                    Code = CodeableConcept(Coding = L [ Coding("http://loinc.org", "1988-5") ]),
                    Value = FhirQuantity(1m, "mg/L", Comparator = N Quantity.QuantityComparator.LessThan),
                    ReferenceRange = L [ Observation.ReferenceRangeComponent(Text = "<5") ],
                    Subject = referenceToResource patient
                )

            yield
                Observation(
                    Status = N ObservationStatus.Final,
                    Category = L [ CodeableConcept("http://hl7.org/fhir/observation-category", "laboratory") ],
                    Code = CodeableConcept(Coding = L [ Coding("http://loinc.org", "6301-6") ], Text = "INR"),
                    Value = FhirQuantity(5.0m, null, Comparator = N Quantity.QuantityComparator.LessThan),
                    ReferenceRange =
                        L [ Observation.ReferenceRangeComponent(
                                Text = "0.9-1.2",
                                Low = FhirQuantity(Value = N 0.9m),
                                High = FhirQuantity(Value = N 1.2m)
                            ) ],
                    Interpretation = L [ CodeableConcept("http://hl7.org/fhir/v2/0078", "H", "H") ],
                    Subject = referenceToResource patient,
                    Effective = FhirDateTime("2016-01-21")
                )
        }

    observations
    |> Seq.map createResource
    |> Seq.toList
