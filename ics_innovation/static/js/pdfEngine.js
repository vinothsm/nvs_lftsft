const { UI } = PDFAnnotate;
let PAGE_HEIGHT;
let ORG_PAGE_HEIGHT;
var rendered_pages = [];
var rendered_pages2 = [];
var out_json = {};
var page_container = "#anonpageContainer";
var app_page_conatiner = "#approvalpageContainer";
var pdf_num_pages;
let RENDER_OPTIONS = {
  document_id: null,
  pdfDocument: null,
  scale: 1.0,
  rotate: 0
};
let brushed_coords, approval_json

PDFAnnotate.setStoreAdapter(new PDFAnnotate.LocalStoreAdapter());
// pdfjsLib.GlobalWorkerOptions.workerSrc = '../static/node_modules/pdfjs-dist/build/pdf.worker.js';

function distance(x1, x2) {
  return Math.pow((Math.pow(x1.x - x2.x, 2) + Math.pow(x2.y - x2.y, 2)), 0.5)
}

function resizeFunc() {
  let resize = d3.drag()
  .on('drag', function() {
    $('.tooltip').hide()
    let l = d3.select(this),
        _id = l.attr('data-entity-id'),
        c = d3.select(`rect[data-entity_id="${_id}"]`),
        highlight_fill = c.attr('fill'),
        e = d3.event,
        x = Number(l.attr('x')),
        y = Number(l.attr('y')),
        w = Number(l.attr('width')),
        h = Number(l.attr('height')),
        c1 = {x: x, y: y},
        c2 = {x: (x + w), y: y},
        c3 = {x: (x + w), y: (y + h)},
        c4 = {x: x, y: (y + h)},

        m1 = distance(e, c1),
        m2 = distance(e, c2),
        m3 = distance(e, c3),
        m4 = distance(e, c4);

    l.style('fill', highlight_fill)
      .style('opacity', 0.5)
    c.style('opacity', 0.0)

    switch(Math.min(m1, m2, m3, m4)) {
      case m2:
        l.attr('width', function() { return (w + (e.x - c3.x));})
          .attr('height', function() { return (h + (e.y - c3.y));})
      break;
      
      case m3:
      l.attr('width', function() { return (w + (e.x - c3.x));})
        .attr('height', function() { return (h + (e.y - c3.y));});
      break;

      case m1:
      l.attr('x', function(){ return e.x; })
       .attr('y', function(){ return e.y; })
       .attr('width', function() { return w + (c1.x - e.x); })
       .attr('height', function() { return h + (c1.y - e.y); })
      break;
    
      // case m4:
      //   c.attr('x', function(){ return e.x + 2; })
      //   .attr('y', function(){ return e.y; })
      //   .attr('width', function() { return w - 4 + (c1.x - e.x); })
      //   .attr('height', function() { return h + (c1.y - e.y); })

      //   l.attr('x', function(){ return e.x; })
      //   .attr('y', function(){ return e.y; })
      //   .attr('width', function() { return w + (c1.x - e.x); })
      //   .attr('height', function() { return h + (c1.y - e.y); })
      //   break;
    }
  })
  .on('end', function(){

    let elem = d3.select(this), entity_id = elem.attr('data-entity-id'),
      high_elem = d3.select(`rect[data-entity_id="${entity_id}"]`),
      n_width = Number(elem.attr('width')) - 4, n_x = Number(elem.attr('x')) + 2,
      n_y = Number(elem.attr('y')), n_ht = Number(elem.attr('height'));

      high_elem.attr('x', n_x)
      high_elem.attr('y', n_y)
      high_elem.attr('width', n_width)
      high_elem.attr('height', n_ht)
      elem.attr('fill', '#999999')
      elem.style('opacity', 0.0)
      high_elem.style('opacity', 0.5)

    let pg_no = elem.attr('data-page'), scale_ratio = RENDER_OPTIONS.scale,
      para_id = elem.attr('data-para-id'), type = elem.attr('data-type');
    let word_idx = -1, found_start = false, count = 0;  
    let x0 = parseFloat(elem.attr('x')) /scale_ratio, y0 = parseFloat(elem.attr('y')) / scale_ratio, 
    width = parseFloat(elem.attr('width')) / scale_ratio,
    height = parseFloat(elem.attr('height')) / scale_ratio,
    coords = [],
    coordinates = $(`#anonymizedViewer .annotationLayer g>rect[data-entity-id=${entity_id}]`);
    for(let i = 0; i < coordinates.length; i++) {
      let _x0 = parseFloat($(coordinates[i]).attr('x')) / scale_ratio,
      _y0 = parseFloat($(coordinates[i]).attr('y')) / scale_ratio;
      let temp = {
        "x0": _x0,
        "y0": _y0,
        "x1": _x0 + (parseFloat($(coordinates[i]).attr('width')) / scale_ratio),
        "y1": _y0 + (parseFloat($(coordinates[i]).attr('height')) / scale_ratio)
      }
      coords.push(temp)
    }

    coords = _.sortBy(coords, d => d.y0)
    let updated_rects = [],
      last_x_map = {};

    _.each(coords, function(rect) {
      if(last_x_map[rect.x0] === undefined || (rect.y0 > last_x_map[rect.x0] + 3)) {
        updated_rects.push(rect)
        last_x_map[rect.x0] = rect.y0
      }
    })
    let heights = [], widths = []
    _.each($(`.yellowBox[data-para-id="${para_id}"]`), function(d) {
      heights.push($(d).height())
      widths.push($(d).width())
    })

    if((heights < 3) || (widths < 3)) {
      uploadWarning('Highlight is resized to small area, Please try again');
      gotoPage(pg_no)
      $('body>.tooltip').remove()
      return;
    }
    showLoader();
    ajaxCall(`/get_highlight_text?package=${g_url.searchKey.package}&coords=${JSON.stringify(updated_rects)}&doc=${g_url.searchKey.doc}&page=${pg_no}`, {}, 'GET', 'fetch_data', 32)
    .done(function(highlight){
      let new_entity = highlight.text.trim();
      if(new_entity === '') {
        uploadWarning("The resized text was an emtpy string. Please try again with different selection");
        gotoPage(pg_no)
        $('body>.tooltip').remove()
        return;
      }
      let temp_entity = _.cloneDeep(rendered_json[para_id]["entities"][entity_id]);
      temp_entity["coordinates"] = updated_rects;
      let word_index = [];
      if(rendered_json[para_id]['is_brushed']) {
        word_index = [0, new_entity.split(' ').length, new_entity];
      } else {
        word_index = temp_entity["word_index"]
      }
      temp_entity["word_index"] = word_index;
      temp_entity["entity"] = new_entity;
      let new_added_entities = [];
      new_added_entities.push({
        "package_id": g_url.searchKey.package,
        "docid": g_url.searchKey.doc,
        "pageNo": pg_no,
        "paraid": para_id,
        "entity_id": entity_id,
        "entities": temp_entity,
        "para": new_entity,
        "mode": "resize"
      })
      let new_value = [{
        "page_no": pg_no,
        "paraid": para_id,
        "entity_id": entity_id,
        "word_index": word_index
      }]
      ajaxCall(`/save_json_changes?package=${g_url.searchKey.package}&doc_id=${g_url.searchKey.doc}`, JSON.stringify(new_added_entities), 'POST', 'insert_data', 19, '', JSON.stringify(new_value), 'editview')
      .done(function(data){
        // hideLoader()
        rendered_json = data.data;
        new_added_entities = [];
        new_entity = "";
        gotoPage(pg_no);
      })
    })
  })
  return resize;
}

function drawBoundingBox(draw_dim, en, view='editview') {
  let annotation_svg = d3.select('#anonymizedViewer .annotationLayer'),
  annotation_g = annotation_svg.append('g');
  let class_name = "";
  if(view == 'approval') {
    annotation_svg = d3.select('#approvalViewer .annotationLayer');
    annotation_g = annotation_svg.append('g');
  }
  if(en.highlight_type == 'search') {
    class_name = 'search'
  } else if(en.highlight_type == 'approval') {
    class_name = 'app-yellowBox'
  } else {
    if(gbl_package_status !== "approved") {
      //Class_name = "resize" is for cursor icon.
      class_name = 'yellowBox new-tooltip'
    } else {
      class_name = 'highlight new-tooltip'
    }
  }
  let resize_func;
  if(gbl_package_status !== "approved") {
    resize_func = resizeFunc();
  } else {
    resize_func = () => void 0;
  }
  let title = `Annotation Value: ${en.tag}<br>Entity: ${en.entity_type}${en.action_type}`
  if(g_url.searchKey.flow == 'Risk') {
    title += `<br>Subject ID: ${en.subjid}<br> Replacement Value: ${en.replace_text}`;
  }

  annotation_g.append('rect')
    .attr('x', (draw_dim.x))
    .attr('y', (draw_dim.y))
    .attr('width', draw_dim.width)
    .attr('height', draw_dim.height)
    .attr('class', "resize")
    .attr('fill', "#999999")
    .attr('data-entity-id', en.entity_id)
    .attr('data-para-id', en.para_id)
    .attr('data-tag', en.tag)
    .attr('data-page', en.page_no)
    .attr('data-type', 'word_index')
    .style('opacity', 0.0)
    .attr('title', title)
    .call(resize_func)
  
  annotation_g.append('rect')
    .attr('x', draw_dim.x + 2)
    .attr('y', draw_dim.y)
    .attr('width', draw_dim.width - 4)
    .attr('height', draw_dim.height)
    .attr('class', class_name)
    .attr('fill', draw_dim.color)
    .attr('data-entity_id', en.entity_id)
    .attr('data-para-id', en.para_id)
    .attr('data-tag', en.tag)
    .attr('data-page', en.page_no)
    .attr('data-type', 'word_index')
    .style('opacity', 0.5)
    .attr('title', title)
  //   .call(resize_func)
}
  

function draw_using_d3(en) {
  let annotation_svg = d3.select('#anonymizedViewer .annotationLayer'),
  scale_ratio = RENDER_OPTIONS.scale, class_name = "",
  annotation_g = annotation_svg.append('g');
  if(!en.is_deleted && en.coordinates !== undefined) {
    let _tag = en.tag.values[en.tag.values.length - 1][1],
      subjid = en["SUBJID"]["values"].slice(-1)[0][1],
      replace_txt = en["position"][2];
    let _coords = en.coordinates, coords = [], resize_func;
    if(gbl_package_status !== "approved") {
      resize_func = resizeFunc();
      //Class_name of "resize" is for cursor icon.
      class_name = "yellowBox new-tooltip"
    } else {
      class_name = "highlight new-tooltip"
      resize_func = () => void 0;
    }
    if(!Array.isArray(_coords)) {
      coords.push(_coords);
    } else {
      coords = _coords
    }
    let title = `Annotation Value: ${en.entity}<br>Entity: ${_tag}${en.action}`;
    if(g_url.searchKey.flow == 'Risk') {
      title += `<br>Subject ID: ${subjid}<br>Replacement text: ${replace_txt}`
    }
    for (const coord of coords) {
      if(coord.y0 > coord.y1) {
        continue;
      }
      annotation_g.append('rect')
        .attr('x', coord.x0 * scale_ratio)
        .attr('y', coord.y0 * scale_ratio)
        .attr('width', coord.x1 * scale_ratio - coord.x0 * scale_ratio)
        .attr('height', coord.y1 * scale_ratio - coord.y0 * scale_ratio)
        .attr('class', "resize")
        .attr('fill', "#999999")
        .attr('data-entity-id', en.entity_id)
        .attr('data-para-id', en.paraId)
        .attr('data-tag', en.entity)
        .attr('data-type', 'brushed')
        .attr('data-page', en.pageNo)
        .style('opacity', 0.0)
        .attr('title', title)
        .call(resize_func)

      annotation_g.append('rect')
      .attr('x', (coord.x0 * scale_ratio)+ 2)
      .attr('y', coord.y0 * scale_ratio)
      .attr('width', (coord.x1 * scale_ratio - coord.x0 * scale_ratio) - 4)
      .attr('height', coord.y1 * scale_ratio - coord.y0 * scale_ratio)
      .attr('class', class_name)
      .attr('fill', en.color)
      .attr('data-entity_id', en.entity_id)
      .attr('data-para-id', en.paraId)
      .attr('data-tag', en.entity)
      .attr('data-type', 'brushed')
      .attr('data-page', en.pageNo)
      .style('opacity', 0.5)
      .attr('title', title)
      // .call(resize_func)
    }
  }
}
/**
 * @param {Integer} page_num
 * Draw the Annotations for the anonymized entities for the supplied page numbers
 */
function applyAnon(page_num, hilit_type, data){
  page_num.toString();
  let text_node_selector = page_container + page_num + " .textLayer",
    scale_ratio = RENDER_OPTIONS.scale,
    color_map = {'ai_comment': '#DE7A07', 'approved': '#118776', 'qc_comment': '#E03C3C', 'search': '#bbbdbe', 'verified':'#68C5F5'},
    highlight_type = hilit_type;
  let page_data_obj = {};
  if (data) {
    //Search data
    _.each(gbl_search_data, function(elem, idx){
        temp_k = _.keys(elem)
        if(elem[temp_k[0]].pageNo == page_num){
          page_data_obj = elem
        }
      })
  } else {
    //Normal data
    page_data_obj = rendered_json
  }
  let page_data = _.values(page_data_obj);
  let para_ids = _.keys(page_data_obj);
  page_data.forEach(function(each, indx){
    let para_id = para_ids[indx];
    let is_verified = each['isVerified'] != undefined ? each['isVerified'] : false
    if(each["is_brushed"] || each['onlypara'] == '' || each['onlypara'] == undefined) {
      _.each(each.entities, function(en) {
        let data_source = "qc_comment", 
        action_type = "",
        _action = en.action || 'ADD';
        if(en.is_deleted) {
          _action = 'DELETE'
        }
        if(_action == 'ADD') {
          action_type = `<br> Action: ${_action} `
        } else if(_action == 'EDIT') {
          action_type = `<br> Action: ${_action} `
        }
        if(is_verified == true) {
          data_source = "verified"
        }
        if(en["is_originator_verified"]) {
          data_source = "approved"
        }
        
        if(!en.is_deleted) {
          let _en = _.cloneDeep(en);
          _en["pageNo"] = each["pageNo"], _en["paraId"] = each["paraId"],
          _en["color"] = color_map[data_source], _en["action"] = action_type;
          draw_using_d3(_en)
        }
      })
      return
    } else if(each.wordsBbox !== undefined && each.wordsBbox.length > 0) {
      //Calling new json
      if(!_.isEmpty(each.entities)) {
        let entities = _.values(each.entities), word_coord = each.wordsBbox,
          page_no = each.pageNo;
        for(let i = 0; i < entities.length; i++) {
          if(!entities[i].entity_id) {
            continue
          }
          let subj_id = entities[i]["SUBJID"]["values"].slice(-1)[0][1],
            entity_type = entities[i]["tag"]["values"].slice(-1)[0][1],
            replace_txt = entities[i]["position"][2],
            _type = entities[i]["position"][3],
            entity_id = entities[i]["entity_id"],
            start_idx = entities[i]["word_index"][0],
            end_idx = entities[i]["word_index"][1],
            tagged_by = entities[i]["tag"]["values"].slice(-1)[0][0],
            is_approved = entities[i]['is_originator_verified'] ? entities[i]['is_originator_verified'] : false,
            data_source = '',
            action_type = '',
            _action = entities[i].action;
          if(_action === undefined) {
            if (entities[i]["tag"]["values"].length == 1 && tagged_by !== 'model') {
              _action = 'ADD'
            } else {
              _action = 'AI Comment'
            }
          }
          if(entities[i].is_deleted) {
            _action = 'DELETE'
          }
          action_type = `<br> Action: ${_action}`;

          if(is_approved == true ) {
            data_source = 'approved'
          } else if(is_verified == true && _action !== 'EDIT' && _action !== 'ADD') {
            data_source = "verified"
          } else if(tagged_by == 'model' && _action !== 'EDIT') {
            data_source = 'ai_comment'
          } else {
            data_source = 'qc_comment'
          }
          
          if(!entities[i].is_deleted && !entities[i].coordinates) {
            let entity_coord = word_coord.slice(start_idx, end_idx);

            if (entity_coord.length === 0) {
              // return
              continue;
            }
            let en = {
              entity_id: entity_id,
              para_id: para_id,
              subjid: subj_id,
              tag: entities[i].entity,
              page_no: page_no,
              highlight_type: '',
              action_type: action_type,
              entity_type: entity_type,
              replace_text: replace_txt
            }
            if(highlight_type == 'search') {
              data_source = 'search',
              en.highlight_type = 'search'
            }
            let line_coord = [entity_coord[0][0], entity_coord[0][1]],
              temp = [];
            entity_coord.forEach((coord, idx) => {
              let y0 = coord[1];
              if(y0 !== line_coord[1]) {
                let draw_dim = {
                  x: line_coord[0] * scale_ratio,
                  y: line_coord[1] * scale_ratio,
                  width: (entity_coord[idx -1][2] * scale_ratio) - (line_coord[0] * scale_ratio),
                  height: (entity_coord[idx -1][3] * scale_ratio) - (line_coord[1] * scale_ratio),
                  color: color_map[data_source]
                }
                drawBoundingBox(draw_dim, en)
                line_coord = [coord[0], coord[1]]
              }
              temp = [];
              temp.push(coord)
            })
            let draw_dim = {
              x: line_coord[0] * scale_ratio,
              y: line_coord[1] * scale_ratio,
              width: (temp[0][2] * scale_ratio) - (line_coord[0] * scale_ratio),
              height: (temp[0][3] * scale_ratio) - (line_coord[1] * scale_ratio),
              color: color_map[data_source]
            }
            drawBoundingBox(draw_dim, en)
          } else if(entities[i].coordinates && !entities[i].is_deleted) {
            let _en = _.cloneDeep(entities[i])
            _en["paraId"] = para_id, _en["pageNo"] = page_no
            _en["color"] = color_map[data_source], _en["action"] = action_type
            draw_using_d3(_en)
          }
        }
      }
    } else {
      //Handle the entity on paragraphs      
      let entities =  _.values(each["entities"]);
      entities = entities.sort(function(a, b){
        if(a["word_index"] && b["word_index"]) {
          return (a["word_index"][0] - b["word_index"][0]);
        }
      })
      for(let i = 0; i < entities.length; i++){
        let search_term = entities[i]["entity"];
        if(search_term === undefined) {
          continue;
        }
        let subj_id = entities[i]["SUBJID"]["values"].slice(-1)[0][1];
        let entity_type = entities[i]["tag"]["values"].slice(-1)[0][1];
        let replace_txt = entities[i]["position"][2];
        let _type = entities[i]["position"][3];
        let entity_id = entities[i]["entity_id"];
        let entity_index_0 = entities[i]["word_index"][0];
        let entity_index_1 = entities[i]["word_index"][1];
        let tagged_by = entities[i]["tag"]["values"].slice(-1)[0][0];
        let is_approved = entities[i]['is_originator_verified'] ? entities[i]['is_originator_verified'] : false
        let data_source = ''
        let action_type = '', tag_type = entities[i]["tag"]["values"].slice(-1)[0][1]
        let show_action = entities[i].action;
        if(show_action === undefined) {
          if (entities[i]["tag"]["values"].length == 1 && tagged_by !== 'model') {
            show_action = 'ADD'
          } else {
            show_action = 'AI Comment'
          }
        }
        if(is_approved == true) {
          data_source = 'approved'
        } else if(is_verified == true && entities[i]['action'] !== 'EDIT' && show_action !== 'ADD') {
          data_source = 'verified'
        }else if(tagged_by == 'model' && entities[i]['action'] !== 'EDIT') {
          data_source = 'ai_comment'
        } else {
          data_source = 'qc_comment'
        }
        (highlight_type == "search") ? data_source = "search" : ""
        if(entities[i].is_deleted) {
          show_action = 'DELETE'
        }
        let show_action_type = `<br> Action: ${show_action} `
        if('coordinates' in entities[i] && !entities[i].is_deleted) {
          let _en = _.cloneDeep(entities[i]);
          _en["paraId"] = each["paraId"], _en["pageNo"] = each["pageNo"]
          _en["color"] = color_map[data_source], _en["action"] = show_action_type;
          draw_using_d3(_en)
        }
        continue;
      }
    }
  })
  return;
}

function gotoHighlights(page_no,highlight_selected=false,selected_dict={}) {
  let new_pos=''
  if(!_.isEmpty(search_result) && search_result.pages.includes(page_no)) {
    displaySearchResult(page_no, "", mode = "next", gbl_search_data);
    let _c_pg = parseInt($('.anon-pageNo').attr('data-pageNo'))
    let _pg_ind = search_result.pages.indexOf(_c_pg)
    let _curr_count = 0
    if(_pg_ind > 0) {
      for(let _i=0; _i<_pg_ind; _i++) { 
        _curr_count += search_result.each_pg_data[_i]['count']
      }
      _curr_count += 1
    } else {
      _curr_count = search_result.tot_count > 0 ? 1 : 0
    }
    search_result.curr_count = _curr_count;
    search_result.curr_wrd_idx = 0;
    $("#search-count").text(`${_curr_count}/${search_result.tot_count}`);
  } else if(!_.isEmpty(rendered_json)) {
    applyAnon(page_no);
    if(highlight_selected){
      let  entity_id=selected_dict['data-entityid']
      let new_svg_elm = $('.annotationLayer').find(`rect[data-entity_id=${entity_id}]`)
      if (new_svg_elm.length>0){        
         new_pos = $(new_svg_elm).attr('y')
          $('#anonymized-container').scrollTop(new_pos);
          $(new_svg_elm).attr('fill', '#bbbdbe')
        }
      }
  }
  if(selection_status == 'text_selection') {
    $('.textLayer').css('z-index', 1000);
    $(".annotationLayer .brush").remove();
  } else {
    $('.textLayer').css('z-index', 0);
  }
  $('.textLayer').addClass('no-pointers')
  $(`g[data-pdf-annotate-type="highlight"]`).remove();
  if(!_.isEmpty(highlight_list)) {
    let curr_entity = $('#filter-count').text()
    if (curr_entity !== ""){
      let curr_elem = parseInt(curr_entity.split('/')[0])
      if (curr_elem>0){
        let page_num = highlight_list[curr_elem-1]['page_no']
        let entity_id = highlight_list[curr_elem-1]['entity_id']
        filter_mode = "next"
        if (filter_next !==undefined){
          if (filter_next.length>0){
            if (filter_next[0]['next'] == true){
              filter_mode="next"
            } else {
              filter_mode="prev"
              let page_num = highlight_list[curr_elem-1]['page_no']
              let entity_id = highlight_list[curr_elem-1]['entity_id']
            }
          }
        }
        highlightEntity(page_num,entity_id, filter_mode)
      }
    } 
  } else {
    $('#anonymized-container').scrollTop(60, 0);
    if(highlight_selected && new_pos!='')
    {
      $('#anonymized-container').scrollTop(new_pos);

    }
  }
  hideLoader();
}

/**
 * @param {Integer} page_no
 * Render the particular page number
 */
function gotoPage(page_no, redraw=false,highlight_selected=false,selected_dict={}) {
  page_no = parseInt(page_no)
  if(page_no >= 1 && page_no <= pdf_num_pages) {
    let anon_viewer = document.getElementById('upd-pdf-file');
    let org_viewer = document.getElementById('org-pdf-file');
    anon_viewer.innerHTML = '';
    org_viewer.innerHTML = '';
    for(let i = page_no - 1; i < page_no; i++) {
      let anon_page = UI.createPage(i + 1, "anon");
      let org_page = UI.createPage(i + 1, "original");
      org_viewer.appendChild(org_page);
      anon_viewer.appendChild(anon_page);
    }
    $('#upd-pdf-file').attr('data-pageNo', page_no)
    $('#org-pdf-file').attr('data-pageNo', page_no)
    UI.renderPage(page_no, RENDER_OPTIONS, pageType="anon").then(([pdfPage, annotations]) => {})
    UI.renderPage(page_no, RENDER_OPTIONS, pageType="original").then(([pdfPage, annotations]) => {
    })
  } else {
  }
}

/**
 *
 * @param {Integer} page_num - page number to be rendered.
 * @param {Boolean} fullscreen - display fullscreen or not.
 * @param {String} selector - Anonymized view or plain view.
 * @param {String} canvasWrapper - Canvas ID in the dom for a particular view.
 * @param {Object} document_id - pdf to be rendered
 */
function render(page_num,document_id,org_doc_id) {
  
  var loading_task = pdfjsLib.getDocument(document_id);
  RENDER_OPTIONS.rotate = parseInt(localStorage.getItem(`${document_id}/rotate`), 10) || 0;
  loading_task.promise.then((pdf) => {
    RENDER_OPTIONS.pdfDocument = pdf;
    let viewer = document.getElementById('upd-pdf-file');
    viewer.innerHTML = '';
    let NUM_PAGES = pdf._pdfInfo.numPages;
    //Set the max number of pages in page-removal modal
    pdf_num_pages = NUM_PAGES;
    for (let i=page_num-1; i<page_num; i++) {
      let page = UI.createPage(i+1, "anon");
      viewer.appendChild(page);
    }
    UI.renderPage(page_num, RENDER_OPTIONS, pageType="anon").then(([pdfPage, annotations]) => {
      OrgRender(page_num, org_doc_id);
    
    });
  });
}

/**
 * Render the plain view for the particular page in the pdf.
 */
function OrgRender(page_num, document_id) {
  var org_loading_task = pdfjsLib.getDocument(document_id);
  RENDER_OPTIONS.rotate = parseInt(localStorage.getItem(`${document_id}/rotate`), 10) || 0;
  org_loading_task.promise.then((pdf) => {
    RENDER_OPTIONS.pdfDocument = pdf;
    let viewer1 = document.getElementById('org-pdf-file');
    viewer1.innerHTML = '';
    let NUM_PAGES = pdf._pdfInfo.numPages;
    document.getElementById('org-pdf-file').setAttribute('data-pdf-length', NUM_PAGES);
    document.getElementById('upd-pdf-file').setAttribute('data-pageNo', page_num)
    document.getElementById('org-pdf-file').setAttribute('data-pageNo', page_num)
    document.getElementById('upd-pdf-file').setAttribute('data-totalpages', NUM_PAGES)
    document.getElementById('org-pdf-file').setAttribute('data-totalpages', NUM_PAGES)
    if(NUM_PAGES == 1){
      $('#page-scroll-up').prop('disabled', true)
      $('#page-scroll-down').prop('disabled', true)
    }
    else{
      $('#page-scroll-up').prop('disabled', true)
      $('#page-scroll-down').prop('disabled', false)
    }
    for (let i=page_num - 1; i<page_num; i++) {
      let page1 = UI.createPage(i+1, "original");
      viewer1.appendChild(page1);
    }
    UI.renderPage(page_num, RENDER_OPTIONS, pageType="original").then(([pdfPage, annotations]) => {
      ORG_PAGE_HEIGHT = document.querySelector(".canvasWrapper").clientHeight;
    });
  });
}

// Pen stuff & initial setup
(function () {
  let penSize = 1;
  let penColor = '#000000';

  function setPen(size, color) {
    UI.setPen(size, color);
  }
  setPen();
})();

function enableSelection() {
  let tooltype = 'highlight';
  UI.enableRect(tooltype);
}

function disableSelection() {
  UI.disableRect();
}

function getSelectedText() {
   var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    selectedTxt = text
    return {'text': text, 'pageNo': $('.edit-page-no').attr('pageno') || 'NA'};
}

function renderSearchResult(data, page) {
  add_brush()
  applyAnon(page);
  applyAnon(page, 'search', data)
  if(selection_status == 'text_selection') {
    $('.textLayer').css('z-index', 1000);
    $(".annotationLayer .brush").remove();
  } else {
    $('.textLayer').css('z-index', 0);
  }
  $('.textLayer').addClass('no-pointers')
  if((mode == 'next' || mode == 'jump')) {
    let svg_elem = $(".annotationLayer").find('.search'),
    idx = search_result.curr_wrd_idx,
    pos = $(svg_elem[idx]).attr('y');
    search_result.svg_elem = svg_elem;
    $('#anonymized-container').scrollTop(pos);
    $(svg_elem[idx]).attr("fill", "#6b6b6b")
  } else if(mode == 'prev') {
    let svg_elem = $(".annotationLayer").find('.search'),
    pos = $(svg_elem[svg_elem.length - 1]).attr('y');
    search_result.svg_elem = svg_elem;
    search_result.curr_wrd_idx = svg_elem.length - 1;
    $('#anonymized-container').scrollTop(pos);
    $(svg_elem[svg_elem.length - 1]).attr("fill", "#6b6b6b")
  }
  hideLoader();
}

function displaySearchResult(page_to_display, search_text, mode, data) {
  if (typeof(page_to_display) !== 'number') {
    return
  }
  let _curr_page = parseInt($('.anon-pageNo').attr('data-pageNo'))
  if (mode == 'jump') {
    _curr_page = page_to_display
  } else if(mode == 'next') {
    _curr_page = _curr_page < page_to_display ? page_to_display : _curr_page
  } else {
    _curr_page = page_to_display
  }
  if(search_result.pages.indexOf(_curr_page) == -1 && mode !== 'jump') {
    let _search_pages = _.filter(search_result.pages, m=> m > _curr_page);
    _curr_page = _search_pages[0];
    // page_to_display = _curr_page;
  }
  _curr_page = _curr_page == undefined ? search_result.pages[0] : _curr_page
  search_result.curr_idx = search_result.pages.indexOf(_curr_page)
  let anon_viewer = document.getElementById('anonymizedViewer');
  let org_viewer = document.getElementById('originalViewer');
  anon_viewer.innerHTML = '';
  org_viewer.innerHTML = '';
  for(let i = _curr_page - 1; i < _curr_page; i++) {
    let anon_page = UI.createPage(i + 1, "anon");
    let org_page = UI.createPage(i + 1, "original");
    org_viewer.appendChild(org_page);
    anon_viewer.appendChild(anon_page);
  }

  $('.anon-pageNo').html(`${_curr_page} of ${pdf_num_pages}`)
  $('.anon-pageNo').attr('data-pageNo', _curr_page)
  $('.org-pageNo').html(`${_curr_page} of ${pdf_num_pages}`)
  $('.org-pageNo').attr('data-pageNo', _curr_page);
  UI.renderPage(_curr_page, RENDER_OPTIONS, pageType="anon").then(([pdfPage, annotations]) => {
    let query = g_url.search + `&page_no=${_curr_page}`;
    if (_curr_page == rendered_json['pageNo']) {
      renderSearchResult(rendered_json, _curr_page)
    } else {
      ajaxCall('get_page_json?' + query, {}, 'GET', 'fetch_data', 28)
      .done(function(data){
        rendered_json = JSON.parse(data);
        renderSearchResult(data, _curr_page)
      })
    }
  })
  UI.renderPage(_curr_page, RENDER_OPTIONS, pageType="original").then(([pdfPage, annotations]) => {
    if(mode == 'next') {
      $('#original-container').scrollTop(10,0)
    }
  })
}

function renderApproval(page_no, page_data) {
  let approval_viewer = document.getElementById("approvalViewer");
  approval_viewer.innerHTML = '';
  page_no = parseInt(page_no);
  RENDER_OPTIONS.scale = 0.85
  for(let i = page_no - 1; i < page_no; i++) {
    let page = UI.createPage(i+1, "approval");
    approval_viewer.appendChild(page);
  }
  UI.renderPage(page_no, RENDER_OPTIONS, pageType="approval").then(([pdfPage, annotations]) => {
    let query = g_url.search + `&page_no=${page_no}`; 
    if(page_data === undefined) {
      ajaxCall('get_page_json?' + query, {}, 'GET', 'fetch_data', 28)
      .done(function(data){
        approval_json = JSON.parse(data)
        delete(approval_json['pageNo'])
        delete(approval_json['removeRanges'])
        delete(approval_json['removedPages'])
  
        applyApprovalAnon(page_no, approval_json)
        hideLoader()
      })
    } else {
      delete(page_data['pageNo'])
      delete(page_data['removeRanges'])
      delete(page_data['removedPages'])

      applyApprovalAnon(page_no, page_data)
      hideLoader()
    }
  });
}

function applyApprovalAnon(page_num, page_data) {
  let text_node_selector = app_page_conatiner + page_num + " .textLayer", scale = 0.85;
  let _para_id = $('.app-entity')[0] != undefined ? $('.app-entity').attr("data-paraid") : '' 
  let _en_id = $('.app-entity')[0] != undefined ? $('.app-entity').attr("data-entityid") : '' 
  let page_values = _.values(page_data)
  for(j = 0; j < page_values.length; j++) {
    let _para_data = page_values[j]  
    let _para_txt = _para_data['onlypara'] != undefined ? _para_data['onlypara'] : '',
    word_coord = _para_data['wordsBbox'];
    if(_.isEmpty(_para_data["entities"])){
      continue
    }
    let _en_data = _para_data["entities"][_en_id], has_bbox = (word_coord !== undefined && word_coord.length > 0) ? true : false;
    if(_para_data != undefined && !_para_data['is_brushed']){
      if(has_bbox) {
        let entities = _.values(_para_data["entities"])
        for(let i = 0; i < entities.length; i++) {
          if(!entities[i].entity_id) {
            continue;
          }
          let search_term = entities[i]["entity"], data_source = '', en_id = entities[i]["entity_id"];
          let start_idx = entities[i]["word_index"][0],
          end_idx = entities[i]["word_index"][1];
          let entity_coord = word_coord.slice(start_idx, end_idx);
          if(entity_coord.length == 0) {
            continue;
          }
          let line_coord = [entity_coord[0][0], entity_coord[0][1]], temp = []
          let en = {
            entity_id: en_id,
            para_id: _para_id,
            tag: search_term,
            page_no: page_num,
            highlight_type: 'approval',
            action_type: '',
            entity_type: ''
          }
          entity_coord.forEach((coord, idx) => {
            let y0 = coord[1]
            if(y0 !== line_coord[1]) {
              let draw_dim = {
                x: line_coord[0] * scale,
                y: line_coord[1] * scale,
                width: (entity_coord[idx -1][2] * scale) - (line_coord[0] * scale),
                height: (entity_coord[idx -1][3] * scale) - (line_coord[1] * scale),
                color: '#E03C3C'
              }
              drawBoundingBox(draw_dim, en, 'approval')
              line_coord = [coord[0], coord[1]]
            }
            temp = []
            temp.push(coord)
          })
          let draw_dim = {
            x: line_coord[0] * scale,
            y: line_coord[1] * scale,
            width: (temp[0][2] * scale) - (line_coord[0] * scale),
            height: (temp[0][3] * scale) - (line_coord[1] * scale),
            color: '#E03C3C'
          }
          drawBoundingBox(draw_dim, en, 'approval')
        }
      }
    } else if(_para_data['is_brushed']) {
      let annotation_svg = d3.select(`#approvalpageContainer${page_num} .annotationLayer`);
      let annotation_g = annotation_svg.append('g');
      let para_id = _para_data
      _.each(_para_data["entities"], function(en) {
        if(!en['entity_id']) {
          return
        }
        if(en.coordinates !== undefined) {
          let _coords = en.coordinates, coords = [];
          if(!Array.isArray(_coords)) {
            coords.push(_coords);
          } else {
            coords = _coords
          }
          for(const coord of coords) {
            if(coord.y0 > coord.y1) {
              continue;
            }
            annotation_g.append('rect')
              .attr('x', coord.x0 * scale)
              .attr('y', coord.y0 * scale)
              .attr('width', coord.x1 * scale - coord.x0 * scale)
              .attr('height', coord.y1 * scale - coord.y0 * scale)
              .attr('class', 'app-yellowBox')
              .attr('fill', (en.is_originator_verified) ? '#118776' : '#E03C3C')
              .attr('data-entity_id', en.entity_id)
              .attr('data-para-id', _para_data.paraId)
              .attr('data-tag', en.entity)
              .attr('data-page', en.pageNo)
              .style('opacity', 0.5)
              .style('display', 'none')
          }
        }
      })
    }
  }
  d3.select(`#approvalpageContainer${page_num} .annotationLayer`).selectAll('.app-yellowBox').style('display', 'none')
  d3.select(`#approvalpageContainer${page_num} .annotationLayer`).selectAll('.app-yellowBox').filter(function() {
    return d3.select(this).attr('data-entity_id') == $('.ai-comment.app-entity').attr('data-entityid') 
  }).style('display', 'block') 
  return

}

function highlightEntity(page_no, entity_id, mode){
  let curr_entity = $('#filter-count').text()
  let curr_elem = parseInt(curr_entity[0])
  let svg_elm = $(`#anonymizedViewer svg[data-pdf-annotate-page=${page_no}]`).find('*')
  $.each(svg_elm, function (idx, elem) {
    for (let j=0; j<highlight_list.length;j++){
      if ($(elem).attr('data-entity_id') == highlight_list[j]['entity_id'].toString() && highlight_list[j]['page_no'] == parseInt(page_no)) {
        let _node_val = $(elem)
        if (_node_val.prop('nodeName') == 'rect'){
          if($(elem).attr('data-page') == page_no && $(elem).attr('data-entity_id') == entity_id) {
            $(elem).attr("fill", "#6b6b6b");
          } else {
            $(elem).attr("fill", "#bbbdbe");
          }
        }
      }
    }
  })
  let new_svg_elm = $('.annotationLayer').find(`rect[data-entity_id=${entity_id}]`) 
  if (new_svg_elm.length>0){        
    let ele = document.getElementById('anonymized-container');
    let new_pos = $(new_svg_elm).attr('y')
    $('#anonymized-container').scrollTop(new_pos);
    $('#original-container').scrollTop(new_pos);
    // if (new_pos > 0 && (ele.offsetHeight + new_pos < ele.scrollHeight)) {
    //   $('#anonymized-container').scrollTop(new_pos);
    //   $('#original-container').scrollTop(new_pos);
    // }
    // } else {
    //   $('#anonymized-container').scrollTop(new_pos, 0);
    //   $('#original-container').scrollTop(new_pos,0);      
    // }
  }
}

function add_brush () {
  if(gbl_package_status !== 'approved') {

    let annotation_svg = d3.select('#anonymizedViewer .annotationLayer'),
      brush = d3.brush().on("end", brushed);
    annotation_svg.append("g")
            .attr("class", "brush")
            .call(brush)
            .lower();
  }
}

function brushed() {
  brushed_coords = d3.event.selection;
}
