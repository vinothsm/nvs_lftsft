const dropArea = document.querySelector(".drag-area"),
dragText = dropArea.querySelector("header")
let file,
available_entity_list=[],
selected_entity_list=[];


$('body')
.on('click', '[name="tab-select"]', function(e) {
    e.stopPropagation();
    if(!$(this).hasClass('active')){
    $(this).toggleClass('active')
          .siblings().not(this).removeClass('active');}
  })
.on("click","#upload_file", function(e) {
    $('#file').trigger('click')
  })
.on("input","#file", function(e) {
    var fileList = this.files;
    console.log(fileList)
    file=fileList[0]
    dropArea.classList.add("active");
  showFile()
  })
.on('click','#extract_btn', function(e) {
    var files_length= document.getElementById('file').files.length
    if(files_length==0){
        alert('no file is uploaded')
    }
    else{    
    update_available_entites()
    }
    })
.on("click","#submit_btn", function(e) {
    alert('submit button is clicked')
      })
.on("click","#btn_all", function(e) {
    available_entity_list=['First Name','Last Name','Patient ID','Race','Drug Form',
'Mobile Number','Drug Units','Drug Name','Age','Gender','Site ID','Weight','Drug Strength',
'Country','Etnicity','Address','BMI']
update_available_entites()
    })
.on("click","#btn_pll", function(e) {
    available_entity_list=['First Name','Last Name','Patient ID','Race','Mobile Number',
    'Age','Gender','Country','Address']
    update_available_entites()
    })
.on("click","#btn_drug", function(e) {
    available_entity_list=['Drug Form','Drug Units','Drug Name','Drug Strength']
    update_available_entites()
    })
.on("click","#btn_demographics", function(e) {
    available_entity_list=['Site ID','Weight','Etnicity','BMI']
    update_available_entites()
    })
.on("click",".card.entity-card", function(e) {
    let selected_ent_val=this.attributes['data-ent_val']['value'] 
    if(!selected_entity_list.includes(selected_ent_val)){
        selected_entity_list.push(selected_ent_val) 
        update_selected_entites()
        $(this).addClass('selected')
    }
    })           
.on("click",".btn.del_btn", function(e) {
    let selected_ent_val=this.attributes['data-ent_val']['value'] 
    let e_val=selected_ent_val.replace(/[^a-zA-Z0-9]/g,'')
    if(selected_entity_list.includes(selected_ent_val)){
        const index = selected_entity_list.indexOf(selected_ent_val);
        if (index > -1) {
            selected_entity_list.splice(index, 1); // 2nd parameter means remove one item only
        }
        $(`.card.entity-card.selected[data-regex_ent_val='${e_val}']`).removeClass('selected')

        update_selected_entites()
    }
    })           
    
dropArea.addEventListener("dragover", (event)=>{
event.preventDefault(); 
dropArea.classList.add("active");
let header_tag = `<header>Release to Upload File</header>`; 
dropArea.innerHTML = header_tag; 
// dragText.textContent = "Release to Upload File";
});
     
dropArea.addEventListener("dragleave", ()=>{
dropArea.classList.remove("active");
    var files_length= document.getElementById('file').files.length,
    display_text='<a id="upload_file" > Drag a Document/Click here to upload</a>'
    if(files_length!=0){
       display_text=file['name']
    }
let header_tag = `<header>${display_text}</header>`; 
dropArea.innerHTML = header_tag; 
});
    
dropArea.addEventListener("drop", (event)=>{
event.preventDefault(); 
    file = event.dataTransfer.files[0];
    document.getElementById('file').files=event.dataTransfer.files
showFile();
});
    
function showFile(){
    dropArea.classList.remove("active");
    let header_tag = `<header>${file['name']}</header>`; 
    dropArea.innerHTML = header_tag; 
          console.log(dragText.textContent,file['name'])
      }
    
function update_available_entites(){

    dropArea.classList.remove("active");
    let header_tag = `<header><a id="upload_file" > Drag a Document/Click here to upload</a></header>`; 
    dropArea.innerHTML = header_tag; 
    let html_content=''
    _.forEach(available_entity_list, function(ent_val) {
        let e_val=ent_val.replace(/[^a-zA-Z0-9]/g,'')
        html_content=html_content
        +`<div class="column entity-column">`
        if(selected_entity_list.includes(ent_val))
        {
            html_content=html_content
        +`<div class="card entity-card selected"`
        }
        else{
            html_content=html_content
        +`<div class="card entity-card"`
        }
        html_content=html_content
        +`
         data-ent_val='${ent_val}' data-regex_ent_val='${e_val}'>
          <p class='entity-text'>${ent_val}</p>
        </div>
      </div>`
      });
    
    update_html(html_content,'.row.entity-row')
    }

function update_selected_entites(){
    let html_content=''
    _.forEach(selected_entity_list, function(sel_ent_val) {
        let sel_e_val=sel_ent_val.replace(/[^a-zA-Z0-9]/g,'')
        html_content=html_content
        +`<div class="column entity-column-selected">
            <div class="card entity-card-selected" data-ent_val='${sel_ent_val}' data-regex_ent_val='${sel_e_val}'>
                <p class='entity-text'>${sel_ent_val}</p>
            </div>
            <button class="btn del_btn"  data-ent_val='${sel_ent_val}' data-regex_ent_val='${sel_e_val}'><img src="../static/img/delete_img.PNG" class="del_img"/></button>
        </div>
        `
        });
    
    update_html(html_content,'.entity-row-selected')
    }

function update_html(html_content,container){
    $(container).html(html_content)
}
$('#btn_all').addClass('active')
$('#btn_all').click()