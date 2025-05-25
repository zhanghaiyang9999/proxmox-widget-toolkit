Ext.define('Proxmox.panel.OpenIDInputPanel', {
    extend: 'Proxmox.panel.InputPanel',
    xtype: 'pmxAuthOpenIDPanel',
    mixins: ['Proxmox.Mixin.CBind'],

    showDefaultRealm: false,

    type: 'openid',

    onGetValues: function(values) {
	let me = this;

	if (me.isCreate && !me.useTypeInUrl) {
	    values.type = me.type;
	}

	return values;
    },

    columnT: [
	{
	    xtype: 'textfield',
	    name: 'issuer-url',
	    fieldLabel: gettext('Issuer URL'),
	    allowBlank: false,
	},
    ],

    column1: [
	{
	    xtype: 'pmxDisplayEditField',
	    name: 'realm',
	    cbind: {
		value: '{realm}',
		editable: '{isCreate}',
	    },
	    fieldLabel: gettext('Realm'),
	    allowBlank: false,
	},
	{
	    xtype: 'proxmoxcheckbox',
	    fieldLabel: gettext('Default Realm'),
	    name: 'default',
	    value: 0,
	    cbind: {
		deleteEmpty: '{!isCreate}',
		hidden: '{!showDefaultRealm}',
		disabled: '{!showDefaultRealm}',
	    },
	    autoEl: {
		tag: 'div',
		'data-qtip': gettext('Set realm as default for login'),
	    },
	},
	{
	    xtype: 'proxmoxtextfield',
	    fieldLabel: gettext('Client ID'),
	    name: 'client-id',
	    allowBlank: false,
	},
	{
	    xtype: 'proxmoxtextfield',
	    fieldLabel: gettext('Client Key'),
	    cbind: {
		deleteEmpty: '{!isCreate}',
	    },
	    name: 'client-key',
	},
    ],

    column2: [
	{
	    xtype: 'proxmoxcheckbox',
	    fieldLabel: gettext('Autocreate Users'),
	    name: 'autocreate',
	    value: 0,
	    cbind: {
		deleteEmpty: '{!isCreate}',
	    },
	},
	{
	    xtype: 'pmxDisplayEditField',
	    name: 'username-claim',
	    fieldLabel: gettext('Username Claim'),
	    editConfig: {
		xtype: 'proxmoxKVComboBox',
		editable: true,
		comboItems: [
		    ['__default__', Proxmox.Utils.defaultText],
		    ['subject', 'subject'],
		    ['username', 'username'],
		    ['email', 'email'],
		],
	    },
	    cbind: {
		value: get => get('isCreate') ? '__default__' : Proxmox.Utils.defaultText,
		deleteEmpty: '{!isCreate}',
		editable: '{isCreate}',
	    },
	},
	{
	    xtype: 'proxmoxtextfield',
	    name: 'scopes',
	    fieldLabel: gettext('Scopes'),
	    emptyText: `${Proxmox.Utils.defaultText} (email profile)`,
	    submitEmpty: false,
	    cbind: {
		deleteEmpty: '{!isCreate}',
	    },
	},
	{
	    xtype: 'proxmoxKVComboBox',
	    name: 'prompt',
	    fieldLabel: gettext('Prompt'),
	    editable: true,
	    emptyText: gettext('Auth-Provider Default'),
	    comboItems: [
		['__default__', gettext('Auth-Provider Default')],
		['none', 'none'],
		['login', 'login'],
		['consent', 'consent'],
		['select_account', 'select_account'],
	    ],
	    cbind: {
		deleteEmpty: '{!isCreate}',
	    },
	},
    ],

    columnB: [
	{
	    xtype: 'proxmoxtextfield',
	    name: 'comment',
	    fieldLabel: gettext('Comment'),
	    cbind: {
		deleteEmpty: '{!isCreate}',
	    },
	},
    ],

    advancedColumnB: [
	{
	    xtype: 'proxmoxtextfield',
	    name: 'acr-values',
	    fieldLabel: gettext('ACR Values'),
	    submitEmpty: false,
	    cbind: {
		deleteEmpty: '{!isCreate}',
	    },
	},
    ],
});

