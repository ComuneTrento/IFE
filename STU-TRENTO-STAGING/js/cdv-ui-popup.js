// Citizen Data Vault User Interface (cdv-ui-popup.js)
//-----------------------------------------------------------------------------
// This JavaScript contains the functionality related to the User Interface
// which enriches the Interactive Front-End component with the features of
// the CDV component.
// - It uses the methods implemented in cdv-core-popup.js
// - The CDV server side code is available in:
//              https://github.com/SIMPATICOProject/CDV
//-----------------------------------------------------------------------------

var cdvUI = (function () {
	var instance; // Singleton Instance of the UI component
	var featureEnabled = false;
	var consent_given=false;
    var dialog_cdv = null;
	var informedConsentLink = "informed_consent.html";
	var dlgPosition = { my: "right top", at: "right bottom",  of: "#cdv_toolbar_buttons"}
	
	function Singleton() {

		var colors = {
			cdv: '#008000'
		}

		var originalCSS = null;

		var labels = {
			dialogTitle: 'Citizen Data Vault',
			entryMessage: 'Welcome to SIMPATICO Citizen Data Vault!',
			statusMessage: 'Now you can select, store and update your personal data to fill form fields.',
			dialogSaveTitle: 'Data Saved',
			dialogSaveMessage: 'Data saved successfully into your Data Vault.',
			statusMessageNoAccount: "No CDV Account associated to you. Create?",
			statusMessageNoActive: "CDV is not active for this service. Activate?",
			confirmSaveDataMessage: "Update your Persona Data?",
			buttonSaveData:"Save your data",
			buttonManageData:"Manage your data",
			buttonActivate:"Activate",
			buttonCreate: "Create",
			consentButton: "Consent"

		};

		var dataFields = [];
		var cdvDashUrl = "#";
													 

		/**
		 * CURRENTLY SELECTED FIELD
		 */
		var selectedField = null;

		

		/**
		 * INITIALIZE UI COMPONENT.
		 * CONFIG PARAMETERS:

		 */
		function initComponent(parameters) {

			if (parameters.cdvDashUrl) {
				cdvDashUrl = parameters.cdvDashUrl;
			}
			
			if (parameters.dataFields) {
				dataFields = parameters.dataFields;
			}
			
			if (parameters.informedConsentLink) {
				this.informedConsentLink = parameters.informedConsentLink;
			}
                        
                        if (parameters.consentGiven) {
				consent_given = parameters.consentGiven;
			}
            if (parameters.dlgPosition) {
            	dlgPosition = parameters.dlgPosition; 
            }
                        
                        
			cdvDashUrl: parameters.cdvDashUrl

			cdvCORE.getInstance().init({
				endpoint: parameters.endpoint,
				serviceID: parameters.serviceID,
				serviceName: parameters.serviceName,
				dataFields: parameters.dataFields,
				serviceURL: parameters.serviceURL,
                cdvDashUrl: parameters.cdvDashUrl
			});

			labels.dialogTitle = parameters.dialogTitle || labels.dialogTitle;
			labels.entryMessage = parameters.entryMessage || labels.entryMessage;
			labels.statusMessage = parameters.statusMessage || labels.statusMessage;
            labels.dialogSaveTitle = parameters.dialogSaveTitle || labels.dialogSaveTitle;
			labels.dialogSaveMessage = parameters.dialogSaveMessage || labels.dialogSaveMessage;
            labels.statusMessageNoAccount = parameters.statusMessageNoAccount || labels.statusMessageNoAccount;
            labels.statusMessageNoActive = parameters.statusMessageNoActive || labels.statusMessageNoActive;
			labels.confirmSaveDataMessage=parameters.confirmSaveDataMessage || labels.confirmSaveDataMessage;
			labels.buttonSaveData=parameters.buttonSaveData || labels.buttonSaveData;
			labels.buttonManageData=parameters.buttonManageData || labels.buttonManageData;
			labels.buttonActivate=parameters.buttonActivate || labels.buttonActivate;
			labels.buttonCreate=parameters.buttonCreate || labels.buttonCreate;
			labels.consentButton=parameters.consentButton || labels.consentButton;
           
    	    colors.cdv = parameters.cdvColor || colors.cdv;

		}

		/**
		 * OPEN CDV UI DIALOG
		 */
		function enableComponentFeatures() {
			if (featureEnabled)
				return;
			featureEnabled = true;
			console.log(">>>>initializing CDV Dialog Box");

			if (!dialog_cdv) {
				var inizialize = initializeAccount();
				cdvCORE.getInstance().initializeAccount(inizialize);
				console.log("<<<<initializing CDV Dialog Box");
				
			} else {

				dialog_cdv.dialog("open");
				
				

			}
			highlightFields(dataFields, true);
			$(document.body).append('<div id="cdv_toolbar_buttons"><button class="btn btn-primary pull-right" title="Open CDV" onClick="toggleDialog();" name="Open CDV">&#9776; '+labels.dialogTitle + '<i class="icon-circle-arrow-down"></i></button></div>');
			

		}
		
		
		function disableComponentFeatures() {
			if (!featureEnabled)
				return;
			featureEnabled = false;
			selectedField = null;
			highlightFields(dataFields, false);
			$('#plist').remove();
			if (dialog_cdv) {
				dialog_cdv.dialog("destroy");
				dialog_cdv=null;
			}
			if ($('#cdv_toolbar_buttons').length) $('#cdv_toolbar_buttons').remove();

		}

		function setError(target) {
			var targetElement = document.getElementById(target);
			return function (text) {
				targetElement.innerHTML = '<p>' + text + '</p>';
			}
		}

		function confirmUpdateData() {
			return function (saved) {

				console.log("saved__:" + saved);
				var errCb = setError("tab-pdata");
				if (saved) {
					var dialog_saved = $(
							'<div id="dialog-message" title="' + labels.dialogSaveTitle + '">' +
							'			<p>' + labels.dialogSaveMessage + '</p>' +
							'</div>').dialog({
							modal: true,
							buttons: {
								Ok: function () {
									//cdvCORE.getInstance().cdv_getdata(cdvUI.selectedField, "tab-pdata", errCb);
									var getPDataList = updatePDataFields(cdvUI.selectedField, "tab-pdata");
									cdvCORE.getInstance().cdv_getdata(getPDataList, errCb);
									$(this).dialog("close");
									//dialog_saved.dialog("open");
								}
							}
						});
					dialog_saved.dialog("open");
				}
			}

		}
		
		

		function initializeAccount() {
			return function (account_exist) {
				console.log("Account " + account_exist);
				if (account_exist) {
					var initializeDlg = initializeDialog();
					cdvCORE.getInstance().initializeSLR(initializeDlg);
				} else {
					var initializeDlg = initializeDialog();
					initializeDlg(false, false);
				}
			}
		}

		function updatePDataFields(source, target) {
			return function (json) {
				var fieldSelect1 = "<fieldset><legend>Selected field </legend>";
				var fieldSelect2 = "<fieldset><legend>Other available fields</legend>";

				 // code for the creation of datalist to anchor to each data input
				var p = $('#plist');
				if (p) {
					p.remove();
				}
				var datalisttemp = '<div id="plist">';
				for (var itemName in json.properties) {
					var property = json.properties[itemName];
					var propertyField = property.key;
					propertyField = propertyField.replace( /(:|\.|\[|\]|,|=|@)/g, "\\$1" );	
					
					datalisttemp += '<datalist id="datalist' + property.key + '">';
                    datalisttemp +='<select id='+property.key+' style="display: none;">';
					for (var field in property.values) {
						datalisttemp += '<option>' + property.values[field] + '</option>';
					}
					datalisttemp += '</select></datalist>';
					$('#' +propertyField).attr("list", "datalist" + property.key);
					
					if(property.values.length>0)
						{$('#' +propertyField).val(property.values[0]);}
				    
                    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
						$('#' +propertyField).autocomplete({
							source: property.values,
							minLength: 0,
						  }).focus(function () {
							$(this).autocomplete("search");
						  });
					 }
				}
				$(document.body).append(datalisttemp + '</div>');

				
				/*for (itemName in json.properties) {
					property = json.properties[itemName];
					var fieldSelectTemp='';
					var propertyField= property.key;
					propertyField=propertyField.replace( /(:|\.|\[|\]|,|=|@)/g, "\\\\$1" );
					console.log(propertyField);
					if ($('#' + propertyField).attr("label")){
						fieldSelectTemp = '<label class="Labeltabella">' + $('#' + propertyField).attr("label") + '</label>';
					
					} else{
						
						fieldSelectTemp = $('label[for="' + property.key + '"]').html();
					}
					
					fieldSelectTemp += '<p><select onchange="setFieldValue(\'' + propertyField + '\',$(this).val())">';
					fieldSelectTemp += '<option value="">--------</option>';
					for (field in property.values) {
						fieldSelectTemp += '<option value=\'' + property.values[field] + '\'>' + property.values[field] + '</option>';
						
					}
					fieldSelectTemp += '</select></p>';
					if (property.key == $(source).attr("id")) {
						fieldSelect1 += fieldSelectTemp;
					} else {
						fieldSelect2 += fieldSelectTemp;
					}
					
				}
				document.getElementById(target).innerHTML = fieldSelect1 + "</fieldset>";
				document.getElementById(target).innerHTML += fieldSelect2 + "</fieldset>";*/

			}

		}
		
				
		
		function createTabSetting(target) {
			//return function (json) {
				
				
				var fieldSelect1 = "<fieldset><legend>CDV Account</legend>";
				var fieldSelect2 = "<fieldset><legend>Export</legend>";
				var fieldSelect3 = "<fieldset><legend>Data and Permissions</legend>";
			    fieldSelect1 += ' <button class="ui-button ui-widget ui-corner-all" onClick="confirmRemoveAccount();">Remove Account</button>';

				fieldSelect2 += ' <button on-click class="ui-button ui-widget ui-corner-all" onClick="cdvCORE.getInstance().exportData();">Export your data</button>';
				fieldSelect3 += ' <button class="ui-button ui-widget ui-corner-all" onClick="openCDV(\''+cdvDashUrl+'\')">Manage your Data</button>';

				
				
				document.getElementById(target).innerHTML = fieldSelect1 + "</fieldset><br>";
				document.getElementById(target).innerHTML += fieldSelect2 + "</fieldset><br>";
				document.getElementById(target).innerHTML += fieldSelect3 + "</fieldset>";

			//}

		}
		
		

		function initializeDialog() {

			return function (account_exist, activated) {
				var statusMessage = labels.statusMessage;
				var entryMessage = labels.entryMessage;

				console.log("Initialize dialog: " + account_exist + "-" + activated);

				if (!account_exist) {
					statusMessage = '<img src="./img/alert.png" width="40" height="40" <span class="ui-icon ui-icon-alert">  ' + labels.statusMessageNoAccount;
					entryMessage = "";
				} else if (!activated) {
					statusMessage = '<img src="./img/alert.png" width="40" height="40" align="bottom">  ' + labels.statusMessageNoActive;
					entryMessage = "";
				}
				dialog_cdv = createDialogNoTabs(entryMessage, statusMessage);
				
				
				if (!account_exist) {
					dialog_cdv.dialog({
						buttons: [{
							text: labels.buttonCreate,
							click: function () {
								
								if(consent_given){
									var confirm = activateSLR();
								    cdvCORE.getInstance().createAccount(confirm);
								    dialog_cdv.dialog("destroy");
								} else {
									showPrivacyPolicyForActivation();									
								}
								
							}

						}]

					});

				} else if (!activated) {
					dialog_cdv.dialog({
						buttons: [{
							text: labels.buttonActivate,
							click: function () {
								var activate = activateSLR();
								activate(true);
								dialog_cdv.dialog("destroy");
							}

						}]

					});

				} else {

					dialog_cdv.dialog({
						buttons:[ {
							text: labels.buttonSaveData,
							click: function () {
								var confirm = confirmUpdateData();
								cdvCORE.getInstance().cdv_postdata(confirm);
						}},
							
							{text: labels.buttonManageData,
							click: function () {
								openCDV(cdvDashUrl);
							}
							
					}]

					});

				}

				dialog_cdv.tabs({
					beforeActivate: function (event, ui) {

						var errCb = setError(ui.newPanel["0"].id);

						if (ui.newPanel["0"].id == "tab-pdata") {
							/*ui.newPanel["0"].innerHTML = '<p>Loading...</p>';
							var getPDataList = updatePDataFields(cdvUI.selectedField, ui.newPanel["0"].id);
							cdvCORE.getInstance().cdv_getdata(getPDataList, errCb);*/
						}
						
						if (ui.newPanel["0"].id == "tab-setting") {
							ui.newPanel["0"].innerHTML = '<p>Loading...</p>';
							//var getPDataList = createTabSetting(ui.newPanel["0"].id);
							//cdvCORE.getInstance().cdv_getdata(getPDataList, errCb);
							createTabSetting(ui.newPanel["0"].id);
						}
						
					},
					load: function (event, ui) {
						/* After page load*/
						

					}
				});

				$("input[type!='submit']").on("click", function () {
					console.log("<<<selected field: " + $(this).attr("id"));
					/*if ($.inArray($(this).attr("id"), dataFields) != -1) {
						console.log("selected field: " + $(this).attr("id"));
						cdvUI.selectedField = $(this);
						var errCb = setError("tab-pdata");
						var getPDataList = updatePDataFields(cdvUI.selectedField, "tab-pdata");
						cdvCORE.getInstance().cdv_getdata(getPDataList, errCb);
					}*/

				});

				$("input[type='submit']").on("click", function () {
					console.log("selected submit: " + $(this).attr("id"));
					var r = confirm(labels.confirmSaveDataMessage);
					if (r == true) {
						//TODO: You can Define "callback" function to elaborate the result of update action
						var callback;
						cdvCORE.getInstance().cdv_postdata(callback);
					}
                    
				});
				
				$("button[type='submit']").on("click", function () {
					console.log("selected submit: " + $(this).attr("id"));
					var r = confirm(labels.confirmSaveDataMessage);
					if (r == true) {
						//TODO: You can Define "callback" function to elaborate the result of update action
						var callback;
						cdvCORE.getInstance().cdv_postdata(callback);
					}
                    
				});

				dialog_cdv.tabs("option", "active", 0);
				dialog_cdv.tabs("option", "disabled", [1,2]);
				if (account_exist && activated) {
					dialog_cdv.tabs("option", "disabled", []);
				}
				if (!account_exist || !activated){
					dialog_cdv.dialog("open");
				} else {
					var getPDataList = updatePDataFields(null, null);
				    cdvCORE.getInstance().cdv_getdata(getPDataList, null);					
				}

			}

		}

		function activateSLR() {
			return function (created) {

				if (created) {
					//dialog_cdv.dialog("destroy");
					var initializeDlg = initializeDialog();
					cdvCORE.getInstance().createSLR(initializeDlg);

				} else {
					var initializeDlg = initializeDialog();
					initializeDlg(false, false);
				}
			}
		}

		function reloadDialog() {
			return function (created) {
				console.log("reload " + created);
				if (created) {
					dialog_cdv.dialog("destroy");
					dialog_cdv.dialog("open");
				}
			}
		}

		function confirmActivation(title, message) {

			var dialog_saved = $(
					'<div id="dialog-message" title="' + title + '">' +
					'			<p>' + message + '</p>' +
					'</div>').dialog({
					modal: true,
					buttons: {
						Ok: function () {
							$(this).dialog("close");
							dialog_cdv.dialog("open");
						}
					}
				});
			dialog_saved.dialog("open");

		}
		
		
		

		function highlightFields(fields, selected) {
			var n = fields.length;
			console.log("#"+n);
			var field="";
			for (var i = 0; i < n; i++) {
				field = fields[i].replace( /(:|\.|\[|\]|,|=|@)/g, "\\$1" );
                 console.log("#"+field+$('#'+field).html());
				if (selected) {
					originalCSS = $('#' + field).css('border');

					$('#' + field).css({
						'border': '2px solid ' + colors.cdv
					});

				} else if (originalCSS) {

					$('#' + field).css({
						'border': originalCSS
					});

				}

			}

		}
		
		function createDialogNoTabs(entryMessage, statusMessage){
			dialog_cdv = $(
                        '<div id="dialog-cdv" title="' + labels.dialogTitle + '">' +
						'			<p>' + entryMessage + '</p>' +
						'			<br>' +
						'			<p>' + statusMessage + '</p>' +
						'			<hr>' +
						'		</div>' ).dialog({
						dialogClass: "no-close",
						autoOpen: false,
						modal: false,
						closeOnEscape: true,
						resizable: false,
						draggable: false,
						height: "auto",
						position: {
							my: dlgPosition.my,
							at: dlgPosition.at,
							of: dlgPosition.of
						},
						width: 310,
						show: {
							effect: "slide",
							duration: 200,
							direction: 'right'
						},
						hide: {
							effect: "slide",
							duration: 200,
							direction: 'right'
						},
						
						open: function(){
                                var errCb = setError("tab-0");
				                var getPDataList = updatePDataFields(null, null);
				                cdvCORE.getInstance().cdv_getdata(getPDataList, null);
                        }

					});
										
					return dialog_cdv;					
		}
		
		
		


function showPrivacyPolicyForActivation(url, title){
	var $dialog = $('<div></div>')
			.load(informed_consent).dialog({
				autoOpen: false,
				title: "Privacy Policy",
				width: 700,
				height: 350,
				modal: true,
				buttons: [{
				text:labels.consentButton,
				click: function() {
				  var confirm = activateSLR();
				  cdvCORE.getInstance().createAccount(confirm);
				  cdvUI.getInstance().consent_given=true;
				  dialog_cdv.dialog("destroy");	
				  $( this ).dialog( "close" );
				}
			}]
			});
	$dialog.dialog('open'); 
	
}
		
		

		return {
			// Public definitions
			init: initComponent, // Called only one time
			enable: enableComponentFeatures, // Called when the Component button is enabled
			disable: disableComponentFeatures, // Called when the Component button is disabled or another one enabled
			isEnabled: function () {
				return featureEnabled;
			}, // Returns if the feature is enabled

			//paragraphEvent: paragraphEvent
		};
	}

	return {
		getInstance: function () {
			if (!instance)
				instance = Singleton();
			return instance;
		}
	};
})();





function confirmRemoveAccount(){

			var dialog_saved = $(
					'<div id="dialog-message" title="' + 'Remove Account' + '">' +
					'			<p>' + 'Are you sure to remove your account?' + '</p>' +
					'			<p>' + 'Your data will be permanently deleted and cannot be recovered. Remember to save your data first.' + '</p>' +
					'			<p>' + 'Press \'OK\' to continue... '+ '</p>' +
					'</div>').dialog({
					modal: true,
					buttons: {
						Ok: function () {
							
							cdvCORE.getInstance().removeCDV();
							cdvUI.getInstance().disable();
							$('#dialog_cdv').dialog("destroy");
							$('#dialog_cdv').dialog("open");
							
							$(this).dialog("close");
							
							
						},
						Cancel: function () {
							$(this).dialog("close");
							
						}
					}
				});
			dialog_saved.dialog("open");

		}
		
function toggleDialog(){
			
	if ($('#dialog-cdv').dialog('isOpen') === true) {
	  $('#dialog-cdv').dialog("close"); 
	} else {
	  $('#dialog-cdv').dialog("open"); 
	   }
}




function showPrivacyPolicy(url, title){
	var $dialog = $('<div></div>')
			.load(cdvUI.getInstance().informedConsentLink).dialog({
				autoOpen: false,
				title: "Privacy Policy",
				width: 700,
				height: 350,
				modal: true,
				buttons: [{
				text: "Consent",
				click: function() {
				  cdvUI.getInstance().consent_given=true;
				  $( this ).dialog( "close" );
				}
			  }]
			});
	$dialog.dialog('open'); 
	
}


