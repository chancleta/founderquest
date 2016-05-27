/// <reference path="../models/CSVEntryModel.ts" />
/// <reference path="../models/CVSImportModel.ts" />
/// <reference path="../../../typings/tsd.d.ts" />

module App.Controllers {
    'use strict';

    export class CSVImporterCtrl {
        public importData:App.Models.CSVImportModel;
        public processingData:boolean = false;
        public static $inject = ["$scope", "localStorageService"];
        private LatLonErrorMessage:string;

        constructor($scope:angular.IScope, public localStorage:angular.local.storage.ILocalStorageService) {
            this.setDefaultScopeValues();
            $scope.$emit(App.Models.DashboardEvents[App.Models.DashboardEvents.changeView], {id: "#dashboardImport"});

        }

        public processCSV(formData:angular.IFormController):void {
            /**
             * Setting processingData to true to disabled the Import button on the UI
             * @type {boolean}
             */
            this.processingData = true;

            /**
             * Splitting the CSV content into lines
             * @type {string[]}
             */
            let lines:Array<string> = this.importData.csvContent.split(/\n/);


            /**
             * Verify if the integrity of the data, if the data is valid, then we proceed, if not a message
             * is shown to the user and we retrn.
             */
            if (!this.verifyHeaderIntegrity(formData, lines)) {
                this.processingData = false;
                return;
            }

            /**
             * Retreving the current saved data from the localStorage
             * @type {AIrray<App.Models.CSVEntryModel>}
             */
            let currentEntries = this.localStorage.get<Array<App.Models.ICSVEntryModel>>("csvEntries");
            currentEntries = currentEntries == null ? [] : currentEntries;

            /**
             * If there are no entries returned, then we verify if there was an error, on lat, long
             * @type {Array<App.Models.ICSVEntryModel>}
             */
            let entries = this.getCSVEnriesFromData(lines);
            if (entries.length == 0) {
                let message = "Oops no entries were imported";
                if (this.LatLonErrorMessage !== undefined)
                    message = this.LatLonErrorMessage;

                document.querySelector('#toastError').MaterialSnackbar.showSnackbar({
                    message: message,
                    timeout: 10000
                });
                return;
            }
            this.localStorage.set("csvEntries", currentEntries.concat(entries));

            /*
             * Resetting all the values and showing the user a notification about the status of the import
             */
            this.setDefaultScopeValues();
            this.processingData = false;
            formData.$setUntouched();
            formData.$setPristine();

            /*
             * Resetting Material Design Lite fields after changing their value
             * */
            let mldFields = document.querySelectorAll(".mdl-textfield");
            for (let i = 0; i < mldFields.length; i++) {
                if (mldFields[i].MaterialTextfield !== undefined) {
                    mldFields[i].MaterialTextfield.change();
                }
            }

            document.querySelector('#toastSuccess').MaterialSnackbar.showSnackbar({
                message: "Data successfully imported",
                timeout: 10000
            });

        }

        private  getSeparatorString():RegExp {
            switch (this.importData.separatedBy) {
                case App.Models.SeparatedBy.Comma:
                    return /,/;
                case App.Models.SeparatedBy.Semicolon:
                    return /;/;
                default:
                    return /\t/;
            }
        }

        private verifyHeaderIntegrity(formData:angular.IFormController, lines:Array<string>):boolean {
            let message:string;
            let separator = this.getSeparatorString();
            /**
             * Verify if we have the minimun required lines
             */
            if (lines.length <= 1) {
                message = "Error Occurred, please verify your CSV Data, not enough lines";
            }
            /**
             * if we do, then we split the first line ( header line ) into an array separated by the users input
             * @type {any[]}
             */
            let headersArray = lines[0].split(separator).map(Function.prototype.call, String.prototype.trim);

            /**
             * The header must be at least 11 columns length
             */
            console.log(headersArray.length);
            if (message === undefined && headersArray.length <= 10) {
                message = "Header line does not contains minimun requirements (11 columns at least), did you choose right Separated by value?";
            }

            /**
             * if for any reason the form data is still invalid
             */
            if (message === undefined && formData.$invalid) {
                message = "There is a problem with the Form, please verify the fields";
            }

            /**
             * verify if there is a Longitude column with the name supplied by the user
             */
            if (message === undefined && headersArray.indexOf(this.importData.longitudeName) == -1) {
                message = 'Longitude Column with name "' + this.importData.longitudeName + '" not found';
            }

            /**
             * verify if there is a Latitude column with the name supplied by the user
             */
            if (message === undefined && headersArray.indexOf(this.importData.latitudeName) == -1) {
                message = 'Latitude Column with name "' + this.importData.latitudeName + '" not found';
            }

            /**
             * If User Marker Label is set to true then we verify if the Marker Name header is present
             */
            if (message === undefined && this.importData.useMakerLabel && headersArray.indexOf(this.importData.markerName) == -1) {
                message = 'Maker Label Column with name "' + this.importData.markerName + '" not found';

            }

            /**
             * Showing the errors to the user
             */
            if (message !== undefined)
                document.querySelector('#toastError').MaterialSnackbar.showSnackbar({
                    message: message,
                    timeout: 10000
                });

            return message === undefined;
        }


        private getCSVEnriesFromData(lines:Array<string>):Array<App.Models.ICSVEntryModel> {

            let entryArray:Array<App.Models.ICSVEntryModel> = [];
            let separator = this.getSeparatorString();
            let headersArray = lines[0].split(separator).map(Function.prototype.call, String.prototype.trim);

            /**
             * Setting the index of the Latitude, Longitude and Maker headers
             * @type {number}
             */
            let latitudeHeader = headersArray.indexOf(this.importData.latitudeName);
            let longitudeHeader = headersArray.indexOf(this.importData.longitudeName);
            let markerHeader = this.importData.useMakerLabel ? headersArray.indexOf(this.importData.markerName) : undefined;

            for (let counter = 1; counter < lines.length; counter++) {
                let line:Array<string> = lines[counter].split(separator);
                /**
                 * For each line we create a new entry object and push it into the array
                 * @type {{companyName: string, founder: string, city: string, country: string, postalCode: string, street: string, photo: string, homePage: string, latitude: string, longitude: string, markerName: string}}
                 */
                let latitude:number = parseFloat(line[latitudeHeader]);
                let longitude:number = parseFloat(line[longitudeHeader]);

                if (isNaN(latitude)) {
                    this.LatLonErrorMessage = "Latitude value for row " + (counter + 1) + " is not a valid number";
                }

                if (isNaN(longitude)) {
                    this.LatLonErrorMessage = "Longitude value for row " + (counter + 1) + " is not a valid number";
                }

                if (this.LatLonErrorMessage !== undefined) {

                    return [];
                }

                let entry:App.Models.ICSVEntryModel = {
                    companyName: line[App.Models.CSVHeader.CompanyName],
                    founder: line[App.Models.CSVHeader.Founder],
                    city: line[App.Models.CSVHeader.City],
                    country: line[App.Models.CSVHeader.Country],
                    postalCode: line[App.Models.CSVHeader.PostalCode],
                    street: line[App.Models.CSVHeader.Street],
                    photo: line[App.Models.CSVHeader.Photo],
                    homePage: line[App.Models.CSVHeader.HomePage],
                    latitude: latitude,
                    longitude: longitude,
                    active: true,
                    markerName: markerHeader !== undefined ? line[markerHeader] : ""
                };
                entryArray.push(entry);
            }
            return entryArray;
        }

        private setDefaultScopeValues():void {
            this.importData = {
                separatedBy: App.Models.SeparatedBy.Comma,
                useMakerLabel: false,
                markerName: "",
                latitudeName: "",
                longitudeName: "",
                csvContent: ""
            };
        }

    }
}