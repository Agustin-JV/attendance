import React, { Component } from 'react';
import * as colors from '@material-ui/core/colors';
import { Chip, Avatar } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
class AvChip extends Component {
  constructor(props) {
    super(props);
    this.state = { hover: false };
  }

  setButtonHovered = hover => () => {
    this.setState({ hover: hover && this.props.clickable });
  };
  onClick = () => {
    let { onClick } = this.props;
    if (onClick && this.isClickable()) {
      onClick();
    }
  };
  isClickable = () => {
    let { clickable } = this.props;
    let click = clickable !== null && clickable !== undefined ? clickable : true;
    return click;
  };
  render() {
    const { label, avatar, variant, clickable, hide } = this.props;
    let c = this.getColor();
    //console.log('Fix clickable thing to be able to disable them')
    return hide !== true ? (
      <Chip
        avatar={
          <Avatar style={{ backgroundColor: c['dark'], color: c['avatar'] }}>{avatar}</Avatar>
        }
        style={{ backgroundColor: c['light'], color: c['text'], borderColor: c['border'] }}
        label={label}
        variant={variant || 'default'}
        onClick={this.onClick}
        clickable={this.isClickable()}
        onMouseEnter={this.setButtonHovered(true)}
        onMouseLeave={this.setButtonHovered(false)}
      />
    ) : (
      <div />
    );
  }

  getColor = () => {
    const { cAr, variant } = this.props;
    let color = this.props.color || (cAr && cAr.length >= 1 ? cAr[0] : 'grey');
    let d = cAr && cAr.length >= 3 ? cAr[2] : 800;
    let l = cAr && cAr.length >= 2 ? cAr[1] : 500;
    let dark = colors[color][d];
    let border = colors[color][l];
    let light = colors[color][l];
    let text = colors['grey'][50];
    let output = {
      dark: dark,
      light: light,
      text: text,
      avatar: colors['grey'][50],
      border: border
    };
    if (variant === 'outlined') {
      output['text'] = dark;
      output['light'] = 'transparent';
      if (this.state.hover) {
        output['light'] = colors[color][l] + '50';
      }
    } else if (this.state.hover) {
      output['light'] = colors[color][l + 100];
    }
    return output;
  };
}

export default AvChip;
