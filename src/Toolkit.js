// ExtJS related things

 // do not send '_dc' parameter
Ext.Ajax.disableCaching = false;

// custom Vtypes
Ext.apply(Ext.form.field.VTypes, {
    IPAddress: function(v) {
	return Proxmox.Utils.IP4_match.test(v);
    },
    IPAddressText: gettext('Example') + ': 192.168.1.1',
    IPAddressMask: /[\d.]/i,

    IPCIDRAddress: function(v) {
	let result = Proxmox.Utils.IP4_cidr_match.exec(v);
	// limits according to JSON Schema see
	// pve-common/src/PVE/JSONSchema.pm
	return result !== null && result[1] >= 8 && result[1] <= 32;
    },
    IPCIDRAddressText: gettext('Example') + ': 192.168.1.1/24<br>' + gettext('Valid CIDR Range') + ': 8-32',
    IPCIDRAddressMask: /[\d./]/i,

    IP6Address: function(v) {
	return Proxmox.Utils.IP6_match.test(v);
    },
    IP6AddressText: gettext('Example') + ': 2001:DB8::42',
    IP6AddressMask: /[A-Fa-f0-9:]/,

    IP6CIDRAddress: function(v) {
	let result = Proxmox.Utils.IP6_cidr_match.exec(v);
	// limits according to JSON Schema see
	// pve-common/src/PVE/JSONSchema.pm
	return result !== null && result[1] >= 8 && result[1] <= 128;
    },
    IP6CIDRAddressText: gettext('Example') + ': 2001:DB8::42/64<br>' + gettext('Valid CIDR Range') + ': 8-128',
    IP6CIDRAddressMask: /[A-Fa-f0-9:/]/,

    IP6PrefixLength: function(v) {
	return v >= 0 && v <= 128;
    },
    IP6PrefixLengthText: gettext('Example') + ': X, where 0 <= X <= 128',
    IP6PrefixLengthMask: /[0-9]/,

    IP64Address: function(v) {
	return Proxmox.Utils.IP64_match.test(v);
    },
    IP64AddressText: gettext('Example') + ': 192.168.1.1 2001:DB8::42',
    IP64AddressMask: /[A-Fa-f0-9.:]/,

    IP64CIDRAddress: function(v) {
	let result = Proxmox.Utils.IP64_cidr_match.exec(v);
	if (result === null) {
	    return false;
	}
	if (result[1] !== undefined) {
	    return result[1] >= 8 && result[1] <= 128;
	} else if (result[2] !== undefined) {
	    return result[2] >= 8 && result[2] <= 32;
	} else {
	    return false;
	}
    },
    IP64CIDRAddressText: gettext('Example') + ': 192.168.1.1/24 2001:DB8::42/64',
    IP64CIDRAddressMask: /[A-Fa-f0-9.:/]/,

    MacAddress: function(v) {
	return (/^([a-fA-F0-9]{2}:){5}[a-fA-F0-9]{2}$/).test(v);
    },
    MacAddressMask: /[a-fA-F0-9:]/,
    MacAddressText: gettext('Example') + ': 01:23:45:67:89:ab',

    MacPrefix: function(v) {
	return (/^[a-f0-9][02468ace](?::[a-f0-9]{2}){0,2}:?$/i).test(v);
    },
    MacPrefixMask: /[a-fA-F0-9:]/,
    MacPrefixText: gettext('Example') + ': 02:8f - ' + gettext('only unicast addresses are allowed'),

    BridgeName: function(v) {
	return (/^[a-zA-Z][a-zA-Z0-9_]{0,9}$/).test(v);
    },
    VlanName: function(v) {
       if (Proxmox.Utils.VlanInterface_match.test(v)) {
	 return true;
       } else if (Proxmox.Utils.Vlan_match.test(v)) {
	 return true;
       }
       return true;
    },
    BridgeNameText: gettext('Format') + ': alphanumeric string starting with a character',

    BondName: function(v) {
	return (/^bond\d{1,4}$/).test(v);
    },
    BondNameText: gettext('Format') + ': bond<b>N</b>, where 0 <= <b>N</b> <= 9999',

    InterfaceName: function(v) {
	return (/^[a-z][a-z0-9_]{1,20}$/).test(v);
    },
    InterfaceNameText: gettext("Allowed characters") + ": 'a-z', '0-9', '_'<br />" +
		       gettext("Minimum characters") + ": 2<br />" +
		       gettext("Maximum characters") + ": 21<br />" +
		       gettext("Must start with") + ": 'a-z'",

    StorageId: function(v) {
	return (/^[a-z][a-z0-9\-_.]*[a-z0-9]$/i).test(v);
    },
    StorageIdText: gettext("Allowed characters") + ":  'A-Z', 'a-z', '0-9', '-', '_', '.'<br />" +
		   gettext("Minimum characters") + ": 2<br />" +
		   gettext("Must start with") + ": 'A-Z', 'a-z'<br />" +
		   gettext("Must end with") + ": 'A-Z', 'a-z', '0-9'<br />",

    ConfigId: function(v) {
	return (/^[a-z][a-z0-9_-]+$/i).test(v);
    },
    ConfigIdText: gettext("Allowed characters") + ": 'A-Z', 'a-z', '0-9', '_'<br />" +
		  gettext("Minimum characters") + ": 2<br />" +
		  gettext("Must start with") + ": " + gettext("letter"),

    HttpProxy: function(v) {
	return (/^http:\/\/.*$/).test(v);
    },
    HttpProxyText: gettext('Example') + ": http://username:password&#64;host:port/",

    CpuSet: function(v) {
	return Proxmox.Utils.CpuSet_match.test(v);
    },
    CpuSetText: gettext('This is not a valid CpuSet'),

    DnsName: function(v) {
	return Proxmox.Utils.DnsName_match.test(v);
    },
    DnsNameText: gettext('This is not a valid hostname'),

    DnsNameOrWildcard: function(v) {
	return Proxmox.Utils.DnsName_or_Wildcard_match.test(v);
    },
    DnsNameOrWildcardText: gettext('This is not a valid hostname'),

    // email regex used by pve-common
    proxmoxMail: function(v) {
	return (/^[\w+-~]+(\.[\w+-~]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/).test(v);
    },
    proxmoxMailText: gettext('Example') + ": user@example.com",

    DnsOrIp: function(v) {
	if (!Proxmox.Utils.DnsName_match.test(v) &&
	    !Proxmox.Utils.IP64_match.test(v)) {
	    return false;
	}

	return true;
    },
    DnsOrIpText: gettext('Not a valid DNS name or IP address.'),

    HostPort: function(v) {
	return Proxmox.Utils.HostPort_match.test(v) ||
		Proxmox.Utils.HostPortBrackets_match.test(v) ||
		Proxmox.Utils.IP6_dotnotation_match.test(v);
    },
    HostPortText: gettext('Host/IP address or optional port is invalid'),

    HostList: function(v) {
	let list = v.split(/[ ,;]+/);
	let i;
	for (i = 0; i < list.length; i++) {
	    if (list[i] === '') {
		continue;
	    }

	    if (!Proxmox.Utils.HostPort_match.test(list[i]) &&
		!Proxmox.Utils.HostPortBrackets_match.test(list[i]) &&
		!Proxmox.Utils.IP6_dotnotation_match.test(list[i])) {
		return false;
	    }
	}

	return true;
    },
    HostListText: gettext('Not a valid list of hosts'),

    password: function(val, field) {
	if (field.initialPassField) {
	    let pwd = field.up('form').down(`[name=${field.initialPassField}]`);
	    return val === pwd.getValue();
	}
	return true;
    },

    passwordText: gettext('Passwords do not match'),

    email: function(value) {
	let emailre = /^[\w+~-]+(\.[\w+~-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/;
	return emailre.test(value);
    },
});

// we always want the number in x.y format and never in, e.g., x,y
Ext.define('PVE.form.field.Number', {
    override: 'Ext.form.field.Number',
    submitLocaleSeparator: false,
});

// avois spamming the console and if we ever use this avoid a CORS block error too
Ext.define('PVE.draw.Container', {
    override: 'Ext.draw.Container',
    defaultDownloadServerUrl: document.location.origin, // avoid that pointing to http://svg.sencha.io
    applyDownloadServerUrl: function(url) { // avoid noisy warning, we don't really use that anyway
	url = url || this.defaultDownloadServerUrl;
	return url;
    },
});

// ExtJs 5-6 has an issue with caching
// see https://www.sencha.com/forum/showthread.php?308989
Ext.define('Proxmox.UnderlayPool', {
    override: 'Ext.dom.UnderlayPool',

    checkOut: function() {
	let cache = this.cache,
	    len = cache.length,
	    el;

	// do cleanup because some of the objects might have been destroyed
	while (len--) {
	    if (cache[len].destroyed) {
		cache.splice(len, 1);
	    }
	}
	// end do cleanup

	el = cache.shift();

	if (!el) {
	    el = Ext.Element.create(this.elementConfig);
	    el.setVisibilityMode(2);
	    //<debug>
	    // tell the spec runner to ignore this element when checking if the dom is clean
	    el.dom.setAttribute('data-sticky', true);
	    //</debug>
	}

	return el;
    },
});

// if the order of the values are not the same in originalValue and value
// extjs will not overwrite value, but marks the field dirty and thus
// the reset button will be enabled (but clicking it changes nothing)
// so if the arrays are not the same after resetting, we
// clear and set it
Ext.define('Proxmox.form.ComboBox', {
    override: 'Ext.form.field.ComboBox',

    reset: function() {
	// copied from combobox
	let me = this;
	me.callParent();

	// clear and set when not the same
	let value = me.getValue();
	if (Ext.isArray(me.originalValue) && Ext.isArray(value) &&
	    !Ext.Array.equals(value, me.originalValue)) {
	    me.clearValue();
	    me.setValue(me.originalValue);
	}
    },

    // we also want to open the trigger on editable comboboxes by default
    initComponent: function() {
	let me = this;
	me.callParent();

	if (me.editable) {
	    // The trigger.picker causes first a focus event on the field then
	    // toggles the selection picker. Thus skip expanding in this case,
	    // else our focus listener expands and the picker.trigger then
	    // collapses it directly afterwards.
	    Ext.override(me.triggers.picker, {
		onMouseDown: function(e) {
		    // copied "should we focus" check from Ext.form.trigger.Trigger
		    if (e.pointerType !== 'touch' && !this.field.owns(Ext.Element.getActiveElement())) {
			me.skip_expand_on_focus = true;
		    }
		    this.callParent(arguments);
		},
	    });

	    me.on("focus", function(combobox) {
		if (!combobox.isExpanded && !combobox.skip_expand_on_focus) {
		    combobox.expand();
		}
		combobox.skip_expand_on_focus = false;
	    });
	}
    },
});

// when refreshing a grid/tree view, restoring the focus moves the view back to
// the previously focused item. Save scroll position before refocusing.
Ext.define(null, {
    override: 'Ext.view.Table',

    jumpToFocus: false,

    saveFocusState: function() {
	var me = this,
	    store = me.dataSource,
	    actionableMode = me.actionableMode,
	    navModel = me.getNavigationModel(),
	    focusPosition = actionableMode ? me.actionPosition : navModel.getPosition(true),
	    activeElement = Ext.fly(Ext.Element.getActiveElement()),
	    focusCell = focusPosition && focusPosition.view === me &&
	    Ext.fly(focusPosition.getCell(true)),
	    refocusRow, refocusCol, record;

	// The navModel may return a position that is in a locked partner, so check that
	// the focusPosition's cell contains the focus before going forward.
	// The skipSaveFocusState is set by Actionables which actively control
	// focus destination. See CellEditing#activateCell.
	if (!me.skipSaveFocusState && focusCell && focusCell.contains(activeElement)) {
	    // Separate this from the instance that the nav model is using.
	    focusPosition = focusPosition.clone();

	    // While we deactivate the focused element, suspend focus processing on it.
	    activeElement.suspendFocusEvents();

	    // Suspend actionable mode.
	    // Each Actionable must silently save its state ready to resume when focus
	    // can be restored but should only do that if the activeElement is not the cell itself,
	    // this happens when the grid is refreshed while one of the actionables is being
	    // deactivated (e.g. Calling  view refresh inside CellEditor 'edit' event listener).
	    if (actionableMode && focusCell.dom !== activeElement.dom) {
		me.suspendActionableMode();
	    } else {
		// Clear position, otherwise the setPosition on the other side
		// will be rejected as a no-op if the resumption position is logically
		// equivalent.
		actionableMode = false;
		navModel.setPosition();
	    }

	    // Do not leave the element in that state in case refresh fails, and restoration
	    // closure not called.
	    activeElement.resumeFocusEvents();

	    // if the store is expanding or collapsing, we should never scroll the view.
	    if (store.isExpandingOrCollapsing) {
		return Ext.emptyFn;
	    }

	    // The following function will attempt to refocus back in the same mode to the same cell
	    // as it was at before based upon the previous record (if it's still in the store),
	    // or the row index.
	    return function() {
		var all;

		// May have changed due to reconfigure
		store = me.dataSource;

		// If we still have data, attempt to refocus in the same mode.
		if (store.getCount()) {
		    all = me.all;

		    // Adjust expectations of where we are able to refocus according to
		    // what kind of destruction might have been wrought on this view's DOM
		    // during focus save.
		    refocusRow =
			Math.min(Math.max(focusPosition.rowIdx, all.startIndex), all.endIndex);

		    refocusCol = Math.min(
			focusPosition.colIdx,
			me.getVisibleColumnManager().getColumns().length - 1,
		    );

		    record = focusPosition.record;

		    focusPosition = new Ext.grid.CellContext(me).setPosition(
			record && store.contains(record) && !record.isCollapsedPlaceholder
			? record
			: refocusRow,
			refocusCol,
		    );

		    // Maybe there are no cells. eg: all groups collapsed.
		    if (focusPosition.getCell(true)) {
			if (actionableMode) {
			    me.resumeActionableMode(focusPosition);
			} else {
			    // we sometimes want to scroll back to where we are

			    let x = me.getScrollX();
			    let y = me.getScrollY();

			    // Pass "preventNavigation" as true
			    // so that that does not cause selection.
			    navModel.setPosition(focusPosition, null, null, null, true);

			    if (!navModel.getPosition()) {
				focusPosition.column.focus();
			    }

			    if (!me.jumpToFocus) {
				me.scrollTo(x, y);
			    }
			}
		    }
		} else { // No rows - focus associated column header
		    focusPosition.column.focus();
		}
	    };
	}
	return Ext.emptyFn;
    },
});

// ExtJS 6.0.1 has no setSubmitValue() (although you find it in the docs).
// Note: this.submitValue is a boolean flag, whereas getSubmitValue() returns
// data to be submitted.
Ext.define('Proxmox.form.field.Text', {
    override: 'Ext.form.field.Text',

    setSubmitValue: function(v) {
	this.submitValue = v;
    },
});

// make mousescrolling work in firefox in the containers overflowhandler,
// by using only the 'wheel' event not 'mousewheel'(fixed in 7.3)
// also reverse the scrolldirection (fixed in 7.3)
// and reduce the default increment
Ext.define(null, {
    override: 'Ext.layout.container.boxOverflow.Scroller',

    wheelIncrement: 1,

    getWheelDelta: function(e) {
	return -e.getWheelDelta(e);
    },

    onOwnerRender: function(owner) {
	var me = this,
	    scrollable = {
		isBoxOverflowScroller: true,
		x: false,
		y: false,
		listeners: {
		    scrollend: this.onScrollEnd,
		    scope: this,
		},
	    };

	// If no obstrusive scrollbars, allow natural scrolling on mobile touch devices
	if (!Ext.scrollbar.width() && !Ext.platformTags.desktop) {
	    scrollable[owner.layout.horizontal ? 'x' : 'y'] = true;
	} else {
	    me.wheelListener = me.layout.innerCt.on(
		'wheel', me.onMouseWheel, me, { destroyable: true },
	    );
	}

	owner.setScrollable(scrollable);
    },
});

// extj 6.7 reversed mousewheel direction... (fixed in 7.3)
// https://forum.sencha.com/forum/showthread.php?472517-Mousewheel-scroll-direction-in-numberfield-with-spinners
// also use the 'wheel' event instead of 'mousewheel' (fixed in 7.3)
Ext.define('Proxmox.form.field.Spinner', {
    override: 'Ext.form.field.Spinner',

    onRender: function() {
	let me = this;

	me.callParent();

	// Init mouse wheel
	if (me.mouseWheelEnabled) {
	    // Unlisten Ext generated listener ('mousewheel' is deprecated anyway)
	    me.mun(me.bodyEl, 'mousewheel', me.onMouseWheel, me);

	    me.mon(me.bodyEl, 'wheel', me.onMouseWheel, me);
	}
    },

    onMouseWheel: function(e) {
	var me = this,
	    delta;
	if (me.hasFocus) {
	    delta = e.getWheelDelta();
	    if (delta > 0) {
		me.spinDown();
	    } else if (delta < 0) {
		me.spinUp();
	    }
	    e.stopEvent();
	    me.onSpinEnd();
	}
    },
});

// add '@' to the valid id
Ext.define('Proxmox.validIdReOverride', {
    override: 'Ext.Component',
    validIdRe: /^[a-z_][a-z0-9\-_@]*$/i,
});

Ext.define('Proxmox.selection.CheckboxModel', {
    override: 'Ext.selection.CheckboxModel',

    // [P] use whole checkbox cell to multiselect, not only the checkbox
    checkSelector: '.x-grid-cell-row-checker',

    // TODO: remove all optimizations below to an override for parent 'Ext.selection.Model' ??

    // [ P: optimized to remove all records at once as single remove is O(n^3) slow ]
    // records can be an index, a record or an array of records
    doDeselect: function(records, suppressEvent) {
	var me = this,
	    selected = me.selected,
	    i = 0,
	    len, record,
	    commit;
	if (me.locked || !me.store) {
	    return false;
	}
	if (typeof records === "number") {
	    // No matching record, jump out
	    record = me.store.getAt(records);
	    if (!record) {
		return false;
	    }
	    records = [
		record,
	    ];
	} else if (!Ext.isArray(records)) {
	    records = [
		records,
	    ];
	}
	// [P] a beforedeselection, triggered by me.onSelectChange below, can block removal by
	// returning false, thus the original implementation removed only here in the commit fn,
	// which has an abysmal performance O(n^3). As blocking removal is not the norm, go do the
	// reverse, record blocked records and remove them from the to-be-removed array before
	// applying it. A FF86 i9-9900K on 10k records goes from >40s to ~33ms for >90% deselection
	let committed = false;
	commit = function() {
	    committed = true;
	    if (record === me.selectionStart) {
		me.selectionStart = null;
	    }
	};
	let removalBlocked = [];
	len = records.length;
	me.suspendChanges();
	for (; i < len; i++) {
	    record = records[i];
	    if (me.isSelected(record)) {
		committed = false;
		me.onSelectChange(record, false, suppressEvent, commit);
		if (!committed) {
		    removalBlocked.push(record);
		}
		if (me.destroyed) {
		    return false;
		}
	    }
	}
	if (removalBlocked.length > 0) {
	    records.remove(removalBlocked);
	}
	selected.remove(records); // [P] FAST(er)
	me.lastSelected = selected.last();
	me.resumeChanges();
	// fire selchange if there was a change and there is no suppressEvent flag
	me.maybeFireSelectionChange(records.length > 0 && !suppressEvent);
	return records.length;
    },


    doMultiSelect: function(records, keepExisting, suppressEvent) {
	var me = this,
	    selected = me.selected,
	    change = false,
	    result, i, len, record, commit;

	if (me.locked) {
	    return;
	}

	records = !Ext.isArray(records) ? [records] : records;
	len = records.length;
	if (!keepExisting && selected.getCount() > 0) {
	    result = me.deselectDuringSelect(records, suppressEvent);
	    if (me.destroyed) {
		return;
	    }
	    if (result[0]) {
		// We had a failure during selection, so jump out
		// Fire selection change if we did deselect anything
		me.maybeFireSelectionChange(result[1] > 0 && !suppressEvent);
		return;
	    } else {
		// Means something has been deselected, so we've had a change
		change = result[1] > 0;
	    }
	}

	let gotBlocked, blockedRecords = [];
	commit = function() {
	    if (!selected.getCount()) {
		me.selectionStart = record;
	    }
	    gotBlocked = false;
	    change = true;
	};

	for (i = 0; i < len; i++) {
	    record = records[i];
	    if (me.isSelected(record)) {
		continue;
	    }

	    gotBlocked = true;
	    me.onSelectChange(record, true, suppressEvent, commit);
	    if (me.destroyed) {
		return;
	    }
	    if (gotBlocked) {
		blockedRecords.push(record);
	    }
	}
	if (blockedRecords.length > 0) {
	    records.remove(blockedRecords);
	}
	selected.add(records);
	me.lastSelected = record;

	// fire selchange if there was a change and there is no suppressEvent flag
	me.maybeFireSelectionChange(change && !suppressEvent);
    },
    deselectDuringSelect: function(toSelect, suppressEvent) {
	var me = this,
	    selected = me.selected.getRange(),
	    changed = 0,
	    failed = false;
	// Prevent selection change events from firing, will happen during select
	me.suspendChanges();
	me.deselectingDuringSelect = true;
	let toDeselect = selected.filter(item => !Ext.Array.contains(toSelect, item));
	if (toDeselect.length > 0) {
	    changed = me.doDeselect(toDeselect, suppressEvent);
	    if (!changed) {
		failed = true;
	    }
	    if (me.destroyed) {
		failed = true;
		changed = 0;
	    }
	}
	me.deselectingDuringSelect = false;
	me.resumeChanges();
	return [
	    failed,
	    changed,
	];
    },
});

// stop nulling of properties
Ext.define('Proxmox.Component', {
    override: 'Ext.Component',
    clearPropertiesOnDestroy: false,
});

// Fix drag&drop for vms and desktops that detect 'pen' pointerType
// NOTE: this part has been rewritten in ExtJS 7.4, so re-check once we can upgrade
Ext.define('Proxmox.view.DragZone', {
    override: 'Ext.view.DragZone',

    onItemMouseDown: function(view, record, item, index, e) {
	// Ignore touchstart.
	// For touch events, we use longpress.
	if (e.pointerType !== 'touch') {
	    this.onTriggerGesture(view, record, item, index, e);
	}
    },
});

// Fix text selection on drag when using DragZone,
// see https://forum.sencha.com/forum/showthread.php?335100
Ext.define('Proxmox.dd.DragDropManager', {
    override: 'Ext.dd.DragDropManager',

    stopEvent: function(e) {
	if (this.stopPropagation) {
	    e.stopPropagation();
	}

	if (this.preventDefault) {
	    e.preventDefault();
	}
    },
});

// make it possible to set the SameSite attribute on cookies
Ext.define('Proxmox.Cookies', {
    override: 'Ext.util.Cookies',

    set: function(name, value, expires, path, domain, secure, samesite) {
	let attrs = [];

	if (expires) {
	    attrs.push("expires=" + expires.toUTCString());
	}

	if (path === undefined) { // mimic original function's behaviour
	    attrs.push("path=/");
	} else if (path) {
	    attrs.push("path=" + path);
	}

	if (domain) {
	    attrs.push("domain=" + domain);
	}

	if (secure === true) {
	    attrs.push("secure");
	}

	if (samesite && ["lax", "none", "strict"].includes(samesite.toLowerCase())) {
	    attrs.push("samesite=" + samesite);
	}

	document.cookie = name + "=" + escape(value) + "; " + attrs.join("; ");
    },
});

// force alert boxes to be rendered with an Error Icon
// since Ext.Msg is an object and not a prototype, we need to override it
// after the framework has been initiated
Ext.onReady(function() {
    Ext.override(Ext.Msg, {
	alert: function(title, message, fn, scope) { // eslint-disable-line consistent-return
	    if (Ext.isString(title)) {
		let config = {
		    title: title,
		    message: message,
		    icon: this.ERROR,
		    buttons: this.OK,
		    fn: fn,
		    scope: scope,
		    minWidth: this.minWidth,
		};
	    return this.show(config);
	    }
	},
    });
});

// add allowfullscreen to render template to allow the noVNC/xterm.js embedded UIs to go fullscreen
//
// The rest is the same as in the separate ux package (extjs/build/packages/ux/classic/ux-debug.js),
// which we do not load as it's rather big and most of the widgets there are not useful for our UIs
Ext.define('Ext.ux.IFrame', {
    extend: 'Ext.Component',

    alias: 'widget.uxiframe',

    loadMask: 'Loading...',

    src: 'about:blank',

    renderTpl: [
	// eslint-disable-next-line max-len
	'<iframe src="{src}" id="{id}-iframeEl" data-ref="iframeEl" name="{frameName}" width="100%" height="100%" frameborder="0" allowfullscreen="true"></iframe>',
    ],

    childEls: ['iframeEl'],

    initComponent: function() {
	this.callParent();

	this.frameName = this.frameName || this.id + '-frame';
    },

    initEvents: function() {
	let me = this;

	me.callParent();
	me.iframeEl.on('load', me.onLoad, me);
    },

    initRenderData: function() {
	return Ext.apply(this.callParent(), {
	    src: this.src,
	    frameName: this.frameName,
	});
    },

    getBody: function() {
	let doc = this.getDoc();

	return doc.body || doc.documentElement;
    },

    getDoc: function() {
	try {
	    return this.getWin().document;
	} catch (ex) {
	    return null;
	}
    },

    getWin: function() {
	let me = this,
	    name = me.frameName,
	    win = Ext.isIE ? me.iframeEl.dom.contentWindow : window.frames[name];

	return win;
    },

    getFrame: function() {
	let me = this;

	return me.iframeEl.dom;
    },

    onLoad: function() {
	let me = this,
	    doc = me.getDoc();

	if (doc) {
	    this.el.unmask();
	    this.fireEvent('load', this);
	} else if (me.src) {
	    this.el.unmask();
	    this.fireEvent('error', this);
	}
    },

    load: function(src) {
	let me = this,
	    text = me.loadMask,
	    frame = me.getFrame();

	if (me.fireEvent('beforeload', me, src) !== false) {
	    if (text && me.el) {
		me.el.mask(text);
	    }

	    frame.src = me.src = src || me.src;
	}
    },
});
