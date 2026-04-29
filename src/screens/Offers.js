import React from 'react';
import {View as RNView, StyleSheet, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {LinearGradient} from 'expo-linear-gradient';
import {useTheme} from '../theme';
import Header from '../components/Header';
import {Card, Text, TouchableOpacity} from '../uikit';

const offers = [
  {id:1,title:'5% Cashback on Ring Purchases', subtitle:'Use your ring to get instant cashback'},
  {id:2,title:'Ring Loyalty Rewards', subtitle:'Earn points for every ring use'},
  {id:3,title:'Partner Discounts', subtitle:'Exclusive deals with our partners'}
];

export default function Offers(){
  const navigation = useNavigation();
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <RNView style={[styles.container,{backgroundColor: theme.background}]}> 
      <Header title="Offers & Rewards" />
      <ScrollView contentContainerStyle={{padding:18, paddingBottom:90}}>
        <Card padding={16} style={{marginBottom:16}}>
          <Text variant="subtext">Reward Points</Text>
          <Text variant="h2" style={{marginTop:6}}>1,250 pts</Text>
          <Text variant="caption" style={{marginTop:8}}>Valid through: 31 Jan 2026</Text>
        </Card>
        {offers.map(o=> (
          <Card key={o.id} style={styles.card} padding={0}>
            <LinearGradient colors={[theme.card, theme.card]} style={styles.cardGrad} />
            <RNView style={styles.cardContent}>
              <Text variant="bodyStrong" style={styles.cardTitle}>{o.title}</Text>
              <Text variant="subtext" style={styles.cardSub}>{o.subtitle}</Text>
              <TouchableOpacity style={[styles.cta, { backgroundColor: theme.secondary }]} activeOpacity={0.8}>
                <Text variant="bodyStrong" style={[styles.ctaText, { color: theme.textOnDark }]}>View Details</Text>
              </TouchableOpacity>
            </RNView>
          </Card>
        ))}
      </ScrollView>
    </RNView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container:{flex:1},
  card:{marginBottom:14,borderRadius:12,overflow:'hidden'},
  cardGrad:{position:'absolute',left:0,right:0,top:0,bottom:0,opacity:0.6},
  cardContent:{padding:16},
  cardTitle:{marginBottom:6},
  cardSub:{marginBottom:12},
  cta:{alignSelf:'flex-start',paddingVertical:8,paddingHorizontal:12,borderRadius:8,borderWidth:1, borderColor: theme.border} ,
  ctaText:{fontWeight:'700',fontSize:14}
});
