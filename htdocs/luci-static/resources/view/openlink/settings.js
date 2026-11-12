'use strict';
'require view';
'require form';
'require uci';
'require ui';
'require fs';

return view.extend({
    load: function() {
        return uci.load('openlink', 'nodogsplash', 'firewall', 'dhcp');
    },
    render: function() {
        var m, s, o;
        m = new form.Map('openlink', 'OpenLink Captive Portal', 'Configure the captive portal, network interface, timeouts, and firewall rules.');
        m.tabbed = true;

        // TAB 1: General
        s = m.section(form.NamedSection, 'settings', 'General Settings', 'General Settings');
        s.anonymous = false; s.addremove = false;
        o = s.option(form.Flag, 'enabled', 'Enable Portal'); o.rmempty = false;
        o = s.option(form.Value, 'admin_pass', 'Admin Password'); o.password = true; o.rmempty = true;
        o = s.option(form.Value, 'port', 'Portal Port'); o.default = '7891'; o.datatype = 'port'; o.rmempty = false;
        o = s.option(form.ListValue, 'theme', 'Portal Theme');
        o.value('default', 'Default Theme'); o.value('modern', 'Modern Theme'); o.value('corporate', 'Corporate Theme'); o.value('music', 'Music Theme'); o.default = 'default';

        // TAB 2: Network
        s = m.section(form.NamedSection, 'settings', 'Network & Interface', 'Network & Interface');
        s.anonymous = false; s.addremove = false;
        o = s.option(form.Flag, 'auto_bridge', 'Auto-Create Bridge Interface'); o.default = '1';
        o = s.option(form.Value, 'interface', 'Gateway Interface'); o.default = 'br-voucher'; o.rmempty = false;
        o = s.option(form.Value, 'portal_ip', 'Portal IP Address'); o.default = '192.168.20.1'; o.datatype = 'ipaddr'; o.rmempty = false;
        o = s.option(form.Value, 'netmask', 'Subnet Mask'); o.default = '255.255.255.0'; o.datatype = 'ipaddr'; o.rmempty = false;

        // TAB 3: Timeouts
        s = m.section(form.NamedSection, 'settings', 'Timeout & Network', 'Timeout & Network');
        s.anonymous = false; s.addremove = false;
        o = s.option(form.Value, 'authidletimeout', 'Inactivity Timeout (mins)'); o.default = '120'; o.datatype = 'range(1, 1440)';
        o = s.option(form.Value, 'sessiontimeout', 'Forced Session Timeout (mins)'); o.default = '1440'; o.datatype = 'range(1, 10080)';
        o = s.option(form.Value, 'preauthidletimeout', 'Pre-Auth Idle Timeout (mins)'); o.default = '30'; o.datatype = 'range(1, 1440)';
        o = s.option(form.Value, 'checkinterval', 'Check Interval (secs)'); o.default = '60'; o.datatype = 'range(10, 3600)';
        o = s.option(form.Value, 'maxclients', 'Max Concurrent Clients'); o.default = '250'; o.datatype = 'range(1, 1000)';
        o = s.option(form.Value, 'leasetime', 'DHCP Lease Time'); o.default = '12h'; o.rmempty = false;
        o = s.option(form.Flag, 'disable_ipv6', 'Disable IPv6 on Portal Interface'); o.default = '1';

        // TAB 4: DHCP & Firewall
        s = m.section(form.NamedSection, 'settings', 'DHCP & Firewall', 'DHCP & Firewall');
        s.anonymous = false; s.addremove = false;
        o = s.option(form.Flag, 'dhcp_enabled', 'Enable DHCP Server'); o.default = '1';
        o = s.option(form.Value, 'dhcp_start', 'DHCP Start IP'); o.default = '192.168.20.100'; o.datatype = 'ipaddr'; o.depends('dhcp_enabled', '1');
        o = s.option(form.Value, 'dhcp_limit', 'DHCP Limit'); o.default = '150'; o.datatype = 'range(1, 250)'; o.depends('dhcp_enabled', '1');
        o = s.option(form.Value, 'dns1', 'Primary DNS'); o.default = '8.8.8.8'; o.datatype = 'ipaddr'; o.rmempty = true;
        o = s.option(form.Value, 'dns2', 'Secondary DNS'); o.default = '8.8.4.4'; o.datatype = 'ipaddr'; o.rmempty = true;
        o = s.option(form.Flag, 'fw_forward', 'Allow Forwarding to WAN'); o.default = '1';

        // TAB 5: Help (Proper HTML using DummyValue)
        s = m.section(form.NamedSection, 'settings', 'Help & Documentation', 'Help & Documentation');
        s.anonymous = false; s.addremove = false;
        o = s.option(form.DummyValue, '_help', 'Setup Guide'); 
        o.rawhtml = true;
        o.default = '<div style="padding: 10px;">' +
            '<h3>OpenLink Captive Portal Setup Guide</h3>' +
            '<p>Welcome to the OpenLink Captive Portal. This application automatically configures your router to provide a secure, isolated guest network that redirects clients to a voucher login page.</p>' +
            '<h4>1. Network & Interface</h4>' +
            '<ul>' +
            '<li><b>Auto-Create Bridge:</b> If checked, the router will automatically create the bridge interface (e.g., <code>br-voucher</code>) and assign the IP address.</li>' +
            '<li><b>Gateway Interface:</b> The network interface the portal listens on.</li>' +
            '<li><b>Portal IP Address:</b> The gateway IP for the isolated network.</li>' +
            '</ul>' +
            '<h4>2. Timeout & Network Settings</h4>' +
            '<ul>' +
            '<li><b>Inactivity Timeout:</b> Minutes of inactivity before a client is forced to re-authenticate.</li>' +
            '<li><b>Forced Session Timeout:</b> The absolute maximum time a client can stay connected.</li>' +
            '<li><b>DHCP Lease Time:</b> How long clients keep their assigned IP address.</li>' +
            '</ul>' +
            '<h4>3. DHCP & Firewall</h4>' +
            '<ul>' +
            '<li>Configures the DHCP server to assign IPs to clients.</li>' +
            '<li>Creates an isolated firewall zone (<code>openlink</code>) with masquerading enabled, allowing clients to access the internet while blocking access to your main LAN.</li>' +
            '</ul>' +
            '<p style="margin-top: 20px;"><b>Click Save & Apply to configure the network, firewall, and NoDogSplash.</b></p>' +
            '</div>';

        return m.render();
    },
    handleSaveApply: function(ev, mode) {
        // (The handleSaveApply logic is unchanged and correct from the previous step)
        var iface = this.map.lookupOption('interface')[0].formvalue();
        var portal_ip = this.map.lookupOption('portal_ip')[0].formvalue();
        var netmask = this.map.lookupOption('netmask')[0].formvalue();
        var enabled = this.map.lookupOption('enabled')[0].formvalue();
        var admin_pass = this.map.lookupOption('admin_pass')[0].formvalue() || 'openlinkadmin';
        var port = this.map.lookupOption('port')[0].formvalue() || '7891';
        var theme = this.map.lookupOption('theme')[0].formvalue() || 'default';
        var auto_bridge = this.map.lookupOption('auto_bridge')[0].formvalue();
        var dhcp_enabled = this.map.lookupOption('dhcp_enabled')[0].formvalue();
        var dhcp_start = this.map.lookupOption('dhcp_start')[0].formvalue();
        var dhcp_limit = this.map.lookupOption('dhcp_limit')[0].formvalue();
        var leasetime = this.map.lookupOption('leasetime')[0].formvalue() || '12h';
        var disable_ipv6 = this.map.lookupOption('disable_ipv6')[0].formvalue();
        var dns1 = this.map.lookupOption('dns1')[0].formvalue();
        var dns2 = this.map.lookupOption('dns2')[0].formvalue();
        var fw_forward = this.map.lookupOption('fw_forward')[0].formvalue();
        var authidletimeout = this.map.lookupOption('authidletimeout')[0].formvalue() || '120';
        var sessiontimeout = this.map.lookupOption('sessiontimeout')[0].formvalue() || '1440';
        var preauthidletimeout = this.map.lookupOption('preauthidletimeout')[0].formvalue() || '30';
        var checkinterval = this.map.lookupOption('checkinterval')[0].formvalue() || '60';
        var maxclients = this.map.lookupOption('maxclients')[0].formvalue() || '250';

        return this.handleSave(ev).then(function() {
            var settings = { "admin_password": admin_pass, "port": port, "theme": theme };
            return fs.write('/data/settings.json', JSON.stringify(settings)).then(function() {
                if (auto_bridge == '1' && iface !== 'br-lan') { uci.set('network', iface, 'device', iface); }
                uci.set('network', 'voucher', 'interface');
                uci.set('network', 'voucher', 'proto', 'static');
                uci.set('network', 'voucher', 'device', iface);
                uci.set('network', 'voucher', 'ipaddr', portal_ip);
                uci.set('network', 'voucher', 'netmask', netmask);
                if (disable_ipv6 == '1') { uci.set('network', 'voucher', 'ipv6', '0'); }
                if (dhcp_enabled == '1') {
                    uci.set('dhcp', 'voucher', 'dhcp');
                    uci.set('dhcp', 'voucher', 'interface', 'voucher');
                    uci.set('dhcp', 'voucher', 'start', dhcp_start);
                    uci.set('dhcp', 'voucher', 'limit', dhcp_limit);
                    uci.set('dhcp', 'voucher', 'leasetime', leasetime);
                    if (dns1) { uci.set('dhcp', 'voucher', 'dns', dns1); }
                    if (dns2) { uci.add_list('dhcp', 'voucher', 'dns', dns2); }
                }
                var zoneSid = uci.sections('firewall', 'zone').find(function(s) { return s.name === 'openlink'; });
                if (!zoneSid) { zoneSid = uci.add('firewall', 'zone'); uci.set('firewall', zoneSid, 'name', 'openlink'); }
                uci.set('firewall', zoneSid, 'input', 'ACCEPT'); uci.set('firewall', zoneSid, 'output', 'ACCEPT');
                uci.set('firewall', zoneSid, 'forward', fw_forward == '1' ? 'ACCEPT' : 'REJECT');
                uci.set('firewall', zoneSid, 'masq', '1'); uci.set('firewall', zoneSid, 'network', 'voucher');
                var rulePortal = uci.sections('firewall', 'rule').find(function(s) { return s.name === 'Allow-OpenLink-Portal'; });
                if (!rulePortal) { rulePortal = uci.add('firewall', 'rule'); uci.set('firewall', rulePortal, 'name', 'Allow-OpenLink-Portal'); }
                uci.set('firewall', rulePortal, 'src', 'openlink'); uci.set('firewall', rulePortal, 'proto', 'tcp udp');
                uci.set('firewall', rulePortal, 'dest_port', '53 67 80 443 2050 7891'); uci.set('firewall', rulePortal, 'target', 'ACCEPT');
                if (!enabled) { uci.set('nodogsplash', '@nodogsplash[0]', 'enabled', '0'); return uci.apply(); }
                uci.set('nodogsplash', '@nodogsplash[0]', 'gatewayinterface', iface);
                uci.set('nodogsplash', '@nodogsplash[0]', 'gatewayipaddress', portal_ip);
                uci.set('nodogsplash', '@nodogsplash[0]', 'maxclients', maxclients);
                uci.set('nodogsplash', '@nodogsplash[0]', 'binauth', '/etc/nodogsplash/binauth.sh');
                uci.set('nodogsplash', '@nodogsplash[0]', 'authidletimeout', authidletimeout);
                uci.set('nodogsplash', '@nodogsplash[0]', 'sessiontimeout', sessiontimeout);
                uci.set('nodogsplash', '@nodogsplash[0]', 'preauthidletimeout', preauthidletimeout);
                uci.set('nodogsplash', '@nodogsplash[0]', 'checkinterval', checkinterval);
                uci.set('nodogsplash', '@nodogsplash[0]', 'splashpage', 'splash.html');
                uci.set('nodogsplash', '@nodogsplash[0]', 'enabled', '1');
                return uci.apply().then(function() { return fs.exec('/etc/init.d/network', ['reload']); }).then(function() { return fs.exec('/etc/init.d/dnsmasq', ['restart']); }).then(function() { return fs.exec('/etc/init.d/firewall', ['restart']); }).then(function() { return fs.exec('/etc/init.d/nodogsplash', ['restart']); }).then(function() { return fs.exec('/etc/init.d/voucher', ['restart']); });
            });
        }).then(function() { ui.changes.apply(); });
    }
});
