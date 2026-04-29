import React from 'react';
import {View as RNView, StyleSheet, Alert} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '../theme';
import Header from '../components/Header';
import {Card, Text} from '../uikit';

export default function TransactionDetail(){
  const navigation = useNavigation();
  const route = useRoute();
  const {transaction} = route.params || {};
  const theme = useTheme();
  const tx = transaction || {merchant:'Unknown', amount:'₹0', date:'Unknown', status:'Completed', method:'Ring', txId:'TX-XXXX-XXXX', location:'Unknown'};
  return (
    <RNView style={[styles.container,{backgroundColor: theme.background}]}> 
      <Header title="Transaction" />

      <Card style={styles.card} padding={20}>
        <Text variant="h2" style={styles.merchant}>{tx.merchant}</Text>
        <Text variant="h1" style={styles.amount}>{tx.amount}</Text>
        <Text variant="subtext" style={styles.meta}>{tx.date} · {tx.status}</Text>
        <RNView style={{height:12}} />
        <Text variant="body">Transaction ID: {tx.txId}</Text>
        <Text variant="body">Payment method: {tx.method}</Text>
        <Text variant="body">Location: {tx.location}</Text>
      </Card>

      <RNView style={{paddingHorizontal:18,marginTop:16}}>
        <Card padding={14} onPress={()=>Alert.alert('Report an issue','Please describe the issue via Help & Support. Go to Settings → Help & Support.',[{text:'OK'}])}>
          <RNView style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
            <RNView style={{flexDirection:'row',alignItems:'center'}}>
              <MaterialCommunityIcons name="lifebuoy" size={20} color={theme.accent} />
              <Text variant="bodyStrong" style={{marginLeft:10,color:theme.accent}}>Report an issue</Text>
            </RNView>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.chevron} />
          </RNView>
        </Card>
      </RNView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:18},
  card:{},
  merchant:{textAlign:'center'},
  amount:{textAlign:'center',marginTop:8},
  meta:{textAlign:'center',marginTop:8},
});
