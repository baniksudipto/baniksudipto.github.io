const W_KEY = 87;
const S_KEY = 83;
const A_KEY = 65;
const D_KEY = 68;
const UP_KEY = 38;
const DOWN_KEY = 40;
const SPACE_KEY = 32;
const v_lim = 100;
var time_handle = null;
const time_gap = 50; // ms
const rrate = document.getElementById("rrate");
const angle = document.getElementById("angle");
var velocity=[0 , 0];// px/step
const step = 2;
const bx = document.getElementById("box");
const v_x_slider = document.getElementById("v_x"); 
const v_y_slider = document.getElementById("v_y"); 
const space_screen_btn = document.getElementById("space_screen_btn");
const box_len = bx.offsetHeight;
const v_meter = document.getElementById("v_meter");


function _width(){return window.innerWidth; }
function _height(){return window.innerHeight;}
var currentHeight= _height();
var currentWidth= _width();

function retraction_ratio(){return parseInt(rrate.value)/100;}

function updateLeft(left){	bx.style.left = left + 'px';}

function updateTop(top){	bx.style.top = top + 'px';	}

angle.onchange = function(){
	let curr_angle = parseInt(angle.value);
	bx.style.transform = "rotateZ("+curr_angle+"deg)";
}

v_x.onchange = function(){
	
	velocity[0] = parseInt(v_x.value);
	update_velocity();
}	
v_y.onchange = function(){
	
	velocity[1] = parseInt(v_y.value0;
	update_velocity();
}

space_screen_btn.onclick = function(e){
	e.preventDefault();
	e.stopPropagation();
	
	if(time_handle == null){
		start();
	}else{
		pause();
	}
}
bx.onclick = function(e){
	e.preventDefault();
	e.stopPropagation();
	
	if(time_handle == null){
		start();
	}else{
		pause();
	}
}

function pause(){
    if(time_handle != null){
        clearInterval(time_handle);
        time_handle = null;
		bx.innerHTML = "||";
    }
}

function start(){
	pause();
	bx.innerHTML = "|>";
    time_handle = setInterval(move,time_gap);
}

function move(){
    var boxLeft = bx.offsetLeft;
    var boxTop = bx.offsetTop;
    
    if((velocity[0] < 0 && boxLeft + velocity[0] >= 0) || (velocity[0] > 0 && ((boxLeft + velocity[0]) <= (currentWidth - box_len)))){ // safe horizontally
        updateLeft(velocity[0] + boxLeft);	
    }else{

        if(velocity[0]<0){
            updateLeft(0);
            // updateLeft(Math.abs(boxLeft + velocity[0]));
        }else if(velocity[0]>0){
            updateLeft(currentWidth - box_len);
        }

        velocity[0] = - Math.round(retraction_ratio() *  velocity[0]);
        update_velocity();
    }

    if((velocity[1] < 0 && boxTop + velocity[1] >= 0) || (velocity[1] > 0 && ((boxTop + velocity[1] ) <=  (currentHeight-box_len)))){
        updateTop(velocity[1] + boxTop);
    }else{

        
        if(velocity[1]<0){
            updateTop(0);
            //updateLeft(Math.abs(boxLeft + velocity[0]));
        }else if(velocity[1]>0){
            updateTop(currentHeight - box_len);
        }

        velocity[1] = - Math.round(retraction_ratio() *  velocity[1]);
        update_velocity();
    }
    
}

window.onresize = function(){
    currentHeight=_height();
    currentWidth= _width();
}




function update_velocity(){
    v_meter.innerHTML = 'x : '+(velocity[0]).toString() + ' y : '+(-1*velocity[1]).toString();
}

document.onkeydown = function(e){
        
    var pressed = parseInt(e.keyCode);
    
    // console.log(pressed);
    
    
    if(pressed === D_KEY){ // d going right
        if( velocity[0] + step < v_lim){
            velocity[0] += step;
            update_velocity();
        } 
    }
    if(pressed === A_KEY){ // a going left
        if( velocity[0] -step > -v_lim){
            velocity[0] -= step;
            update_velocity();
        }
    }
    if(pressed === S_KEY){ // s going down
        if( velocity[1] + step < v_lim){
            velocity[1] += step;
            update_velocity();
        }
    }
    if(pressed === W_KEY){ // w going up
        if( velocity[1] - step > -v_lim){
            velocity[1] -= step;
            update_velocity();
        }
    }

    
    if(pressed === SPACE_KEY){ // space
        if(time_handle !=null){
            pause();
        }else{
            start();
        }
    }
    if(pressed === DOWN_KEY){
        velocity[0] = 0 , velocity[1]=0;
        update_velocity();
    }
    
    // if(pressed === 109){ // minus
    // 	if(box_len > 5){
    // 		box_len -= step;
    // 		bx.style.height = box_len + 'px';
    // 		bx.style.width = box_len + 'px';
    // 		updateLeft(Math.min(bx.offsetLeft,currentWidth-box_len));
    // 		updateTop(Math.min(bx.offsetTop,currentHeight-box_len));
    // 	}
    // }
    // if(pressed === 107){ // plus
    // 	if(box_len < Math.min(currentHeight,currentWidth)){
    // 		box_len += step;
    // 		bx.style.height = box_len + 'px';
    // 		bx.style.width = box_len + 'px';
    // 		updateLeft(Math.min(bx.offsetLeft,currentWidth-box_len));
    // 		updateTop(Math.min(bx.offsetTop,currentHeight-box_len));
    // 	}
    // }
    
    }