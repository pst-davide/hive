import {Component, OnInit} from '@angular/core';
import {VersionModel, VersionService} from '../../core/services/version.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  public year: number = new Date().getFullYear();
  public version!: string;

  constructor(private versionService: VersionService) {
  }

  ngOnInit(): void {
    this.versionService.getVersion().subscribe(versionInfo => {
      console.log(versionInfo);
      this.version = versionInfo.version;
    });
  }
}
