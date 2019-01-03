import React from "react";
import { Button, Card, CardContent } from "@material-ui/core";
import { connect } from "react-redux";
//https://github.com/mac-s-g/react-json-view
import ReactJson from "react-json-view";
class JsonViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = () => {};
  render() {
    const { data } = this.props;
    return (
      <div>
        <Card style={{ textAlign: "start", backgroundColor: "#272822" }}>
          <CardContent>
            <ReactJson src={data} indentWidth={2} theme="monokai" />
          </CardContent>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  data: state
});

export default connect(
  mapStateToProps
)(JsonViewer);