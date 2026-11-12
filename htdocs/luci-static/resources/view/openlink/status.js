'use strict';
'require view';
'require rpc';
'require ui';

var callStatus = rpc.declare({ object:'openlink', method:'get_status', expect:{'':{}} });
var callStart  = rpc.declare({ object:'openlink', method:'start_service' });
var callStop   = rpc.declare({ object:'openlink', method:'stop_service' });

return view.extend({
    render: function() {
        var self = this;
        return callStatus().then(function(r) {
            var running = (r.status === 'running');
            return E('div', { 'class':'cbi-section' }, [
                E('h3', {}, _('Service Status')),
                E('p', {}, [
                    _('Voucher Server: '),
                    E('strong', { 'style':'color:' + (running?'green':'red') },
                       running ? _('Running') : _('Stopped'))
                ]),
                E('div', { 'class':'cbi-page-actions' }, [
                    E('button', { 'class':'btn cbi-button-apply',
                        'click': ui.createHandlerFn(self, function(){
                            return callStart().then(function(){ location.reload(); });
                        })}, _('Start Service')),
                    ' ',
                    E('button', { 'class':'btn cbi-button-reset',
                        'click': ui.createHandlerFn(self, function(){
                            return callStop().then(function(){ location.reload(); });
                        })}, _('Stop Service'))
                ])
            ]);
        });
    }
});
