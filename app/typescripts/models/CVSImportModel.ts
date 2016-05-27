module App.Models{

    export interface CSVImportModel{
        separatedBy:SeparatedBy;
        useMakerLabel:boolean;
        markerName?:string;
        latitudeName:string;
        longitudeName:string;
        csvContent:string;
    }
    export enum SeparatedBy {
        Comma,Semicolon,Tab
    }
}