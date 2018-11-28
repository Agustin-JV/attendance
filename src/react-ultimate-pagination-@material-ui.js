import React from 'react';
import { createUltimatePagination, ITEM_TYPES } from 'react-ultimate-pagination';
import { ChevronRight, ChevronLeft, LastPage, FirstPage } from '@material-ui/icons';
import { Button, Typography } from '@material-ui/core';
const flatButtonStyle = {
  minWidth: 36
};

const Page = ({ value, isActive, onClick, isDisabled }) => (
  <Button
    size="small"
    style={flatButtonStyle}
    variant={isActive ? 'contained' : 'text'}
    onClick={onClick}
    disabled={isActive}>
    <Typography>{isActive ? <b>{value.toString()}</b> : value.toString()}</Typography>
  </Button>
);

const Ellipsis = ({ onClick, isDisabled }) => (
  <Button style={flatButtonStyle} onClick={onClick} disabled={isDisabled}>
    ...
  </Button>
);

const FirstPageLink = ({ isActive, value, currentPage, onClick, isDisabled }) => (
  <Button
    style={{ minWidth: 10 }}
    size="small"
    onClick={onClick}
    disabled={currentPage === 1 || isDisabled}>
    <FirstPage fontSize="small" />
  </Button>
);

const PreviousPageLink = ({ isActive, currentPage, onClick, isDisabled }) => (
  <Button
    style={{ minWidth: 10 }}
    size="small"
    onClick={onClick}
    disabled={currentPage === 1 || isDisabled}>
    <ChevronLeft fontSize="small" />
  </Button>
);

const NextPageLink = ({ isActive, currentPage, totalPages, onClick, onGoNext, isDisabled }) => (
  <Button
    style={{ minWidth: 10 }}
    size="small"
    disabled={currentPage === totalPages || isDisabled}
    onClick={function(event) {
      onClick(event);
      onGoNext !== undefined ? onGoNext(event) : null;
    }}>
    <ChevronRight fontSize="small" />
  </Button>
);

const LastPageLink = ({ isActive, onClick, currentPage, totalPages, onGoLast, isDisabled }) => (
  <Button
    style={{ minWidth: 10 }}
    size="small"
    onClick={function(event) {
      onClick(event);
      onGoLast !== undefined ? onGoLast(event, currentPage === totalPages) : null;
    }}
    disabled={isDisabled}>
    <LastPage fontSize="small" />
  </Button>
);
function Wrapper(props) {
  const { children } = props;
  const childrenWithProps = React.Children.map(children, child =>
    React.cloneElement(child, {
      currentPage: props.cP,
      totalPages: props.tP,
      onGoLast: props.onGoLast,
      onGoNext: props.onGoNext
    })
  );
  return <div className="pagination">{childrenWithProps}</div>;
}
const itemTypeToComponent = {
  [ITEM_TYPES.PAGE]: Page,
  [ITEM_TYPES.ELLIPSIS]: Ellipsis,
  [ITEM_TYPES.FIRST_PAGE_LINK]: FirstPageLink,
  [ITEM_TYPES.PREVIOUS_PAGE_LINK]: PreviousPageLink,
  [ITEM_TYPES.NEXT_PAGE_LINK]: NextPageLink,
  [ITEM_TYPES.LAST_PAGE_LINK]: LastPageLink
};

const UltimatePaginationMaterialUi = createUltimatePagination({
  itemTypeToComponent: itemTypeToComponent,
  WrapperComponent: Wrapper
});

export default UltimatePaginationMaterialUi;
