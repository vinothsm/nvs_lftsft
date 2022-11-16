$(function(){
 var original_path = $('.card.preview-ent.selected').attr('data-original-path')
 var updated_path = $('.card.preview-ent.selected').attr('data-updated-path')
 $('.page-no-text').text('Page 1')
 $('#org-pdf-file').html('')
 $('#upd-pdf-file').html('')
render(1,'/static/'+updated_path,'/static/'+original_path);
setScrollEventListner()

})

$("body")
.on("click", ".card.preview-ent", function (e) {
    $('.card.preview-ent').removeClass('selected')
    $(this).addClass('selected')
    var original_path=$(this).attr('data-original-path'),
    updated_path =$(this).attr('data-updated-path');
    $('#org-pdf-file').empty()
    $('#upd-pdf-file').empty()
    render(1,'/static/'+updated_path,'/static/'+original_path);
    let total_page_num = parseInt($('#upd-pdf-file').attr('data-totalpages'))
    $('.page-no-text').text('Page 1')
    if(total_page_num == 1){
      $('#page-scroll-up').prop('disabled', true)
      $('#page-scroll-down').prop('disabled', true)
    }

  })
.on('click', '#page-scroll-down', function() {
  page_scroll("scroll-down")
})
.on('click', '#page-scroll-up', function() {
  page_scroll("scroll-up")
})


const scrollEventfunc = function() {
  document.getElementById('original-container').scrollTop += $('#anonymized-container').scrollTop() - $('#original-container').scrollTop()
  document.getElementById('original-container').scrollLeft += $('#anonymized-container').scrollLeft() - $('#original-container').scrollLeft()
  
  let ele = document.getElementById('anonymized-container'),
    cur_page = parseInt($('.anon-pageNo').attr('data-pageNo'))
    scrolling = true
  if (ele.offsetHeight + ele.scrollTop >= ele.scrollHeight && scrolling) {
    scrolling = false
  } else if ((ele.offsetHeight + ele.scrollTop >= ele.scrollHeight / 2) && ele.scrollTop != 0) {
    scrolling = true
  } else if (ele.scrollTop == 0 && scrolling && cur_page > 1) {
    scrolling = false
  }
}


function setScrollEventListner() {
    document.getElementById('anonymized-container').addEventListener('scroll', scrollEventfunc)
    document.getElementById('original-container').addEventListener('scroll', function(){
      document.getElementById('anonymized-container').scrollTop += $('#original-container').scrollTop() - $('#anonymized-container').scrollTop()
      document.getElementById('anonymized-container').scrollLeft += $('#original-container').scrollLeft() - $('#anonymized-container').scrollLeft()
    })
}


function page_scroll(move_type){
    var changeval =0
    if (move_type == "scroll-down"){
      changeval = 1
    } else if (move_type == "scroll-up"){
      changeval = -1
    }
    let pages_val = $('#upd-pdf-file').attr('data-pageNo')
    if (pages_val !== ""){
      let present_page_num = parseInt(pages_val),
        total_page_num = parseInt($('#upd-pdf-file').attr('data-totalpages'))
      if (total_page_num> present_page_num && present_page_num >0){
        $('#page-scroll-up').prop('disabled', false)
        $('#page-scroll-down').prop('disabled', false)
        var res_page_no = present_page_num+changeval
        $('#upd-pdf-file').attr('data-pageNo',res_page_no)
        $('#org-pdf-file').attr('data-pageNo',res_page_no)
        $('.page-no-text').text('Page '+res_page_no)
        if(total_page_num == res_page_no){
          $('#page-scroll-down').prop('disabled', true)
        }
        gotoPage(present_page_num + changeval)
      } else {
        $('#upd-pdf-file').attr('data-pageNo',1)
        $('#org-pdf-file').attr('data-pageNo',1)
        $('.page-no-text').text('Page 1')
        $('#page-scroll-up').prop('disabled', true)
        if(total_page_num != 1){
          $('#page-scroll-down').prop('disabled', false)
        }
        gotoPage(1)
      }
    }
}