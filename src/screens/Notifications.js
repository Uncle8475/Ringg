import React, {useEffect, useState} from 'react';
import {View as RNView, StyleSheet, Switch} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import {useTheme} from '../theme';
import {Card, Text} from '../uikit';

const STORAGE_KEY = 'notificationPrefs';

export default function Notifications(){
  const navigation = useNavigation();
  const theme = useTheme();
  const [prefs, setPrefs] = useState({
    paymentSuccess: true,
    paymentFailed: true,
    walletTopup: true,
    ringUsed: true,
    ringStatus: true,
    suspiciousActivity: true,
    safetyModeEnabled: true,
  });

  useEffect(()=>{
    (async()=>{
      try{
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if(saved) setPrefs(JSON.parse(saved));
      }catch(e){}
    })();
  },[]);

  const toggle = async (k)=>{
    const next = {...prefs, [k]: !prefs[k]};
    setPrefs(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <RNView style={[styles.container,{backgroundColor: theme.background}]}> 
      <Header title="Notifications" />
      <RNView style={{padding:18}}>
        <Text variant="label" style={{marginBottom:8}}>Payment Alerts</Text>
        <Card padding={16} style={{marginBottom:16}}>
          <Row label="Payment successful" value={prefs.paymentSuccess} onToggle={()=>toggle('paymentSuccess')} />
          <Row label="Payment failed" value={prefs.paymentFailed} onToggle={()=>toggle('paymentFailed')} />
          <Row label="Wallet top-up" value={prefs.walletTopup} onToggle={()=>toggle('walletTopup')} />
        </Card>

        <Text variant="label" style={{marginBottom:8}}>Ring Activity</Text>
        <Card padding={16} style={{marginBottom:16}}>
          <Row label="Ring used" value={prefs.ringUsed} onToggle={()=>toggle('ringUsed')} />
          <Row label="Ring blocked/unblocked" value={prefs.ringStatus} onToggle={()=>toggle('ringStatus')} />
        </Card>

        <Text variant="label" style={{marginBottom:8}}>Security Alerts</Text>
        <Card padding={16}>
          <Row label="Suspicious activity" value={prefs.suspiciousActivity} onToggle={()=>toggle('suspiciousActivity')} />
          <Row label="Safety mode enabled" value={prefs.safetyModeEnabled} onToggle={()=>toggle('safetyModeEnabled')} />
        </Card>
      </RNView>
    </RNView>
  );
}

const Row = ({label, value, onToggle}) => (
  <RNView style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:8}}>
    <Text variant="bodyStrong">{label}</Text>
    <Switch value={value} onValueChange={onToggle} />
  </RNView>
);

const styles = StyleSheet.create({container:{flex:1}});
