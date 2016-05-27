module App.Models{

    export interface ICSVEntryModel{
        companyName:string;
        founder:string;
        city:string;
        country:string;
        postalCode:string;
        street:string;
        photo:string;
        homePage:string;
        latitude:number;
        longitude:number;
        active:boolean;
        markerName?:string;
    }

    export interface IDashboardEventArg{
        id:string
    }
    export enum CSVHeader{
        Id,CompanyName,Founder,City,Country,PostalCode, Street,Photo,HomePage
    }

    export enum DashboardEvents{
        changeView
    }

    export enum GlobalEvents{
        googleMapsLoaded
    }
}