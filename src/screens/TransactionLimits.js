import React, {useEffect, useState} from 'react';
import {View as RNView, StyleSheet, Switch, TextInput} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import {useTheme} from '../theme';
import {Card, Text, Button} from '../uikit';

const STORAGE_KEY = 'transactionLimits';

export default function TransactionLimits(){
  const navigation = useNavigation();
  const theme = useTheme();
  const [dailyEnabled, setDailyEnabled] = useState(true);
  const [dailyMax, setDailyMax] = useState('10000');
  const [monthlyEnabled, setMonthlyEnabled] = useState(false);
  const [monthlyMax, setMonthlyMax] = useState('50000');

  useEffect(()=>{
    (async()=>{
      try{
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if(saved){
          const s = JSON.parse(saved);
          setDailyEnabled(!!s.dailyEnabled);
          setDailyMax(String(s.dailyMax ?? '10000'));
          setMonthlyEnabled(!!s.monthlyEnabled);
          setMonthlyMax(String(s.monthlyMax ?? '50000'));
        }
      }catch(e){}
    })();
  },[]);

  const save = async ()=>{
    const payload = {dailyEnabled, dailyMax: Number(dailyMax||0), monthlyEnabled, monthlyMax: Number(monthlyMax||0)};
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  return (
    <RNView style={[styles.container,{backgroundColor: theme.background}]}> 
      <Header title="Transaction Limits" />
      <RNView style={{padding:18}}>
        <Text variant="label" style={{marginBottom:8}}>Daily Limit</Text>
        <Card padding={16} style={{marginBottom:16}}>
          <RNView style={styles.row}> 
            <Text variant="bodyStrong">Enable Daily Limit</Text>
            <Switch value={dailyEnabled} onValueChange={setDailyEnabled} />
          </RNView>
          <RNView style={{marginTop:12}}>
            <Text variant="subtext">Max amount per day</Text>
            <TextInput value={dailyMax} onChangeText={setDailyMax} keyboardType="numeric" style={styles.input} />
          </RNView>
          <Text variant="caption" style={{marginTop:8}}>Currently active: {dailyEnabled ? `₹${Number(dailyMax).toLocaleString()}/day` : 'Disabled'}</Text>
        </Card>

        <Text variant="label" style={{marginBottom:8}}>Monthly Limit</Text>
        <Card padding={16}>
          <RNView style={styles.row}> 
            <Text variant="bodyStrong">Enable Monthly Limit</Text>
            <Switch value={monthlyEnabled} onValueChange={setMonthlyEnabled} />
          </RNView>
          <RNView style={{marginTop:12}}>
            <Text variant="subtext">Max amount per month</Text>
            <TextInput value={monthlyMax} onChangeText={setMonthlyMax} keyboardType="numeric" style={styles.input} />
          </RNView>
          <Text variant="caption" style={{marginTop:8}}>Currently active: {monthlyEnabled ? `₹${Number(monthlyMax).toLocaleString()}/month` : 'Disabled'}</Text>
        </Card>

        <Button label="Save Limits" style={{marginTop:16}} onPress={save} />
      </RNView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1},
  row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  input:{backgroundColor:'rgba(255,255,255,0.06)',borderRadius:10,paddingHorizontal:12,paddingVertical:10,color:'#fff',marginTop:6}
});
