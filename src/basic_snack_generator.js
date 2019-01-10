import React from 'react';
import {
  isLoading,
  objectForEach,
  capitalizeFirstLetter,
  isAny
} from './utils';
import { connect } from 'react-redux';
import { withSnackbar } from 'notistack';
import * as status from './constants/LoadingStatusTypes';
import { loadingRemove } from './actions';
class BasicSnackGenerator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentWillReceiveProps(props) {
    const { loading } = props;
    if (
      isLoading(status.ONGOING)(loading, 'download') &&
      !isLoading([status.COMPLETE, status.FAIL, status.REMOVE])(
        loading,
        'download'
      )
    ) {
      this.props.enqueueSnackbar('Loading', { variant: 'warning' });
    }
    if (
      isLoading(status.COMPLETE)(loading, 'download') &&
      !isLoading([status.ONGOING, status.FAIL, status.REMOVE])(
        loading,
        'download'
      )
    ) {
      let complete = [];
      objectForEach(loading, (type, value) => {
        objectForEach(value, (key, stat) => {
          if (stat === status.COMPLETE) {
            let labelType = capitalizeFirstLetter(type.toLowerCase());

            if (!isAny(type, complete)) {
              this.props.enqueueSnackbar(labelType + ' Complete', {
                variant: 'success'
              });
              complete.push(type);
            }
            this.props.loadingRemove(key, type);
          }
        });
      });
    }
    if (loading !== this.props.loading) {
    }
  }

  render() {
    return <div />;
  }
}

const mapStateToProps = state => {
  return {
    loading: state.loading
  };
};

export default connect(
  mapStateToProps,
  { loadingRemove }
)(withSnackbar(BasicSnackGenerator));
