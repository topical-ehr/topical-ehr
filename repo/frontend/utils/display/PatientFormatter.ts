import { HumanName, Patient } from "../FhirTypes";
import * as libphonenumber from "libphonenumber-js";

const dobFormatter = new Intl.DateTimeFormat([], {
  year: "numeric",
  month: "2-digit",
  day: "numeric",
});

export class PatientFormatter {
  constructor(public patient: Patient) {}

  /**
   * @returns a text representation of a patient's name
   *
   * Picks, in order, the usual name, the official name, and then the first name.
   * Also adds a nickname.
   *
   * WARNING: Other names are ignored - may want to highlight in the UI if there are several.
   */
  get name() {
    function display(name: HumanName) {
      const useText = false;
      if (useText && name.text) {
        return name.text.trim();
      } else {
        return `${(name.family ?? "").toUpperCase()}, ${
          name.given ?? ""
        }`.trim();
      }
    }

    const names = this.patient.name ?? [];

    function getOne() {
      const candidates = [
        names.find((n) => n.use === "official"),
        names.find((n) => n.use === "usual"),
        names[0],
      ];

      for (const candidate of candidates) {
        if (candidate) {
          return candidate;
        }
      }
    }

    const name = getOne();
    if (!name) {
      return "(NO NAME)";
    } else {
      const nickname = names.find((n) => n.use === "nickname");
      if (nickname && name.use != "nickname") {
        return `${display(name)} (${display(nickname)})}`;
      } else {
        return display(name);
      }
    }
  }

  /**
   * @returns date of birth
   */
  get dateOfBirth() {
    return this.patient.birthDate;
  }

  private getAgeFullYears(dobOrString: Date | string) {
    const dob =
      typeof dobOrString == "string" ? new Date(dobOrString) : dobOrString;

    // see e.g. https://stackoverflow.com/a/7091965/94078
    const today = new Date();
    const years = today.getFullYear() - dob.getFullYear();
    const months = today.getMonth() - dob.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
      return years - 1;
    }
    return years;
  }

  get ageGenderBorn() {
    const gender = (this.patient.gender || "gender not recorded").toLowerCase();
    const dobTimestamp = Date.parse(this.patient.birthDate ?? "");
    const dob = isNaN(dobTimestamp) ? null : new Date(dobTimestamp);
    if (dob) {
      return `${this.getAgeFullYears(
        dob
      )} years old  ·  ${gender}  ·  born ${dobFormatter.format(dob)}`;
    } else {
      return `NO DOB | ${gender}`;
    }
  }

  get medicareNumber() {
    const identifiers = this.patient.identifier || [];
    const medicares = identifiers.filter(
      (i) => i.system === "http://ns.electronichealth.net.au/id/hi/mc"
    );
    if (medicares.length > 1) {
      throw new Error(
        `multiple medicare identifiers for patient: ${this.patient.id}`
      );
    }
    if (medicares.length == 0) {
      return null;
    }
    return medicares[0].value;
  }

  private contactPoint(type: string) {
    const telecom = this.patient.telecom || [];
    return (
      telecom
        .filter((t) => t.system === "phone" && t.use === type)
        .map((t) => t.value)
        .join("; ") || null
    );
  }
  get contactMobilePhone() {
    return formatPhoneNumber(this.contactPoint("mobile"));
  }
  get contactHomePhone() {
    return formatPhoneNumber(this.contactPoint("home"));
  }
  get contactEmail() {
    return this.contactPoint("email");
  }

  get addresses() {
    const address = this.patient.address;
    if (!address) return null;
    return address
      .map((a) => [(a.line || []).join(" "), a.city, a.postalCode].join(", "))
      .join("; ");
  }

  get ageGenderBornPhoneAddressMedicare() {
    const medicare = this.medicareNumber;
    const medicareStr =
      medicare && medicare.length === 11
        ? // separate out the IRN digit
          medicare.slice(0, -1) + "-" + medicare.slice(-1)
        : medicare;
    const medicare2 = medicareStr ? ["MC " + medicareStr] : [];

    return [
      this.ageGenderBorn,
      this.contactMobilePhone,
      this.contactHomePhone,
      this.addresses,
      medicare2,
    ]
      .filter((s) => s)
      .join(" | ");
  }
}

function formatPhoneNumber(str: string | null) {
  if (!str) {
    return str;
  }

  const parsed = libphonenumber.parse(str);
  if (parsed.valid) {
    return libphonenumber.format(parsed, "National");
  } else {
    return str;
  }
}
