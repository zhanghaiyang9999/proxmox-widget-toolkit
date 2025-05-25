Ext.define('Proxmox.panel.NotificationConfigViewModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.pmxNotificationConfigPanel',

    formulas: {
	builtinSelected: function(get) {
	    let origin = get('selection')?.get('origin');
	    return origin === 'modified-builtin' || origin === 'builtin';
	},
	removeButtonText: get => get('builtinSelected') ? gettext('Reset') : gettext('Remove'),
	removeButtonConfirmMessage: function(get) {
	    if (get('builtinSelected')) {
		return gettext('Do you want to reset {0} to its default settings?');
	    } else {
		// Use default message provided by the button
		return undefined;
	    }
	},
    },

});

Ext.define('Proxmox.panel.NotificationConfigView', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.pmxNotificationConfigView',
    mixins: ['Proxmox.Mixin.CBind'],
    onlineHelp: 'chapter_notifications',
    layout: {
	type: 'border',
    },

    items: [
	{
	    region: 'center',
	    border: false,
	    xtype: 'pmxNotificationEndpointView',
	    cbind: {
		baseUrl: '{baseUrl}',
	    },
	},
	{
	    region: 'south',
	    height: '50%',
	    border: false,
	    collapsible: true,
	    animCollapse: false,
	    xtype: 'pmxNotificationMatcherView',
	    cbind: {
		baseUrl: '{baseUrl}',
	    },
	},
    ],
});

Ext.define('Proxmox.panel.NotificationEndpointView', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.pmxNotificationEndpointView',

    title: gettext('Notification Targets'),

    viewModel: {
	type: 'pmxNotificationConfigPanel',
    },

    bind: {
	selection: '{selection}',
    },

    controller: {
	xclass: 'Ext.app.ViewController',

	openEditWindow: function(endpointType, endpoint) {
	    let me = this;

	    Ext.create('Proxmox.window.EndpointEditBase', {
		baseUrl: me.getView().baseUrl,
		type: endpointType,

		name: endpoint,
		autoShow: true,
		listeners: {
		    destroy: () => me.reload(),
		},
	    });
	},

	openEditForSelectedItem: function() {
	    let me = this;
	    let view = me.getView();

	    let selection = view.getSelection();
	    if (selection.length < 1) {
		return;
	    }

	    me.openEditWindow(selection[0].data.type, selection[0].data.name);
	},

	reload: function() {
	    let me = this;
	    let view = me.getView();
	    view.getStore().rstore.load();
	    this.getView().setSelection(null);
	},

	testEndpoint: function() {
	    let me = this;
	    let view = me.getView();

	    let selection = view.getSelection();
	    if (selection.length < 1) {
		return;
	    }

	    let target = selection[0].data.name;

	    Ext.Msg.confirm(
		gettext("Notification Target Test"),
		Ext.String.format(gettext("Do you want to send a test notification to '{0}'?"), target),
		function(decision) {
		    if (decision !== "yes") {
			return;
		    }

		    Proxmox.Utils.API2Request({
			method: 'POST',
			url: `${view.baseUrl}/targets/${target}/test`,

			success: function(response, opt) {
			    Ext.Msg.show({
				title: gettext('Notification Target Test'),
				message: Ext.String.format(
				    gettext("Sent test notification to '{0}'."),
				    target,
				),
				buttons: Ext.Msg.OK,
				icon: Ext.Msg.INFO,
			    });
			},
			autoErrorAlert: true,
		    });
	    });
	},
    },

    listeners: {
	itemdblclick: 'openEditForSelectedItem',
	activate: 'reload',
    },

    emptyText: gettext('No notification targets configured'),

    columns: [
	{
	    dataIndex: 'disable',
	    text: gettext('Enable'),
	    renderer: (disable) => Proxmox.Utils.renderEnabledIcon(!disable),
	    align: 'center',
	},
	{
	    dataIndex: 'name',
	    text: gettext('Target Name'),
	    renderer: Ext.String.htmlEncode,
	    flex: 2,
	},
	{
	    dataIndex: 'type',
	    text: gettext('Type'),
	    renderer: Ext.String.htmlEncode,
	    flex: 1,
	},
	{
	    dataIndex: 'comment',
	    text: gettext('Comment'),
	    renderer: Ext.String.htmlEncode,
	    flex: 3,
	},
	{
	    dataIndex: 'origin',
	    text: gettext('Origin'),
	    renderer: (origin) => {
		switch (origin) {
		    case 'user-created': return gettext('Custom');
		    case 'modified-builtin': return gettext('Built-In (modified)');
		    case 'builtin': return gettext('Built-In');
		}

		// Should not happen...
		return 'unknown';
	    },
	},
    ],

    store: {
	type: 'diff',
	autoDestroy: true,
	autoDestroyRstore: true,
	rstore: {
	    type: 'update',
	    storeid: 'proxmox-notification-endpoints',
	    model: 'proxmox-notification-endpoints',
	    autoStart: true,
	},
	sorters: 'name',
    },

    initComponent: function() {
	let me = this;

	if (!me.baseUrl) {
	    throw "baseUrl is not set!";
	}

	let menuItems = [];
	for (const [endpointType, config] of Object.entries(
	    Proxmox.Schema.notificationEndpointTypes).sort()) {
	    menuItems.push({
		text: config.name,
		iconCls: 'fa fa-fw ' + (config.iconCls || 'fa-bell-o'),
		handler: () => me.controller.openEditWindow(endpointType),
	    });
	}

	Ext.apply(me, {
	    tbar: [
		{
		    text: gettext('Add'),
		    menu: menuItems,
		},
		{
		    xtype: 'proxmoxButton',
		    text: gettext('Modify'),
		    handler: 'openEditForSelectedItem',
		    disabled: true,
		},
		{
		    xtype: 'proxmoxStdRemoveButton',
		    callback: 'reload',
		    bind: {
			text: '{removeButtonText}',
			customConfirmationMessage: '{removeButtonConfirmMessage}',
		    },
		    getUrl: function(rec) {
			return `${me.baseUrl}/endpoints/${rec.data.type}/${rec.getId()}`;
		    },
		    enableFn: (rec) => {
			let origin = rec.get('origin');
			return origin === 'user-created' || origin === 'modified-builtin';
		    },
		},
		'-',
		{
		    xtype: 'proxmoxButton',
		    text: gettext('Test'),
		    handler: 'testEndpoint',
		    disabled: true,
		},
	    ],
	});

	me.callParent();
	me.store.rstore.proxy.setUrl(`/api2/json/${me.baseUrl}/targets`);
    },
});

Ext.define('Proxmox.panel.NotificationMatcherView', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.pmxNotificationMatcherView',

    title: gettext('Notification Matchers'),

    controller: {
	xclass: 'Ext.app.ViewController',

	openEditWindow: function(matcher) {
	    let me = this;

	    Ext.create('Proxmox.window.NotificationMatcherEdit', {
		baseUrl: me.getView().baseUrl,
		name: matcher,
		autoShow: true,
		listeners: {
		    destroy: () => me.reload(),
		},
	    });
	},

	openEditForSelectedItem: function() {
	    let me = this;
	    let view = me.getView();

	    let selection = view.getSelection();
	    if (selection.length < 1) {
		return;
	    }

	    me.openEditWindow(selection[0].data.name);
	},

	reload: function() {
	    this.getView().getStore().rstore.load();
	    this.getView().setSelection(null);
	},
    },

    viewModel: {
	type: 'pmxNotificationConfigPanel',
    },

    bind: {
	selection: '{selection}',
    },

    listeners: {
	itemdblclick: 'openEditForSelectedItem',
	activate: 'reload',
    },

    emptyText: gettext('No notification matchers configured'),

    columns: [
	{
	    dataIndex: 'disable',
	    text: gettext('Enable'),
	    renderer: (disable) => Proxmox.Utils.renderEnabledIcon(!disable),
	    align: 'center',
	},
	{
	    dataIndex: 'name',
	    text: gettext('Matcher Name'),
	    renderer: Ext.String.htmlEncode,
	    flex: 1,
	},
	{
	    dataIndex: 'comment',
	    text: gettext('Comment'),
	    renderer: Ext.String.htmlEncode,
	    flex: 2,
	},
	{
	    dataIndex: 'origin',
	    text: gettext('Origin'),
	    renderer: (origin) => {
		switch (origin) {
		    case 'user-created': return gettext('Custom');
		    case 'modified-builtin': return gettext('Built-In (modified)');
		    case 'builtin': return gettext('Built-In');
		}

		// Should not happen...
		return 'unknown';
	    },
	},
    ],

    store: {
	type: 'diff',
	autoDestroy: true,
	autoDestroyRstore: true,
	rstore: {
	    type: 'update',
	    storeid: 'proxmox-notification-matchers',
	    model: 'proxmox-notification-matchers',
	    autoStart: true,
	},
	sorters: 'name',
    },

    initComponent: function() {
	let me = this;

	if (!me.baseUrl) {
	    throw "baseUrl is not set!";
	}

	Ext.apply(me, {
	    tbar: [
		{
		    xtype: 'proxmoxButton',
		    text: gettext('Add'),
		    handler: () => me.getController().openEditWindow(),
		    selModel: false,
		},
		{
		    xtype: 'proxmoxButton',
		    text: gettext('Modify'),
		    handler: 'openEditForSelectedItem',
		    disabled: true,
		},
		{
		    xtype: 'proxmoxStdRemoveButton',
		    callback: 'reload',
		    bind: {
			text: '{removeButtonText}',
			customConfirmationMessage: '{removeButtonConfirmMessage}',
		    },
		    baseurl: `${me.baseUrl}/matchers`,
		    enableFn: (rec) => {
			let origin = rec.get('origin');
			return origin === 'user-created' || origin === 'modified-builtin';
		    },
		},
	    ],
	});

	me.callParent();
	me.store.rstore.proxy.setUrl(`/api2/json/${me.baseUrl}/matchers`);
    },
});
