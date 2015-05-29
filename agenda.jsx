
var Task = React.createClass({
    render: function() {
        return (
            <div
                className='task'
                style={{
                    height: this.props.height + 'px',
                }}
            >
                <h2 className='_title'>{this.props.title}</h2>
                <h3 className='_duration'>{this.props.duration}</h3>
            </div>
        );
    },
});


var Agenda = React.createClass({
    getDefaultProps: function() {
        return {
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
            <ul className='agenda'>
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
