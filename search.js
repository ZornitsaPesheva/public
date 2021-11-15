 OrgChart.searchUI = function () {
        };
        
        OrgChart.searchUI.prototype.init = function (obj) {
            this.obj = obj;
            this.addSearchControl()
        };
        
        OrgChart.searchUI.prototype.hide = function () {
            var search = this.obj.element.querySelector('[' + OrgChart.attr.id + '="search"]');
            if (!search) {
                return;
            }
            var searchCell1 = search.querySelector('[' + OrgChart.attr.id + '="cell-1"]');
            var input = this.obj.element.getElementsByTagName("input")[0];
            var container = this.obj.element.querySelector('[' + OrgChart.attr.id + '="container"]');
        
            input.value = "";
            container.innerHTML = "";
        
            if (searchCell1.style.display != "none" && search.style.display != "none") {
                OrgChart.anim(searchCell1, { opacity: searchCell1.style.opacity }, { opacity: 0 }, 200, OrgChart.anim.inOutSin, function () {
                    searchCell1.style.display = "none";
                    OrgChart.anim(search, { width: 300, opacity: 1 }, { width: 50, opacity: 0 }, 300, OrgChart.anim.inBack, function () {
                        search.style.display = "none";
                    });
                });
            }
        };
        
        OrgChart.searchUI.prototype.show = function (callback) {
            var search = this.obj.element.querySelector('[' + OrgChart.attr.id + '="search"]');
            var searchCell1 = search.querySelector('[' + OrgChart.attr.id + '="cell-1"]');
        
            searchCell1.style.display = "none";
            search.style.width = "50px";
            search.style.display = "block";
            search.style.opacity = 0;
        
            OrgChart.anim(search, { width: 50, opacity: 0 }, { width: 300, opacity: 1 }, 300, OrgChart.anim.outBack, function () {
                searchCell1.style.display = "inherit";
                searchCell1.style.opacity = 0;        
                OrgChart.anim(searchCell1, { opacity: 0 }, { opacity: 1 }, 200, OrgChart.anim.inOutSin);
                if (callback)
                    callback();
            });
        };
        
        OrgChart.searchUI.prototype.addSearchControl = function () {
            debugger;
            var that = this;
        
            var div = document.createElement("div");
            div.innerHTML = OrgChart.searchUI.createSearchIcon(this.obj.config.padding);
        
            div.innerHTML += OrgChart.searchUI.createInputField(this.obj.config.padding);
            this.obj.element.appendChild(div);
        
            var searchIcon = this.obj.element.querySelector('[' + OrgChart.attr.id + '="search-icon"]');
            var search = this.obj.element.querySelector('[' + OrgChart.attr.id + '="search"]');
            var input = this.obj.element.getElementsByTagName("input")[0];
        
            searchIcon.addEventListener("mouseover", function () {
                that.show();
            });
        
            search.addEventListener("mouseleave", function () {        
                if (document.activeElement == input) {
                    return;
                }
                that.hide();    
            });
        
            search.addEventListener("click", function () {
                input.focus();
            });
        
            //Start fix : FW: Issues with research and the links between nodes in the organigram
            input.addEventListener("keypress", function (e) {
                if (e.keyCode == 13) {//enter            
                    e.preventDefault();
                }
            });
            //End fix
        
            input.addEventListener("keyup", function (e) {       
                if (e.keyCode == 40) {//arrow down
                    searchTableRowDown();
                }
                else if (e.keyCode == 38) {//arrow up
                    searchTableRowUp();
                }
                else if (e.keyCode == 13) {//enter            
                    searchTableSelectEnter();
                }
                else if (e.keyCode == 27) {//escape
                    that.hide();
                }
                else {
                    that._serverSearch(this.value);
                }
            });
        
            var searchTableRowDown = function () {
                var itemElements = search.querySelectorAll("[" + OrgChart.attr.search_item_id + "]");
        
                var selectedItem = search.querySelector('[data-selected="yes"]')
                if (selectedItem == null && itemElements.length > 0) {
                    itemElements[0].setAttribute("data-selected", "yes");
                    itemElements[0].style.backgroundColor = "#F0F0F0";  
                }
                else if (itemElements.length > 0) {
                    if (selectedItem.nextSibling) {
                        selectedItem.setAttribute("data-selected", "no");
                        selectedItem.style.backgroundColor = "inherit";  
                        selectedItem.nextSibling.setAttribute("data-selected", "yes");
                        selectedItem.nextSibling.style.backgroundColor = "#F0F0F0";
                    }
                }
            };
        
            var searchTableRowUp = function () {
                var itemElements = search.querySelectorAll("[" + OrgChart.attr.search_item_id + "]");
        
                var selectedItem = search.querySelector('[data-selected="yes"]')
                if (selectedItem == null && itemElements.length > 0) {
                    itemElements[itemElements.length - 1].setAttribute("data-selected", "yes");
                    itemElements[itemElements.length - 1].style.backgroundColor = "#F0F0F0";
                }
                else if (itemElements.length > 0){
                    if (selectedItem.previousSibling) {
                        selectedItem.setAttribute("data-selected", "no");
                        selectedItem.style.backgroundColor = "inherit";
                        selectedItem.previousSibling.setAttribute("data-selected", "yes");
                        selectedItem.previousSibling.style.backgroundColor = "#F0F0F0";
                    }
                }
            };
        
            var searchTableSelectEnter = function () {
                var selectedItem = search.querySelector('[data-selected="yes"]');
                if (!selectedItem){
                    return;
                }
                var id = selectedItem.getAttribute(OrgChart.attr.search_item_id);
        
                var fireEvent = OrgChart.events.publish('searchclick', [that.obj, id]);
                if (fireEvent == undefined || fireEvent == true) {
                    that.obj.center(id);
                }
            };
        };
        
        OrgChart.searchUI.prototype.find = function (value) {
            var that = this;
            this.show(function () {
                var input = that.obj.element.getElementsByTagName("input")[0];
                input.value = value;
                that._serverSearch(value);
                input.focus();
            });
        };
        
        OrgChart.searchUI.prototype._serverSearch = function (value) {
            var that = this;
            var container = this.obj.element.querySelector('[' + OrgChart.attr.id + '="container"]');
            var search = this.obj.element.querySelector('[' + OrgChart.attr.id + '="search"]');
        
           
            var result = OrgChart._search.search(
                this.obj.config.nodes,
                value,
                this.obj.config.searchFields,
                this.obj.config.searchFields,
                this.obj.config.searchDisplayField,
                this.obj.config.searchFieldsWeight
            );
        
        
            var imgFiled = OrgChart._getFistImgField(this.obj.config);
        
            var html = "";
            for (var i = 0; i < result.length; i++) {
                if (i >= OrgChart.SEARCH_RESULT_LIMIT ){
                    break;
                }
        
                var item = result[i];
        
                var img = "";
                if (imgFiled){
                    var data = this.obj._get(item.id);
                    if (typeof(imgFiled) == 'function'){
                        img = imgFiled(this.obj, this.obj.getNode(item.id), data);
                    }
                    else if(data[imgFiled]){
                        img = data[imgFiled];
                    }
                    if (img){
                        img = '<img style="padding: 2px 0px  2px 7px;width:32px;height:32px;" src="' + img + '" / >';
                    }
                }
        
                var first = '';
                var second = '';
                if (this.obj.config.searchDisplayField == item.__searchField){
                    first = item.__searchMarks;
                }
                else if (this.obj.config.searchDisplayField){
                    first = item[this.obj.config.searchDisplayField];
                    if (OrgChart.isNullOrEmpty(first)){
                        first = '';
                    }
                    second = item.__searchMarks;
                }
                else{
                    first= item.__searchMarks;
                }
                html += OrgChart.searchUI.createItem(img, item.id, first, second);      
            }
        
            container.innerHTML = html;
        
            var itemElements = search.querySelectorAll("[" + OrgChart.attr.search_item_id + "]");
            for (var i = 0; i < itemElements.length; i++) {
                itemElements[i].addEventListener("click", function () {
        
                    var fireEvent = OrgChart.events.publish('searchclick', [that.obj, this.getAttribute(OrgChart.attr.search_item_id)]);
                    
                    if (fireEvent == undefined || fireEvent == true) {
                        that.obj.center(this.getAttribute(OrgChart.attr.search_item_id));
                    }
                });
                itemElements[i].addEventListener("mouseover", function () {
                    this.setAttribute("data-selected", "yes");
                    this.style.backgroundColor = "#F0F0F0";
                });
        
                itemElements[i].addEventListener("mouseleave", function () {
                    this.style.backgroundColor = "inherit";
                    this.setAttribute("data-selected", "no");
                });
            }
        };
        
        
        OrgChart.searchUI.createInputField = function (p) {
            return '<div ' + OrgChart.attr.id + '="search" style="display:none;border-radius: 20px 20px;padding:5px; box-shadow: #808080 0px 1px 2px 0px; font-family:Roboto-Regular, Helvetica;color:#7a7a7a;font-size:14px;border:1px solid #d7d7d7;width:300px;position:absolute;top:' + p + 'px;left:' + p + 'px;background-color:#ffffff;">'
                + '<div>'
                + '<div style="float:left;">'
                + OrgChart.icon.search(32, 32, '#757575')
                + '</div>'
                + '<div ' + OrgChart.attr.id + '="cell-1" style="float:right; width:83%">'
                + '<input title="' + OrgChart.SEARCH_PLACEHOLDER + '" placeholder="' + OrgChart.SEARCH_PLACEHOLDER + '" style="font-size:14px;font-family:Roboto-Regular, Helvetica;color:#7a7a7a;width:98%;border:none;outline:none; padding-top:10px;" type="text" />'
                + '</div>'
                + '<div style="clear:both;"></div>'
                + '</div>'
                + '<div ' + OrgChart.attr.id + '="container"></div>'
                + '</div>'
        };
        
        OrgChart.searchUI.createItem = function (img, id, first, second) {
            return '<div ' + OrgChart.attr.search_item_id + '="' + id + '" style="border-top:1px solid #d7d7d7; padding: 7px 0 7px 0;cursor:pointer;">'
                + '<div style="float:left;">'
                + img
                + '</div>'
                + '<div style="float:right; width:83%">'
                + '<div style="overflow:hidden; white-space: nowrap;text-overflow:ellipsis;text-align:left;">' + first + '</div>'
                + '<div style="overflow:hidden; white-space: nowrap;text-overflow:ellipsis;text-align:left;">' + second + '</div>'
                + '</div>'
                + '<div style="clear:both;"></div>'
                + '</div>';
        };
        
        OrgChart.searchUI.createSearchIcon = function (p) {
            return '<div ' + OrgChart.attr.id + '="search-icon" style="padding:5px; position:absolute;top:' + p + 'px;left:' + p + 'px;border:1px solid transparent;">'
                + '<div>'
                + '<div style="float:left;">'
                + OrgChart.icon.search(32, 32, '#757575')
                + '</div>'
                + '</div>'
                + '</div>'
        };