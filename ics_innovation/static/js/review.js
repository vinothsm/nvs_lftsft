$(function(){
  
})

$("body")
.on("click", ".card.preview-ent", function (e) {
    $('.card.preview-ent').removeClass('selected')
    $(this).addClass('selected')
    var original_path=$(this).attr('data-original-path'),
    updated_path =$(this).attr('data-updated-path');
    $('.original-pdf-file').attr('src',`/static/${original_path}`)
    $('.updated-pdf-file').attr('src',`/static/${updated_path}`)
  })

// document
//   .querySelector('#original-pdf-file')
//   .addEventListener('load', e => {
//     e.target.contentWindow.addEventListener('scroll', e => {
//       console.log('scrollin');
//     });
//   });

var iframe = document.getElementById('original-pdf-file');
iframe.contentDocument.body.addEventListener('scroll', function(event) {
  console.log(event);
  debugger
}, false);
