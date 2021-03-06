
var onload = function() {
    var agenda = [
        {duration: 4, title: "First Task", description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Suspendisse porttitor vehicula dui."},
        {duration: 4, title: "Second Task", description: "Quisque quis massa. Donec est. Sed vitae tellus ac libero tincidunt tempor."},
        {duration: 4, title: "Third Task", description: "In faucibus lorem nec elit. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus."},
    ];

    var cfg = {
        tasks: {
            thresholds: {
                warning_time: 2
            }
        }
    };

    (new Agenda(agenda, cfg, document.getElementById("agenda")));
}

var Task = function(duration, title, description, cfg) {

    var self = this;

    self._originalDuration = duration;
    self._duration = duration;
    self._elapsedTime = 0;
    self._title = title;
    self._description = description;
    self._progressBarDebt = (new HtmlBuilder(null, "div"))
                    .addClass("_debt").addClass("_prog").style("height", "0")
                    .build();
    self._progressBarElapsed = (new HtmlBuilder(null, "div"))
                    .addClass("_elapsed").addClass("_prog").style("height", "0")
                    .build();
    self._progressBarConsumed = (new HtmlBuilder(null, "div"))
                    .addClass("_bonus-consumed").addClass("_prog").style("height", "0")
                    .build();
    self._progressBarOver = (new HtmlBuilder(null, "div"))
                    .addClass("_over").addClass("_prog").style("height", "0")
                    .build();
    self._progressBarRemaining = (new HtmlBuilder(null, "div"))
                    .addClass("_remaining").addClass("_prog").style("height", "0")
                    .build();
    self._progressBarBonus = (new HtmlBuilder(null, "div"))
                    .addClass("_bonus").addClass("_prog").style("height", "0")
                    .build();
    self._progressBar = (new HtmlBuilder(null, "div"))
                    .addClass("VerticalProgressBar")
                    .add(self._progressBarDebt)
                    .add(self._progressBarElapsed)
                    .add(self._progressBarConsumed)
                    .add(self._progressBarOver)
                    .add(self._progressBarRemaining)
                    .add(self._progressBarBonus)
                    .build();

    self._pctCompleteNode = document.createTextNode("-");
    self._timeRemainingNode = document.createTextNode(self._duration + "s");
    self._ele = 
            new HtmlBuilder(null, "div")
                .addClass("Task")
                .add(self._progressBar)
                .ele("ul").addClass("pct-complete")
                    .ele("li").add(self._pctCompleteNode).up()
                    .ele("li").add(self._timeRemainingNode).up()
                .up()
                .ele("h2").text(self._title).up()
                .ele("h3").text(self._duration + " sec").up()
                .ele("p").text(self._description).up()
                .build()

    self.getElement = function() {
        return self._ele;
    };

    self.setTimeElapsed = function(seconds) {
        self._elapsedTime = seconds;
        self._update();
    }

    /**
     * Sets the duration of the task. If this is less than the original, we assume
     * there is some debt to be paid. If this is more, than there is surplus time.
     */
    self.setDuration = function(duration) {
        self._duration = duration;
        self._update();
    };

    self._update = function() {
        var pctCompelte = self._elapsedTime / self._duration;
        var timeRemaining = self._duration - self._elapsedTime;
        if(self._elapsedTime <= self._duration) {
            self._pctCompleteNode.nodeValue = parseInt(pctCompelte * 100) + '% complete';
            if(timeRemaining < 1) {
                self._timeRemainingNode.nodeValue = "<1s remaining";
            } else {
                self._timeRemainingNode.nodeValue = parseInt(timeRemaining) + "s remaining";
            }
        }
        else {
            self._pctCompleteNode.nodeValue = "+" + parseInt(pctCompelte * 100)-100 + '% over';
            self._timeRemainingNode.nodeValue = parseInt(-timeRemaining) + "s over";
        }

        var bonus = 0;
        var debt = 0;
        var tdelta = self._originalDuration - self._duration;
        if(tdelta > 0) {
            debt = tdelta;
        }
        else if(tdelta < 0) {
            bonus = -tdelta;
        }

        //First set of cases, we have not yet exceeded our available duration
        if(self._elapsedTime <= self._duration) {
            $(self._progressBarOver).hide();

            if(tdelta == 0) {
                //no debt, no bonus.
                $(self._progressBarDebt).hide();
                $(self._progressBarConsumed).hide();
                $(self._progressBarRemaining).show();
                $(self._progressBarBonus).hide();

                var pct = self._elapsedTime / self._originalDuration;
                self._progressBarElapsed.style.height = (pct * 100.0) + '%'
                self._progressBarRemaining.style.height = ((1-pct) * 100.0) + '%'
            }
            else if(tdelta > 0) {
                //debt
                $(self._progressBarDebt).show();
                $(self._progressBarConsumed).hide();
                $(self._progressBarRemaining).show();
                $(self._progressBarBonus).hide();

                var pctDebt = debt  / self._originalDuration;
                var pctElapsed = self._elapsedTime / self._originalDuration;
                var pct = pctDebt + pctElapsed;
                self._progressBarDebt.style.height = (pctDebt * 100.0) + '%'
                self._progressBarElapsed.style.height = (pctElapsed * 100.0) + '%'
                self._progressBarRemaining.style.height = ((1-pct) * 100.0) + '%'
            }
            else {
                $(self._progressBarDebt).hide();
                $(self._progressBarBonus).show();

                //bonus
                if(self._elapsedTime < self._originalDuration) {
                    //have not yet consumed any bonus time.
                    $(self._progressBarConsumed).hide();
                    $(self._progressBarRemaining).show();

                    var pctElapsed = self._elapsedTime / self._duration;
                    var pctBonus = bonus / self._duration;
                    var pct = pctElapsed + pctBonus
                    self._progressBarElapsed.style.height = (pctElapsed * 100.0) + '%'
                    self._progressBarRemaining.style.height = ((1-pct) * 100.0) + '%'
                    self._progressBarBonus.style.height = (pctBonus * 100.0) + '%'
                }
                else {
                    //Started consuming bonus time, but still within available time.
                    $(self._progressBarConsumed).show();
                    $(self._progressBarRemaining).hide();

                    var pctElapsed = self._originalDuration / self._duration;
                    var remainingBonus = self._duration - self._elapsedTime;
                    var pctBonus = remainingBonus / self._duration;
                    var pct = pctElapsed + pctBonus
                    self._progressBarElapsed.style.height = (pctElapsed * 100.0) + '%'
                    self._progressBarConsumed.style.height = ((1-pct) * 100.0) + '%'
                    self._progressBarBonus.style.height = (pctBonus * 100.0) + '%'
                }
            }
        }
        //Next set of cases, we've gone over time.
        else {
            $(self._progressBarOver).show();
            $(self._progressBarRemaining).hide();
            $(self._progressBarBonus).hide();
            if(tdelta == 0) {
                //No debt, no bonus
                $(self._progressBarDebt).hide();
                $(self._progressBarConsumed).hide();

                var pct = self._duration / self._elapsedTime;
                self._progressBarElapsed.style.height = (pct * 100.0) + '%';
                self._progressBarOver.style.height = ((1.0 - pct) * 100.0) + '%';
            }
            else if (tdelta > 0) {
                //debt
                $(self._progressBarDebt).show();
                $(self._progressBarConsumed).hide();

                var mx = self._elapsedTime + debt;
                var pctDebt = debt / mx;
                var pctElapsed = self._duration / mx;
                var pct = pctDebt + pctElapsed;
                self._progressBarDebt.style.height = (pctDebt * 100.0) + '%';
                self._progressBarElapsed.style.height = (pctElapsed * 100.0) + '%';
                self._progressBarOver.style.height = ((1.0 - pct) * 100.0) + '%';
            }
            else {
                //bonus
                $(self._progressBarDebt).hide();
                $(self._progressBarConsumed).show();

                var pctElapsed = self._originalDuration / self._elapsedTime;
                var pctConsumed = bonus / self._elapsedTime;
                var pct = pctElapsed + pctConsumed;
                self._progressBarElapsed.style.height = (pctElapsed * 100.0) + '%';
                self._progressBarConsumed.style.height = (pctConsumed * 100.0) + '%';
                self._progressBarOver.style.height = ((1.0 - pct) * 100.0) + '%';
            }
        }

    };

    self.selected = function() {
        var el = self.getElement();
        el.scrollIntoView({behavior: "smooth", block: "start"});
        $(el).addClass("_selected");
    };

    self.deselected = function() {
        var $el = $(self.getElement());
        $el.removeClass("_selected");
        $el.addClass("_completed");
    };
    
    self.getDuration = function() {
        return self._duration;
    };
}

var Agenda = function(taskList, cfg, ele) {

    var self = this;
    self._totalHeight = 300;
    self._rate = 50;
    self._ele = ele;
    self._cfg = cfg;

    self._pastRunTime = 0;
    self._pastTimeInTask = 0;
    self._runningSince = null;
    self._state = "stopped";
    self._pastOffSchedule = 0;

    self._tasks = [];
    self._totalDuration = 0;

    self._init = function() {

        //Create the overall progress bar.
        self._progressBarDebt = (new HtmlBuilder(null, "div"))
                        .addClass("_debt").addClass("_prog").style("height", "0")
                        .build();
        self._progressBarElapsed = (new HtmlBuilder(null, "div"))
                        .addClass("_elapsed").addClass("_prog").style("height", "0")
                        .build();
        self._progressBarBonus = (new HtmlBuilder(null, "div"))
                        .addClass("_bonus").addClass("_prog").style("height", "0")
                        .build();
        self._progressBar = (new HtmlBuilder(null, "div"))
                        .addClass("VerticalProgressBar").addClass("overall-progress")
                        .add(self._progressBarDebt)
                        .add(self._progressBarElapsed)
                        .add(self._progressBarBonus)
                        .build();
        self._ele.appendChild(self._progressBar);


        //Generate the task list.
        var taskListBuilder = (new HtmlBuilder(null, "ol")).addClass("TaskList");
        for(var i=0; i<taskList.length; i++) {
            self._totalDuration += taskList[i].duration;

            //Build an element to represent self task.
            var task = new Task(taskList[i].duration, taskList[i].title, taskList[i].description, cfg);
            self._tasks.push(task);
            taskListBuilder.ele("li").add(task.getElement()).up();
        }

        //Add the task list to the parent element.
        self._ele.appendChild(taskListBuilder.build());

        //Add key listeners.
        $(document).keydown(function(event) {
            switch(event.which) {
                case 32:    //space-bar
                    if(!self.isStarted()) {
                        self.start();
                    }
                    else if(self.isRunning()) {
                        self._next();
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    break;

                case 80:    //'p'
                    if(self.isPaused()) {
                        self.resume();
                    } else if(self.isRunning()) {
                        self.pause();
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    break;
            }
        });
    };

    /**
     * returns the total number of seconds that you've been in the current task.
     */
    self.getTimeInTask = function() {
        if(self._runningSince == null) {
            return self._pastTimeInTask;
        }
        return self._pastTimeInTask + parseFloat((new Date() - self._runningSince)) / 1000.0;
    };

    self.getOffSchedule = function() {
        var offInTask = self._currentTask.getDuration() - self.getTimeInTask();
        if(offInTask < 0) {
            return self._pastOffSchedule + offInTask;
        }
        return self._pastOffSchedule;
    };

    /**
     * Returns the total number of seconds you've been running self agenda.
     */
    self.getTotalRunTime = function() {
        return self._pastRunTime + self.getTimeInTask();
    };

    self.isRunning = function() {
        return self._state == "running";
    };

    self.isStarted = function() {
        return self._state == "running" || self._state == "paused";
    };

    self.isPaused = function() {
        return self._state == "paused";
    }

    self.start = function() {
        self._runningSince = new Date();

        //Reset timing accumulators.
        self._pastRunTime = 0;

        //select the current task.
        self._currentIdx = 0;
        self._currentTask = self._tasks[self._currentIdx];
        self._currentTask.selected();
        self._pastTimeInTask = 0;
            
        self._calculateWeights();

        self._pastOffSchedule = 0;

        //Kick off the run.
        self._state = "running";
        self._timer = setInterval(self._tick, self._rate);
    };

    self.pause = function() {
        clearInterval(self._timer);
        if(self._runningSince !== null) {
            self._pastTimeInTask += parseFloat(new Date() - self._runningSince) / 1000.0;
            self._runningSince = null;
        }
        self._state = "paused";
    };

    self.resume = function() {
        if(self.isPaused()) {
            self._state = "running";
            self._runningSince = new Date();
            self._timer = setInterval(self._tick, self._rate);
        }
    };

    self._next = function() {
        var newRunTime = new Date();

        //Get the total time the previous task was running.
        var prevRunTime = self._pastTimeInTask;
        if(self._runningSince !== null) {
            prevRunTime += parseFloat(newRunTime - self._runningSince) / 1000.0;
        }

        self._updateRemainingTasks(prevRunTime);

        //Add into total runtime accumulator.
        self._pastRunTime += prevRunTime;

        //And total off-schedule time
        var prevOffSchedule = self._currentTask.getDuration() - prevRunTime;
        self._pastOffSchedule += prevOffSchedule;

        self._currentTask.deselected();

        //Select the next task.
        if (self._currentIdx+1 < self._tasks.length) {

            self._currentIdx++;
            self._currentTask = self._tasks[self._currentIdx];
            self._currentTask.selected();

            //Reset in-task timings.
            self._runningSince = newRunTime;
            self._pastTimeInTask = 0;

            //Update weights.
            self._calculateWeights();

        } else {
            clearInterval(self._timer);
            self._runningSince = null;
            self._state = "stopped";
            console.log("Done");
        }
    };

    self._calculateWeights = function() {
        self._weights = [];
        var total = 0;
        for(var i=self._currentIdx+1; i<self._tasks.length; i++) {
            total += self._tasks[i].getDuration();
        }
        for(var i=self._currentIdx+1; i<self._tasks.length; i++) {
            self._weights[i-self._currentIdx-1] = self._tasks[i].getDuration() / total;
        }
    };

    self._tick = function() {
        //How long have we been running in self task (since resume).
        var elapsedTime = self.getTimeInTask();
        self._currentTask.setTimeElapsed(elapsedTime);

        //Update the overall progress bar.
        self._updateOverallProgressBar();
        
        //Update all the remaining tasks.
        var timeForTask = Math.max(self._currentTask.getDuration(), elapsedTime);
        self._updateRemainingTasks(timeForTask);
    };

    self._updateOverallProgressBar = function() {
        var pct = self.getTotalRunTime() / self._totalDuration;
        var height;
        if (pct <= 0) {
            height = '0';
        } else if(pct >= 1.0) {
            height = '100%';
        } else {
            height = (pct * 100.0) + '%';
        }

        var offSchedule = self.getOffSchedule();
        if(offSchedule < 0) {
            //debt
            //XXX: update the _progressBarDebt height. Then do bonus, too.
        }

        self._progressBarElapsed.style.height = height;
    };

    self._updateRemainingTasks = function(timeForTask) {
        //See how much time we have left in the whole presentation (after this task).
        if(self._currentIdx+1 < self._tasks.length) {
            var timeRemaining = self._totalDuration - self._pastRunTime - timeForTask;
            if(timeRemaining > 0) {
                //Divvy it up, as a form of divvying of the debt.
                var total = 0;
                for(var i=self._currentIdx+1; i<self._tasks.length-1; i++) {
                    var t = timeRemaining * self._weights[i - self._currentIdx - 1];
                    total += t;
                    self._tasks[i].setDuration(t);
                }
                self._tasks[self._tasks.length-1].setDuration(timeRemaining - total);
            } else {
                //No time left in the entire agenda. Set all remaining tasks to 0.
                for(var i=self._currentIdx+1; i<self._tasks.length; i++) {
                    self._tasks[i].setDuration(0);
                }
            }
        }
    };

    self._init();

};

