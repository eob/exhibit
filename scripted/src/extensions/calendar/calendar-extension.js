/*==================================================
 *  Simile Exhibit Calendar Extension
 *==================================================
 */

Exhibit.onjQueryLoaded(function() {
    var loader;
    loader = function() {
        var javascriptFiles, cssFiles, paramTypes, url, scriptURLs, cssURLs, ajaxURLs, i, delayID, finishedLoading, localesToLoad
        , proto = document.location.protocol === "https:" ?
            "https:" : "http:";
        delayID = Exhibit.generateDelayID();
        Exhibit.jQuery(document).trigger(
            "delayCreation.exhibit",
            delayID
        );
        
        Exhibit.CalendarExtension = {
            "params": {
                "bundle": false,
                "calendarPrefix": proto + "//api.simile-widgets.org"
            },
            "urlPrefix": null,
            "locales": [
                "en"
            ]
        };
        
        javascriptFiles = [
            "date-picker-facet.js",
            "date-picker.js",
            "date-util.js",
            "calendar-view.js"
        ];
        cssFiles = [
            "date-picker-facet.css",
            "calendar-view.css"
        ];
        paramTypes = {
            "bundle": Boolean,
            "calendarPrefix": String

        };

        if (Exhibit.params.dev) {
            Exhibit.CalendarExtension.params.bundle = false;
        }
        
        if (typeof Exhibit_CalendarExtension_urlPrefix === "string") {
            Exhibit.CalendarExtension.urlPrefix = Exhibit_CalendarExtension_urlPrefix;
            if (typeof Exhibit_CalendarExtension_parameters !== "undefined") {
                Exhibit.parseURLParameters(Exhibit_CalendarExtension_parameters,
                                           Exhibit.CalendarExtension.params,
                                           paramTypes);
            }
        } else {
            url = Exhibit.findScript(document, "/calendar-extension.js");
            if (url === null) {
                Exhibit.Debug.exception(new Error("Failed to derive URL prefix for SIMILE Exhibit Calendar Extension files"));
                return;
            }
            Exhibit.CalendarExtension.urlPrefix = url.substr(0, url.indexOf("calendar-extension.js"));
            Exhibit.parseURLParameters(url, Exhibit.CalendarExtension.params, paramTypes);
        }
        
        scriptURLs = [];
        cssURLs = [];
        
        if (typeof SimileAjax === "undefined") {
            /**
             * Ugly SimileAjax hack.  See load-simile-ajax.js.
             */
            scriptURLs.push(Exhibit.CalendarExtension.urlPrefix + "load-simile-ajax.js");
        }
        
        if (Exhibit.CalendarExtension.params.bundle) {
            scriptURLs.push(Exhibit.CalendarExtension.urlPrefix + "calendar-extension-bundle.js");
            cssURLs.push(Exhibit.CalendarExtension.urlPrefix + "styles/calendar-extension-bundle.css");
        } else {
            Exhibit.prefixURLs(scriptURLs, Exhibit.CalendarExtension.urlPrefix + "scripts/", javascriptFiles);
            Exhibit.prefixURLs(cssURLs, Exhibit.CalendarExtension.urlPrefix + "styles/", cssFiles);
        }
    
        localesToLoad = Exhibit.Localization.getLoadableLocales(Exhibit.CalendarExtension.locales);
        for (i = 0; i < localesToLoad.length; i++) {
            scriptURLs.push(Exhibit.CalendarExtension.urlPrefix + "locales/" + localesToLoad[i] + "/locale.js");
        }
        
        Exhibit.includeCssFiles(document, null, cssURLs);
        Exhibit.includeJavascriptFiles(null, scriptURLs);

        // Ugly polling hack
        finishedLoading = function() {
            if (typeof Exhibit.CalendarView !== "undefined") {

                // Note: there's a bug in SimileAjax's exception handling
                // when we try duct tape on this old version. (parseUrlParams isn't present)
                // so for now I'll hard-code this.
                SimileAjax.Debug.exception = function(e, msg) {
                    var f;
                    f = function(e2, msg2) {
                        if (msg2 != null) {
                            console.error(msg2 + " %o", e2);
                        } else {
                            console.error(e2);
                        }
                        throw(e2); // do not hide from browser's native debugging features
                    };
                    SimileAjax.Debug.exception = f;
                    f(e, msg);
                };

                Exhibit.jQuery(document).trigger("delayFinished.exhibit", delayID);
            } else {
                setTimeout(finishedLoading, 500);
            }
        };
        finishedLoading();
    };

    Exhibit.jQuery(document).one("loadExtensions.exhibit", loader);
});