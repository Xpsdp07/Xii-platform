import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EndPointApi } from '../_helpers/endpointapi';

import { WidgetsCatalogResponse } from '../_models/widgets-catalog';

@Injectable({
    providedIn:'root'
})

export class WidgetsCatalogService{
    private endPointConfig:string=EndPointApi.getURL();

    constructor(private http:HttpClient){}

    // get widgets catalog
    getCatalog():Observable<WidgetsCatalogResponse>{
        const headers=new HttpHeaders({
            'Content-Type':'application/json',
            'Skip-Auth':'true'

        });

        return this.http.get<WidgetsCatalogResponse>(
            this.endPointConfig + '/api/widgets-catalog',
            {headers}
        );

    }


}