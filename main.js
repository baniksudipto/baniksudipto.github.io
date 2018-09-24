//Global Data

class Prop{
    
    constructor(list){
        this.list = list;
    }
}

var tabs = ['About Me','Contact Me','Education','Interests','Hobbies'];

var data = new Map();
data['aboutme']  = ['Terms That Go with me',"Competitive Programming","Web Developement","PC Gaming","Geek"];
data['education'] = ["UnderGraduate : Jadavpur University ( B.E. in Electrical Engineering') 2015 - 2019 ","High School : Madhyamgram High School (State Board) 2008 - 2015"] ;
data['contact']   = ['Email Id : sudipta.banik.112@gmail.com', 
                    'Contact Number: +91 9051073567' ,'codechef: sdpt' , 'codeforces: sdpt131',
                    'hackerrank: sdpt_banik','Facebook Profile: sudiptosdpt'];
data['interests'] = ['Algorithms & Data Structures','Web Development','Operating Systems','Electronics','Competitive Programming','Knowing How Stuff Works'];
data['hobbies'] = ['Unique Notes & Coin Collection','Cycling','Listening to music'];



var options = null;
var slides = null;
var data_tabs = null;
var current_open = 0;
var slideshow_pop_up_time_lag = 10;//mili sec


function create_opt_list(){
    var root = document.getElementById("opt_nav_list");
    let n = tabs.length;
    for(let i=0;i<n;i++){
        let x = document.createElement('li');
        x.innerHTML = tabs[i];
        x.setAttribute('class','opt_nav_elem');
        x.setAttribute('onclick','show('+i+')');
        root.appendChild(x);
    }
    options = document.getElementsByClassName('opt_nav_elem');
}

function create_slideshow(callback_function){
    var root = document.getElementById("slideshow");
    let n = tabs.length;
    var i = 0;
    // root.style.width = (window.innerWidth * n )+'px';
    var handle = setInterval(function(){
        
        var tab_window = document.createElement('div');
        var tab_title = document.createElement('span');
        var data_part = document.createElement('div');
        data_part.classList.add('data_part');
        tab_title.innerHTML = tabs[i];
        tab_title.setAttribute('class','tab_title');
        tab_window.classList.add('tab_window');
        tab_window.appendChild(tab_title);
        tab_window.appendChild(data_part);
        root.appendChild(tab_window);
        
        if(++i == n){
            clearInterval(handle);
            do_rest();
        }


    },slideshow_pop_up_time_lag);
    function do_rest(){
        slides = document.getElementsByClassName('tab_window');
        data_tabs = document.getElementsByClassName('data_part');
        current_open = 0;
        slides[current_open].classList.add('shown_window');
        options[current_open].classList.add('active_tab');
        callback_function();
    }
}

function show_my_data(){
    data_tabs[0].appendChild(render( data['aboutme']));
    data_tabs[1].appendChild(render( data['contact']));
    data_tabs[2].appendChild(render( data['education']));
    data_tabs[3].appendChild(render( data['interests']));
    data_tabs[4].appendChild(render( data['hobbies']));
}

function render(list){
    var ul = document.createElement('ul');
    for(var i=0;i< list.length;i++){
        var li = document.createElement('li');
        li.classList.add('data_show_li');
        li.innerHTML = list[i].trim().toString();
        ul.appendChild(li);
    }
    return ul;
}

function show(e){
    if(options != null && slides !=null && current_open !=e){
        slides[current_open].classList.remove('shown_window');
        options[current_open].classList.remove('active_tab');
        slides[e].classList.add('shown_window');
        options[e].classList.add('active_tab');
        current_open = e;
    }
}

function gen_rand(){
    var n = 10;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < n; i++)text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(){
    if(getCookie('wasVisited')==""){
        var random_key = gen_rand();
        var date = new Date();
        date.setDate(date.getDate()+30);    
        document.cookie = "wasVisited=" + random_key.toString()+";expires=" + date.toUTCString()+";path=/";
    }else{
        console.log('cookie set');
    }
}

function init(){
    create_opt_list();
    create_slideshow(show_my_data);
    
    setCookie();
    
    
}

document.onload = init();



