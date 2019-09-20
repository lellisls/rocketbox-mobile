import React, {Component} from 'react';
import {Text, View, FlatList, TouchableOpacity} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';

import api from '../../services/api';
import styles from './styles';

import {formatDistance} from 'date-fns';
import pt from 'date-fns/locale/pt';

import Icon from 'react-native-vector-icons/MaterialIcons';

import ImagePicker from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

export default class Box extends Component {
  state = {box: {}};

  async componentDidMount() {
    const box = await AsyncStorage.getItem('@RocketBox:box');
    try {
      const response = await api.get(`boxes/${box}`);
      console.log(box);
      this.setState({box: response.data});
    } catch (err) {
      await AsyncStorage.setItem('@RocketBox:box', '');
      this.props.navigation.navigate('Main');
    }
  }

  handleUpload = () => {
    ImagePicker.launchImageLibrary({}, async upload => {
      if (upload.error) {
        console.error('ImagePicker error: ', upload.error);
      } else if (upload.didCancel) {
        console.log('Canceled by user');
      } else {
        console.log(upload);

        const data = new FormData();

        const [prefix, suffix] = upload.fileName.split('.');
        const ext = suffix.toLowerCase() === 'heic' ? 'jpg' : suffix;

        data.append('file', {
          uri: upload.uri,
          type: upload.type,
          name: `${prefix}.${ext}`,
        });

        api.post(`boxes/${this.state.box._id}/files`, data);
      }
    });
  };

  openFile = async file => {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/${file.title}`;
      const options = {
        fromUrl: file.url,
        toFile: filePath,
      };

      console.log('options', options);

      const res = await RNFS.downloadFile(options).promise;

      console.log('res', res);

      console.log(filePath);

      await FileViewer.open(filePath);
    } catch (err) {
      console.error(err);
    }
  };

  renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        this.openFile(item);
      }}
      style={styles.file}>
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

        <TouchableOpacity style={styles.fab} onPress={this.handleUpload}>
          <Icon name="cloud-upload" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  }
}
