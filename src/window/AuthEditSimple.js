Ext.define('Proxmox.panel.SimpleRealmInputPanel', {
    extend: 'Proxmox.panel.InputPanel',
    xtype: 'pmxAuthSimplePanel',
    mixins: ['Proxmox.Mixin.CBind'],

    showDefaultRealm: false,

    column1: [
	{
	    xtype: 'pmxDisplayEditField',
	    name: 'realm',
	    cbind: {
		value: '{realm}',
	    },
	    fieldLabel: gettext('Realm'),
	},
	{
	    xtype: 'proxmoxcheckbox',
	    fieldLabel: gettext('Default Realm'),
	    name: 'default',
	    value: 0,
	    deleteEmpty: true,
	    autoEl: {
		tag: 'div',
		'data-qtip': gettext('Set realm as default for login'),
	    },
	    cbind: {
		hidden: '{!showDefaultRealm}',
		disabled: '{!showDefaultRealm}',
	    },
	},
    ],

    column2: [],

    columnB: [
	{
	    xtype: 'proxmoxtextfield',
	    name: 'comment',
	    fieldLabel: gettext('Comment'),
	    allowBlank: true,
	    deleteEmpty: true,
	},
    ],
});
