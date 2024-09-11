import {Component, Inject, OnInit} from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AddressModel} from '../../model/address.model';
import {Feature} from 'ol';
import {Icon, Style} from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {Point} from 'ol/geom';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent, IconDefinition} from '@fortawesome/angular-fontawesome';
import ol from 'ol/dist/ol';

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

  public map: Map | undefined;
  private doc!: AddressModel;
  public readonly faTimes: IconDefinition = faTimes;

  constructor(public dialogRef: MatDialogRef<MapComponent>, @Inject(MAT_DIALOG_DATA) public data: AddressModel) {
  }

  ngOnInit(): void {
    this.doc = this.data;
    this.initMap();
  }

  private initMap(): void {
    /*
    const marker: Feature<Point> = new Feature({
      geometry: new ol.geom.Point(fromLonLat([this.doc?.latitude, this.doc?.longitude]))
    });

    const markerStyle: Style = new Style({
      image: new Icon({
        src: 'path/to/marker-icon.png',
        scale: 0.1
      })
    });

    marker.setStyle(markerStyle);

    const vectorSource = new VectorSource({
      features: [marker]
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource
    });
    */

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        // vectorLayer
      ],
      view: new View({
        center: fromLonLat([this.doc?.longitude, this.doc?.latitude]),
        zoom: 12
      })
    });
  }

  public closeDialog(): void {
    this.dialogRef.close(null);
  }

}
