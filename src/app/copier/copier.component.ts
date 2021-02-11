import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-copier',
  templateUrl: './copier.component.html',
  styleUrls: ['./copier.component.css']
})
export class CopierComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get('http://192.168.1.86:4012/api/mov/dirinfogetter').subscribe((data) => {
      console.log(data);
      
    })
  }
}
