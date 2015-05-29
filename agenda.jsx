
var Task = React.createClass({
    render: function() {
        return (
            <div
                className='task'
            >
                <h2 className='_title'>{this.props.title}</h2>
                <h3 className='_duration'>{this.props.duration}</h3>
            </div>
        );
    },
});


var Agenda = React.createClass({
    render: function() {
        var childIdx = 0;
        return (
            <ul>
                {this.props.children.map(function(child) {
                    var key = childIdx;
                    childIdx++;
                    return (
                        <li key={key}>{child}</li>
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
