export class EntityReference
{
    public LogicalName : string;
    public Id : string;
    public Name : string;

    constructor(LogicalName : string, Id : string, Name : string)
    {
        this.LogicalName = LogicalName;
        this.Id = Id;
        this.Name = Name;
    }

    public ToXrmLookupValue() : Xrm.LookupValue
    {
        var thisEntityRecord = {
            entityType: this.LogicalName,
            id: this.Id,
            name: this.Name
        };
        return thisEntityRecord;
    }
}