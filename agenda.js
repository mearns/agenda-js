
var agenda = [
    {duration: 1, title: "First Task"},
    {duration: 2, title: "Second Task"},
    {duration: 2, title: "Third Task"},
];


var Task = function(duration, title) {

    var self = this;

    this._originalDuration = duration;
    this._duration = duration;
    this._title = title;
    this._progressBarFill = (new HtmlBuilder(null, "div"))
                    .addClass("_prog").style("height", "0")
                    .build();
    this._progressBar = (new HtmlBuilder(null, "div"))
                    .addClass("VerticalProgressBar")
                    .add(this._progressBarFill)
                    .build();
    this._pctCompleteNode = document.createTextNode("-");
    this._ele = 
            new HtmlBuilder(null, "div")
                .addClass("Task")
                .add(this._progressBar)
                .ele("p").addClass("pct-complete")
                    .ele("span").add(this._pctCompleteNode).up()
                .up()
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

        self._pctCompleteNode.nodeValue = parseInt(pct * 100) + '%';
            
        self._progressBarFill.style.height = height;
    };

    this.setTimeScale = function(timeScale) {
        self._timeScale = timeScale;
        self._ele.style.height = (self._duration * timeScale) + 'px';
    };

    this.setAvailableDuration = function(duration) {
        self._duration = duration;
        self.setTimeScale(self._timeScale);
    };
    
    this.getDuration = function() {
        return this._duration;
    };
}

var Agenda = function(taskList, ele) {

    var self = this;
    this._totalHeight = 300;
    this._rate = 50;
    this._ele = ele;
    this._pastDeficit = 0;

    this._pastRunTime = 0;
    this._pastTimeInTask = 0;
    this._runningSince = null;

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
                if(!self.isRunning()) {
                    self.start();
                }
                else {
                    self._next();
                }
                break;
        }
    });

    /**
     * returns the total number of seconds that you've been in the current task.
     */
    this.getTimeInTask = function() {
        if(self._runningSince == null) {
            return self._pastTimeInTask;
        }
        return self._pastTimeInTask + parseFloat((new Date() - self._runningSince)) / 1000.0;
    };

    /**
     * Returns the total number of seconds you've been running this agenda.
     */
    this.getTotalRunTime = function() {
        return self._pastRunTime + self.getTimeInTask();
    };

    this.isRunning = function() {
        return self._runningSince !== null;
    };

    this.start = function() {
        self._runningSince = new Date();

        //Reset timing accumulators.
        self._pastRunTime = 0;
        self._pastDeficit = 0;

        //select the current task.
        self._currentIdx = 0;
        self._currentTask = self._tasks[self._currentIdx];
        self._pastTimeInTask = 0;
            
        //Place the deficit tracker with this task.
        $(self._currentTask.getElement()).before(self._deficitEle);

        self._calculateWeights();

        //Kick off the run.
        self._timer = setInterval(self._tick, self._rate);
    };

    this._next = function() {
        var newRunTime = new Date();

        //Get the total time the previous task was running.
        var prevRunTime = self._pastTimeInTask;
        if(self._runningSince !== null) {
            prevRunTime += parseFloat(newRunTime - self._runningSince) / 1000.0;
        }

        //Add into total runtime accumulator.
        self._pastRunTime += prevRunTime;

        //Update deficit
        var taskDeficit = (prevRunTime - self._currentTask.getDuration());
        self._pastDeficit += taskDeficit;
        if (self._currentIdx+1 < self._tasks.length) {
            self._currentIdx++;
            self._currentTask = self._tasks[self._currentIdx];

            //Reset in-task timings.
            self._runningSince = newRunTime;
            self._pastTimeInTask = 0;

            //Move the deficit tracker with this task.
            $(self._currentTask.getElement()).before(self._deficitEle);

            //Update weights.
            self._calculateWeights();

        } else {
            clearInterval(self._timer);
            self._runningSince = null;
            console.log("Done");
        }
    };

    this._calculateWeights = function() {
        self._weights = [];
        var total = 0;
        for(var i=self._currentIdx+1; i<self._tasks.length; i++) {
            total += self._tasks[i].getDuration();
        }
        for(var i=self._currentIdx+1; i<self._tasks.length; i++) {
            self._weights[i-self._currentIdx-1] = self._tasks[i].getDuration() / total;
        }
    };

    this._tick = function() {

        //How long have we been running in this task (since resume).
        var elapsedTime = self.getTimeInTask();

        var pctTaskComplete = elapsedTime / self._currentTask.getDuration();
        self._currentTask.setPercentComplete(pctTaskComplete);

        if(pctTaskComplete >= 1.0) {

            //Update the deficit.
            var taskDeficit = (elapsedTime - self._currentTask.getDuration());
            var totalDeficit = self._pastDeficit + taskDeficit;
            self._deficitEle.style.height = (totalDeficit * self._timeScale) + 'px';

            //See how much time we have left in the whole presentation.
            var timeRemaining = self._totalDuration - self.getTotalRunTime();
            if(timeRemaining > 0) {
                //Divvy it up
                var total = 0;
                for(var i=self._currentIdx+1; i<self._tasks.length-1; i++) {
                    var t = timeRemaining * self._weights[i - self._currentIdx - 1];
                    total += t;
                    self._tasks[i].setAvailableDuration(t);
                }
                self._tasks[self._tasks.length-1].setAvailableDuration(timeRemaining - total);
            }
        }
    }

};

var onload = function() {
    (new Agenda(agenda, document.getElementById("agenda"))).start();
};

