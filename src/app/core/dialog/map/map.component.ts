import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AddressModel} from '../../model/address.model';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent, IconDefinition} from '@fortawesome/angular-fontawesome';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';
import {Point} from "ol/geom";
import {Feature} from "ol";

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    FaIconComponent
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit {
  public title: string = '';
  private doc!: AddressModel;
  public readonly faTimes: IconDefinition = faTimes;
  public map: Map | undefined;

  constructor(public dialogRef: MatDialogRef<MapComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { address: AddressModel, title: string }) {
  }

  ngOnInit(): void {
    this.doc = this.data.address;
    this.title = this.data.title;
    this.initMap();
  }

  private initMap(): void {

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),

        new VectorLayer({
          source: new VectorSource({
            features: [
              new Feature({
                geometry: new Point(fromLonLat([this.doc?.longitude, this.doc?.latitude]))
              })
            ]
          }),
          style: new Style({
            image: new Icon({
              anchor: [0.5, 1],
              src: '/images/logo.svg',
              width: 50,
              height: 50,

            })
          })
        })

      ],
      view: new View({
        center: fromLonLat([this.doc?.longitude, this.doc?.latitude]),
        zoom: 17
      })
    });

  }

  public closeDialog(): void {
    this.dialogRef.close(null);
  }

}
