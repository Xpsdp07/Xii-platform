export interface WidgetsCatalogResponse{
    groups:WidgetsCatalogGroup[];
}

export interface WidgetsCatalogGroup{
    name:string;
    items:WidgetsCatalogItem[];
}

export interface WidgetsCatalogItem{
    name:string;
    type:string;
    path:string;
    preview:string;
}
