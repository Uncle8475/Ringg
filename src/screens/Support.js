import React from 'react';
import {View as RNView, StyleSheet, ScrollView, Alert} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import Header from '../components/Header';
import {useTheme} from '../theme';
import {Card, Text, TouchableOpacity} from '../uikit';

export default function Support(){
  const navigation = useNavigation();
  const theme = useTheme();
  const faqs = [
    {id:'f1',question:'What is COSMIC ATTIRE Ring?',answer:'A premium wearable enabling secure payments and access control with contactless tech.'},
    {id:'f2',question:'Is my data secure?',answer:'Protected with bank-grade encryption and biometrics. No payment data stored on the ring.'},
    {id:'f3',question:'My ring stopped working — what now?',answer:'Try re-pairing the ring. If issues persist, contact support. Warranty available.'},
    {id:'f4',question:'Does the ring track location?',answer:'No, there is no GPS tracking. Focus is on secure payments and access.'}
  ];
  return (
    <RNView style={[styles.container]}> 
      <Header title="Help & Support" />
      <ScrollView style={styles.content} contentContainerStyle={{paddingBottom:90}} showsVerticalScrollIndicator={false}>
        <Text variant="label" style={styles.sectionTitle}>FAQs</Text>
        {faqs.map(faq => (
          <Card key={faq.id} style={styles.faqCard} padding={16} onPress={()=>Alert.alert(faq.question, faq.answer)}>
            <RNView style={styles.faqHeader}>
              <Text variant="bodyStrong" style={styles.faqQuestion}>{faq.question}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={theme.muted} />
            </RNView>
          </Card>
        ))}

        <Text variant="label" style={styles.sectionTitle}>Contact Support</Text>
        <Card style={styles.contactCard} padding={16} onPress={()=>Alert.alert('Email Support','attirecosmic@gmail.com')}>
          <RNView style={styles.contactIcon}><MaterialCommunityIcons name="email" size={24} color="#fff" /></RNView>
          <RNView style={{flex:1}}>
            <Text variant="bodyStrong">Email</Text>
            <Text variant="subtext">attirecosmic@gmail.com</Text>
          </RNView>
        </Card>

        <Card style={styles.contactCard} padding={16} onPress={()=>Alert.alert('Phone Support','+91 63920 92199')}>
          <RNView style={styles.contactIcon}><MaterialCommunityIcons name="phone" size={24} color="#fff" /></RNView>
          <RNView style={{flex:1}}>
            <Text variant="bodyStrong">Phone</Text>
            <Text variant="subtext">+91 63920 92199</Text>
          </RNView>
        </Card>

        <Text variant="label" style={styles.sectionTitle}>Quick Links</Text>
        <Card padding={16} onPress={()=>Alert.alert('Report an issue','Describe your issue and include transaction ID if applicable.')} style={{marginBottom:10}}>
          <RNView style={styles.linkRow}>
            <Text variant="bodyStrong">Report an issue</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.chevron} />
          </RNView>
        </Card>
        <Card padding={16} onPress={()=>Alert.alert('Terms of Service','Standard terms apply for device and app usage.')} style={{marginBottom:10}}>
          <RNView style={styles.linkRow}>
            <Text variant="bodyStrong">Terms of Service</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.chevron} />
          </RNView>
        </Card>
        <Card padding={16} onPress={()=>Alert.alert('Privacy Policy','We respect your privacy. No GPS tracking; payments are encrypted.')}>
          <RNView style={styles.linkRow}>
            <Text variant="bodyStrong">Privacy Policy</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.chevron} />
          </RNView>
        </Card>
      </ScrollView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:18},
  content:{flex:1},
  sectionTitle:{marginBottom:12,marginTop:8},
  faqCard:{marginBottom:8},
  faqHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  faqQuestion:{flex:1},
  contactCard:{flexDirection:'row',alignItems:'center',marginBottom:12},
  contactIcon:{width:48,height:48,borderRadius:8,backgroundColor:'#6D5EF6',alignItems:'center',justifyContent:'center',marginRight:16},
  linkRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}
});
