
var VerticalProgressBar = React.createClass({

    getInitialState: function() {
        return {
            pct: 50,
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
                onClick={this.start}
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
        var childIdx = 0;
        var total = 0.0;
        this.props.children.forEach(function(child) {
            total += parseFloat(child.props.duration);
        });
        var height = this.props.height;
        return (
            <ul className='Agenda'>
                {this.props.children.map(function(child) {
                    var key = childIdx;
                    childIdx++;
                    var pct = parseFloat(child.props.duration) / total;
                    return (
                        <li key={key} ><Task {...child.props} height={height * pct} /></li>
                    );
                })}
            </ul>
        );
    },
});

React.render(
  <Agenda>
    <Task duration='10' title='First Task' />
    <Task duration='20' title='Second Task' />
    <Task duration='8' title='Third Task' />
  </Agenda>,
  document.body
);
