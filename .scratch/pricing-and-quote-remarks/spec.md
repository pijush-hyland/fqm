# Admin Pricing and Quote Remarks

## Destination

Define implementation-ready behavior for reorganizing pricing inputs in the admin experience, renaming the admin pricing section, and adding customer remarks to the final quote-form stage.

## Scope

### Admin pricing field order

- In both create and edit modes, place `Currency` immediately before the price input it qualifies.
- For Air and LCL pricing, show `Currency` followed by `Rate` as adjacent fields.
- For FCL pricing, show the single `Currency` selector immediately before the container-rate group.
- A single currency continues to apply to every container rate in an FCL pricing record.
- Reordering fields must not change existing defaults, validation, supported currencies, or submitted payload values.

### Admin section wording

- Rename the admin section from `Courier Rates` to `My Pricing` wherever the section itself is identified to an admin, including its navigation tab and page heading.
- Keep rate-specific commands and messages precise. Labels such as `Create Rate`, `Edit Rate`, `Update Rate`, and field-level validation messages remain unchanged.
- Internal component, route, API, type, and database names remain unchanged.

### Customer remarks

- Add an optional multiline field labelled `Remarks` at the bottom of the existing final `Cargo Type` stage.
- Do not add another form stage or alter progress-step behavior.
- The field accepts at most 1,000 characters.
- Preserve the entered value when the customer moves backward and forward through the form.
- Include Remarks in the quote requirement sent to `POST /quotes/get-quotes`.
- The backend request contract accepts Remarks without using it to alter rate matching or price calculation.
- Empty Remarks may be omitted or sent as an empty value, but must not prevent quote retrieval.

## Acceptance Criteria

1. Given an admin creates or edits an Air or LCL rate, when the pricing fields are displayed, then `Currency` appears directly before and adjacent to `Rate`.
2. Given an admin creates or edits an FCL rate, when container pricing is displayed, then `Currency` appears directly before the container-rate group and applies to every entered container rate.
3. Given any supported pricing mode, when the admin submits unchanged values after the reordering, then the request payload and validation behavior match the existing behavior.
4. Given an admin opens the pricing area, then its navigation tab and page heading read `My Pricing` rather than `Courier Rates`.
5. Given an admin performs a rate-specific action, then action text such as `Create Rate` and `Edit Rate` remains unchanged.
6. Given a customer reaches the existing final `Cargo Type` stage, then an optional `Remarks` textarea appears after the cargo fields on that same stage.
7. Given a customer enters Remarks and navigates to an earlier stage and back, then the entered Remarks remain present.
8. Given a customer enters no more than 1,000 characters and requests quotes, then Remarks is included in the quote request and quote retrieval proceeds normally.
9. Given a customer enters more than 1,000 characters, then the form prevents submission and explains the character limit.
10. Given Remarks is present in a quote request, then it does not affect which rates match or how prices are calculated.

## Out of Scope

- Replacing FCL dimensions or weight data with data from Zip World or any other external source.
- Persisting quote searches or Remarks as durable quote-request records.
- Adding an admin inbox, notification, or submitted-quote details view for Remarks.
- Renaming backend concepts, APIs, source files, database objects, or rate-specific actions from courier rate to pricing.