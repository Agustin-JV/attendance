import React from 'react';
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  Typography,
  Divider,
  ExpansionPanelDetails
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
const ExpansionBlock = props => (
  <ExpansionPanel style={{ backgroundColor: props.color ? props.color : '#fff' }}>
    <ExpansionPanelSummary expandIcon={<ExpandMore />}>
      <Typography
        style={{
          flexBasis: '33.33%',
          flexShrink: 0,
          color: props.textColor ? props.textColor : 'default'
        }}
        variant={props.variant ? props.variant : 'subtitle1'}>
        {props.title}
      </Typography>
      <Typography
        style={{ color: props.textColor ? props.textColor : 'default' }}
        variant={props.variant ? props.variant : 'subtitle2'}>
        {props.subtitle}
      </Typography>
    </ExpansionPanelSummary>
    <Divider />
    {props.clean ? props.children : <ExpansionPanelDetails>{props.children}</ExpansionPanelDetails>}
  </ExpansionPanel>
);
export default ExpansionBlock;
