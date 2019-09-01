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
}