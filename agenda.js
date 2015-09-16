
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
        agenda[i].lastDuration = agenda[i].duration;
    }

    var runtime = 0;
    var startTime = new Date();
    var currentIdx = 0;
    var timer = null;
    var running = false;
    var rate = 50;

    var togglePaused = function() {
        if(running) {
            if(timer !== null) {
                clearInterval(timer);
                timer = null;
            }
            running = false;
            runtime += parseFloat((new Date()) - startTime) / 1000.0;
        }
        else {
            running = true;
            startTime = new Date();
            timer = setInterval(tick, rate);
        }
    };

    var next = function() {
        currentIdx++;
        for(var i=currentIdx; i<agenda.length; i++) {
            agenda[i].lastDuration = agenda[i].duration;
        }
    };

    window.onkeydown = function(evt) {
        if(evt.keyCode == 32) { //space
            next();
        }
        else if(evt.keyCode == 27) {    //esc
            togglePaused();
        }
    };

    function tick() {

        var elapsedTime = runtime + parseFloat((new Date()) - startTime) / 1000.0;
        var remainingTime = elapsedTime;

        agendaEle.innerHTML = "";
        for(var i=0; i<agenda.length; i++) {
            var task = agenda[i];

            var pct = 0;
            var overflow = 0;
            if(i == currentIdx) {
                pct = remainingTime / task.duration;
                if(pct >= 1.0) {
                    pct = 1.0;
                    overflow = remainingTime - task.duration;

                    var timeRequired = 0;
                    for(var j=i+1; j<agenda.length; j++) {
                        timeRequired += agenda[j].duration;
                    }
                    if(timeRequired > 0) {
                        for(var j=i+1; j<agenda.length; j++) {
                            agenda[j].duration = agenda[j].lastDuration - overflow * (agenda[j].duration / timeRequired);
                            if(agenda[j].duration < 0) {
                                agenda[j].duration = 0;
                            }
                        }
                    }
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

            if(overflow) {
                new HtmlBuilder(null, "div")
                    .addClass("Task").addClass("Overflow")
                    .style("height", (totalHeight * (overflow / totalDuration)) + "px")
                    .ele("div")
                        .addClass("VerticalProgressBar")
                        .ele("div").addClass("_prog").style("height", "100%").up()
                    .up()
                    .appendTo(agendaEle);
            }
        }

        if(elapsedTime > 12 || currentIdx >= agenda.length) {
            clearInterval(timer);
        }
    }

    running = true;
    timer = setInterval(tick, rate);

};

