
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

var Agenda = function(taskList, ele) {

    var self = this;
    this._totalHeight = 600;
    this._rate = 50;
    this._ele = ele;

    this._tasks = [];
    this._totalDuration = 0;
    for(var i=0; i<agenda.length; i++) {
        this._totalDuration += taskList[i].duration;

        //Build an element to represent this task.
        var task = new Task(taskList[i].duration, taskList[i].title);
        this._tasks.push(task);
        this._ele.appendChild(task.getElement());
    }

    var timeScale = this._totalHeight / this._totalDuration;
    for(var i=0; i<this._tasks.length; i++) {
        this._tasks[i].setTimeScale(timeScale);
    }

    this.start = function() {
        self._startTime = new Date();
        self._currentIdx = 0;
        self._currentTask = self._tasks[self._currentIdx];
        self._timer = setInterval(self._tick, self._rate);
    };

    this._next = function() {
        if (self._currentIdx+1 < self._tasks.length) {
            self._currentIdx++;
            self._currentTask = self._tasks[self._currentIdx];
            self._startTime = new Date();
        } else {
            clearInterval(self._timer);
            console.log("Done");
        }
    };

    this._tick = function() {

        var elapsedTime = parseFloat((new Date()) - self._startTime) / 1000.0;

        var pctTaskComplete = elapsedTime / self._currentTask.getDuration();
        self._currentTask.setPercentComplete(pctTaskComplete);

        if(pctTaskComplete >= 1.0) {
            self._next();
        }
    }

};

var onload = function() {
    (new Agenda(agenda, document.getElementById("agenda"))).start();
};

