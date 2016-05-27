/// <reference path="../../../typings/tsd.d.ts" />
namespace App.Services {

    export interface IAsynchResource {
        url:string;
        loadResource():angular.IPromise<boolean>;
        id?:string;
   }

    /**
     * Given an URL and an id, it will asynch load that file
     */
    export class JavaScriptResourceLoader implements IAsynchResource {

        public static $inject = ["$q"];
        public deferred:angular.IDeferred<boolean>;
        public url:string;
        public id:string;
        public static placement = "script";

        constructor(public promise:angular.IQService) {

        }

        loadResource():angular.IPromise<boolean> {
            this.deferred = this.promise.defer<boolean>();

            let scriptTag, loadAfter = document.getElementsByTagName(JavaScriptResourceLoader.placement)[0];
            if (document.getElementById(this.id)) return;
            scriptTag = document.createElement(JavaScriptResourceLoader.placement);

            scriptTag.id = this.id;
            scriptTag.src = this.url;
            loadAfter.parentNode.insertBefore(scriptTag, loadAfter);
            scriptTag.onload = ()=> this.deferred.resolve(true);

            return <angular.IPromise<boolean>> this.deferred.promise;

        }




    }

}