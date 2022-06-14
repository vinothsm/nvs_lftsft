var dropArea = "";
var dragText = "";
var file;
var available_entity_list = [],
  selected_entity_list = [];

var entities_obj = {
  all: ["STRENGTH", "DRUG", "FORM", "BRAND", 'SUBJID', 'AGE', 'BMI', 'CIRCUMSTANCES', 'DATE', 'RACE', 'COUNTRY', 'DRINKING HABITS', 'EMAIL', 'ETHNICITY', 'GENDER', 'HEIGHT', 'MEDICAL HISTORY', 'NON PARTICIPANT', 'PHONE', 'SITEID', 'SMOKING HABITS', 'STUDY DAY', 'WEIGHT', "NAME", "ADDRESS"],
  pre: ['SUBJID', 'AGE', 'BMI', 'CIRCUMSTANCES', 'DATE', 'RACE', 'COUNTRY', 'DRINKING HABITS', 'EMAIL', 'ETHNICITY', 'GENDER', 'HEIGHT', 'MEDICAL HISTORY', 'NON PARTICIPANT', 'PHONE', 'SITEID', 'SMOKING HABITS', 'STUDY DAY', 'WEIGHT', "NAME", "ADDRESS"],
  dre: ["STRENGTH", "DRUG", "FORM", "BRAND"]
};

$("body")
  .on("click", '[name="tab-select"]', function (e) {
    e.stopPropagation();
    if (!$(this).hasClass("active")) {
      $(this).toggleClass("active").siblings().not(this).removeClass("active");
    }
  })
  .on("click", ".upload_file", function (e) {
    $("#file").trigger("click");
  })
  .on("input", "#file", function (e) {
    var fileList = this.files;
    console.log(fileList);
    file = fileList[0];
    dropArea.classList.add("active");
    showFile();
  })

  // .on("submit", "form", function (e) {
  //   e.preventDefault()
  //   if (file.length == 0) {
  //     alert("no file is uploaded");
  //   } else {
  //     // display_preview_view();
  //     debugger;
  //     $(this).submit()
  //   }
  // })
  .on("click", "#btn_all", function (e) {
    available_entity_list = entities_obj["all"];
    update_available_entites();
  })
  .on("click", "#btn_dre", function (e) {
    available_entity_list = entities_obj["dre"];
    update_available_entites();
  })
  .on("click", "#btn_pre", function (e) {
    available_entity_list = entities_obj["pre"];
    update_available_entites();
  })
  .on("click", ".card.entity-card", function (e) {
    let selected_ent_val = this.attributes["data-ent_val"]["value"];
    if (!selected_entity_list.includes(selected_ent_val)) {
      if(selected_entity_list.length<5){
        selected_entity_list.push(selected_ent_val);
        update_selected_entites();
        $(this).addClass("selected");
    }
      else{
          $('#alert_limit').modal('show')
      }
    }
  })
  .on("click", ".btn.del_btn", function (e) {
    let selected_ent_val = this.attributes["data-ent_val"]["value"];
    let e_val = selected_ent_val.replace(/[^a-zA-Z0-9]/g, "");
    if (selected_entity_list.includes(selected_ent_val)) {
      const index = selected_entity_list.indexOf(selected_ent_val);
      if (index > -1) {
        selected_entity_list.splice(index, 1); // 2nd parameter means remove one item only
      }
      $(
        `.card.entity-card.selected[data-regex_ent_val='${e_val}']`
      ).removeClass("selected");

      update_selected_entites();
    }
  });

// show categorized entities on the left side
function update_available_entites() {
  //   dropArea.classList.remove("active");
  //   let header_tag = `<header><a id="upload_file" > Drag a Document/Click here to upload</a></header>`;
  //   dropArea.innerHTML = header_tag;
  let html_content = "";
  _.forEach(available_entity_list, function (ent_val) {
    let e_val = ent_val.replace(/[^a-zA-Z0-9]/g, "");
    html_content = html_content + `<div class="column entity-column">`;
    if (selected_entity_list.includes(ent_val)) {
      html_content = html_content + `<div class="card entity-card selected"`;
    } else {
      html_content = html_content + `<div class="card entity-card"`;
    }
    html_content =
      html_content +
      `
         data-ent_val='${ent_val}' data-regex_ent_val='${e_val}'>
          <p class='entity-text'>${toTitleCase(ent_val)}</p>
        </div>
      </div>`;
  });

  update_html(html_content, ".row.entity-row");
}

function update_html(html_content,container,_url=''){
  $(container).html(html_content)
  // if(_url.includes('extraction')){
  //     initalize_extract_view()
  // }
  // else if(_url.includes('review')){
  //     preview()
  // }
}

// show selected entites in the right side
function update_selected_entites() {
  let html_content = "";
  _.forEach(selected_entity_list, function (sel_ent_val, idx) {
    let sel_e_val = sel_ent_val.replace(/[^a-zA-Z0-9]/g, "");
    html_content =
      html_content +
      `<div class="column entity-column-selected">
            <div class="card entity-card-selected" data-ent_val='${sel_ent_val}' data-regex_ent_val='${sel_e_val}'>
                <input class="checkboxes" type="checkbox" value='${sel_ent_val}' name="entities" id="${idx}" checked>
                <label for="${idx}">${toTitleCase(sel_ent_val)}</label>
            </div>
            <button class="btn del_btn" type="button"  data-ent_val='${sel_ent_val}' data-regex_ent_val='${sel_e_val}'><img src="../static/img/delete_img.PNG" class="del_img"/></button>
        </div>
        `;
  });

  update_html(html_content, ".entity-row-selected");
}

// handle drag and upload file functionality
function initalize_extract_view() {
  //selecting all required elements
  const dropArea = document.querySelector(".drag-area"),
    dragText = dropArea.querySelector("header"),
    buttons = dropArea.querySelectorAll("button"),
    input = dropArea.querySelector("input");
  let file; //this is a global variable and we'll use it inside multiple functions
  buttons.forEach((button) => {
    button.onclick = () => {
      input.click(); //if user click on the button then the input also clicked
    };
  })
  input.addEventListener("change", function () {
    //getting user select file and [0] this means if user select multiple files then we'll select only the first one
    file = this.files[0];
    dropArea.classList.add("active");
    showFile(); //calling function
  });
  //If user Drag File Over DropArea
  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault(); //preventing from default behaviour
    dropArea.classList.add("active");
    dragText.textContent = "Release to Upload File";
  });
  //If user leave dragged File from DropArea
  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("active");
    dragText.textContent = "Drag & Drop to Upload File";
  });
  //If user drop File on DropArea
  dropArea.addEventListener("drop", (event) => {
    event.preventDefault(); //preventing from default behaviour
    //getting user select file and [0] this means if user select multiple files then we'll select only the first one
    file = event.dataTransfer.files[0];
    showFile(); //calling function
  });

  function showFile() {
    let fileType = file.type; //getting selected file type
    let validExtensions = ["application/pdf"]; //adding some valid image extensions in array
    if (validExtensions.includes(fileType)) {
      dragText.textContent = file["name"]
    } else {
      alert("This is not a PDF File!");
      dragText.textContent = "Drag & Drop to Upload File";
    }
  }
}


function toTitleCase(str) {
  return str.toLowerCase().split(' ').map(function (word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
}

$(() => {

  initalize_extract_view()
  $("#btn_all").trigger("click")
  $("#btn_all").addClass("active")
})
