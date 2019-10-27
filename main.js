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
                link.setAttribute("target","_blank");
                let icon = document.createElement("i");
                icon.classList.add("fas","fa-external-link-alt");
                dv.appendChild(link);
                dv.appendChild(icon);
            } else if ("timeText" in v) {
                let timeLine = document.createElement("span");
                timeLine.classList.add("treeSpan");
                timeLine.innerHTML = v["timeText"] + v["timeline"] ;
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
        let sectionData = document.createElement("div");
        sectionData.classList.add("sectionData");
        if (domTree !== undefined) {
            info_root.appendChild(sectionTitle);
            sectionData.appendChild(domTree);
            info_root.appendChild(sectionData);
        }
    });
}

function init(data) {
    render_nav(Object.keys(data), show, 0);
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

function render_nav(tabs, callback_function, params) {
    let root = document.getElementById("opt_nav");
    for (let i = 0, n = tabs.length; i < n; i++) {
        let x = document.createElement('a');
        x.innerHTML = tabs[i];
        x.setAttribute('class', 'opt_nav_elem');
        x.setAttribute('onclick', 'show(' + i + ')');
        x.setAttribute('href', "#"+tabs[i]);
        root.appendChild(x);
    }
    options = document.getElementsByClassName('opt_nav_elem');
    callback_function(params);
}


function show(e) {
    if (current_open && current_open === e) return; // clicked on same tab
    if (current_open !== undefined) {
        options[current_open].classList.remove('active_tab');
    }
    current_open = e;
    options[e].classList.add('active_tab');
}



