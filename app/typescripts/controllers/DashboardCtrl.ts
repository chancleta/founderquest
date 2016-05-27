/// <reference path="../models/CSVEntryModel.ts" />
/// <reference path="../models/CVSImportModel.ts" />
/// <reference path="../../../typings/tsd.d.ts" />

module App.Controllers {
    'use strict';
    export class DashboardCtrl {
        public static $inject = ["$scope"];

        constructor($scope:angular.IScope) {

            /**
             * We lister for the event App.Models.DashboardEvents.changeView, to update the html title, to set the proper
             * list item to active and the change the header name to its respective screen
             */
            $scope.$on(App.Models.DashboardEvents[App.Models.DashboardEvents.changeView], (event, args)=> {
                let finder:App.Models.IDashboardEventArg = <App.Models.IDashboardEventArg>args;

                let newActiveItem:HTMLElement = <HTMLElement> document.querySelector(finder.id);
                /**
                 * Each A tag has the information of its view, what the title of the page should be and
                 * the header of the dashboard
                 * @type {string}
                 */
                let newTitle:string = newActiveItem.getAttribute("data-title");
                let newHeader:string = newActiveItem.getAttribute("data-dashboard-title");

                let dashboardHeader:HTMLElement = <HTMLElement> document.querySelector("#dashboardTitle");
                let documentTitle:HTMLElement = <HTMLElement> document.querySelector("title");
                let activeMenuItem:HTMLElement = <HTMLElement> document.querySelectorAll("#dashboardMenu a.mdl-navigation__link.is-active");

                dashboardHeader.innerHTML = newHeader;
                documentTitle.innerHTML = newTitle;

                angular.element(activeMenuItem).removeClass("is-active");
                angular.element(newActiveItem).addClass("is-active");

            });
        }
    }

}