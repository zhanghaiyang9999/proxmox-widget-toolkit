Ext.define('PMX.image.Logo', {
    extend: 'Ext.Img',
    xtype: 'proxmoxlogo',

    height: 30,
    width: 85,
    src: '/images/proxmox_logo.png',
    alt: 'Proxmox',
    autoEl: {
	tag: 'a',
	href: 'https://www.cloudock.cn',
	target: '_blank',
    },

    initComponent: function() {
	let me = this;
	let prefix = me.prefix !== undefined ? me.prefix : '/pve2';
	me.src = prefix + me.src;
	me.callParent();
    },
});
