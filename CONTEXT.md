# Freight Quote Management

This context describes the language used to select equipment for customer full-container-load freight quotations while preserving the meaning of historical records.

## Language

**FCL Container Option**:
A canonical equipment category that a customer can select for a full-container-load quotation. It has a stable local identity and a customer-facing name.
_Avoid_: Container type, when referring specifically to a customer-selectable catalogue option

**Retired FCL Container Option**:
An FCL Container Option that is no longer offered for new customer quotations but remains identifiable in historical quotations and rates.
_Avoid_: Deleted container, unsupported container

**Internal Dimensions**:
The complete inside length, width, and height of an FCL Container Option. The set is unknown when any component cannot be established reliably.
_Avoid_: Container dimensions, external dimensions

**Container Capacity**:
The source-stated usable volume of an FCL Container Option, independent of its Internal Dimensions.
_Avoid_: Calculated volume

**Tare Weight**:
The source-stated weight of an empty FCL Container Option.
_Avoid_: Empty payload

**Maximum Cargo Weight**:
The source-stated upper limit for cargo carried in an FCL Container Option and the weight limit relevant to customer equipment selection. It is independent of Tare Weight and Maximum Total Weight.
_Avoid_: Maximum payload, when referring to the aligned source value

**Maximum Total Weight**:
The source-stated upper limit for the combined container and cargo weight of an FCL Container Option.
_Avoid_: Maximum gross weight, when referring to the aligned source value