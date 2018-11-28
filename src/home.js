import React from 'react';
import SignIn from './signIn';
import SignUp from './signUp';
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      newUser: false
    };
    //this.onDelayChange = this.onDelayChange.bind(this)
  }
  newUser = flag => {
    this.setState({
      newUser: flag
    });
  };
  render() {
    return (
      <div>
        {this.state.newUser ? (
          <SignUp auth={this.props.auth} newUser={this.newUser} />
        ) : (
          <SignIn auth={this.props.auth} newUser={this.newUser} />
        )}
      </div>
    );
  }
}
export default Home;
