# SystemUserOverView

With this component, you can see the complete hierarchy (parentsystemuserid) of a user (only ownerid), make calls, send emails and parametrize wich activities will be displayed.

![alt text](https://github.com/VinnyDyn/SystemUserOverView/blob/master/Images/control-presentation.gif)

### Attribute Types
The component suport these attribute types:
- Whole.None
- TwoOptions
- DateAndTime.DateOnly
- DateAndTime.DateAndTime
- Decimal
- FP
- Multiple
- Currency
- OptionSet
- SingleLine.Email
- SingleLine.Text
- SingleLine.TextArea
- SingleLine.URL
- SingleLine.Ticker
- SingleLine.Phone

### Add Activities
Use a JSON parameter to add multiple buttons representing the activities.
##### Only add activities!
Samples:
```json
[{"DisplayName":"Task","LogicalName":"task"}]

[{"DisplayName":"Task","LogicalName":"task"},{"DisplayName":"Phone Call","LogicalName":"phonecall"},{"DisplayName":"Appointment","LogicalName":"appointment"}]
```
Use the json as a parameter for the component.
![alt text](https://github.com/VinnyDyn/SystemUserOverView/blob/master/Images/control-activities.gif)

### \node_modules\@types\xrm\index.d.ts\Xrm.Utility.OpenParameters
Change the OpenParameters interface to:
```typescript
    namespace Utility {
        interface OpenParameters {
            [index: string]: string | LookupValue | LookupValue[];
        }
```
