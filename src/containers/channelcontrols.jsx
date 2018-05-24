import React, { Component } from "react";

import ChannelControlList from "../components/channelcontrollist";
import ChannelControl from "../components/channelcontrol";

class ChannelControls extends Component {

  constructor() {
    super();
    this.state = {
      channelMap: new Map(),
      channels: [],
    };
  }

  componentDidMount() {

    this.addChannel({
      id: 0,
      color: [255, 0, 0],
      range: [0, 0.1]
    },  () => {
      this.addChannel({
        id: 1,
        color: [0, 0, 255],
        range: [0, 1]
      })
   ; });

  }

  addChannel(channelcontrol, callback=()=>{}) {
    const {id} = channelcontrol;
    const {channels, channelMap} = this.state;

    var newChannelMap = new Map(channelMap);
    newChannelMap.set(id, channelcontrol);

    this.setState({
      channelMap: newChannelMap,
      channels: channels.concat([id])
    }, callback)
  }

  updateChannelColor(id, rgbColor) {
    const {channelMap} = this.state;
    
    var newChannelMap = new Map(channelMap);
    newChannelMap.get(id).color = rgbColor;

    this.setState({
      ChannelMap: newChannelMap
    })
  }

  updateChannelRange(id, range_percent) {
    const {channelMap} = this.state;
    
    // input validation
    const range = range_percent.map(v => {
      return v / 100;
    });
    if (!(0 <= range[0] < range[1] <= 1)) {
      return;
    }

    var newChannelMap = new Map(channelMap);
    newChannelMap.get(id).range = range

    this.setState({
      ChannelMap: newChannelMap
    })

  }

  render() {
    const {channels, channelMap} = this.state;
    return (
      <div>
        <ChannelControlList>
          {channels.map(id => {
            const channelcontrol = channelMap.get(id);
            const {color, range} = channelcontrol;
            return (
              <ChannelControl key={id} channelcontrol={channelcontrol}
               onColorChange={this.updateChannelColor.bind(this, id)}
               onRangeChange={this.updateChannelRange.bind(this, id)}/>
            );
          })}
        </ChannelControlList>
      </div>
    );
  }
}

export default ChannelControls;