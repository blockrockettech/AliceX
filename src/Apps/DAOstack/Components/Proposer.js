import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

export default class Proposer extends Component {
  constructor() {
    super();
  }

  render() {
    const { name, proposal } = this.props;
    return (
      <>
        <Text numberOfLines={1} style={{ marginRight: 10, fontSize: 18, fontWeight: '700' }}>
          { name ? name : proposal.proposer }
        </Text>
      </>
    );
  }
}
