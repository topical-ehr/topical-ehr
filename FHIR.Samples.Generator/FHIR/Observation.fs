module NextEHR.Samples.Generator.FHIR.Observation

open Hl7.Fhir.Model

open NextEHR.FHIR.DotNetUtils
open NextEHR.FHIR.Extensions
open NextEHR.Samples.Generator.Utils

let create (createResource: CreateResource) (patient: Patient) =

    let observations =
        seq {
            yield
                Observation(
                    Identifier =
                        L [ Identifier(
                                Value = "123",
                                System = PatExtensions.Urls.PRACTICE_SOFTWARE_RECORD_ID,
                                Type = CodeableConcept("https://hl7.org/fhir/v2/0203", "MR", "INTERNALID")
                            ) ],
                    Status = N ObservationStatus.Final,
                    Category = L [ CodeableConcept("http://hl7.org/fhir/observation-category", "laboratory") ],
                    Code =
                        CodeableConcept(
                            Coding =
                                L [ Coding("http://loinc.org", "14749-6")
                                    Coding(PatExtensions.Urls.BPCODE, "14") ],
                            Text = "Glucose, Serum"
                        ),
                    Value = Quantity(2.0m, "mmol/L"),
                    ReferenceRange =
                        L [ Observation.ReferenceRangeComponent(Text = "<5.5", High = Quantity(Value = N 5.5m)) ],
                    Subject = referenceToResource patient,
                    Effective = FhirDateTime("2015-01-21")
                )

            yield
                Observation(
                    Identifier =
                        L [ Identifier(Value = "124", System = PatExtensions.Urls.PRACTICE_SOFTWARE_RECORD_ID) ],
                    Status = N ObservationStatus.Final,
                    Category = L [ CodeableConcept("http://hl7.org/fhir/observation-category", "laboratory") ],
                    Code = CodeableConcept(Coding = L [ Coding("http://loinc.org", "1988-5") ]),
                    Value = Quantity(1m, "mg/L", Comparator = N Quantity.QuantityComparator.LessThan),
                    ReferenceRange = L [ Observation.ReferenceRangeComponent(Text = "<5") ],
                    Subject = referenceToResource patient
                )

            yield
                Observation(
                    Identifier =
                        L [ Identifier(Value = "125", System = PatExtensions.Urls.PRACTICE_SOFTWARE_RECORD_ID) ],
                    Status = N ObservationStatus.Final,
                    Category = L [ CodeableConcept("http://hl7.org/fhir/observation-category", "laboratory") ],
                    Code =
                        CodeableConcept(
                            Coding =
                                L [ Coding("http://loinc.org", "6301-6")
                                    Coding(PatExtensions.Urls.BPCODE, "12") ],
                            Text = "INR"
                        ),
                    Value = Quantity(5.0m, null, Comparator = N Quantity.QuantityComparator.LessThan),
                    ReferenceRange =
                        L [ Observation.ReferenceRangeComponent(
                                Text = "0.9-1.2",
                                Low = Quantity(Value = N 0.9m),
                                High = Quantity(Value = N 1.2m)
                            ) ],
                    Interpretation = L [ CodeableConcept("http://hl7.org/fhir/v2/0078", "H", "H") ],
                    Subject = referenceToResource patient,
                    Effective = FhirDateTime("2016-01-21")
                )
        }

    observations
    |> Seq.map createResource
    |> Seq.toList
