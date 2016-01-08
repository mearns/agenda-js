
var agenda = [
    {duration: 1, title: "First Task"},
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
    this._running = false;
    this._totalDeficit = 0;

    this._tasks = [];
    this._totalDuration = 0;
    for(var i=0; i<agenda.length; i++) {
        this._totalDuration += taskList[i].duration;

        //Build an element to represent this task.
        var task = new Task(taskList[i].duration, taskList[i].title);
        this._tasks.push(task);
        this._ele.appendChild(task.getElement());
    }

    this._timeScale = this._totalHeight / this._totalDuration;
    for(var i=0; i<this._tasks.length; i++) {
        this._tasks[i].setTimeScale(this._timeScale);
    }

    this._deficitEle = (new HtmlBuilder(null, "div"))
        .addClass("Deficit").addClass("Task")
        .style("height", "0")
        .build();

    $(document).keydown(function(event) {
        switch(event.which) {
            case 32:    //space-bar
                if(!self._running) {
                    self.start();
                }
                else {
                    self._next();
                }
                break;
        }
    });

    this.start = function() {
        self._running = true;
        self._currentTaskDeficit = 0;
        self._currentIdx = 0;
        self._selectCurrentIdx();
        self._timer = setInterval(self._tick, self._rate);
    };

    this._selectCurrentIdx = function() {
        self._startTime = new Date();
        self._totalDeficit += self._currentTaskDeficit;
        self._currentTaskDeficit = 0;
        self._currentTask = self._tasks[self._currentIdx];
        $(self._currentTask.getElement()).after(self._deficitEle);
    };

    this._next = function() {
        if (self._currentIdx+1 < self._tasks.length) {
            self._currentIdx++;
            self._selectCurrentIdx();
        } else {
            clearInterval(self._timer);
            self._running = false;
            console.log("Done");
        }
    };

    this._tick = function() {

        var elapsedTime = parseFloat((new Date()) - self._startTime) / 1000.0;

        var pctTaskComplete = elapsedTime / self._currentTask.getDuration();
        self._currentTask.setPercentComplete(pctTaskComplete);

        if(pctTaskComplete >= 1.0) {
            self._currentTaskDeficit = (elapsedTime - self._currentTask.getDuration());
            deficit = self._totalDeficit + self._currentTaskDeficit;
            self._deficitEle.style.height = (deficit * self._timeScale) + 'px';
        }
    }

};

var onload = function() {
    (new Agenda(agenda, document.getElementById("agenda"))).start();
};

