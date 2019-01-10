import React from 'react';
import { Card, CardContent } from '@material-ui/core';
import { connect } from 'react-redux';
//https://github.com/mac-s-g/react-json-view
import ReactJson from 'react-json-view';
import { onUserRetrieveSucces } from './actions/users';
import { onShiftRetrieveSucces } from './actions/shifts';
import { downloadloading } from './actions/index';
import { getData } from './fbGetPaginatedData';
import { isLoading } from './utils'
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
   /*componentWillReceiveProps(props) {
    
    console.log('componentWillReceiveProps', props.data);
    if (isLoading('ONGOING')(props.data.loading,'download') ) {
      console.log('Loading ONGOING')
      
      //console.log(props.shifts)
    }
   if (!isLoading('ONGOING')(props.data.loading,'download') ) {
      console.log('Loading NOT ONGOING')
      
      //console.log(props.shifts)
    }
    if (isLoading(['ONGOING','COMPLETE'])(props.data.loading,'download') ) {
      console.log('Loading  ONGOING or COMPLETE')
      
      //console.log(props.shifts)
    }
   }*/
  shiftAmmountToRetrieve = () => {
    
    return  50;
  };
  shiftRequest = (year, month, lastRow = null) => {
    let args = {
      collection: 'wsinf/' + year + '/' + month,
      tag: 'download_shifts',
      limit: this.shiftAmmountToRetrieve(),
      year,
      month,
      callback: onShiftRetrieveSucces
    };
    if (lastRow !== null) {
      args = { ...args, lastRow };
    }

    return args;
  };
  componentDidMount() {
    //this.getShifts();
    let { downloadloading } = this.props;
   
    //this.props.getData(this.userRequest())//.then((x)=>{console.log('blabla',x)});
    this.props.getData(this.shiftRequest(2018,10))
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
  return { data: state };
};

export default connect(
  mapStateToProps,
  { getData, downloadloading }
)(JsonViewer);
