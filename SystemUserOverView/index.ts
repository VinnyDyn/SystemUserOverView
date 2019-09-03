import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { SystemUser } from "./SystemUser";
import { DH_NOT_SUITABLE_GENERATOR } from "constants";
import { ActivityReference } from "./ActivityReference";
import { EntityReference } from "./EntityReference";

export class SystemUserOverView implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _formType: XrmEnum.FormType;
	private _thisEntity: EntityReference;

	private _container: HTMLDivElement;
	private _buttons: HTMLDivElement;
	private _divSystemUsers: HTMLDivElement;

	private _activitiesReference: ActivityReference[];
	private _systemUsers: SystemUser[];
	private _selectedSystemUser: SystemUser;

	/**
	 * Empty constructor.
	 */
	constructor() {
		this._systemUsers = new Array();
	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='starndard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
		//Form Type
		this._formType = Xrm.Page.ui.getFormType();
		if(this._formType != XrmEnum.FormType.Create)
		{
			//Record Id
			this._thisEntity = new EntityReference(
				Xrm.Page.data.entity.getEntityName(),
				Xrm.Page.data.entity.getId(),
				Xrm.Page.data.entity.getPrimaryAttributeValue()
			)
		}

		//Activity Parameters
		this.JsonIsValid(context);

		this._container = document.createElement("div");
		this._container.setAttribute("class", "Container");
		container.append(this._container);

		//Buttons
		this._buttons = document.createElement("div");
		this._buttons.setAttribute("class", "SelectorTab");
		container.append(this._buttons);

		//Users
		this._divSystemUsers = document.createElement("div");
		container.append(this._divSystemUsers);

		this.GetAttributeValue();
	}
	
	private JsonIsValid(context: ComponentFramework.Context<IInputs>) {
		try {
			this._activitiesReference = JSON.parse(context.parameters.json.raw);
		}
		catch (e) {
			Xrm.Utility.alertDialog("Verify the parameter activity manifest.", function () { });
		}
	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		// Add code to update control view
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		return {};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void {
		// Add code to cleanup control if necessary
	}

	/**
	 * Recursive: Workaround, while we don't have a Lookup field on PCF
	 */
	public GetAttributeValue()
	{
		let ownerAttribute = Xrm.Page.getAttribute("ownerid");
		if (ownerAttribute)
		{
			//Get Value
			let ownerValue = ownerAttribute.getValue();
			if(ownerValue && ownerValue[0])
			{
				if(ownerValue[0].entityType = "systemuser")
					this.RetrieveSystemUser(ownerValue[0].id, this);
				else
					return;
			}
			else
			{
				//Recursive
				this.GetAttributeValue();
			}
		}
		else
			return;
	}
	
	/**
	 * Retrieve informations about SystemUser
	 * @param systemUserId 
	 * @param self 
	 */
	public RetrieveSystemUser(systemUserId: string, self: SystemUserOverView) {
		if (!self)
			self = this;

		Xrm.WebApi.online.retrieveRecord("systemuser", systemUserId, "?$select=address1_telephone1,_businessunitid_value,fullname,internalemailaddress,jobtitle,mobilephone,_parentsystemuserid_value,entityimageid,_positionid_value").then(
			function success(result) {

				let fullname = result["fullname"];
				let address1_telephone1 = result["address1_telephone1"];
				let mobilephone = result["mobilephone"];
				let internalemailaddress = result["internalemailaddress"];
				let jobtitle = result["jobtitle"];

				//Picture
				let entityimageid = result["entityimageid"];
				let entityimageurl = "";
				if (entityimageid)
					entityimageurl = Xrm.Page.context.getClientUrl() + result["entityimage_url"];

				//BusinessUnit
				let businessUnit: EntityReference = new EntityReference("", "", "");
				if (result["_businessunitid_value"]) {
					businessUnit = new EntityReference(
						result["_businessunitid_value@Microsoft.Dynamics.CRM.lookuplogicalname"],
						result["_businessunitid_value"],
						result["_businessunitid_value@OData.Community.Display.V1.FormattedValue"]);
				}

				//Position
				let postion: EntityReference = new EntityReference("", "", "");
				if (result["_positionid_value"]) {
					postion = new EntityReference(
						result["_positionid_value@Microsoft.Dynamics.CRM.lookuplogicalname"],
						result["_positionid_value"],
						result["_positionid_value@OData.Community.Display.V1.FormattedValue"]);
				}

				//Parent
				let parent: EntityReference = new EntityReference("", "", "");
				if (result["_parentsystemuserid_value"]) {
					parent = new EntityReference(
						result["_parentsystemuserid_value@Microsoft.Dynamics.CRM.lookuplogicalname"],
						result["_parentsystemuserid_value"],
						result["_parentsystemuserid_value@OData.Community.Display.V1.FormattedValue"]
					)
				}

				let systemUser: SystemUser;
				systemUser = new SystemUser(
					entityimageurl,
					systemUserId,
					fullname,
					address1_telephone1,
					mobilephone,
					internalemailaddress,
					jobtitle,
					postion,
					businessUnit,
					parent);
				self._systemUsers.push(systemUser);
				self.CreateContent(systemUser);

				//Recursive
				if (systemUser.Parent.Id)
					self.RetrieveSystemUser(systemUser.Parent.Id, self);
			},
			function (error) {
				Xrm.Utility.alertDialog(error.message, function () { });
			}
		);
	}

	/**
	 * Create visual components to represent the SystemUser
	 * @param systemUser 
	 */
	public CreateContent(systemUser: SystemUser) {
		//Button
		let selector: HTMLButtonElement;
		selector = document.createElement("button");
		selector.setAttribute("class", "SelectorButton");
		selector.innerText = systemUser.Name;
		selector.addEventListener("click", this.SelectUser.bind(this, systemUser.Id));
		this._buttons.append(selector);

		//User
		let divContent: HTMLDivElement;
		divContent = document.createElement("div");
		divContent.setAttribute("class", "Content");
		divContent.id = systemUser.Id;
		this._divSystemUsers.append(divContent);

		//Left
		let divLeft: HTMLDivElement;
		divLeft = document.createElement("div");
		divLeft.setAttribute("class", "Left");
		divContent.append(divLeft);
		{
			//Image
			let img: HTMLImageElement;
			img = document.createElement("img");
			img.setAttribute("class", "Image");
			img.setAttribute("src", systemUser.PhotoUrl);
			divLeft.append(img);
		}

		//Right
		let divRight: HTMLDivElement;
		divRight = document.createElement("div");
		divRight.setAttribute("class", "Right");
		divContent.append(divRight);
		{
			//Name
			let pName: HTMLParagraphElement;
			pName = document.createElement("p");
			pName.innerText = systemUser.Name;
			divRight.append(pName);

			//Telephone
			let aTelephone: HTMLAnchorElement;
			aTelephone = document.createElement("a");
			aTelephone.setAttribute("href", "tel:" + systemUser.Telephone);
			aTelephone.innerText = systemUser.Telephone;
			divRight.append(aTelephone);

			//MobilePhone
			let aMobilePhone: HTMLAnchorElement;
			aMobilePhone = document.createElement("a");
			aMobilePhone.setAttribute("href", "tel:" + systemUser.Mobile);
			aMobilePhone.innerText = systemUser.Mobile;
			divRight.append(aMobilePhone);

			//Email
			let aEmail: HTMLAnchorElement;
			aEmail = document.createElement("a");
			aEmail.setAttribute("href", "mailto:" + systemUser.Email);
			aEmail.innerText = systemUser.Email;
			divRight.append(aEmail);

			//JobTitle
			let pJobTitle: HTMLParagraphElement;
			pJobTitle = document.createElement("p");
			pJobTitle.innerText = systemUser.JobTitle;
			divRight.append(pJobTitle);

			//Position
			let pPosition: HTMLParagraphElement;
			pPosition = document.createElement("p");
			pPosition.innerText = systemUser.Position.Name;
			divRight.append(pPosition);

			//Position
			let pBusinessUnit: HTMLParagraphElement;
			pBusinessUnit = document.createElement("p");
			pBusinessUnit.innerText = systemUser.BusinessUnit.Name;
			divRight.append(pBusinessUnit);

			//Activities Buttons
			divRight.append(this.CreateActivityArea());
		}
	}

	/**
	 * Dynamic components, based on JSON parameter. Add a button for each record.
	 */
	public CreateActivityArea(): HTMLDivElement {

		let divActivities: HTMLDivElement;
		divActivities = document.createElement("div");
		divActivities.setAttribute("class", "Activities");

		//Only for created records
		if (this._formType != XrmEnum.FormType.Create && this._activitiesReference && this._activitiesReference!.length > 0) {
			for (let index = 0; index < this._activitiesReference.length; index++) {
				//Get Acitivity
				let activityReference = this._activitiesReference[index] as ActivityReference;
				//Create a button for the activity
				divActivities.append(this.CreateActivityButton(activityReference));
			}
		}
		return divActivities;
	}

	/**
	 * Create a User Name
	 * @param systemUserId 
	 */
	public SelectUser(systemUserId: string) {
		let contents: HTMLCollection;
		contents = document.getElementsByClassName("Content");
		for (let index = 0; index < contents.length; index++) {
			let element = contents[index] as HTMLDivElement;
			element.style.display = "none";
		}

		let systemUserContent = document.getElementById(systemUserId);
		systemUserContent!.style.display = "flex";

		//Get SystemUserReferemce in memory array
		this.GetSystemUserReference(systemUserId);
	}

	/** 
	 * Select SystemUser by SystemUserId
	*/
	public GetSystemUserReference(systemUserId: string) {
		//Verify if the array has values
		if (this._systemUsers!.length > 0)
			this._selectedSystemUser = this._systemUsers.filter(function (systemUser: SystemUser) { return systemUser.Id == systemUserId })[0];
	}

	/**
	 * Create a button to represent the activity
	 * @param activityReference 
	 */
	public CreateActivityButton(activityReference: ActivityReference): HTMLButtonElement {
		let btnActivity: HTMLButtonElement;
		btnActivity = document.createElement("button");
		btnActivity.setAttribute("class", "Activities");
		btnActivity.innerText = activityReference.DisplayName;
		btnActivity.addEventListener("click", this.NewActvitiy.bind(this, activityReference.LogicalName));
		return btnActivity;
	}

	/**
	 * Call a new activity form
	 * @param activityLogicalName 
	 */
	public NewActvitiy(activityLogicalName: string) {

		if (this._formType != XrmEnum.FormType.Create) {
			var parameters = {
				"regardingobjectid": this._thisEntity.ToXrmLookupValue(),
				"ownerid": this._selectedSystemUser.ToXrmLookupValue(),
				//TO-DO
				//"from" : this._selectedSystemUser.ToXrmActivityPartyValue()
			};
			Xrm.Utility.openQuickCreate(activityLogicalName,this._thisEntity.ToXrmLookupValue(),parameters).then(function (caller){},function (error) {});
		}
	}
}