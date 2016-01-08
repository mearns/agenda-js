
var agenda = [
    {duration: 3, title: "First Task"},
    {duration: 6, title: "Second Task"},
    {duration: 2, title: "Third Task"},
];


var Task = function(duration, title) {

    var self = this;

    this._duration = duration;
    this._title = title;
    this._progressBarFill = (new HtmlBuilder(null, "div"))
                    .addClass("_prog").style("height", "0")
                    .build();
    this._progressBar = (new HtmlBuilder(null, "div"))
                    .addClass("VerticalProgressBar")
                    .add(this._progressBarFill)
                    .build();
    this._ele = 
            new HtmlBuilder(null, "div")
                .addClass("Task")
                .add(this._progressBar)
                .ele("h2").text(this._title).up()
                .ele("h3").text(this._duration).up()
                .build()

    this.getElement = function() {
        return self._ele;
    };

    this.setPercentComplete = function(pct) {
        var height;
        if(pct <= 0) {
            height = '0';
        } else if (pct >= 1) {
            height = '100%';
        } else {
            height = (pct * 100) + '%'
        }
            
        this._progressBarFill.style.height = height;
    };

    this.setTimeScale = function(timeScale) {
        this._ele.style.height = (this._duration * timeScale) + 'px';
    };
    
    this.getDuration = function() {
        return this._duration;
    };
}

var onload = function() {

    var totalHeight = 600;
    var tasks = [];
    
    var agendaEle = document.getElementById("agenda");
    var totalDuration = 0;
    for(var i=0; i<agenda.length; i++) {
        totalDuration += agenda[i].duration;

        //Build an element to represent this task.
        var task = new Task(agenda[i].duration, agenda[i].title);
        tasks.push(task);
        agendaEle.appendChild(task.getElement());
    }

    var timeScale = totalHeight / totalDuration;
    for(var i=0; i<tasks.length; i++) {
        tasks[i].setTimeScale(timeScale);
    }

    var runtime = 0;
    var startTime = new Date();
    var currentIdx = 0;
    var currentTask = tasks[currentIdx];
    var timer = null;
    var rate = 50;

    function tick() {

        var elapsedTime = runtime + parseFloat((new Date()) - startTime) / 1000.0;

        var pctTaskComplete = elapsedTime / currentTask.getDuration();
        currentTask.setPercentComplete(pctTaskComplete);

        if(pctTaskComplete >= 1.0) {
            clearInterval(timer);
            console.log("Done");
        }

    }

    timer = setInterval(tick, rate);

};

