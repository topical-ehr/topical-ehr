module NextEHR.FHIR.V5Guid

open System
open System.Text
open System.Security.Cryptography

let makeV5Guid (namespaceGuid: Guid) (value: string) =

    // based on  http://stackoverflow.com/questions/2642141/how-to-create-deterministic-guids
    //           https://github.com/LogosBible/Logos.Utility/blob/master/src/Logos.Utility/GuidUtility.cs

    let SwapByteOrder guid =
        let SwapBytes (array: byte []) left right =
            let temp = array.[left]
            array.[left] <- array.[right]
            array.[right] <- temp

        SwapBytes guid 0 3
        SwapBytes guid 1 2
        SwapBytes guid 4 5
        SwapBytes guid 6 7


    // convert the name to a sequence of octets (as defined by the standard or conventions of its namespace) (step 3)
    let nameBytes = Encoding.UTF8.GetBytes(value)

    // convert the namespace UUID to network order (step 3)
    let namespaceBytes = namespaceGuid.ToByteArray()
    SwapByteOrder(namespaceBytes)

    // comput the hash of the name space ID concatenated with the name (step 4)
    use hasher = SHA1.Create()

    hasher.TransformBlock(namespaceBytes, 0, namespaceBytes.Length, null, 0)
    |> ignore

    hasher.TransformFinalBlock(nameBytes, 0, nameBytes.Length)
    |> ignore

    let hashBytes = hasher.Hash

    // most bytes from the hash are copied straight to the bytes of the new GUID (steps 5-7, 9, 11-12)
    let newGuid = Array.take 16 hashBytes

    // set the four most significant bits (bits 12 through 15) of the time_hi_and_version field to the appropriate 4-bit version number from Section 4.1.3 (step 8)
    let version = 5uy
    newGuid.[6] <- ((newGuid.[6] &&& 0x0Fuy) ||| (version <<< 4))

    // set the two most significant bits (bits 6 and 7) of the clock_seq_hi_and_reserved to zero and one, respectively (step 10)
    newGuid.[8] <- ((newGuid.[8] &&& 0x3Fuy) ||| 0x80uy)

    // convert the resulting UUID to local byte order (step 13)
    SwapByteOrder(newGuid)
    Guid(newGuid)
