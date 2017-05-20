import Inferno from 'inferno';
import Component from 'inferno-component';
import createElement from 'inferno-create-element';

import getNotControlledWarning from './NotControlledWarning';
import getMain from './Main';
import getFooter from './Footer';

export default function getApp(theState) {

  const NotControlledWarning = getNotControlledWarning(theState);
  const Main = getMain(theState);
  const Footer = getFooter(theState);

  return class App extends Component {

    constructor(props) {

      super(props);
      this.state = {
        status: 'Загрузка...',
        ifInputsDisabled: false,
      };

    }

    setStatusTo(msg) {

      this.setState(
        {
          status: msg,
        }
      );

    }

    showErrors(err, ...warns) {

      const warningHtml = warns
        .map(
          (w) => w && w.message || ''
        )
        .filter( (m) => m )
        .map( (m) => '✘ ' + m )
        .join('<br/>');

      let messageHtml = '';
      if (err) {
        let wrapped = err.wrapped;
        messageHtml = err.message || '';

        while( wrapped ) {
          const deeperMsg = wrapped && wrapped.message;
          if (deeperMsg) {
            messageHtml = messageHtml + ' &gt; ' + deeperMsg;
          }
          wrapped = wrapped.wrapped;
        }
      }
      messageHtml = messageHtml.trim();
      if (warningHtml) {
        messageHtml = messageHtml ? messageHtml + '<br/>' + warningHtml : warningHtml;
      }
      this.setStatusTo(
        (<span>
          <span style="color:red">
            {err ? <span><span class="emoji">🔥</span> Ошибка!</span> : 'Некритичная oшибка.'}
          </span>
          <br/>
          <span style="font-size: 0.9em; color: darkred" dangerouslySetInnerHTML={{__html: messageHtml}}></span>
          {err && <a href="" onClick={(evt) => {

            this.props.apis.errorHandlers.viewError('pup-ext-err', err);
            evt.preventDefault();

          }}> [Техн.детали]</a>}
        </span>)
      );

    }

    switchInputs(val) {

      this.setState({
        ifInputsDisabled: val === 'off' ? true : false,
      });

    }

    conduct(
      beforeStatus, operation, afterStatus,
      onSuccess = () => {}, onError = () => {}
    ) {

      this.setStatusTo(beforeStatus);
      this.switchInputs('off');
      operation((err, res, ...warns) => {

        warns = warns.filter( (w) => w );
        if (err || warns.length) {
          this.showErrors(err, ...warns);
        } else {
          this.setStatusTo(afterStatus);
        }
        this.switchInputs('on');
        if (!err) {
          onSuccess(res);
        } else {
          onError(err);
        }

      });

    }

    render(originalProps) {

      const props = Object.assign({}, originalProps, {
        funs: {
          setStatusTo: this.setStatusTo.bind(this),
          conduct: this.conduct.bind(this),
          showErrors: this.showErrors.bind(this),
        },
        ifInputsDisabled: this.state.ifInputsDisabled,
      });

      return createElement('div', null, [
        ...( props.flags.ifNotControlled ? [createElement(NotControlledWarning, props)] : [] ),
        createElement(Main, props),
        createElement(Footer, Object.assign({ status: this.state.status }, props)),
      ]);

    }

  }

};
