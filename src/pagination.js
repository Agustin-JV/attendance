import React from 'react';
import PropTypes from 'prop-types';
import { TablePagination } from '@material-ui/core';
import UltimatePaginationMaterialUi from './react-ultimate-pagination-@material-ui';
class Pagination extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: this.props.rows || 0,
      rowsPerPage: 5,
      page: 0
    };
  }
  onChange = x => {
    this.setState({
      page: x - 1
    });
    if (this.props.onPageChange) this.props.onPageChange(x);
  };
  onGoNext = event => {
    this.setState({ rows: this.props.rows });
    if (this.props.onGoNext) this.props.onGoNext(event);
  };
  onGoLast = (event, onLast) => {
    this.setState({ rows: this.props.rows });
    if (this.props.onGoLast) this.props.onGoLast(event, onLast);
  };
  forceUpdateRows = () => {
    this.setState({ rows: this.props.rows });
  };
  handleChangeRowsPerPage = event => {
    let { rows, page } = this.state;
    let rowsPerPage = event.target.value;
    let maxPage = Math.ceil(rows / rowsPerPage);
    this.setState({
      rowsPerPage: rowsPerPage,
      page: page >= maxPage ? maxPage - 1 : page
    });

    if (this.props.onChangeRowsPerPage) this.props.onChangeRowsPerPage(rowsPerPage);
  };
  render() {
    const { rows, rowsPerPage, page } = this.state;
    return (
      <div
        style={{
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          height: '35px'
        }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows % 50 === 0 ? rows + 1 : rows}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            style: { visibility: 'hidden', display: 'none' }
          }}
          nextIconButtonProps={{
            style: { visibility: 'hidden', display: 'none' }
          }}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
          onChangePage={() => {}}
        />
        <UltimatePaginationMaterialUi
          style={{ width: 5 }}
          totalPages={Math.ceil(rows / rowsPerPage)}
          tP={Math.ceil(rows / rowsPerPage)}
          cP={page + 1}
          boundaryPagesRange={0}
          siblingPagesRange={2}
          currentPage={rows === 0 ? 0 : page + 1}
          hideEllipsis={true}
          onChange={this.onChange}
          onGoNext={this.onGoNext}
          onGoLast={this.onGoLast}
        />
      </div>
    );
  }
}
Pagination.propTypes = {
  onPageChange: PropTypes.func,
  onGoLast: PropTypes.func,
  onGoNext: PropTypes.func,
  rows: PropTypes.number.isRequired,
  onChangeRowsPerPage: PropTypes.func
};
export default Pagination;
