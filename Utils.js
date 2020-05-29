Ext.ns('Proxmox');
Ext.ns('Proxmox.Setup');

if (!Ext.isDefined(Proxmox.Setup.auth_cookie_name)) {
    throw "Proxmox library not initialized";
}

// avoid errors related to Accessible Rich Internet Applications
// (access for people with disabilities)
// TODO reenable after all components are upgraded
Ext.enableAria = false;
Ext.enableAriaButtons = false;
Ext.enableAriaPanels = false;

// avoid errors when running without development tools
if (!Ext.isDefined(Ext.global.console)) {
    var console = {
	dir: function() {},
	log: function() {}
    };
}

Ext.Ajax.defaultHeaders = {
    'Accept': 'application/json'
};

Ext.Ajax.on('beforerequest', function(conn, options) {
    if (Proxmox.CSRFPreventionToken) {
	if (!options.headers) {
	    options.headers = {};
	}
	options.headers.CSRFPreventionToken = Proxmox.CSRFPreventionToken;
    }
});

Ext.define('Proxmox.Utils', { utilities: {

    // this singleton contains miscellaneous utilities

    yesText: gettext('Yes'),
    noText: gettext('No'),
    enabledText: gettext('Enabled'),
    disabledText: gettext('Disabled'),
    noneText: gettext('none'),
    NoneText: gettext('None'),
    errorText: gettext('Error'),
    unknownText: gettext('Unknown'),
    defaultText: gettext('Default'),
    daysText: gettext('days'),
    dayText: gettext('day'),
    runningText: gettext('running'),
    stoppedText: gettext('stopped'),
    neverText: gettext('never'),
    totalText: gettext('Total'),
    usedText: gettext('Used'),
    directoryText: gettext('Directory'),
    stateText: gettext('State'),
    groupText: gettext('Group'),

    language_map: {
	ar: 'Arabic',
	ca: 'Catalan',
	da: 'Danish',
	de: 'German',
	en: 'English',
	es: 'Spanish',
	eu: 'Euskera (Basque)',
	fa: 'Persian (Farsi)',
	fr: 'French',
	he: 'Hebrew',
	it: 'Italian',
	ja: 'Japanese',
	nb: 'Norwegian (Bokmal)',
	nn: 'Norwegian (Nynorsk)',
	pl: 'Polish',
	pt_BR: 'Portuguese (Brazil)',
	ru: 'Russian',
	sl: 'Slovenian',
	sv: 'Swedish',
	tr: 'Turkish',
	zh_CN: 'Chinese (Simplified)',
	zh_TW: 'Chinese (Traditional)',
    },

    render_language: function (value) {
	if (!value) {
	    return Proxmox.Utils.defaultText + ' (English)';
	}
	var text = Proxmox.Utils.language_map[value];
	if (text) {
	    return text + ' (' + value + ')';
	}
	return value;
    },

    language_array: function() {
	var data = [['__default__', Proxmox.Utils.render_language('')]];
	Ext.Object.each(Proxmox.Utils.language_map, function(key, value) {
	    data.push([key, Proxmox.Utils.render_language(value)]);
	});

	return data;
    },

    bond_mode_gettext_map: {
	'802.3ad': 'LACP (802.3ad)',
	'lacp-balance-slb': 'LACP (balance-slb)',
	'lacp-balance-tcp': 'LACP (balance-tcp)',
    },

    render_bond_mode: value => Proxmox.Utils.bond_mode_gettext_map[value] || value || '',

    bond_mode_array: function(modes) {
	return modes.map(mode => [mode, Proxmox.Utils.render_bond_mode(mode)]);
    },

    getNoSubKeyHtml: function(url) {
	// url http://www.proxmox.com/products/proxmox-ve/subscription-service-plans
	return Ext.String.format('You do not have a valid subscription for this server. Please visit <a target="_blank" href="{0}">www.proxmox.com</a> to get a list of available options.', url || 'https://www.proxmox.com');
    },

    format_boolean_with_default: function(value) {
	if (Ext.isDefined(value) && value !== '__default__') {
	    return value ? Proxmox.Utils.yesText : Proxmox.Utils.noText;
	}
	return Proxmox.Utils.defaultText;
    },

    format_boolean: function(value) {
	return value ? Proxmox.Utils.yesText : Proxmox.Utils.noText;
    },

    format_neg_boolean: function(value) {
	return !value ? Proxmox.Utils.yesText : Proxmox.Utils.noText;
    },

    format_enabled_toggle: function(value) {
	return value ? Proxmox.Utils.enabledText : Proxmox.Utils.disabledText;
    },

    format_expire: function(date) {
	if (!date) {
	    return Proxmox.Utils.neverText;
	}
	return Ext.Date.format(date, "Y-m-d");
    },

    // somewhat like a human would tell durations, omit zero values and do not
    // give seconds precision if we talk days already
    format_duration_human: function(ut) {
	let seconds = 0, minutes = 0, hours = 0, days = 0;

	if (ut <= 0) {
	    return '0s';
	}

	let remaining = ut;
	seconds = +((remaining % 60).toFixed(1));
	remaining = Math.trunc(remaining / 60);
	if (remaining > 0) {
	    minutes = remaining % 60;
	    remaining = Math.trunc(remaining / 60);
	    if (remaining > 0) {
		hours = remaining % 24;
		remaining = Math.trunc(remaining / 24);
		if (remaining > 0) {
		    days = remaining;
		}
	    }
	}

	let res = [];
	let add = (t, unit) => {
	    if (t > 0) res.push(t + unit);
	    return t > 0;
	};

	let addSeconds = !add(days, 'd');
	add(hours, 'h');
	add(minutes, 'm');
	if (addSeconds) {
	    add(seconds, 's');
	}
	return res.join(' ');
    },

    format_duration_long: function(ut) {
	var days = Math.floor(ut / 86400);
	ut -= days*86400;
	var hours = Math.floor(ut / 3600);
	ut -= hours*3600;
	var mins = Math.floor(ut / 60);
	ut -= mins*60;

	var hours_str = '00' + hours.toString();
	hours_str = hours_str.substr(hours_str.length - 2);
	var mins_str = "00" + mins.toString();
	mins_str = mins_str.substr(mins_str.length - 2);
	var ut_str = "00" + ut.toString();
	ut_str = ut_str.substr(ut_str.length - 2);

	if (days) {
	    var ds = days > 1 ? Proxmox.Utils.daysText : Proxmox.Utils.dayText;
	    return days.toString() + ' ' + ds + ' ' +
		hours_str + ':' + mins_str + ':' + ut_str;
	} else {
	    return hours_str + ':' + mins_str + ':' + ut_str;
	}
    },

    format_subscription_level: function(level) {
	if (level === 'c') {
	    return 'Community';
	} else if (level === 'b') {
	    return 'Basic';
	} else if (level === 's') {
	    return 'Standard';
	} else if (level === 'p') {
	    return 'Premium';
	} else {
	    return Proxmox.Utils.noneText;
	}
    },

    compute_min_label_width: function(text, width) {

	if (width === undefined) { width = 100; }

	var tm = new Ext.util.TextMetrics();
	var min = tm.getWidth(text + ':');

	return min < width ? width : min;
    },

    setAuthData: function(data) {
	Proxmox.CSRFPreventionToken = data.CSRFPreventionToken;
	Proxmox.UserName = data.username;
	Proxmox.LoggedOut = data.LoggedOut;
	// creates a session cookie (expire = null)
	// that way the cookie gets deleted after the browser window is closed
	Ext.util.Cookies.set(Proxmox.Setup.auth_cookie_name, data.ticket, null, '/', null, true);
    },

    authOK: function() {
	if (Proxmox.LoggedOut) {
	    return undefined;
	}
	let cookie = Ext.util.Cookies.get(Proxmox.Setup.auth_cookie_name);
	if (Proxmox.UserName !== '' && cookie && !cookie.startsWith("PVE:tfa!")) {
	    return cookie;
	} else {
	    return false;
	}
    },

    authClear: function() {
	if (Proxmox.LoggedOut) {
	    return undefined;
	}
	Ext.util.Cookies.clear(Proxmox.Setup.auth_cookie_name);
    },

    // comp.setLoading() is buggy in ExtJS 4.0.7, so we
    // use el.mask() instead
    setErrorMask: function(comp, msg) {
	var el = comp.el;
	if (!el) {
	    return;
	}
	if (!msg) {
	    el.unmask();
	} else {
	    if (msg === true) {
		el.mask(gettext("Loading..."));
	    } else {
		el.mask(msg);
	    }
	}
    },

    getResponseErrorMessage: (err) => {
	if (!err.statusText) {
	    return gettext('Connection error');
	}
	let msg = [`${err.statusText} (${err.status})`];
	if (err.response && err.response.responseText) {
	    let txt = err.response.responseText;
	    try {
		let res = JSON.parse(txt)
		if (res.errors && typeof res.errors === 'object') {
		    for (let [key, value] of Object.entries(res.errors)) {
			msg.push(Ext.String.htmlEncode(`${key}: ${value}`));
		    }
		}
	    } catch (e) {
		// fallback to string
		msg.push(Ext.String.htmlEncode(txt));
	    }
	}
	return msg.join('<br>');
    },

    monStoreErrors: function(me, store, clearMaskBeforeLoad) {
	if (clearMaskBeforeLoad) {
	    me.mon(store, 'beforeload', function(s, operation, eOpts) {
		Proxmox.Utils.setErrorMask(me, false);
	    });
	} else {
	    me.mon(store, 'beforeload', function(s, operation, eOpts) {
		if (!me.loadCount) {
		    me.loadCount = 0; // make sure it is numeric
		    Proxmox.Utils.setErrorMask(me, true);
		}
	    });
	}

	// only works with 'proxmox' proxy
	me.mon(store.proxy, 'afterload', function(proxy, request, success) {
	    me.loadCount++;

	    if (success) {
		Proxmox.Utils.setErrorMask(me, false);
		return;
	    }

	    let error = request._operation.getError();
	    let msg = Proxmox.Utils.getResponseErrorMessage(error);
	    Proxmox.Utils.setErrorMask(me, msg);
	});
    },

    extractRequestError: function(result, verbose) {
	var msg = gettext('Successful');

	if (!result.success) {
	    msg = gettext("Unknown error");
	    if (result.message) {
		msg = result.message;
		if (result.status) {
		    msg += ' (' + result.status + ')';
		}
	    }
	    if (verbose && Ext.isObject(result.errors)) {
		msg += "<br>";
		Ext.Object.each(result.errors, function(prop, desc) {
		    msg += "<br><b>" + Ext.htmlEncode(prop) + "</b>: " +
			Ext.htmlEncode(desc);
		});
	    }
	}

	return msg;
    },

    // Ext.Ajax.request
    API2Request: function(reqOpts) {

	var newopts = Ext.apply({
	    waitMsg: gettext('Please wait...')
	}, reqOpts);

	if (!newopts.url.match(/^\/api2/)) {
	    newopts.url = '/api2/extjs' + newopts.url;
	}
	delete newopts.callback;

	var createWrapper = function(successFn, callbackFn, failureFn) {
	    Ext.apply(newopts, {
		success: function(response, options) {
		    if (options.waitMsgTarget) {
			if (Proxmox.Utils.toolkit === 'touch') {
			    options.waitMsgTarget.setMasked(false);
			} else {
			    options.waitMsgTarget.setLoading(false);
			}
		    }
		    var result = Ext.decode(response.responseText);
		    response.result = result;
		    if (!result.success) {
			response.htmlStatus = Proxmox.Utils.extractRequestError(result, true);
			Ext.callback(callbackFn, options.scope, [options, false, response]);
			Ext.callback(failureFn, options.scope, [response, options]);
			return;
		    }
		    Ext.callback(callbackFn, options.scope, [options, true, response]);
		    Ext.callback(successFn, options.scope, [response, options]);
		},
		failure: function(response, options) {
		    if (options.waitMsgTarget) {
			if (Proxmox.Utils.toolkit === 'touch') {
			    options.waitMsgTarget.setMasked(false);
			} else {
			    options.waitMsgTarget.setLoading(false);
			}
		    }
		    response.result = {};
		    try {
			response.result = Ext.decode(response.responseText);
		    } catch(e) {}
		    var msg = gettext('Connection error') + ' - server offline?';
		    if (response.aborted) {
			msg = gettext('Connection error') + ' - aborted.';
		    } else if (response.timedout) {
			msg = gettext('Connection error') + ' - Timeout.';
		    } else if (response.status && response.statusText) {
			msg = gettext('Connection error') + ' ' + response.status + ': ' + response.statusText;
		    }
		    response.htmlStatus = msg;
		    Ext.callback(callbackFn, options.scope, [options, false, response]);
		    Ext.callback(failureFn, options.scope, [response, options]);
		}
	    });
	};

	createWrapper(reqOpts.success, reqOpts.callback, reqOpts.failure);

	var target = newopts.waitMsgTarget;
	if (target) {
	    if (Proxmox.Utils.toolkit === 'touch') {
		target.setMasked({ xtype: 'loadmask', message: newopts.waitMsg} );
	    } else {
		// Note: ExtJS bug - this does not work when component is not rendered
		target.setLoading(newopts.waitMsg);
	    }
	}
	Ext.Ajax.request(newopts);
    },

    checked_command: function(orig_cmd) {
	Proxmox.Utils.API2Request({
	    url: '/nodes/localhost/subscription',
	    method: 'GET',
	    //waitMsgTarget: me,
	    failure: function(response, opts) {
		Ext.Msg.alert(gettext('Error'), response.htmlStatus);
	    },
	    success: function(response, opts) {
		var data = response.result.data;

		if (data.status !== 'Active') {
		    Ext.Msg.show({
			title: gettext('No valid subscription'),
			icon: Ext.Msg.WARNING,
			message: Proxmox.Utils.getNoSubKeyHtml(data.url),
			buttons: Ext.Msg.OK,
			callback: function(btn) {
			    if (btn !== 'ok') {
				return;
			    }
			    orig_cmd();
			}
		    });
		} else {
		    orig_cmd();
		}
	    }
	});
    },

    assemble_field_data: function(values, data) {
        if (Ext.isObject(data)) {
	    Ext.Object.each(data, function(name, val) {
		if (values.hasOwnProperty(name)) {
                    var bucket = values[name];
                    if (!Ext.isArray(bucket)) {
                        bucket = values[name] = [bucket];
                    }
                    if (Ext.isArray(val)) {
                        values[name] = bucket.concat(val);
                    } else {
                        bucket.push(val);
                    }
                } else {
		    values[name] = val;
                }
            });
	}
    },

    updateColumnWidth: function(container) {
	let mode = Ext.state.Manager.get('summarycolumns') || 'auto';
	let factor;
	if (mode !== 'auto') {
	    factor = parseInt(mode, 10);
	    if (Number.isNaN(factor)) {
		factor = 1;
	    }
	} else {
	    factor = container.getSize().width < 1600 ? 1 : 2;
	}

	if (container.oldFactor === factor) {
	    return;
	}

	let items = container.query('>'); // direct childs
	factor = Math.min(factor, items.length);
	container.oldFactor = factor;

	items.forEach((item) => {
	    item.columnWidth = 1 / factor;
	});

	// we have to update the layout twice, since the first layout change
	// can trigger the scrollbar which reduces the amount of space left
	container.updateLayout();
	container.updateLayout();
    },

    dialog_title: function(subject, create, isAdd) {
	if (create) {
	    if (isAdd) {
		return gettext('Add') + ': ' + subject;
	    } else {
		return gettext('Create') + ': ' + subject;
	    }
	} else {
	    return gettext('Edit') + ': ' + subject;
	}
    },

    network_iface_types: {
	eth: gettext("Network Device"),
	bridge: 'Linux Bridge',
	bond: 'Linux Bond',
	vlan: 'Linux VLAN',
	OVSBridge: 'OVS Bridge',
	OVSBond: 'OVS Bond',
	OVSPort: 'OVS Port',
	OVSIntPort: 'OVS IntPort'
    },

    render_network_iface_type: function(value) {
	return Proxmox.Utils.network_iface_types[value] ||
	    Proxmox.Utils.unknownText;
    },

    task_desc_table: {
	acmenewcert: [ 'SRV', gettext('Order Certificate') ],
	acmeregister: [ 'ACME Account', gettext('Register') ],
	acmedeactivate: [ 'ACME Account', gettext('Deactivate') ],
	acmeupdate: [ 'ACME Account', gettext('Update') ],
	acmerefresh: [ 'ACME Account', gettext('Refresh') ],
	acmerenew: [ 'SRV', gettext('Renew Certificate') ],
	acmerevoke: [ 'SRV', gettext('Revoke Certificate') ],
	'auth-realm-sync': [ gettext('Realm'), gettext('Sync') ],
	'auth-realm-sync-test': [ gettext('Realm'), gettext('Sync Preview')],
	'move_volume': [ 'CT', gettext('Move Volume') ],
	clustercreate: [ '', gettext('Create Cluster') ],
	clusterjoin: [ '', gettext('Join Cluster') ],
	diskinit: [ 'Disk', gettext('Initialize Disk with GPT') ],
	vncproxy: [ 'VM/CT', gettext('Console') ],
	spiceproxy: [ 'VM/CT', gettext('Console') + ' (Spice)' ],
	vncshell: [ '', gettext('Shell') ],
	spiceshell: [ '', gettext('Shell')  + ' (Spice)' ],
	qmsnapshot: [ 'VM', gettext('Snapshot') ],
	qmrollback: [ 'VM', gettext('Rollback') ],
	qmdelsnapshot: [ 'VM', gettext('Delete Snapshot') ],
	qmcreate: [ 'VM', gettext('Create') ],
	qmrestore: [ 'VM', gettext('Restore') ],
	qmdestroy: [ 'VM', gettext('Destroy') ],
	qmigrate: [ 'VM', gettext('Migrate') ],
	qmclone: [ 'VM', gettext('Clone') ],
	qmmove: [ 'VM', gettext('Move disk') ],
	qmtemplate: [ 'VM', gettext('Convert to template') ],
	qmstart: [ 'VM', gettext('Start') ],
	qmstop: [ 'VM', gettext('Stop') ],
	qmreset: [ 'VM', gettext('Reset') ],
	qmshutdown: [ 'VM', gettext('Shutdown') ],
	qmreboot: [ 'VM', gettext('Reboot') ],
	qmsuspend: [ 'VM', gettext('Hibernate') ],
	qmpause: [ 'VM', gettext('Pause') ],
	qmresume: [ 'VM', gettext('Resume') ],
	qmconfig: [ 'VM', gettext('Configure') ],
	vzsnapshot: [ 'CT', gettext('Snapshot') ],
	vzrollback: [ 'CT', gettext('Rollback') ],
	vzdelsnapshot: [ 'CT', gettext('Delete Snapshot') ],
	vzcreate: ['CT', gettext('Create') ],
	vzrestore: ['CT', gettext('Restore') ],
	vzdestroy: ['CT', gettext('Destroy') ],
	vzmigrate: [ 'CT', gettext('Migrate') ],
	vzclone: [ 'CT', gettext('Clone') ],
	vztemplate: [ 'CT', gettext('Convert to template') ],
	vzstart: ['CT', gettext('Start') ],
	vzstop: ['CT', gettext('Stop') ],
	vzmount: ['CT', gettext('Mount') ],
	vzumount: ['CT', gettext('Unmount') ],
	vzshutdown: ['CT', gettext('Shutdown') ],
	vzreboot: ['CT', gettext('Reboot') ],
	vzsuspend: [ 'CT', gettext('Suspend') ],
	vzresume: [ 'CT', gettext('Resume') ],
	push_file: ['CT', gettext('Push file')],
	pull_file: ['CT', gettext('Pull file')],
	hamigrate: [ 'HA', gettext('Migrate') ],
	hastart: [ 'HA', gettext('Start') ],
	hastop: [ 'HA', gettext('Stop') ],
	hashutdown: [ 'HA', gettext('Shutdown') ],
	srvstart: ['SRV', gettext('Start') ],
	srvstop: ['SRV', gettext('Stop') ],
	srvrestart: ['SRV', gettext('Restart') ],
	srvreload: ['SRV', gettext('Reload') ],
	cephcreatemgr: ['Ceph Manager', gettext('Create') ],
	cephdestroymgr: ['Ceph Manager', gettext('Destroy') ],
	cephcreatemon: ['Ceph Monitor', gettext('Create') ],
	cephdestroymon: ['Ceph Monitor', gettext('Destroy') ],
	cephcreateosd: ['Ceph OSD', gettext('Create') ],
	cephdestroyosd: ['Ceph OSD', gettext('Destroy') ],
	cephcreatepool: ['Ceph Pool', gettext('Create') ],
	cephdestroypool: ['Ceph Pool', gettext('Destroy') ],
	cephfscreate: ['CephFS', gettext('Create') ],
	cephcreatemds: ['Ceph Metadata Server', gettext('Create') ],
	cephdestroymds: ['Ceph Metadata Server', gettext('Destroy') ],
	imgcopy: ['', gettext('Copy data') ],
	imgdel: ['', gettext('Erase data') ],
	unknownimgdel: ['', gettext('Destroy image from unknown guest') ],
	download: ['', gettext('Download') ],
	vzdump: ['VM/CT', gettext('Backup') ],
	aptupdate: ['', gettext('Update package database') ],
	startall: [ '', gettext('Start all VMs and Containers') ],
	stopall: [ '', gettext('Stop all VMs and Containers') ],
	migrateall: [ '', gettext('Migrate all VMs and Containers') ],
	dircreate: [ gettext('Directory Storage'), gettext('Create') ],
	lvmcreate: [ gettext('LVM Storage'), gettext('Create') ],
	lvmthincreate: [ gettext('LVM-Thin Storage'), gettext('Create') ],
	zfscreate: [ gettext('ZFS Storage'), gettext('Create') ]
    },

    // to add or change existing for product specific ones
    override_task_descriptions: function(extra) {
	for (const [key, value] of Object.entries(extra)) {
	    Proxmox.Utils.task_desc_table[key] = value;
	}
    },

    format_task_description: function(type, id) {
	let farray = Proxmox.Utils.task_desc_table[type];
	let text;
	if (!farray) {
	    text = type;
	    if (id) {
		type += ' ' + id;
	    }
	    return text;
	} else if (Ext.isFunction(farray)) {
	    return farray(type, id);
	}
	let prefix = farray[0];
	text = farray[1];
	if (prefix) {
	    return prefix + ' ' + id + ' - ' + text;
	}
	return text;
    },

    format_size: function(size) {
	/*jslint confusion: true */

	var units = ['', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi'];
	var num = 0;

	while (size >= 1024 && ((num++)+1) < units.length) {
	    size = size / 1024;
	}

	return size.toFixed((num > 0)?2:0) + " " + units[num] + "B";
    },

    render_upid: function(value, metaData, record) {
	let task = record.data;
	let type = task.type || task.worker_type;
	let id = task.id || task.worker_id;

	return Proxmox.Utils.format_task_description(type, id);
    },

    render_uptime: function(value) {

	var uptime = value;

	if (uptime === undefined) {
	    return '';
	}

	if (uptime <= 0) {
	    return '-';
	}

	return Proxmox.Utils.format_duration_long(uptime);
    },

    parse_task_upid: function(upid) {
	var task = {};

	var res = upid.match(/^UPID:([^\s:]+):([0-9A-Fa-f]{8}):([0-9A-Fa-f]{8,9}):(([0-9A-Fa-f]{8,16}):)?([0-9A-Fa-f]{8}):([^:\s]+):([^:\s]*):([^:\s]+):$/);
	if (!res) {
	    throw "unable to parse upid '" + upid + "'";
	}
	task.node = res[1];
	task.pid = parseInt(res[2], 16);
	task.pstart = parseInt(res[3], 16);
	if (res[5] !== undefined) {
	    task.task_id = parseInt(res[5], 16);
	}
	task.starttime = parseInt(res[6], 16);
	task.type = res[7];
	task.id = res[8];
	task.user = res[9];

	task.desc = Proxmox.Utils.format_task_description(task.type, task.id);

	return task;
    },

    render_duration: function(value) {
	if (value === undefined) {
	    return '-';
	}
	return Proxmox.Utils.format_duration_human(value);
    },

    render_timestamp: function(value, metaData, record, rowIndex, colIndex, store) {
	var servertime = new Date(value * 1000);
	return Ext.Date.format(servertime, 'Y-m-d H:i:s');
    },

    get_help_info: function(section) {
	var helpMap;
	if (typeof proxmoxOnlineHelpInfo !== 'undefined') {
	    helpMap = proxmoxOnlineHelpInfo;
	} else if (typeof pveOnlineHelpInfo !== 'undefined') {
	    // be backward compatible with older pve-doc-generators
	    helpMap = pveOnlineHelpInfo;
	} else {
	    throw "no global OnlineHelpInfo map declared";
	}

	return helpMap[section];
    },

    get_help_link: function(section) {
	var info = Proxmox.Utils.get_help_info(section);
	if (!info) {
	    return;
	}

	return window.location.origin + info.link;
    },

    openXtermJsViewer: function(vmtype, vmid, nodename, vmname, cmd) {
	var url = Ext.Object.toQueryString({
	    console: vmtype, // kvm, lxc, upgrade or shell
	    xtermjs: 1,
	    vmid: vmid,
	    vmname: vmname,
	    node: nodename,
	    cmd: cmd,

	});
	var nw = window.open("?" + url, '_blank', 'toolbar=no,location=no,status=no,menubar=no,resizable=yes,width=800,height=420');
	if (nw) {
	    nw.focus();
	}
    }

},

    singleton: true,
    constructor: function() {
	var me = this;
	Ext.apply(me, me.utilities);

	var IPV4_OCTET = "(?:25[0-5]|(?:[1-9]|1[0-9]|2[0-4])?[0-9])";
	var IPV4_REGEXP = "(?:(?:" + IPV4_OCTET + "\\.){3}" + IPV4_OCTET + ")";
	var IPV6_H16 = "(?:[0-9a-fA-F]{1,4})";
	var IPV6_LS32 = "(?:(?:" + IPV6_H16 + ":" + IPV6_H16 + ")|" + IPV4_REGEXP + ")";
	var IPV4_CIDR_MASK = "([0-9]{1,2})";
	var IPV6_CIDR_MASK = "([0-9]{1,3})";


	me.IP4_match = new RegExp("^(?:" + IPV4_REGEXP + ")$");
	me.IP4_cidr_match = new RegExp("^(?:" + IPV4_REGEXP + ")\/" + IPV4_CIDR_MASK + "$");

	var IPV6_REGEXP = "(?:" +
	    "(?:(?:"                                                  + "(?:" + IPV6_H16 + ":){6})" + IPV6_LS32 + ")|" +
	    "(?:(?:"                                         +   "::" + "(?:" + IPV6_H16 + ":){5})" + IPV6_LS32 + ")|" +
	    "(?:(?:(?:"                           + IPV6_H16 + ")?::" + "(?:" + IPV6_H16 + ":){4})" + IPV6_LS32 + ")|" +
	    "(?:(?:(?:(?:" + IPV6_H16 + ":){0,1}" + IPV6_H16 + ")?::" + "(?:" + IPV6_H16 + ":){3})" + IPV6_LS32 + ")|" +
	    "(?:(?:(?:(?:" + IPV6_H16 + ":){0,2}" + IPV6_H16 + ")?::" + "(?:" + IPV6_H16 + ":){2})" + IPV6_LS32 + ")|" +
	    "(?:(?:(?:(?:" + IPV6_H16 + ":){0,3}" + IPV6_H16 + ")?::" + "(?:" + IPV6_H16 + ":){1})" + IPV6_LS32 + ")|" +
	    "(?:(?:(?:(?:" + IPV6_H16 + ":){0,4}" + IPV6_H16 + ")?::" +                         ")" + IPV6_LS32 + ")|" +
	    "(?:(?:(?:(?:" + IPV6_H16 + ":){0,5}" + IPV6_H16 + ")?::" +                         ")" + IPV6_H16  + ")|" +
	    "(?:(?:(?:(?:" + IPV6_H16 + ":){0,7}" + IPV6_H16 + ")?::" +                         ")"             + ")"  +
	    ")";

	me.IP6_match = new RegExp("^(?:" + IPV6_REGEXP + ")$");
	me.IP6_cidr_match = new RegExp("^(?:" + IPV6_REGEXP + ")\/" + IPV6_CIDR_MASK + "$");
	me.IP6_bracket_match = new RegExp("^\\[(" + IPV6_REGEXP + ")\\]");

	me.IP64_match = new RegExp("^(?:" + IPV6_REGEXP + "|" + IPV4_REGEXP + ")$");
	me.IP64_cidr_match = new RegExp("^(?:" + IPV6_REGEXP + "\/" + IPV6_CIDR_MASK + ")|(?:" + IPV4_REGEXP + "\/" + IPV4_CIDR_MASK + ")$");

	var DnsName_REGEXP = "(?:(([a-zA-Z0-9]([a-zA-Z0-9\\-]*[a-zA-Z0-9])?)\\.)*([A-Za-z0-9]([A-Za-z0-9\\-]*[A-Za-z0-9])?))";
	me.DnsName_match = new RegExp("^" + DnsName_REGEXP + "$");

	me.HostPort_match = new RegExp("^(" + IPV4_REGEXP + "|" + DnsName_REGEXP + ")(:\\d+)?$");
	me.HostPortBrackets_match = new RegExp("^\\[(?:" + IPV6_REGEXP + "|" + IPV4_REGEXP + "|" + DnsName_REGEXP + ")\\](:\\d+)?$");
	me.IP6_dotnotation_match = new RegExp("^" + IPV6_REGEXP + "(\\.\\d+)?$");
        me.Vlan_match = new RegExp('^vlan(\\d+)');
        me.VlanInterface_match = new RegExp('(\\w+)\\.(\\d+)');
    }
});
