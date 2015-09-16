
var VerticalProgressBar = React.createClass({

    getDefaultProps: function() {
        return {
            init: {
                pct: 0,
            },
        };
    },

    getInitialState: function() {
        return {
            pct: this.props.init.pct,
            classNames: [],
        };
    },

    /**
     * Set the state of the progress bar to the specified perctange of complete.
     * The `pct` parameter should be a number in the closed range [0, 100]. Values
     * outside of this range are ignored.
     */
    set: function(pct) {
        if(pct >= 0 && pct <= 100) {
            this.setState({pct: pct});
        }
    },

    setClass: function(cls) {
        this.setState({classNames: [cls]});
    },

    clearClass: function() {
        this.setState({classNames: []});
    },

    render: function() {
        var style = {
            height: this.state.pct + '%',
        };
        return (
            <div className={'VerticalProgressBar ' + this.state.classNames.join(' ')} >
                <div className='_prog' style={style}>
                </div>
            </div>
        );
    },
});

var Task = React.createClass({

    getDefaultProps: function() {
        return {
            rate: 50,
            agenda: null,
            idx: null,
        };
    },

    getInitialState: function() {
        return {
            startTime: null,
        };
    },

    componentDidMount: function() {
    },

    componentWillUnmount: function () {
        clearInterval(this.timer);
    },

    clicked: function() {
        if(this.props.agenda !== null) {
            this.props.agenda.clicked(this.props.idx, this);
        }
    },

    start: function() {
        this.setState({startTime: new Date()});
        this.timer = setInterval(this.tick, this.props.rate);
    },

    stop: function() {
        clearInterval(this.timer);
    },

    tick: function() {
        if(this.state.startTime !== null) {
            var elapsed = parseFloat((new Date()) - this.state.startTime) / 1000.0;
            var pct = 100.0 * (elapsed / parseFloat(this.props.duration));
            if (pct > 100.0) {
                pct = 100.0;
                this.stop();
                this.refs.progBar.setClass('_over');
            } else {
                this.refs.progBar.clearClass();
            }
            this.refs.progBar.set(pct);
        };
    },

    render: function() {
        return (
            <div
                className='Task'
                style={{
                    height: this.props.height + 'px',
                }}
                onClick={this.clicked}
            >
                <VerticalProgressBar ref='progBar' />
                <h2 className='_title'>{this.props.title}</h2>
                <h3 className='_duration'>{this.props.duration}</h3>
            </div>
        );
    },
});


var Agenda = React.createClass({
    getDefaultProps: function() {
        return {
            //TODO: The height isn't actually the height of the agenda, because of padding in the tasks.
            height: 300,
        }
    },

    render: function() {
        var height = this.props.height;
        var total_duration = 0;
        this.props.tasks.forEach(function(task) {
            total_duration += task.duration;
        });
        var task_elements = this.props.tasks.map(function(task, idx) {
            var key = "" + idx;
            var ref = 'task_' + idx;
            var pct = parseFloat(task.duration) / total_duration;
            return (
                <li key={key} ><Task {...task} agenda={self} idx={idx} ref={ref} height={height * pct} /></li>
            );
        }, this);
        return (
            <ul className='Agenda'>
                {task_elements}
            </ul>
        );
    },
});

React.render(
  <Agenda tasks={[
    {duration: 10, title: 'First Task'},
    {duration: 20, title: 'Second Task'},
    {duration: 8, title: 'Third Task'},
  ]}>
  </Agenda>,
  document.body
);
