/**     
 *  jquery.flying.js 1.0
 *  (c) 2011 Thuong Dinh Hoang, ASNET SOFTWARE.
 *  Flying is freely distributable under the MIT license.
 *  For all details and documentation:
 *  http://zneo99.github.com/flying
 */

(function($) {
    
    var instance = null, // static instance of Flying object
        timeout; // static master timeout object
    
    /**
     * Clear the master timeout of Flying plugin
     */
    function clearTheTimeout(){
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    }
    
    /**
     * Flying plugin
     * @param {Object} method
     */
    $.flying = function(options){
        
        if (!instance) {
            instance = new Flying(options);
        }
        
        // reset the plugin
        instance._reset();
        
        return instance;
        
    };
    
    /**
     * @class Flying
     */
    var Flying = function (options) {
        
        // Static variables
        //-----------------
        var defaults = {
            message: 'Loading ...', // defaults message
            align: "center", // "center", "left", "right"
            valign: "top", // "middle", "top", "bottom"
            extraAlign: 0,
            extraValign: 15,
            displayAnimation: true,
            hiddenAnimation: true,
            className: 'flying-notification',
            childClassName: 'flying-message',
            dataName: 'flyingData',
            type: 'info', // "info", "error", "success"
            animationDuration: 1000,
            timeout: 2000 // unit is millisecond, if = 0 it will never hide
        },
        opts, 
        isCreating = false, 
        isShowing = false, 
        isWating = false,
        methods = null,
        methodsWrapper = null, // this using when call wait method
                               // this create a set of virtual methods for lazy calling
        self = this,
        timeoutInterval, // store the latest time parametter when call wait method
        waitQueue = [];
        
        // Private methods
        //----------------
        
        /**
         * Update style of flying box
         */
        function updateStyle($html) {
            var cssProperties = { display: 'none' },
                $flyingMessage = $("." + opts.className + " ." + opts.childClassName);
            
            // change html of flying-message
            // or initialize it
            if (!isCreating) {
                $flyingMessage = $("<div/>", {
                    'class': opts.childClassName + " " + opts.type
                });
                
                $html.append($flyingMessage);
            } else {
                $flyingMessage.attr("class", opts.childClassName + " " + opts.type);
            }
            
            $flyingMessage.html(opts.message);
            
            // change the align
            if (opts.align === "center") {
                cssProperties["text-align"] = "center"; 
            } else if(opts.align === "left") {
                cssProperties["text-align"] = "left"; 
            } else {
                cssProperties["text-align"] = "right"; 
            }
            
            // change the align
            if (opts.valign === "middle") { // middle
                cssProperties.top = "50%"; 
            } else if(opts.valign === "top") { // top
                cssProperties.top = opts.extraValign + "px";
            } else { // bottom
                cssProperties.bottom = opts.extraValign + "px";
            }
            
            // change the defaults css
            $html.css(cssProperties);
        }
        
        /**
         * Create the flying message box
         */
        function createFlyingBox() {
            
            // only creating in the first initialize 
            if (!isCreating) {
                
                var html = $("<div/>", {
                        'class': opts.className + " " + opts.type,
                    });
                
                updateStyle.call(this, html);
                
                // append html to the body
                $(document.body).append(html);
                
                isCreating = true;
                
            } else {
                updateStyle.call(this,$(opts.className));
            }
            
        }
        
        /**
         * Clone a method to has lazy calling feature
         * @param {Object} func The function need to be cloned 
         */
        function cloneMethod(func) {
            
            return function(){
                
                if (waitQueue.length > 0) {
                
                    var queueFunc = {
                        'func': func,
                        'arguments': arguments
                    };
    
                    // add to Fun array of last queue item
                    waitQueue[waitQueue.length - 1].funcs.push(queueFunc);
                    
                }
                
                return methodsWrapper;
            };
            
        }
        
        /**
         * Create method wrapper that 
         */
        function createMethodsWrapper() {
            methodsWrapper = {};
            
            for (key in methods) {
                
                var func = methods[key];
                
                if (typeof func === "function") {
                    
                    if (key !== "wait") {
                        methodsWrapper[key] = cloneMethod(func);
                    } else {
                        methodsWrapper[key] = methods[key];
                    }
                    
                }
            }
        }
        
        /**
         * Process a Query after timeout reached
         */
        function processQueue() {
            
            // create the timeout
            clearTheTimeout();
            
            if (waitQueue.length <= 0) { // there is no item in queue
                isWating = false;
            } else { // start new queue processing
                var queueItem = waitQueue.shift(),
                    queueFuncs = queueItem.funcs,
                    queueFun = null;
                
                if (queueFuncs) {
                    
                    // process all function in queue
                    for (var i = 0, len = queueFuncs.length; i < len; i++) {
                        queueFun = queueFuncs[i];
                        queueFun.func.apply(methods, queueFun.arguments);
                    }
                    
                }
                
                // start another queue
                if (waitQueue.length > 0) {
                    startQueue(waitQueue[0].timeout);
                    isWating = true;
                } else {
                    isWating = false;
                }
                
                delete queueItem;
            }
        }
        
        /**
         * Start Queue monitoring
         * @param timeout {Number} The timeout finish a queue item
         */
        function startQueue(timeout) {
            isWating = true;
            timeout = setTimeout(function(){
                // process another queue item
                processQueue();
            }, timeout);
        }
        
        /**
         * Create a new queue item
         * @param timeout {Number} The timeout finish a queue item
         */
        function createQueueItem(timeout) {
            waitQueue.push({
                'timeout': timeout,
                'funcs': []
            });
        }
        
        // Constructor code
        //-----------------
                
        // merge the defaults options
        if (!opts) {
            opts = $.extend(true, defaults, options);
        }
        else {
            opts = $.extend(true, opts, options);
        }
        
        // create the flying box
        createFlyingBox.call(this);
        
        // bind document scroll event
        // change the position of flying box to top if scroll down
        // and reset to middle header when scroll top
        $(document).scroll(function(){
        
            var documentScrollTop = $(this).scrollTop();
            
            if (documentScrollTop <= opts.extraValign) {
                $("." + opts.className).css("top", (opts.extraValign - documentScrollTop) + "px");
            }
            else {
                $("." + opts.className).css("top", "0px");
            }
        });
        
        // Publics methods
        //----------------
        methods = {
            
            /**
             * Reset plugin to default setting
             */
            _reset: function () {
                // remove all old command
                clearTheTimeout();
                
                // if showing, hide the flying box
                if (isShowing) {
                    $("." + opts.className).hide();
                }
                
                waitQueue = null;
                waitQueue = [];
                isCreating = false; 
                isShowing = false; 
                isWating = false;
            },
            
            /**
             * Show the message
             *
             * @param {String} message The message need to be show
             * @param {Object} type The type of message
             */
            show: function(message, type){
            
                var $flying = $("." + opts.className),
                    $flyingMessage = $("." + opts.className + " ." + opts.childClassName);
                
                opts.type = type || "info";
                opts.message = message || opts.message;
                
                // change message and type of flying message box type
                $flyingMessage.attr("class", opts.childClassName + " " + opts.type);
                $flyingMessage.html(opts.message);
                
                // show the flying box
                if (opts.displayAnimation) // show with animation
                    $flying.fadeIn(opts.animationDuration);
                else 
                    $flying.show();
                
                isShowing = true;
                
                // chaining
                return this;
            },
            
            /**
             * Hide the notification
             */
            hide: function(){
                
                var $flying = $("." + opts.className);
                
                if ($flying) {
                    
                    // hide the flying box
                    if (opts.hiddenAnimation) // hide with animation
                        $flying.fadeOut(opts.animationDuration);
                    else 
                        $flying.hide();
                        
                }
                
                isShowing = false;
                
                // chaining
                return this;
            },
            
            /**
             * Waiting a time second after do the next action
             *
             * @param {Number} time The second need to be
             */
            wait: function(time){
                timeoutInterval = time || opts.timeout;
                
                // create new queue item for storing functions in chaining
                createQueueItem(timeoutInterval);
                
                // initialize methodsWrapper
                if (!methodsWrapper)
                    createMethodsWrapper();
                    
                // start queue of there are no waiting method call before
                if (!isWating) {
                    startQueue(timeoutInterval);
                }
                
                return methodsWrapper;
            }
            
        }
        
        // return all the public methods
        return methods;
    }
    
})(jQuery);