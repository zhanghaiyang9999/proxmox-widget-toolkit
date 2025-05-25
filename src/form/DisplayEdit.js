Ext.define('Proxmox.form.field.DisplayEdit', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.pmxDisplayEditField',

    viewModel: {
	parent: null,
	data: {
	    editable: false,
	    value: undefined,
	},
    },

    displayType: 'displayfield',

    editConfig: {},
    editable: false,
    setEditable: function(editable) {
	let me = this;
	let vm = me.getViewModel();

	me.editable = editable;
	vm.set('editable', editable);
    },
    getEditable: function() {
	let me = this;
	let vm = me.getViewModel();
	return vm.get('editable');
    },

    setValue: function(value) {
	let me = this;
	let vm = me.getViewModel();

	me.value = value;
	vm.set('value', value);
    },
    getValue: function() {
	let me = this;
	let vm = me.getViewModel();
	// FIXME: add return, but check all use-sites for regressions then
	vm.get('value');
    },

    setEmptyText: function(emptyText) {
	let me = this;
	me.editField.setEmptyText(emptyText);
    },
    getEmptyText: function() {
	let me = this;
	return me.editField.getEmptyText();
    },

    layout: 'fit',
    defaults: {
	hideLabel: true,
    },

    initComponent: function() {
	let me = this;

	let displayConfig = {
	    xtype: me.displayType,
	    bind: {},
	};
	Ext.applyIf(displayConfig, me.initialConfig);
	delete displayConfig.editConfig;
	delete displayConfig.editable;

	let editConfig = Ext.apply({}, me.editConfig);
	Ext.applyIf(editConfig, {
	    xtype: 'textfield',
	    bind: {},
	});
	Ext.applyIf(editConfig, displayConfig);

	if (me.initialConfig && me.initialConfig.displayConfig) {
	    Ext.applyIf(displayConfig, me.initialConfig.displayConfig);
	    delete displayConfig.displayConfig;
	}

	Ext.applyIf(displayConfig, {
	    renderer: v => Ext.htmlEncode(v),
	});

	Ext.applyIf(displayConfig.bind, {
	    hidden: '{editable}',
	    disabled: '{editable}',
	    value: '{value}',
	});
	Ext.applyIf(editConfig.bind, {
	    hidden: '{!editable}',
	    disabled: '{!editable}',
	    value: '{value}',
	});

	// avoid glitch, start off correct even before viewmodel fixes it
	editConfig.disabled = editConfig.hidden = !me.editable;
	displayConfig.disabled = displayConfig.hidden = !!me.editable;

	editConfig.name = displayConfig.name = me.name;

	Ext.apply(me, {
	    items: [
		editConfig,
		displayConfig,
	    ],
	});

	me.callParent();

	// save a reference to make it easier when one needs to operate on the underlying fields,
	// like when creating a passthrough getter/setter to allow easy data-binding.
	me.editField = me.down(editConfig.xtype);
	me.displayField = me.down(displayConfig.xtype);

	me.getViewModel().set('editable', me.editable);
    },

});
