//icon behavior------------------------------------------------------------------------|
var shouldSelect = true;

var dragging = false;

function dragIcon(elmnt, _this) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	
	elmnt.onmousedown = dragMouseDown;	

	function dragMouseDown(e) {
		e = e || window.event;
        e.preventDefault();

        if(e.button == 0) 
		
		//get initial cursor position:
		pos3 = e.clientX;
		pos4 = e.clientY;
		
		//when mousedown on selected icon
		if (_this.stat == 1) {
			//managing selected icons
			for (var i = 0; i < classActive.length; i++) {
				//light up all hover border onmousedown:-|
				highlight(classActive[i]);
				//---------------------------------------|
			}
		} else {
            if (shouldSelect == true) {
                //light up 1 hover border onmousedown:
                highlight(elmnt);
                elmnt.style.backgroundColor = 'rgb(0,0,0,0)';
                
                //when mousedown on unselected icon
                if(keyPressCtrl == false && dragging == false) {
                    for (icon of iconArray){
                        icon.stat = 0;
                        icon.statNode();
                    }
                    _this.stat = 1;
                    highlight(elmnt);
                } else if(keyPressCtrl == true) {
                    _this.stat = 1;
                    highlight(elmnt);
                }
            }
		}
		
        document.onmouseup = closeDragIcon;
		if(e.button == 0) document.onmousemove = iconDrag;
		iframeAntiHover (true);
	}								 

	function iconDrag(e) {
		e = e || window.event;
        e.preventDefault();
		
		//calculate new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		
        dragging = true;
        _this.stat = 1;
        _this.statNode();
        
		
		//managing selected icons
		for (icon of iconArray){
            if (icon.stat == 1 || icon.stat == 2) {
                //set position for selected icons:------------|
                icon.coor.tx = (icon.coor.tx - pos1);
                icon.coor.ty = (icon.coor.ty - pos2);
                iconGridArray[icon.coor.ax][icon.coor.ay].used = false;
                iconGridArray[icon.coor.ax][icon.coor.ay].icon = null;
                //--------------------------------------------|
                
                icon.stat = 2;
                icon.poseNode();
                icon.statNode();
            }
		}
	}

	function closeDragIcon(e) {	
		//stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
        iframeAntiHover (false);
		
		//managing selected icons
		for (icon of iconArray){
            if (iconGrid == true && icon.stat == 2) {
			    //set position grid for selected icons:----------------------------------|
                icon.coor = validateIconPosition(icon,true,true)
                //-----------------------------------------------------------------------|

                icon.stat = 1;
                icon.poseNode();
                icon.statNode();
            }
		}
		
		//unselect other folders on mouseup W/O drag UNLESS ctrl
		if(keyPressCtrl == false && dragging == false && e.button == 0) {
			for (icon of iconArray){
                icon.stat = 0;
                icon.statNode();
            }
            _this.stat = 1;
            _this.statNode();
        } else {
            for (icon of iconArray){
                lowlight(document.getElementById(icon.text));
            }

            _this.stat = 1;
            _this.statNode();
        }
        
		dragging = false;
	}
}

function menuIcon(elmnt, _this) {

    elmnt.oncontextmenu = iconMenu;

    function iconMenu(e) {
        e.preventDefault();

        if(
            e.target.classList.contains("icon") ||
            e.target.parentNode.classList.contains("icon")
        ) {
            closeMenu();

            idCtextMenu.style.display = "grid";
            idCtextMenu.style.top = e.clientY + "px";
            idCtextMenu.style.left = e.clientX + "px";

            idDesktMenu.blur();
            idCtextMenu.blur();
            clearSelection();
            
            iconMenuOpen(elmnt, _this);

            return false;
        }
    }
}

function statIconNode(elmnt, _this) {
    //0 => unselected | 1 => selected | 2 => moving
    switch(_this.stat){
        case 0:
            elmnt.classList.remove("active");
            elmnt.style.border = '';
            elmnt.style.zIndex = '';
            elmnt.style.pointerEvents = ''
            break;
        case 1:
            if(!elmnt.classList.contains("active")){elmnt.className += " active"};
            elmnt.style.opacity = '1';
			elmnt.style.zIndex = '';
			elmnt.style.border = '';
			elmnt.style.backgroundColor = '';
            elmnt.style.pointerEvents = ''
            break;
        case 2: 
            elmnt.style.opacity = '0.5';
            elmnt.style.zIndex = '1000';
            elmnt.style.border = '3px solid rgb(0,0,0,0.0)';
            elmnt.style.backgroundColor = 'rgb(0,0,0,0)';
            elmnt.style.pointerEvents = 'none';
            break;
        default: 
    }
}

function poseIconNode(elmnt, _this) {
    elmnt.style.left = _this.coor.tx + "px";
    elmnt.style.top = _this.coor.ty + "px";
}

function crteIconNode(_this) {
    //Icon HTML structure-----|
    let newIcon = document.createElement("div");
    newIcon.setAttribute("class", "icon");
    newIcon.setAttribute("id", _this.text);
    newIcon.setAttribute("style", "left:"+_this.coor.px+"px;top:"+_this.coor.py+"px;");

    let newIconImage = document.createElement("div");
    newIconImage.setAttribute("class", "iconImage");
    newIconImage.setAttribute("style", _this.imag);
    newIcon.appendChild(newIconImage);

    let newIconText = document.createElement("h3");
    let newIconTextNode = document.createTextNode(_this.text);
    newIconText.appendChild(newIconTextNode);
    newIcon.appendChild(newIconText);

    document.getElementById("iconLayer").appendChild(newIcon);
    //------------------------|

    _this.statNode();
    _this.poseNode();
    _this.drag();
    _this.menu();
}

function dlteIconNode(_this, fromGrid = false) {
    let delIcon = document.getElementById(_this.text);
    delIcon.parentNode.removeChild(delIcon);
    
    if (fromGrid == false) {
        iconGridArray[_this.coor.ax][_this.coor.ay].used = false;
        iconGridArray[_this.coor.ax][_this.coor.ay].icon = null;
    }
    iconArray.splice(iconArray.indexOf(_this), 1);
}

function deleteSelectedNodes(){
    let iconsToDelete = iconArray.filter((icon) => {return icon.stat == 1})
    for(icon of iconsToDelete){
        if(icon.stat == 1){
            icon.deleteNode();
        }
    }
}

//------------------------------------------------------------------------icon behavior|

/*
<div class="icon" id="Folder 1" style="left: 10px;top: 10px;">
	<div class="iconImage" style="background-image: url('assets/svg/desktopIcons/folderPlaceholder.svg');"></div>
	<h3>Folder 1</h3>
</div>
*/