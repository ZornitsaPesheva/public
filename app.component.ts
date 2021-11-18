import { Component } from '@angular/core';
import OrgChart from "@balkangraph/orgchart.js";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'orgchart';
  constructor() { }

        ngOnInit() {

          OrgChart.templates.ana.field_0 = '<text class="field_0" data-width="230" style="font-size: 18px;" fill="#ffffff" x="125" y="95" text-anchor="middle">{val}</text>';

            const tree = document.getElementById('tree');

            if (tree) {
                var chart = new OrgChart(tree, {
                  nodeMouseClick: OrgChart.action.none,
                  menu: {
                    pdf: { text: "Export PDF" },
                    png: { text: "Export PNG" },
                    svg: { text: "Export SVG" },
                    csv: { text: "Export CSV" }
                  },
                  nodeBinding: {
                    field_0: "name"
                  }
                });

                chart.on('redraw', function () {
                  var filedElements = document.querySelectorAll('.field_0');
                  for (var i = 0; i < filedElements.length; i++) {
                    var nodeElement = (filedElements[i].parentNode as HTMLElement);
                    if (nodeElement.hasAttribute('data-n-id')) {
                      var id = nodeElement.getAttribute('data-n-id');
                      filedElements[i].addEventListener('click', function (e) {
                        chart.editUI.show(id);
                      });
                     }
                  }
                });

                chart.load([
                    { id: 1, name: "Denny Curtis", title: "CEO", img: "https://cdn.balkan.app/shared/2.jpg" },
                    { id: 2, pid: 1, name: "Ashley Barnett", title: "Sales Manager", img: "https://cdn.balkan.app/shared/3.jpg" },
                    { id: 3, pid: 1, name: "Caden Ellison", title: "Dev Manager", img: "https://cdn.balkan.app/shared/4.jpg" },
                    { id: 4, pid: 2, name: "Elliot Patel", title: "Sales", img: "https://cdn.balkan.app/shared/5.jpg" },
                    { id: 5, pid: 2, name: "Lynn Hussain", title: "Sales", img: "https://cdn.balkan.app/shared/6.jpg" },
                    { id: 6, pid: 3, name: "Tanner May", title: "Developer", img: "https://cdn.balkan.app/shared/7.jpg" },
                    { id: 7, pid: 3, name: "Fran Parsons", title: "Developer", img: "https://cdn.balkan.app/shared/8.jpg" }
                ]);
            }
        }
}
