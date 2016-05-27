/// <reference path="../models/CSVEntryModel.ts" />
/// <reference path="../models/CVSImportModel.ts" />
/// <reference path="../../../typings/tsd.d.ts" />

module App.Controllers {
    'use strict';

    export class SummaryCtrl {
        public static $inject = ["$scope", "localStorageService", "$timeout"];
        public dataEntries:Array<App.Models.ICSVEntryModel>;
        public filterText:string;
        public dialog:any;

        constructor($scope:angular.IScope, public localStorage:angular.local.storage.ILocalStorageService, public $timeout:angular.ITimeoutService) {
            /**
             * Cotains all the imported CSV data
             * @type {Array<App.Models.ICSVEntryModel>}
             */
            this.dataEntries = localStorage.get<Array<App.Models.ICSVEntryModel>>("csvEntries");
            /**
             * Telling the Dashboard controller this view has loaded
             */
            $scope.$emit(App.Models.DashboardEvents[App.Models.DashboardEvents.changeView], {id: "#dashboardSummary"});
            /**
             * Saving the reference to Dialog, which is shown when the users click on view photo
             * @type {Element}
             */
            this.dialog = document.querySelector('dialog');
        }

        public reloadMaterialDesign():void {
            this.$timeout(()=>componentHandler.upgradeAllRegistered(), 1);
        }

        public updateEntryStatus(entry:App.Models.ICSVEntryModel):void {
            entry.active = !entry.active;
            this.localStorage.set("csvEntries", this.dataEntries);
        }

        public deployDialog(entry:App.Models.ICSVEntryModel) {
            this.dialog.querySelector('#dialogImage').setAttribute("src", entry.photo);
            this.dialog._showModal();
        }

        public  closeDialog() {
            this.dialog._closeModal();
        }
    }

}