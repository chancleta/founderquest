/// <reference path="../../typings/tsd.d.ts" />

module App {
    'use strict';

    class Init {

        public static $inject = ["$routeProvider", "$stateProvider", "$urlRouterProvider", "$rootScope", "JavaScriptResourceLoader"];

        public static init():void {

            HTMLElement.prototype._showModal = function () {
                this.style.display = "block";
            };

            HTMLElement.prototype._closeModal = function () {
                this.style.display = "none";
            };

            angular.module("foundersmap", ["LocalStorageModule", "ui.router"]).config(Init.config);
            angular.module("foundersmap").run(Init.run);
            angular.module("foundersmap").service("JavaScriptResourceLoader", App.Services.JavaScriptResourceLoader);

        }

        private static run($rootScope:angular.IRootScopeService, JavaScriptResourceLoader:App.Services.IAsynchResource) {
            $rootScope.$on('$stateChangeSuccess', () => angular.element(document).ready(() => componentHandler.upgradeAllRegistered()));

            JavaScriptResourceLoader.id = "google-maps";
            JavaScriptResourceLoader.url = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDgBWbGc9jaXuIdWiwVQT82CQ5TbL5sodI";
            JavaScriptResourceLoader.loadResource().then(()=> {
                $rootScope.googleMapsLoaded = true;
                $rootScope.$emit(App.Models.GlobalEvents[App.Models.GlobalEvents.googleMapsLoaded]);
            });
        }

        private static config($urlRouterProvider:angular.ui.IUrlRouterProvider, $stateProvider:angular.ui.IStateProvider):void {

            $urlRouterProvider.otherwise("/");
            $urlRouterProvider.when('', '/');
            $urlRouterProvider.when('/dashboard', '/dashboard/import');
            $urlRouterProvider.when('/dashboard/', '/dashboard/import');

            $stateProvider
                .state('dashboard', App.Factories.RouteFactory.getInstance().getRoute(App.Controllers.DashboardCtrl))
                .state('dashboard.import', App.Factories.RouteFactory.getInstance().getRoute(App.Controllers.CSVImporterCtrl))
                .state('dashboard.summary', App.Factories.RouteFactory.getInstance().getRoute(App.Controllers.SummaryCtrl))
                .state('home', App.Factories.RouteFactory.getInstance().getRoute(App.Controllers.HomeCtrl));
        }
    }

    Init.init();
}


module App.Factories {
    'use strict';

    export interface IRouteFactory {
        getRoute<T>(controllerType:{ new(...args:any[]): T ;}):angular.route.IRoute;
    }

    export class RouteFactory implements IRouteFactory {

        private static routeFactory:RouteFactory;

        public static getInstance():RouteFactory {
            if (!RouteFactory.routeFactory) {
                RouteFactory.routeFactory = new RouteFactory();
            }
            return RouteFactory.routeFactory;
        }

        public getRoute<T>(controllerType:{ new(...args:any[]): T ;}):angular.route.IRoute {

            let route:angular.ui.IState = {controllerAs: "vm"};
            route.controllerAs = "vm";
            switch (controllerType.toString()) {
                case  App.Controllers.CSVImporterCtrl.toString():
                    route.url = "/import";
                    route.controller = controllerType;
                    route.templateUrl = "views/csvImporter.html";
                    break;
                case  App.Controllers.DashboardCtrl.toString():
                    route.url = "/dashboard";
                    route.controller = controllerType;
                    route.templateUrl = "views/importDashboard.html";
                    route.abstract = true;
                    break;
                case  App.Controllers.SummaryCtrl.toString():
                    route.url = "/summary";
                    route.controller = controllerType;
                    route.templateUrl = "views/summary.html";
                    break;
                case  App.Controllers.HomeCtrl.toString():
                    route.url = "/";
                    route.controller = controllerType;
                    route.templateUrl = "views/home.html";
                    break;
                default:
                    throw "Argument is not a controller type";
            }
            return route;
        }


    }
}
