import React from 'react';
import { Card, CardContent } from '@material-ui/core';
import { connect } from 'react-redux';
//https://github.com/mac-s-g/react-json-view
import ReactJson from 'react-json-view';
import { onUserRetrieveSucces } from './actions/users';
import { downloadloading } from './actions/index';
import { getData } from './fbGetPaginatedData';
class JsonViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    //this.props.downloadloading('SOmething', 'COMPLETE')
    // this.props.getData(this.userRequest())
  }
  userRequest = (lastRow = null) => {
    let args = {
      collection: 'users',
      tag: 'download_users',
      limit: 50,
      callback: onUserRetrieveSucces
    };
    if (lastRow !== null) {
      args = { ...args, lastRow };
    }
    console.log('userRequest', args);

    return args;
  };
  componentDidMount() {
    //this.getShifts();
    let { downloadloading } = this.props;
    console.log('downloading', downloadloading);
    console.log('will mount');
    this.props.getData(this.userRequest())//.then((x)=>{console.log('blabla',x)});
  }

  onChangeClick = e => {
    e.preventDefault();
    this.props.downloadloading('Algo mas', 'COMPLETE');
  };

  render() {
    const { data } = this.props;
    return (
      <div>
        <Card style={{ textAlign: 'start', backgroundColor: '#272822' }}>
          <CardContent>
            <ReactJson src={data} indentWidth={2} theme="monokai" />
          </CardContent>
        </Card>
        <button type="button" onClick={this.onChangeClick}>
          CLICK
        </button>
      </div>
    );
  }
}

const mapStateToProps = state => {
  console.log('mapStateToProps', state);
  return { data: state };
};

export default connect(
  mapStateToProps,
  { getData, downloadloading }
)(JsonViewer);
