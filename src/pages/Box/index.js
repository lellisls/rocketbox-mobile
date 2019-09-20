import React, {Component} from 'react';
import {Text, View, FlatList, TouchableOpacity} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';

import api from '../../services/api';
import styles from './styles';

import {formatDistance} from 'date-fns';
import pt from 'date-fns/locale/pt';

import Icon from 'react-native-vector-icons/MaterialIcons';

export default class Box extends Component {
  state = {box: {}};

  async componentDidMount() {
    const box = await AsyncStorage.getItem('@RocketBox:box');
    const response = await api.get(`boxes/${box}`);
    console.log(box);
    this.setState({box: response.data});
  }

  renderItem = ({item}) => (
    <TouchableOpacity onPress={() => {}} style={styles.file}>
      <View style={styles.fileInfo}>
        <Icon name="insert-drive-file" size={24} color="#A5CFFF" />
        <Text style={styles.fileTitle}>{item.title}</Text>
      </View>
      <Text style={styles.fileDate}>
        há{' '}
        {formatDistance(new Date(item.createdAt), new Date(), {
          locale: pt,
        })}
      </Text>
    </TouchableOpacity>
  );

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.boxTitle}>{this.state.box.title}</Text>
        <FlatList
          style={styles.list}
          data={this.state.box.files}
          keyExtractor={file => file._id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={this.renderItem}
        />
      </View>
    );
  }
}
