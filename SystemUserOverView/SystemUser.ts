import { EntityReference } from "./EntityReference";

export class SystemUser
{
    public PhotoUrl : string;
    public Id : string;
    public Name : string;
    public Telephone : string;
    public Mobile : string;
    public Email : string;
    public JobTitle : string;
    public Position : EntityReference;
    public BusinessUnit : EntityReference;
    public Parent : EntityReference;

    constructor(PhotoUrl : string, Id : string, Name : string, Telephone : string, Mobile : string, Email : string, JobTitle : string, Position : EntityReference, BusinessUnit : EntityReference, Parent : EntityReference)
    {
        this.PhotoUrl = PhotoUrl;
        this.Id = Id;
        this.Name = Name;
        this.Telephone = Telephone;
        this.Mobile = Mobile;
        this.Email = Email;
        this.JobTitle = JobTitle;
        this.Position = Position;
        this.BusinessUnit = BusinessUnit;
        this.Parent = Parent;
    }

    public ToXrmLookupValue() : Xrm.LookupValue
    {
        var thisEntityRecord = {
            entityType: "systemuser",
            id: this.Id,
            name: this.Name
        };
        return thisEntityRecord;
    }
    
    public ToXrmActivityPartyValue() : Xrm.LookupValue[]
    {
        var thisEntityRecord = [{
            entityType: "systemuser",
            id: this.Id,
            name: this.Name
        }];
        return thisEntityRecord;
    } 
}