$(function(){
    $(".loader").removeClass("d-none")
    $(".loader").addClass("d-flex")
    render_extracted_entities()
})

function render_extracted_entities(){
    var html = ""
    $.get("/extracted_data/").done(function(resp){
        var data = resp["data"]
        data.forEach(element => {
            html += '<div class="card preview-ent">'
            html += "<p class='entity-text-preview'>"+element.entity+"</p>"
            var text_str = _.map(element.expected_values, "value").join(",")
            html += "<p class='sub-text'>"+text_str+"</p>"        
            html += "</div>"
        });
        $(".entity-block").append(html)
        $(".loader").addClass("d-none")
        $(".loader").removeClass("d-flex")    
    }).fail(function(error){
        html += "<h1>Failed to fetch response</h1>"
        $(".entity-block").append(html)
    })

}