
var Task = React.createClass({
    render: function() {
        return (
            <div
                className='task'
            >
                <h2 className='_title'>{this.props.title}</h2>
                <h3 className='_duration'>{this.props.duration}</h3>
                <h3 className='_pct'>{this.props.pct}</h3>
            </div>
        );
    },
});


var Agenda = React.createClass({
    render: function() {
        var childIdx = 0;
        var total = 0.0;
        this.props.children.forEach(function(child) {
            total += parseFloat(child.props.duration);
        });
        return (
            <ul className='agenda'>
                {this.props.children.map(function(child) {
                    var key = childIdx;
                    childIdx++;
                    return (
                        <li key={key}><Task {...child.props} pct={100.0*parseFloat(child.props.duration) / total} /></li>
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
