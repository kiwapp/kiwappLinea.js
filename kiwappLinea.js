(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){
    'use strict';

    /**
    *  browserify modules dependencies
    **/
    var EventEmitter = require('../utils/event'),
        extend       = require('../utils/extend'),
        Kiwapp       = window.Kiwapp;

    /**
     * Wrapper for Kiwapp native API calls
     */
    var launch = function launch(name,data) {
        Kiwapp.driver().trigger('callApp', {
            call: name,
            data: data
        });
    };

    /**
     * KWLinea class
     */
    function KWLinea() {
        EventEmitter.call(this);
        this.version = require('./version');
        this.available = false;

        eventsListening(this);
        this.connect();
    }

    /**
     * EventEmitter interface
     */
    KWLinea.prototype = Object.create(EventEmitter.prototype);

    /**
     * Call native to know if Linea device is available
     * @return {KWLinea} return the current instance
     */
    KWLinea.prototype.connect = function KWLineaConnect(){
        Kiwapp.log('[JS@KWLinea] Try to connect Linea device');
        launch('is_linea_barcode_scanner_available', {});
        return this;
    };

    /**
     * Active the Linea device scan
     * @param  {Object} config The scan configuration
     * @return {KWLinea/false} Return current instance if success, else return false
     */
    KWLinea.prototype.scan = function KWLineaScan(config){
        if(!triggerError(this, 'scan')) return false;

        extend({}, {
            timeout : 5,
            sound : true,
            multiscan : false
        }, config);

        Kiwapp.log('[JS@KWLinea] Scanning');
        launch('linea_barcode_scan', config);
        return this;
    };

    /**
     * Stop current scanning Linea device action
     * @return {KWLinea} Return current instance if success, else return false
     */
    KWLinea.prototype.stop = function KWLineaStop(){
        if(!triggerError(this, 'stop')) return false;

        Kiwapp.log('[JS@KWLinea] Stop scanning');
        launch('linea_cancel_barcode_scan');
        return this;
    };

    /**
     * Set the Physical Button
     * @param  {Boolean} enabled Define if the Physical Button is enabled
     * @return {KWLinea}         Return current instance if success, else return false
     */
    KWLinea.prototype.physicalButton = function KWLineaPhysicalButton(enabled){
        if(!triggerError(this, 'physicalButton')) return false;

        Kiwapp.log('[JS@KWLinea] New Physical button state :'+enabled);
        launch('linea_enable_scan_button', enabled);
        return this;
    };

    /**
     * Call native to get Linea device battery state
     * @return {KWLinea} Return current instance if success, else return false
     */
    KWLinea.prototype.battery = function KWLineaBattery(){
        if(!triggerError(this, 'battery')) return false;

        Kiwapp.log('[JS@KWLinea] Waiting for battery informations');
        launch('linea_get_battery_information');
        return this;
    };

    /**
     * [Private] Active events listening for KWLinea instance
     * @param  {KWLinea} self Instance listening events
     * @return {undefined}   Return undefined
     */
    function eventsListening(self){
        Kiwapp.driver().on('isLineaBarcodeScannerAvailable', function(infos){
            if(infos.status){
                Kiwapp.log('[JS@KWLinea] Linea device is available');
                self.available = true;
                self.trigger('ready');
            }
            else{
                Kiwapp.log('[JS@KWLinea] Linea device is unavailable');
                self.available = false;
                triggerError(this, 'connect');
            }
        });
        Kiwapp.driver().on('lineaAnswer', function(answer){
            Kiwapp.log('[JS@KWLinea] Scanning success');
            self.trigger('scan:success', answer);
        });
        Kiwapp.driver().on('lineaBatteryInformation', function(answer){
            Kiwapp.log('[JS@KWLinea] Battery informations get');
            self.trigger('battery:success', answer);
        });
    }

    /**
     * Check if KWLinea is available
     * Trigger error events
     * @param  {KWLinea} self   Instance triggering error events
     * @param  {String} action Action which can't work
     * @return {Boolean}       If the KWLinea device is available : return true, else : return false
     */
    function triggerError(self, action){
        if(!self.available){
            Kiwapp.log('[JS@KWLinea] '+action+' is impossible : Linea device is unavailable');
            self.trigger('error', action);
            self.trigger(action+':error');
            return false;
        }
        return true;
    }

    /**
     * add KWLinea to window
     * @type {KWLinea}
     */
    window.KWLinea  = KWLinea;
    module.exports = KWLinea;
})();

},{"../utils/event":3,"../utils/extend":4,"./version":2}],2:[function(require,module,exports){
module.exports = '1.0.2';

},{}],3:[function(require,module,exports){
'use strict';
(function(){
    function EventEmitter(){
        this.events = {};
    }

    EventEmitter.prototype.on = function(eventName, callback, instance) {

        if(!this.events[eventName]) {
            this.events[eventName] = [];
        }

        this.events[eventName].push({callback : callback, instance : instance});
    };

    EventEmitter.prototype.trigger = function(events) {

        var args = Array.prototype.slice.call(arguments);
        args.shift();

        if(!Array.isArray(events)) {
            events = [events];
        }

        for(var i = 0; i < events.length; i++) {

            var eventName = events[i],
                splitName = eventName.split('*');

            if(splitName.length <= 1){
                if(!this.events[eventName]) {
                    continue;
                }

                for(var o = 0; o < this.events[eventName].length; o++) {
                    this.events[eventName][o].callback.apply(this.events[eventName][o].instance , args);
                }

            } else{
                for(var x in this.events) {

                    if(x.indexOf(splitName[1]) > -1) {
                        eventName = x;

                        for(var u = 0; u < this.events[eventName].length; u++) {
                            this.events[eventName][u].callback.apply(this.events[eventName][u].instance, args);
                        }
                    }
                }
            }
        }
    };

    module.exports = EventEmitter;
})();
},{}],4:[function(require,module,exports){
'use strict';
(function(){
    /**
     * A method which imitate jQuery extend method
     * @return {object} The concat final object
     */
    module.exports = function extend(){
        for(var i=1; i<arguments.length; i++)
            for(var key in arguments[i])
                if(arguments[i].hasOwnProperty(key))
                    arguments[0][key] = arguments[i][key];
        return arguments[0];
    };
})();
},{}]},{},[1]);