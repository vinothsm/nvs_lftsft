$(function(){
    $(".loader").removeClass("d-none")
    $(".loader").addClass("d-flex")
    render_extracted_entities()
})

function render_extracted_entities(){
    var html = ""
    $.get("/extracted_data/").done(function(resp){
        var data = resp["data"]
        var processed_data = []
        data.forEach(element => {
            html += '<div class="card preview-ent">'
            html += "<p class='entity-text-preview'>"+element.entity+"</p>"
            var text_str = _.map(element.expected_values, "value").join(",")
            html += "<p class='sub-text'>"+text_str+"</p>"        
            html += "</div>"

            element.expected_values.forEach((item) => {
                processed_data.push({
                    "entity": element.entity,
                    "value": item.value
                })
            })
        });
        const csvString = [
            [
              "Entity",
              "Value"
            ],
            ...processed_data.map(item => [
                item.entity,
                item.value
            ])
          ]
        .map(e => e.join(",")) 
        .join("\n");
        downloadCSV(csvString)
        $(".entity-block").append(html)
        $(".loader").addClass("d-none")
        $(".loader").removeClass("d-flex")    
    }).fail(function(error){
        html += "<h1>Failed to fetch response</h1>"
        html += error
        $(".entity-block").append(html)
        $(".loader").addClass("d-none")
        $(".loader").removeClass("d-flex")
    })
}

function downloadCSV(csvStr) {
    var hiddenElement = document.getElementById("csv_download_file");
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvStr);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'output.csv';
    // hiddenElement.click();
}
