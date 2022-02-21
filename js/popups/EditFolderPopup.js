'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),

	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
	Utils = require('%PathToCoreWebclientModule%/js/utils/Common.js'),

	Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js'),
	Api = require('%PathToCoreWebclientModule%/js/Api.js'),
	CAbstractPopup = require('%PathToCoreWebclientModule%/js/popups/CAbstractPopup.js'),
	ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js'),

	AccountList = ModulesManager.run('MailWebclient', 'getAccountList'),
	MailCache = ModulesManager.run('MailWebclient', 'getMailCache')
;

/**
 * @constructor
 */
function CEditFolderPopup()
{
	CAbstractPopup.call(this);

	this.isSaving = ko.observable(false);
	if (MailCache) {
		MailCache.folderListLoading.subscribe(function () {
			var isListLoading = MailCache.folderListLoading.indexOf(MailCache.editedFolderList().iAccountId) !== -1;
			if (!isListLoading && this.isSaving()) {
				this.isSaving(false);
				this.closePopup();
			}
		}, this);
	}

	this.options = ko.observableArray([]);

	this.parentFolder = ko.observable('');
	this.folderName = ko.observable('');
	this.folderNameFocus = ko.observable(false);

	this.editedFolder = null;

	this.defaultOptionsAfterRender = Utils.defaultOptionsAfterRender;
}

_.extendOwn(CEditFolderPopup.prototype, CAbstractPopup.prototype);

CEditFolderPopup.prototype.PopupTemplate = '%ModuleName%_EditFolderPopup';

/**
 * @param {object} folder
 */
CEditFolderPopup.prototype.onOpen = function (folder)
{
	this.editedFolder = folder;

	let options = [];
	if (MailCache) {
		const noParentLabel = TextUtils.i18n('MAILWEBCLIENT/LABEL_NO_PARENT_FOLDER');
		options = MailCache.editedFolderList().getOptions(noParentLabel, true, false, true, false, [folder.fullName()]);
	}
	this.options(options);

	this.parentFolder(folder.parentFullName());
	this.folderName(folder.name());
	this.folderNameFocus(true);
};

CEditFolderPopup.prototype.save = function ()
{
	if (this.editedFolder && this.editedFolder.parentFullName() !== this.parentFolder()) {
		const parameters = {
			'AccountID': this.editedFolder.iAccountId,
			'PrevFolderFullNameRaw': this.editedFolder.fullName(),
			'NewFolderNameInUtf8': this.folderName(),
			'ChangeParent': true,
			'NewParentFolder': this.parentFolder()
		};

		this.isSaving(true);
		Ajax.send('Mail', 'RenameFolder', parameters, this.onResponseFolderRename, this);
	} else if (this.editedFolder && this.editedFolder.name() !== this.folderName()) {
		const parameters = {
			'AccountID': this.editedFolder.iAccountId,
			'PrevFolderFullNameRaw': this.editedFolder.fullName(),
			'NewFolderNameInUtf8': this.folderName(),
			'ChangeParent': false
		};

		this.isSaving(true);
		Ajax.send('Mail', 'RenameFolder', parameters, this.onResponseFolderRename, this);
	} else {
		this.closePopup();
	}
};

CEditFolderPopup.prototype.onResponseFolderRename = function (response, request)
{
	if (!AccountList && !MailCache) return;

	if (response && response.Result && response.Result.FullName) {
		MailCache.getFolderList(AccountList.editedId());
	} else {
		this.isSaving(false);
		Api.showErrorByCode(response, TextUtils.i18n('MAILWEBCLIENT/ERROR_RENAME_FOLDER'));
		MailCache.getFolderList(AccountList.editedId());
	}
};

CEditFolderPopup.prototype.cancelPopup = function ()
{
	if (!this.isSaving()) {
		this.closePopup();
	}
};

module.exports = new CEditFolderPopup();
