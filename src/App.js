import React, { Component } from 'react';
import AceEditor from 'react-ace';
import ReactMarkdown from  'react-markdown';
import Tasks from './tasks/tasks';
import Helpers from './helpers';
//import brace from 'brace';
import './App.css';

import 'brace/ext/language_tools';
import 'brace/mode/javascript';
import 'brace/theme/monokai';

var first = false;
class App extends Component {
  constructor(props) {
    super(props);

    let savedTasks = JSON.parse(localStorage.getItem('tasks'));
    this.state = {
      value: ``,
      console: '',
      task: null,
      tasks: savedTasks ? savedTasks : Tasks,
      correctResult: false,
      ran: false,
    };
    this.onChange = this.onChange.bind(this);

    let resultBuffer = [];
    var original = window.console;
    window.console = {
        log: (args) => {
            if (first) {
              resultBuffer = [];
              first = false;
            }

            resultBuffer.push(args);

            let task;
            this.state.tasks.forEach((section) => {
                let t = section.tasks.find((task) => this.state.task && this.state.task.id === task.id);

                if (t) {
                  task = t;
                }
            });

            if (task) {
              if (this.state.task && typeof(args) !== 'undefined' && Helpers.isEqual(resultBuffer, this.state.task.result)) {
                  task.correct = true;
              } else {
                  task.correct = false;
              }

              task.solution = this.state.value;
            }

            localStorage.setItem("tasks", JSON.stringify(this.state.tasks));

            this.setState({
              correctResult: task ? task.correct : false,
              ran: true,
              tasks: this.state.tasks,
              console: `${this.state.console}<br /> ${resultBuffer.join('<br />')}`,
              result: args,
            });
            original.log.apply(original, [args]);
        }
        , warn: (args) => {
            // do sneaky stuff
            //this.setState({ console: `${this.state.console}<br /> <span class='warning'>${args}</span>` });
            original.warn.apply(original, [args]);
        }
        , error: (args) => {
            // do sneaky stuff
            original.error.apply(original, [args]);
            //alert(args);
            this.setState({ console: `${this.state.console}<br /> <span class='error'>${args}</span>` });
        }
    }
  }

  clearConsole() {
    this.setState({ console: '' });
  }

  reset() {
    localStorage.setItem("tasks", null);
    this.setState({
      tasks: Tasks
    });
  }

  evaluate() {
    try {
        first = true;
        eval(this.state.value, true);
        /*((v) => {
          setTimeout(v, 1);
        })(this.state.value);*/
    } catch (e) {
        console.error(e);
    } finally {

    }
  }

  loadTask(task) {
    this.setState({
      task,
      value: task.solution ? task.solution : task.defaultValue,
      console: '',
      ran: false,
    });
  }

  onChange(newValue) {
    this.setState({value: newValue});
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Základy programování</h1>
        </header>
        <div className="App-content">
          <div className="App-sidebar">
            <button onClick={() => { this.reset() }}>Začít znovu</button>
            {this.state.tasks.map((section) =>
              <div key={section.section}>
                <h2>{section.section}</h2>
                <ul>
                  {section.tasks.map((task) => {
                    return <li key={task.id} onClick={() => { this.loadTask(task) }} className={task.correct ? "correctResult": ""}>{task.title}</li>
                  }
                  )}
                </ul>
              </div>
            )}
          </div>
          <div className="App-intro">
            <AceEditor
              mode="javascript"
              theme="monokai"
              value={this.state.value}
              onChange={this.onChange}
              name="content"
              editorProps={{$blockScrolling: true}}
              enableBasicAutocompletion={true}
              enableLiveAutocompletion={true}
              enableSnippets={true}
            />

            <button onClick={() => { this.evaluate() }}>Spustit program</button>
          </div>

          <div>
            <div>
              <h2>{this.state.task && this.state.task.title}</h2>
              {this.state.task && <ReactMarkdown source={this.state.task.description} />}

              {this.state.task && this.state.correctResult && this.state.ran && <div className="correctResult">Máš to správně!</div>}
              {this.state.task && !this.state.correctResult && this.state.ran && <div className="wrongResult">
                Máš to špatně!
              </div>}
            </div>
            <button onClick={() => { this.clearConsole() }}>Vyčistit konzoli</button>
            <div className="App-console">
              <div dangerouslySetInnerHTML={{__html: this.state.console}} />
              <div style={{ float:"left", clear: "both" }}
                   ref={(el) => { this.messagesEnd = el; }}>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
