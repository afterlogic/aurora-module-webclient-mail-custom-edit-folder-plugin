'use strict';

const
	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),

	App = require('%PathToCoreWebclientModule%/js/App.js'),
	Popups = require('%PathToCoreWebclientModule%/js/Popups.js')
;

module.exports = function (appData) {
	if (App.isUserNormalOrTenant()) {
		return {
			start: (ModulesManager) => {
				if (ModulesManager.isModuleIncluded('MailWebclient')) {
					App.subscribeEvent('MailWebclient::RegisterManageFolderButton', function (registerManageFolderButton) {
						registerManageFolderButton({
							tooltip: folder => !folder.isSystem() && folder.bSelectable ? TextUtils.i18n('%MODULENAME%/LABEL_EDIT_FOLDER') : '',
							cssClasses: folder => !folder.isSystem() && folder.bSelectable ? 'edit-folder' : '',
							handler: folder => {
								if (!folder.isSystem() && folder.bSelectable) {
									var EditFolderPopup = require('modules/%ModuleName%/js/popups/EditFolderPopup.js');
									Popups.showPopup(EditFolderPopup, [folder]);
								}
							}
						});
					});
				}
			}
		};
	}

	return null;
};
