
var agenda = [
    {duration: 10, title: "First Task"},
    {duration: 20, title: "Second Task"},
    {duration: 8, title: "Third Task"},
];

var onload = function() {

    var totalHeight = 600;
    
    var agendaEle = document.getElementById("agenda");
    var totalDuration = 0;
    for(var i=0; i<agenda.length; i++) {
        totalDuration += agenda[i].duration;
    }

    for(var i=0; i<agenda.length; i++) {
        var task = agenda[i];
        var taskBuilder =
            new HtmlBuilder(null, "div")
                .addClass("Task")
                .style("height", (totalHeight * (task.duration / totalDuration)) + "px")
                .ele("h2").text(task.title).up()
                .ele("h3").text(task.duration).up()

        agendaEle.appendChild(taskBuilder.build());
    }

};

