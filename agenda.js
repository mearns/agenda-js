
var agenda = [
    {duration: 3, title: "First Task"},
    {duration: 6, title: "Second Task"},
    {duration: 2, title: "Third Task"},
];

var onload = function() {

    var totalHeight = 600;
    
    var agendaEle = document.getElementById("agenda");
    var totalDuration = 0;
    for(var i=0; i<agenda.length; i++) {
        totalDuration += agenda[i].duration;
    }

    var startTime = new Date();
    var currentIdx = 0;

    function tick() {

        var elapsedTime = parseFloat((new Date()) - startTime) / 1000.0;
        var remainingTime = elapsedTime;

        agendaEle.innerHTML = "";
        for(var i=0; i<agenda.length; i++) {
            var task = agenda[i];

            var pct = 0;
            if(i == currentIdx) {
                pct = remainingTime / task.duration;
                if(pct >= 1.0) {
                    pct = 1.0;
                    currentIdx++;
                }
                remainingTime = 0;
            } else if(i < currentIdx) {
                pct = 1.0;
                remainingTime -= task.duration;
            } else {
                pct = 0.0;
            }
            pct *= 100.0;

            var taskBuilder =
                new HtmlBuilder(null, "div")
                    .addClass("Task")
                    .style("height", (totalHeight * (task.duration / totalDuration)) + "px")
                    .ele("div")
                        .addClass("VerticalProgressBar")
                        .ele("div").addClass("_prog").style("height", pct + "%").up()
                    .up()
                    .ele("h2").text(task.title).up()
                    .ele("h3").text(task.duration).up()

            agendaEle.appendChild(taskBuilder.build());
        }

        if(currentIdx >= agenda.length) {
            clearInterval(timer);
        }
    }

    var timer = setInterval(tick, 50);

};

