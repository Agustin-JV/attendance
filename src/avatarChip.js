import React, { Component } from 'react';
import * as colors from '@material-ui/core/colors';
import { Chip, Avatar, CircularProgress } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const AvChip = props =>  {
  const color = props.color || (props.cAr && props.cAr.length >= 1 ? props.cAr[0] : 'grey');
  const d = props.cAr && props.cAr.length >= 3 ? props.cAr[2] : 800;
  const l = props.cAr && props.cAr.length >= 2 ? props.cAr[1] : 500;
  const outlined = (props.variant === 'outlined')
  const styles = theme => ({
        chip:{
            position: 'relative',
            backgroundColor: outlined?'transparent': colors[color][l],
            '&:hover': {
              backgroundColor: outlined?colors[color][l] + '50':colors[color][l + 100],
            },
            color: outlined?colors[color][d]:colors['grey'][50],
            borderColor: colors[color][l]
        },
            avatar:{
              width:32,zIndex: 2, height:32, backgroundColor: colors[color][d], color: colors['grey'][50]
            },
           progress: {
                    color:  colors[color][d],
                    position: 'absolute',
                    top: outlined?-4:-3,
                    left: -3,
                    zIndex: 1
                  }
    });
 
  const onClick = () => {
    let { onClick } = props;
    if (onClick && isClickable()) {
      onClick();
    }
  };
  const isClickable = () => {
    let { clickable } = props;
    let click = clickable === undefined ? false : clickable;
    return click;
  };
  const component = props=> {
    const { label,loading, avatar, variant,  hide } = props;
    
    return hide !== true ? (
    
        <Chip
          avatar={
            <span>
              <Avatar className ={props.classes.avatar}>{avatar}</Avatar>
              {loading && (
                <CircularProgress
                  size={38}
                  thickness ={4.5}
                  className={props.classes.progress}
                  
                />
              )}
            </span>
          }
          className ={props.classes.chip}
          label={label}
          variant={variant || 'default'}
          onClick={onClick}
          clickable={isClickable()}
          
        />
    ) : (
      <div />
    );
  }

  
  const Styled = withStyles(styles)(component);
  return (
        <Styled label={props.label} loading={props.loading} variant={props.variant} avatar={props.avatar} hide={props.hide} />
    );
}

export default AvChip;
