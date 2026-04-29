import React, {useState, useEffect} from 'react';
import {View as RNView, StyleSheet} from 'react-native';
import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import {useTheme} from '../theme';
import {Card, Text, TouchableOpacity} from '../uikit';

export default function Appearance(){
  const navigation = useNavigation();
  const route = useRoute();
  const {currentThemeName} = route.params || {};
  const [selectedTheme, setSelectedTheme] = useState(currentThemeName || 'dark');
  const theme = useTheme();
  
  const handleThemeChange = async (value) => {
    setSelectedTheme(value);
    // Store theme change
    await AsyncStorage.setItem('appTheme', value);
  };
  
  const Option = ({label, value}) => (
    <TouchableOpacity onPress={()=>handleThemeChange(value)} style={styles.optionRow}>
      <Text variant="bodyStrong">{label}</Text>
      <RNView style={[styles.radioOuter,{borderColor: selectedTheme===value ? theme.accent : theme.border}]}> 
        {selectedTheme===value && <RNView style={[styles.radioInner,{backgroundColor: theme.accent}]} />}
      </RNView>
    </TouchableOpacity>
  );
  return (
    <RNView style={[styles.container,{backgroundColor: theme.background}]}> 
      <Header title="Appearance" />
      <RNView style={{padding:18}}>
        <Text variant="label" style={{marginBottom:8}}>Theme</Text>
        <Card padding={16}>
          <Option label="Dark" value="dark" />
          <Option label="Light" value="light" />
          <Option label="System Default" value="system" />
        </Card>
        <Text variant="caption" style={{marginTop:12}}>System Default follows device theme.</Text>
      </RNView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1},
  optionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:10},
  radioOuter:{width:18,height:18,borderRadius:9,borderWidth:2,alignItems:'center',justifyContent:'center'},
  radioInner:{width:10,height:10,borderRadius:5}
});
