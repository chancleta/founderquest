/// <reference path="../models/CSVEntryModel.ts" />
/// <reference path="../models/CVSImportModel.ts" />
/// <reference path="../../../typings/tsd.d.ts" />

module App.Controllers {
    'use strict';


    export class HomeCtrl {
        public static $inject = ["localStorageService", "$rootScope"];
        public entries:Array<App.Models.ICSVEntryModel>;
        public map:google.maps.Map;

        constructor(public localStorage:angular.local.storage.ILocalStorageService, $rootScope:angular.IRootScopeService) {
            this.entries = this.localStorage.get<Array<App.Models.ICSVEntryModel>>("csvEntries");
            document.querySelector("title").innerHTML = "Founder's Map Quest";

            /**
             * When the google map api javascript is loaded the rootScope.googleMapsLoaded is set to true,
             * so if it is already loaded we just init the map, if not then we need to wait for that javscript to be loaded
             * when it is loaded an event is triggered App.Models.GlobalEvents.googleMapsLoaded, when it does we call initMap
             */
            if ($rootScope.googleMapsLoaded)
                this.initMap();

            $rootScope.$on(App.Models.GlobalEvents[App.Models.GlobalEvents.googleMapsLoaded], (event, args)=> {
                this.initMap();
            })

        }

        public initMap():void {
            if (this.map !== undefined)
                return;

            let googleMapsConfig:google.maps.MapOptions = {
                zoom: 3,
                center: {lat: 30.3938139, lng: -30.963366}
            };


            if (this.entries !== null && this.entries.length > 0){
                googleMapsConfig.center = this.getMapCenter();
                googleMapsConfig.zoom = 8;
            }


            this.map = new google.maps.Map(document.getElementById('map'), googleMapsConfig);

            if (this.entries !== null && this.entries.length > 0)
                this.addMarkers();

        }

        private getMapCenter():google.maps.LatLng {

            let bound = new google.maps.LatLngBounds();

            for (let entry:App.Models.ICSVEntryModel of this.entries) {
                bound.extend(new google.maps.LatLng(entry.latitude, entry.longitude));
            }

            return bound.getCenter();
        }

        private addMarkers():void {

            let infowindow = new google.maps.InfoWindow();
            /**
             * We filter all the CSV entries and only take the ones that are not excluded
             * @type {App.Models.ICSVEntryModel[]}
             */
            let filterEntries = this.entries.filter((entry:App.Models.ICSVEntryModel) => entry.active);
            for (let entry:App.Models.ICSVEntryModel of filterEntries) {
                let marker:google.maps.Marker = new google.maps.Marker({
                    label: entry.markerName,
                    position: {lat: entry.latitude, lng: entry.longitude},
                    map: this.map
                });


                marker.addListener('click', ()=> {
                    infowindow.setContent(
                        '<div id="content">' +
                        '<div id="siteNotice">' +
                        '</div>' +
                        '<h1 id="firstHeading" class="firstHeading">' + ((entry.markerName !== undefined && entry.markerName != "") ? entry.markerName : entry.companyName) + '</h1>' +
                        '<div id="bodyContent">' +
                        '<p><img src="' + entry.photo + '"/> </p>' +
                        '<p> <a href="' + entry.homePage + '">' +
                        '' + entry.companyName + '</a> </p>' +
                        'Founder: ' + entry.founder + '' +
                        '</p>' + entry.city + ',' + entry.street + ',' + entry.postalCode + ',' + entry.country + '.</p>' +
                        '</div>' +
                        '</div>'
                    );

                    infowindow.open(this.map, marker);
                });
            }
        }

    }


}