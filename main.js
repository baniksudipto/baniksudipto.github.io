document.onload = loadJSON('data.json', init);

let options = null;
let slides = null;
let data_tabs = null;
let current_open = undefined;
let slideshow_pop_up_time_lag = 10;//mili sec

function renderRecursive(v) {
    if (v) {
        if (v.constructor === String) {
            let sp = document.createElement("span");
            sp.classList.add('treeSpan');
            sp.innerHTML = v;
            return sp;
        } else if (v.constructor === Object) {
            let dv = document.createElement("div");
            dv.classList.add('treeDiv');

            if ("link" in v) {
                let link = document.createElement("a");
                link.classList.add("treeLink");
                link.innerHTML = v["linkText"];
                link.setAttribute("href", v["link"]);
                dv.appendChild(link);
            } else if ("timeText" in v) {
                let timeLine = document.createElement("span");
                timeLine.classList.add("treeSpan");
                timeLine.innerHTML = v["timeText"];
                timeLine.innerHTML +=  v["timeline"] ;
                dv.appendChild(timeLine);
            } else {
                Object.entries(v).forEach(([k, v]) => {
                    let r = renderRecursive(v);
                    let header = document.createElement("h4");
                    header.innerText = k;
                    dv.appendChild(header);
                    dv.appendChild(r);
                });
            }

            return dv;
        } else if (v.constructor === Array) {
            let dv = document.createElement("div");
            dv.classList.add('treeDiv');
            v.forEach(entry => {
                dv.appendChild(renderRecursive(entry));
            });
            return dv;
        }
    }
    return undefined;
}

function render_info(data) {
    let info_root = document.getElementById("info_root");
    Object.entries(data).forEach(([k, v]) => {
        let domTree = renderRecursive(v);
        let sectionTitle = document.createElement("span");
        sectionTitle.classList.add("sectionTitle");
        sectionTitle.setAttribute("id",k);
        sectionTitle.innerText = k;
        if (domTree !== undefined) {
            info_root.appendChild(sectionTitle);
            info_root.appendChild(domTree);
        }
    });
}

function init(data) {
    let keys = [];
    for (let k in data) {
        keys.push(k);
    }
    render_nav(keys,Object.keys(data), show, 0);
    render_info(data);
}

function loadJSON(filename, callback_function) {

    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filename, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState === 4 && xobj.status === 200) {
            callback_function(JSON.parse(xobj.responseText));
        }
    };
    xobj.send(null);
}

function render_nav(tabs,hrefs, callback_function, params) {
    let root = document.getElementById("opt_nav");
    for (let i = 0, n = tabs.length; i < n; i++) {
        let x = document.createElement('a');
        x.innerHTML = tabs[i];
        x.setAttribute('class', 'opt_nav_elem');
        x.setAttribute('onclick', 'show(' + i + ')');
        x.setAttribute('href', "#"+hrefs[i]);
        root.appendChild(x);
    }
    options = document.getElementsByClassName('opt_nav_elem');
    callback_function(params);
}


window.onscroll = function() {optNavStickyToggle()};
const navbar = document.getElementById("opt_nav");
const sticky = navbar.offsetTop;
function optNavStickyToggle() {
    if (window.pageYOffset >= sticky) {
        navbar.classList.add("sticky")
    } else {
        navbar.classList.remove("sticky");
    }
}

// function render_info(tabs,values,callback_function){
//     var root = document.getElementById("slideshow");
//     let n = tabs.length;
//     var i = 0;
//     // root.style.width = (window.innerWidth * n )+'px';
//     var handle = setInterval(function(){

//         var tab_window = document.createElement('div');
//         var tab_title = document.createElement('span');
//         var data_part = document.createElement('div');
//         data_part.classList.add('data_part');
//         tab_title.innerHTML = tabs[i];
//         tab_title.setAttribute('class','tab_title');
//         tab_window.classList.add('tab_window');
//         tab_window.appendChild(tab_title);
//         tab_window.appendChild(data_part);
//         root.appendChild(tab_window);

//         if(++i == n){
//             clearInterval(handle);
//             do_rest();
//         }


//     },slideshow_pop_up_time_lag);

//     function do_rest(){
//         slides = document.getElementsByClassName('tab_window');
//         data_tabs = document.getElementsByClassName('data_part');
//         current_open = 0;
//         slides[current_open].classList.add('shown_window');
//         options[current_open].classList.add('active_tab');
//         callback_function(values);
//     }
// }

// function show_my_data(values){
//     for(let i=0;i<values.length;i++)data_tabs[i].appendChild(render( values[i]));
// }

// function render(list){
//     var ul = document.createElement('ul');
//     for(var i=0;i< list.length;i++){
//         var li = document.createElement('li');
//         li.classList.add('data_show_li');
//         li.innerHTML = list[i].trim().toString();
//         ul.appendChild(li);
//     }
//     return ul;
// }

function show(e) {
    if (current_open && current_open === e) return; // clicked on same tab
    if (current_open !== undefined) {
        options[current_open].classList.remove('active_tab');
    }
    current_open = e;
    options[e].classList.add('active_tab');
}


// // function getCookie(cname) {
// //     var name = cname + "=";
// //     var decodedCookie = decodeURIComponent(document.cookie);
// //     var ca = decodedCookie.split(';');
// //     for(var i = 0; i <ca.length; i++) {
// //         var c = ca[i];
// //         while (c.charAt(0) == ' ') {
// //             c = c.substring(1);
// //         }
// //         if (c.indexOf(name) == 0) {
// //             return c.substring(name.length, c.length);
// //         }
// //     }
// //     return "";
// // }

// // function setCookie(){
// //     if(getCookie('wasVisited')==""){
// //         var random_key = gen_rand();
// //         var date = new Date();
// //         date.setDate(date.getDate()+30);    
// //         document.cookie = "wasVisited=" + random_key.toString()+";expires=" + date.toUTCString()+";path=/";
// //     }else{
// //         console.log('cookie set');
// //     }
// // }



